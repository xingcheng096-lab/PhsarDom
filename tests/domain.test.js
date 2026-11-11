import { describe, expect, it } from 'vitest'
import { priceForQuantity, validateTiers, validateQuantity } from '../src/domain/pricing.js'
import { allocateAcrossWarehouses, backorderQuantity, canPick, canReserve, pickDelta, releaseDelta, reservationDelta, reservationIdentity, transferInventory, warehouseAvailable } from '../src/domain/inventory.js'
import { canTransition, isExpired } from '../src/domain/workflows.js'
import { canAcceptQuote } from '../src/domain/workflows.js'
import { convertQuoteToPO } from '../src/services/mockStore.js'
import { decideQuotation, saveRecord } from '../src/services/mockStore.js'
import { submitCounterOffer, submitRevisedOffer } from '../src/services/mockStore.js'
import { createRFQ, createQuotation } from '../src/services/mockStore.js'
import { calculateInvoice, dueDate, generateInvoice, getCreditAccount, issueCreditNote, recordPayment, setCreditAccount } from '../src/domain/finance.js'
import { createShipmentTransaction, recordShipmentDiscrepancy, reconcilePOShipment, transitionShipment, shippableForLine } from '../src/domain/shipments.js'
import { buildSalesReport } from '../src/domain/reports.js'
import { calculateCommissionLedger, validateCommissionRule } from '../src/domain/commissions.js'
import { decideCommission, payCommission } from '../src/domain/commissions.js'
import { createDirectPurchaseTransaction } from '../src/domain/directPurchase.js'

describe('domain rules', () => {
  const directBuyer = { id: 7, business: 'Direct Buyer Co', status: 'Approved', group: 'Standard', creditLimit: 10000 }
  const directProduct = { id: 77, sku: 'DIRECT-1', name: 'Direct Product', moq: 10, stock: 500, price: 25, tiers: [{ min: 10, max: 99, price: 25 }, { min: 100, price: 20 }] }
  const directActor = { id: 'buyer-7', buyerId: 7, role: 'buyer', name: 'Direct Buyer' }
  const directState = () => ({ purchaseOrders: [], invoices: [], creditAccounts: [], audit: [] })

  it('creates an approved direct purchase with stable source and audit metadata', () => {
    const result = createDirectPurchaseTransaction(directState(), { buyerId: 7, productId: 77, quantity: 10, idempotencyKey: 'direct-test-1' }, directActor, { buyers: [directBuyer], products: [directProduct] })
    expect(result.purchaseOrder.source).toBe('DIRECT_PURCHASE')
    expect(result.purchaseOrder.buyerId).toBe(7)
    expect(result.state.audit[0]).toMatchObject({ action: 'DIRECT_PURCHASE_ORDER_CREATED', buyerId: 7, productId: 77, actor: directActor })
  })

  it('rejects ineligible buyers, ownership errors, invalid quantities and MOQ without mutation', () => {
    for (const buyer of [{ ...directBuyer, status: 'Pending' }, { ...directBuyer, status: 'Rejected' }, { ...directBuyer, status: 'Suspended' }]) {
      expect(() => createDirectPurchaseTransaction(directState(), { productId: 77, quantity: 10, idempotencyKey: `status-${buyer.status}` }, directActor, { buyers: [buyer], products: [directProduct] })).toThrow(/approved/i)
    }
    for (const quantity of [0, -1, 1.5, 'abc']) expect(() => createDirectPurchaseTransaction(directState(), { buyerId: 7, productId: 77, quantity, idempotencyKey: `qty-${quantity}` }, directActor, { buyers: [directBuyer], products: [directProduct] })).toThrow()
    expect(() => createDirectPurchaseTransaction(directState(), { buyerId: 8, productId: 77, quantity: 10, idempotencyKey: 'wrong-owner' }, directActor, { buyers: [directBuyer], products: [directProduct] })).toThrow(/ownership/i)
    expect(() => createDirectPurchaseTransaction(directState(), { buyerId: 7, productId: 77, quantity: 9, idempotencyKey: 'below-moq' }, directActor, { buyers: [directBuyer], products: [directProduct] })).toThrow(/minimum|MOQ/i)
  })

  it('rejects invalid pricing, stock and credit policy before persistence', () => {
    expect(() => createDirectPurchaseTransaction(directState(), { productId: 77, quantity: 10, idempotencyKey: 'bad-tier' }, directActor, { buyers: [directBuyer], products: [{ ...directProduct, price: 0, tiers: [] }] })).toThrow()
    expect(() => createDirectPurchaseTransaction(directState(), { productId: 77, quantity: 10, idempotencyKey: 'stock' }, directActor, { buyers: [directBuyer], products: [{ ...directProduct, stock: 5 }] })).toThrow(/stock/i)
    const held = { ...directState(), creditAccounts: [{ buyerId: 7, creditLimit: 10000, creditStatus: 'Hold' }] }
    expect(() => createDirectPurchaseTransaction(held, { productId: 77, quantity: 10, idempotencyKey: 'hold' }, directActor, { buyers: [directBuyer], products: [directProduct] })).toThrow(/credit/i)
    expect(held.purchaseOrders).toHaveLength(0)
    expect(held.audit).toHaveLength(0)
  })

  it('is idempotent and revalidates current pricing without duplicate state changes', () => {
    const first = createDirectPurchaseTransaction(directState(), { productId: 77, quantity: 100, idempotencyKey: 'same-key' }, directActor, { buyers: [directBuyer], products: [directProduct] })
    expect(first.purchaseOrder.unitPrice).toBe(20)
    const second = createDirectPurchaseTransaction(first.state, { productId: 77, quantity: 100, idempotencyKey: 'same-key' }, directActor, { buyers: [directBuyer], products: [{ ...directProduct, price: 99, tiers: [{ min: 10, price: 30 }] }] })
    expect(second.duplicate).toBe(true)
    expect(second.state.purchaseOrders).toHaveLength(1)
    expect(second.state.audit).toHaveLength(1)
  })
  it('calculates deterministic invoice totals and calendar net terms', () => {
    const invoice = calculateInvoice({ lineItems: [{ quantity: 3, unitPrice: 10.1 }], tax: 1.01, currency: 'USD' })
    expect(invoice.subtotal).toBe(30.3)
    expect(invoice.total).toBe(31.31)
    expect(dueDate('2026-01-31', 'Net-30')).toBe('2026-03-02')
  })

  it('generates one invoice per PO and enforces payment, credit and authorization rules', () => {
    const actor = { id: 'f-1', role: 'finance', name: 'Finance User' }
    const po = { id: 7, number: 'PO-7', buyer: 'Buyer A', buyerId: 2, product: 'SKU-1', ordered: 10, unitPrice: 12, terms: 'Net-30' }
    const first = generateInvoice({ invoices: [], audit: [] }, po, actor, { issueDate: '2026-01-01' })
    expect(first.invoice.total).toBe(120)
    expect(generateInvoice(first.state, po, actor).duplicate).toBe(true)
    const paid = recordPayment(first.state, first.invoice.invoiceId, { amount: 20, reference: 'PAY-1' }, actor)
    expect(paid.invoices[0].outstanding).toBe(100)
    expect(() => recordPayment(paid, first.invoice.invoiceId, { amount: 101, reference: 'PAY-2' }, actor)).toThrow()
    const credited = issueCreditNote(paid, first.invoice.invoiceId, { amount: 10, reference: 'CN-1', reason: 'Return' }, actor)
    expect(credited.invoices[0].creditApplied).toBe(10)
    expect(() => recordPayment(credited, first.invoice.invoiceId, { amount: 1, reference: 'PAY-3' }, { id: 'b', role: 'buyer' })).toThrow()
  })

  it('calculates credit exposure without double counting and enforces credit holds', () => {
    const actor = { id: 'f-1', role: 'finance', name: 'Finance User' }
    const state = { invoices: [{ invoiceId: 'i-1', buyerId: 2, total: 100, outstanding: 40 }], creditAccounts: [], audit: [] }
    expect(getCreditAccount(state, 2, { creditLimit: 50 }).availableCredit).toBe(10)
    const next = setCreditAccount(state, 2, { creditLimit: 50, creditStatus: 'Active' }, actor)
    expect(next.creditAccounts[0].currentExposure).toBe(40)
    expect(() => setCreditAccount(state, 2, { creditLimit: 20, creditStatus: 'Active' }, actor)).toThrow()
  })
  it('enforces MOQ and tier pricing', () => {
    const product = { moq: 50, price: 110, tiers: [{ min: 50, max: 99, price: 100 }, { min: 100, max: 499, price: 95 }, { min: 500, price: 90 }] }
    expect(validateQuantity(20, 50).ok).toBe(false)
    expect(priceForQuantity(150, product).unitPrice).toBe(95)
    expect(validateTiers(product.tiers).ok).toBe(true)
  })
  it('protects inventory and workflow transitions', () => {
    expect(canReserve({ available: 10 }, 11)).toBe(false)
    expect(canPick({ reserved: 10 }, 11)).toBe(false)
    expect(canTransition('quotations', 'Accepted', 'Draft')).toBe(false)
    expect(isExpired('2026-09-01', '2026-09-11')).toBe(true)
  })
  it('calculates warehouse availability, reservations, releases, picks and backorders', () => {
    const rows = [{ warehouse: 'WH-1', sku: 'SKU-1', available: 30, reserved: 10 }, { warehouse: 'WH-2', sku: 'SKU-1', available: 20, reserved: 0 }]
    expect(warehouseAvailable(rows, 'WH-1', 'SKU-1')).toBe(30)
    expect(reservationDelta(rows[0], 20)).toMatchObject({ ok: true, available: 10, reserved: 30 })
    expect(reservationDelta(rows[0], 31).ok).toBe(false)
    expect(releaseDelta(rows[0], 5)).toMatchObject({ ok: true, available: 35, reserved: 5 })
    expect(pickDelta({ reserved: 10 }, 6)).toMatchObject({ ok: true, reserved: 4, picked: 6 })
    expect(pickDelta({ reserved: 10 }, 11).ok).toBe(false)
    expect(backorderQuantity(100, 70)).toBe(30)
    expect(allocateAcrossWarehouses(rows, 45, { sku: 'SKU-1', poId: 9, lineId: 1 })).toMatchObject({ backordered: 0, allocations: [{ warehouseId: 'WH-1', qty: 30 }, { warehouseId: 'WH-2', qty: 15 }] })
    expect(reservationIdentity(9, 1, 'WH-1')).toBe('9:1:WH-1')
  })

  it('validates the production warehouse transfer transaction atomically', () => {
    const state = { inventoryOps: [{ id: 1, sku: 'SKU-1', warehouse: 'WH-1', available: 10, onHand: 10, reserved: 0 }, { id: 2, sku: 'SKU-1', warehouse: 'WH-2', available: 4, onHand: 4, reserved: 0 }], movements: [], audit: [] }
    const actor = { id: 'w-1', role: 'warehouse', name: 'Warehouse User' }
    for (const quantity of [0, -1, 1.5, 'bad']) expect(transferInventory(state, { sku: 'SKU-1', sourceWarehouse: 'WH-1', destinationWarehouse: 'WH-2', quantity, transactionId: String(quantity) }, actor).result.ok).toBe(false)
    expect(transferInventory(state, { sku: 'SKU-1', sourceWarehouse: 'WH-1', destinationWarehouse: 'WH-1', quantity: 1, transactionId: 'same' }, actor).result.ok).toBe(false)
    expect(transferInventory(state, { sku: 'SKU-1', sourceWarehouse: 'WH-1', destinationWarehouse: 'WH-2', quantity: 11, transactionId: 'short' }, actor).result.ok).toBe(false)
    expect(transferInventory(state, { sku: 'SKU-1', sourceWarehouse: 'WH-1', destinationWarehouse: 'WH-2', quantity: 1, transactionId: 'unauth' }, { role: 'buyer' }).result.ok).toBe(false)
    const moved = transferInventory(state, { sku: 'SKU-1', sourceWarehouse: 'WH-1', destinationWarehouse: 'WH-2', quantity: 3, transactionId: 'ok' }, actor)
    expect(moved.state.inventoryOps.find((row) => row.warehouse === 'WH-1').available).toBe(7)
    expect(moved.state.inventoryOps.find((row) => row.warehouse === 'WH-2').available).toBe(7)
    expect(moved.state.audit[0]).toMatchObject({ action: 'WAREHOUSE_TRANSFER', actor, before: { sourceAvailable: 10, destinationOnHand: 4 }, after: { sourceAvailable: 7, destinationOnHand: 7 } })
    expect(transferInventory(moved.state, { sku: 'SKU-1', sourceWarehouse: 'WH-1', destinationWarehouse: 'WH-2', quantity: 3, transactionId: 'ok' }, actor).result.duplicate).toBe(true)
  })
  it('blocks expired or approval-pending quotes', () => {
    expect(canAcceptQuote({ status: 'Sent', expiry: '2020-01-01' }, '2026-09-11')).toBe(false)
    expect(canAcceptQuote({ status: 'Sent', expiry: '2027-01-01', approval: { required: true, status: 'Pending' } }, '2026-09-11')).toBe(false)
  })
  it('converts one accepted quote only once', () => {
    const memory = {}
    globalThis.localStorage = { clear: () => Object.keys(memory).forEach((key) => delete memory[key]), getItem: (key) => memory[key] || null, setItem: (key, value) => { memory[key] = String(value) } }
    localStorage.clear()
    const quote = { id: 1, number: 'QT-TEST-1', status: 'Accepted', buyer: 'Acme', quantity: 50, product: 'Test', unitPrice: 10, amount: 500 }
    const first = convertQuoteToPO(quote, { buyer: { id: 1, status: 'Approved' }, actor: { role: 'buyer', buyerId: 1 } })
    const second = convertQuoteToPO(quote, { buyer: { id: 1, status: 'Approved' }, actor: { role: 'buyer', buyerId: 1 } })
    expect(first.number).toBe(second.number)
    expect(first.quote).toBe('QT-TEST-1')
  })
  it('records manager approval and prevents duplicate decisions', () => {
    saveRecord('quotations', { id: 22, number: 'QT-TEST-22', buyer: 'Acme', status: 'Negotiating', discount: 8, approval: { required: true, status: 'Pending' } })
    const approved = decideQuotation(22, 'Approved', { actor: { name: 'Rachel Evans', label: 'Sales Manager' } })
    expect(approved.status).toBe('Sent')
    expect(approved.approval.decidedBy).toBe('Rachel Evans')
    expect(() => decideQuotation(22, 'Rejected', { reason: 'Too late' })).toThrow('already been decided')
  })
  it('persists authorized negotiation revisions and rejects unauthorized actors', () => {
    saveRecord('quotations', { id: 33, number: 'QT-TEST-33', buyer: 'Acme', status: 'Sent', expiry: '2099-01-01', quantity: 50, unitPrice: 10 })
    const countered = submitCounterOffer(33, { quantity: 60, unitPrice: 9 }, { name: 'Maya Chen', role: 'buyer', buyerId: 1, buyerBusiness: 'Acme' })
    expect(countered.status).toBe('Negotiating')
    const revised = submitRevisedOffer(33, { quantity: 60, unitPrice: 9.5 }, { name: 'Daniel Brooks', role: 'sales' })
    expect(revised.status).toBe('Sent')
    expect(() => submitCounterOffer(33, { unitPrice: 8 }, { name: 'Grace Kim', role: 'support', buyerId: 1, buyerBusiness: 'Acme' })).toThrow()
  })
  it('authorizes RFQ and quotation creation before persistence', () => {
    expect(() => createRFQ({ buyer: 'Greenline Retail Partners', product: 'Commercial Surface Cleaner 5L', quantity: 24 }, { buyerId: 3, role: 'buyer', status: 'Pending' })).toThrow()
    const rfq = createRFQ({ buyer: 'Atlas Hospitality Group', product: 'Commercial Surface Cleaner 5L', quantity: 24 }, { buyerId: 1, role: 'buyer', status: 'Approved', name: 'Maya Chen' })
    expect(rfq.buyerId).toBe(1)
    expect(() => createQuotation({ buyer: rfq.buyer, product: rfq.product, rfq: 'missing' }, { id: 'buyer', name: 'Maya', role: 'buyer' })).toThrow()
  })
  it('creates, dispatches and protects packed shipment transactions', () => {
    const actor = { id: 'l-1', role: 'logistics', name: 'Logistics User' }
    const base = { purchaseOrders: [{ id: 7, number: 'PO-7', buyerId: 2 }], packing: [{ po: 'PO-7', sku: 'SKU-1', status: 'Ready to Ship', packed: 10 }], shipments: [], audit: [] }
    expect(shippableForLine(base.packing, [], 'PO-7', 1, 'SKU-1')).toBe(10)
    expect(() => createShipmentTransaction(base, { poId: 7, buyerId: 2, warehouseId: 'WH-1', carrier: 'Demo', trackingNumber: 'TRK-1', transactionId: 'TX-1', shipmentLines: [{ lineId: 1, productId: 'SKU-1', quantity: 11 }] }, actor)).toThrow()
    const created = createShipmentTransaction(base, { poId: 7, buyerId: 2, warehouseId: 'WH-1', carrier: 'Demo', trackingNumber: 'TRK-1', transactionId: 'TX-1', shipmentLines: [{ lineId: 1, productId: 'SKU-1', quantity: 6 }] }, actor)
    expect(created.shipment.status).toBe('Ready to Dispatch')
    expect(createShipmentTransaction(created.state, { poId: 7, buyerId: 2, warehouseId: 'WH-1', carrier: 'Demo', trackingNumber: 'TRK-1', transactionId: 'TX-1', shipmentLines: [{ lineId: 1, productId: 'SKU-1', quantity: 6 }] }, actor).duplicate).toBe(true)
    const dispatched = transitionShipment(created.state, created.shipment.shipmentId, 'Dispatched', actor)
    expect(dispatched.shipments[0].dispatchedQuantity).toBe(6)
    expect(dispatched.audit[0].action).toBe('SHIPMENT_DISPATCHED')
    expect(() => createShipmentTransaction(base, { poId: 7, buyerId: 2, warehouseId: 'WH-1', carrier: 'Demo', trackingNumber: 'TRK-2', transactionId: 'TX-2', shipmentLines: [{ lineId: 1, productId: 'SKU-1', quantity: 1 }] }, { id: 'b-1', role: 'buyer' })).toThrow()
    const inTransit = transitionShipment(dispatched, created.shipment.shipmentId, 'In Transit', actor)
    const delivered = transitionShipment(inTransit, created.shipment.shipmentId, 'Partially Delivered', actor, { deliveredQuantity: 4, proofOfDelivery: { receiverName: 'Receiver' } })
    const noted = recordShipmentDiscrepancy(delivered, created.shipment.shipmentId, { reference: 'D-1', missingQuantity: 1, damagedQuantity: 1, reason: 'Short and damaged' }, actor)
    expect(noted.state.shipments[0].status).toBe('Delivery Exception')
    expect(noted.state.audit[0].action).toBe('SHIPMENT_DISCREPANCY_RECORDED')
    expect(recordShipmentDiscrepancy(noted.state, created.shipment.shipmentId, { reference: 'D-1', missingQuantity: 1 }, actor).duplicate).toBe(true)
    expect(reconcilePOShipment({ id: 7, number: 'PO-7', ordered: 10 }, base.packing, noted.state.shipments)).toMatchObject({ ordered: 10, packed: 10, allocated: 6, dispatched: 6, delivered: 4, remainingShippable: 4, remainingUnfulfilled: 6 })
  })

  it('derives separated sales metrics from persisted transactions', () => {
    const report = buildSalesReport({ purchaseOrders: [{ id: 1, buyer: 'A', amount: 100, status: 'Approved', created: '2026-09-01' }], invoices: [{ total: 100, outstanding: 100, issueDate: '2026-09-01' }], payments: [{ amount: 25, date: '2026-09-02' }], creditNotes: [{ amount: 5, status: 'Issued' }], quotations: [{ status: 'Accepted' }] })
    expect(report.confirmedPOValue).toBe(100)
    expect(report.invoicedAmount).toBe(100)
    expect(report.paymentsCollected).toBe(25)
    expect(report.outstandingReceivables).toBe(70)
    expect(report.quoteConversion).toBe(100)
  })

  it('calculates an idempotent payment-linked commission ledger', () => {
    expect(() => validateCommissionRule({ salespersonId: 3, rate: 101 })).toThrow()
    const state = { payments: [{ id: 7, invoiceNumber: 'INV-1', amount: 100, date: '2026-09-01' }], purchaseOrders: [] }
    const rules = [{ id: 'R1', salespersonId: 3, rate: 2.5, status: 'Active', effectiveDate: '2026-01-01' }]
    const ledger = calculateCommissionLedger(state, rules)
    expect(ledger).toHaveLength(1)
    expect(ledger[0]).toMatchObject({ paymentId: 7, commissionAmount: 2.5 })
    expect(calculateCommissionLedger(state, rules)).toEqual(ledger)
  })

  it('enforces commission approval and simulated payout transitions', () => {
    const state = { commissionLedger: [{ id: 'commission:1', status: 'Pending', commissionAmount: 4 }], audit: [] }
    const actor = { id: 'f-1', role: 'finance', name: 'Finance User' }
    const approved = decideCommission(state, 'commission:1', 'Approved', actor, '2026-09-01T00:00:00.000Z')
    expect(approved.commissionLedger[0].status).toBe('Approved')
    const paid = payCommission(approved, 'commission:1', actor, '2026-09-02T00:00:00.000Z')
    expect(paid.commissionLedger[0].status).toBe('Paid (Simulated)')
    expect(() => payCommission(paid, 'commission:1', actor)).toThrow()
    expect(() => decideCommission(state, 'commission:1', 'Approved', { id: 'b', role: 'buyer' })).toThrow()
    expect(paid.audit.map((entry) => entry.action)).toEqual(['COMMISSION_PAID_SIMULATED', 'COMMISSION_APPROVED'])
  })
})
