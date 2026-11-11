import { createContext, useContext, useEffect, useState } from 'react'
import { buyers as seedBuyers, inventory, products as seedProducts, purchaseOrders } from '../data'
import {
  seedBackorders, seedCarriers, seedCreditNotes, seedCreditRequests,
  seedDeliveries, seedExceptions, seedPacking, seedPayments, seedPicking,
  seedPlans, seedReceiving, seedReservations, seedStockCounts, seedStockMovements,
} from '../data/erpData'
import { allocateAcrossWarehouses, canPick, canReserve, pickDelta, reservationIdentity, transferInventory } from '../domain/inventory'
import { useSession } from './session'
import { invoices as seedInvoices } from '../data'
import { calculateInvoice, generateInvoice, getCreditAccount, issueCreditNote as issueFinanceCreditNote, recordPayment as recordFinancePayment, setCreditAccount } from '../domain/finance'
import { createShipmentTransaction, recordShipmentDiscrepancy, reconcilePOShipment, transitionShipment } from '../domain/shipments'
import { buildSalesReport } from '../domain/reports'
import { calculateCommissionLedger, commissionActionAllowed, decideCommission, payCommission, validateCommissionRule } from '../domain/commissions'
import { createDirectPurchaseTransaction } from '../domain/directPurchase'
import { getStoredRecords } from './mockStore'

const KEY = 'phsardom-erpv1'
const SEED_VERSION = 'v2-p1'
const TODAY = '2026-09-11'

function initialInventoryOps() {
  return inventory.map((row) => ({
    ...row,
    onHand: row.available + row.reserved + row.allocated,
  }))
}

function initialState() {
  return {
    version: SEED_VERSION,
    creditRequests: seedCreditRequests,
    creditNotes: seedCreditNotes,
    payments: seedPayments,
    reservations: seedReservations,
    receiving: seedReceiving,
    picking: seedPicking,
    packing: seedPacking,
    stockCounts: seedStockCounts,
    backorders: seedBackorders,
    plans: seedPlans,
    deliveries: seedDeliveries,
    exceptions: seedExceptions,
    carriers: seedCarriers,
    movements: seedStockMovements,
    inventoryOps: initialInventoryOps(),
    invoiceOverrides: {},
    audit: [],
    invoices: seedInvoices.map((invoice) => ({
      invoiceId: `seed-${invoice.id}`,
      invoiceNumber: invoice.number,
      po: invoice.po,
      poId: invoice.po,
      buyer: invoice.buyer,
      currency: 'USD',
      issueDate: invoice.created || TODAY,
      dueDate: invoice.due,
      paymentTerms: invoice.terms,
      lineItems: (invoice.items || []).map((item) => ({ productId: item.name, description: item.name, quantity: item.qty, unitPrice: item.unit })),
      subtotal: invoice.amount,
      discount: 0,
      tax: 0,
      total: invoice.amount,
      amountPaid: invoice.paid || 0,
      creditApplied: 0,
      outstanding: Math.max(0, invoice.amount - (invoice.paid || 0)),
      status: invoice.status,
      createdBy: { id: 'seed', role: 'system', name: 'Seed data' },
      createdAt: `${invoice.created || TODAY}T00:00:00.000Z`,
      updatedAt: `${invoice.created || TODAY}T00:00:00.000Z`,
    })),
    creditAccounts: [],
    purchaseOrders,
    shipments: [],
    users: [],
    commissionRules: [],
    commissionLedger: [],
  }
}

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (raw && raw.version === SEED_VERSION) return { ...initialState(), ...raw }
  } catch {
    /* ignore corrupt storage */
  }
  return initialState()
}

const ErpContext = createContext(null)

export function ErpProvider({ children }) {
  const [state, setState] = useState(load)
  const { user } = useSession()

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* storage may be unavailable */
    }
  }, [state])

  const patch = (slice, fn) =>
    setState((prev) => ({ ...prev, [slice]: typeof fn === 'function' ? fn(prev[slice]) : fn }))

  const mutate = (slice, id, update) =>
    patch(slice, (list) => list.map((item) => (item.id === id ? { ...item, ...(typeof update === 'function' ? update(item) : update) } : item)))

  const pushMovement = (m) => patch('movements', (list) => [{ id: Date.now() + Math.round(Math.random() * 1000), date: `${TODAY} ${new Date().toTimeString().slice(0, 5)}`, user: 'System', ...m }, ...list])
  const actor = (override = {}) => ({ id: override.id ?? user?.id ?? user?.buyerId ?? user?.key, role: override.role ?? user?.key, name: override.name ?? user?.name, buyerId: override.buyerId ?? user?.buyerId })
  const canWarehouseMutate = (candidate = {}) => ['admin', 'warehouse', 'inventory', 'manager'].includes(actor(candidate).role)
  const addAudit = ({ action, entityType, entityId, before, after, quantity, related = {}, candidate = {} }) =>
    setState((prev) => ({ ...prev, audit: [{ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, actor: actor(candidate), action, entityType, entityId, timestamp: new Date().toISOString(), before, after, quantity, ...related }, ...prev.audit] }))
  const inventoryPatch = (sku, update) => {
    patch('inventoryOps', (list) =>
      list.map((row) => (row.sku === sku ? { ...row, ...(typeof update === 'function' ? update(row) : update) } : row)),
    )
  }

  const erp = {
    ...state,

    reset: () => setState(initialState()),

    // ---------- Credit requests ----------
    createCreditRequest: (input) => {
      const max = state.creditRequests.reduce((m, r) => Math.max(m, Number(r.number.slice(-3)) || 0), 0)
      const number = `CR-2026-${String(max + 1).padStart(3, '0')}`
      patch('creditRequests', (list) => [
        { id: Date.now(), number, status: 'Pending', priority: 'Medium', submitted: TODAY, requestedBy: 'Elena Petrova', history: [{ user: 'Elena Petrova', action: 'Submitted', comment: 'Credit request created from finance workspace.', time: `${TODAY} 09:30` }], ...input },
        ...list,
      ])
      return number
    },

    applyCreditDecision: (id, status, comment = '', delegateTo = '') =>
      setState((prev) => ({
        ...prev,
        creditRequests: prev.creditRequests.map((r) =>
          r.id === id
            ? {
                ...r,
                status,
                decidedOn: TODAY,
                decidedBy: 'Elena Petrova',
                decisionComment: comment,
                delegateTo,
                history: [...(r.history || []), { user: 'Elena Petrova', action: status, comment: comment || (status === 'Approved' ? 'Approved.' : 'Rejected.'), time: `${TODAY} 09:00` }],
              }
            : r,
        ),
      })),

    // ---------- Stock counts ----------
    submitStockCount: (id) =>
      mutate('stockCounts', id, { adjudicated: true, adjustment: 'Pending' }),

    createStockCount: ({ sku, counted, bin = '', warehouse = '' }) => {
      const row = state.inventoryOps.find((r) => r.sku === sku)
      const systemQty = Number(row?.onHand ?? 0)
      const c = Number(counted)
      const number = `SC-2026-${String(10 + state.stockCounts.length).padStart(3, '0')}`
      patch('stockCounts', (list) => [
        { id: Date.now(), number, sku, product: row?.product || sku, warehouse: warehouse || row?.warehouse || '', bin: bin || row?.bin || '', countedAt: TODAY, systemQty, counted: c, variance: c - systemQty, status: c === systemQty ? 'Matched' : 'Variance', adjudicated: c === systemQty, adjustment: c === systemQty ? 'Approved' : '', adjustmentAt: c === systemQty ? TODAY : '', inventoryRef: number },
        ...list,
      ])
      return number
    },

    applyStockDecision: (id, status, comment = '') => {
      setState((prev) => {
        const c = prev.stockCounts.find((s) => s.id === id)
        if (!c || c.adjustment !== 'Pending') return prev
        const v = Number(c?.variance || 0)
        const approved = status === 'Approved'
        return {
          ...prev,
          stockCounts: prev.stockCounts.map((item) =>
            item.id === id
              ? { ...item, adjudicated: true, adjustment: approved ? 'Approved' : 'Rejected', adjustmentAt: TODAY, adjustmentNote: comment, systemQty: approved ? item.counted : item.systemQty }
              : item,
          ),
          inventoryOps: approved && c
            ? prev.inventoryOps.map((row) => (row.sku === c.sku ? { ...row, available: Math.max(0, row.available + v), onHand: Math.max(0, row.onHand + v) } : row))
            : prev.inventoryOps,
          movements: approved && c
            ? [{ id: Date.now() + Math.round(Math.random() * 99), date: `${TODAY} 09:40`, sku: c.sku, product: c.product, quantity: v, type: 'Adjustment', reference: c.number, user: 'Robert King', warehouse: c.warehouse }, ...prev.movements]
            : prev.movements,
        }
      })
    },

    // ---------- Credit notes ----------
    issueCreditNote: (input) => {
      const number = `CN-2026-${String(316 + state.creditNotes.length).padStart(3, '0')}`
      patch('creditNotes', (list) => [
        { id: Date.now(), number, status: 'Pending Approval', issued: '', history: [{ user: 'Elena Petrova', action: 'Submitted', comment: 'Drafted by finance.', time: `${TODAY} 10:15` }], ...input },
        ...list,
      ])
      return number
    },

    applyCreditNoteDecision: (id, status, comment = '') =>
      mutate('creditNotes', id, {
        status: status === 'Approved' ? 'Issued' : 'Cancelled',
        issued: status === 'Approved' ? TODAY : '',
        history: (item) => [...(item.history || []), { user: 'Elena Petrova', action: status === 'Approved' ? 'Issued' : 'Cancelled', comment, time: `${TODAY} 11:00` }],
      }),

    // ---------- Payments ----------
    recordPayment: (input) => {
      const { invoiceNumber, amount } = input
      const number = `PAY-2026-${String(121 + state.payments.length).padStart(3, '0')}`
      patch('payments', (list) => [{ id: Date.now(), number, date: TODAY, ...input }, ...list])
      setState((prev) => ({
        ...prev,
        invoiceOverrides: {
          ...prev.invoiceOverrides,
          [invoiceNumber]: { paid: (prev.invoiceOverrides[invoiceNumber]?.paid ?? 0) + amount },
        },
      }))
      return number
    },

    voidInvoice: (number) =>
      setState((prev) => ({
        ...prev,
        invoiceOverrides: { ...prev.invoiceOverrides, [number]: { ...prev.invoiceOverrides[number], voided: true } },
      })),

    calculateInvoice,
    buildSalesReport: (filters = {}) => buildSalesReport(state, filters),
    getCommissionLedger: () => calculateCommissionLedger(state, state.commissionRules || []),
    approveCommission: (commissionId, options = {}) => { try { const ledger = calculateCommissionLedger(state, state.commissionRules || []); setState(decideCommission({ ...state, commissionLedger: ledger }, commissionId, 'Approved', actor(options.actor || options))); return { ok: true } } catch (error) { return { ok: false, reason: error.message } } },
    payoutCommission: (commissionId, options = {}) => { try { setState(payCommission(state, commissionId, actor(options.actor || options))); return { ok: true } } catch (error) { return { ok: false, reason: error.message } } },
    addCommissionRule: (input, options = {}) => {
      try {
        const acting = actor(options.actor || options)
        if (!commissionActionAllowed(acting)) throw new Error('Unauthorized commission rule action.')
        const rule = validateCommissionRule({ ...input, id: input.id || `RULE-${Date.now()}`, createdBy: acting }, { ...state, users: state.users.length ? state.users : [] })
        if (state.commissionRules.some((row) => row.id === rule.id)) throw new Error('Commission rule already exists.')
        setState((prev) => ({ ...prev, commissionRules: [rule, ...(prev.commissionRules || [])], audit: [{ id: `${rule.id}:created`, actor: acting, action: 'COMMISSION_RULE_CREATED', entityType: 'commissionRule', entityId: rule.id, timestamp: new Date().toISOString(), before: null, after: rule }, ...prev.audit] }))
        return { ok: true, rule }
      } catch (error) { return { ok: false, reason: error.message } }
    },
    generateInvoiceFromPO: (po, options = {}) => {
      try {
        const result = generateInvoice(state, po, actor(options.actor || options), options)
        if (!result.duplicate) setState(result.state)
        return { ok: true, ...result }
      } catch (error) { return { ok: false, reason: error.message } }
    },
    recordFinancePayment: (invoiceId, input, options = {}) => {
      try { setState(recordFinancePayment(state, invoiceId, input, actor(options.actor || options))); return { ok: true } }
      catch (error) { return { ok: false, reason: error.message } }
    },
    issueFinanceCreditNote: (invoiceId, input, options = {}) => {
      try { setState(issueFinanceCreditNote(state, invoiceId, input, actor(options.actor || options))); return { ok: true } }
      catch (error) { return { ok: false, reason: error.message } }
    },
    getCreditAccount: (buyerId, defaults = {}) => getCreditAccount(state, buyerId, defaults),
    updateCreditAccount: (buyerId, input, options = {}) => {
      try { setState(setCreditAccount(state, buyerId, input, actor(options.actor || options))); return { ok: true } }
      catch (error) { return { ok: false, reason: error.message } }
    },

    // ---------- Reservations ----------
    createDirectPurchaseOrder: (input = {}, options = {}) => {
      try {
        const currentActor = actor(options.actor || options)
          const result = createDirectPurchaseTransaction(state, input, currentActor, { buyers: getStoredRecords('buyers', seedBuyers), products: getStoredRecords('products', seedProducts) })
          if (!result.duplicate) setState(result.state)
          return { ok: true, ...result }
      } catch (error) { return { ok: false, reason: error.message } }
    },
    confirmPurchaseOrder: (po, options = {}) => {
      const currentActor = actor(options.actor || options)
      if (!canWarehouseMutate(currentActor)) return { ok: false, reason: 'Unauthorized warehouse action.' }
      if (!po?.id || !['Pending', 'Confirmed', 'Approved'].includes(po.status)) return { ok: false, reason: 'Purchase order is not confirmable.' }
      const lineId = options.lineId || po.lineId || 1
      const sku = options.sku || po.sku || state.inventoryOps.find((row) => row.product === po.product)?.sku
      const qty = Number(options.quantity || po.quantity || po.ordered || 0)
      if (!sku || !Number.isInteger(qty) || qty <= 0) return { ok: false, reason: 'Invalid PO line quantity or product.' }
      const identityPrefix = `${po.id}:${lineId}:`
      if (state.reservations.some((row) => row.identity?.startsWith(identityPrefix) || (String(row.poId) === String(po.id) && String(row.lineId) === String(lineId)))) return { ok: true, duplicate: true, reservations: state.reservations.filter((row) => row.identity?.startsWith(identityPrefix)) }
      const result = allocateAcrossWarehouses(state.inventoryOps, qty, { sku, poId: po.id, lineId })
      const reservations = result.allocations.map((allocation, index) => ({ id: `${po.id}-${lineId}-${allocation.warehouseId}`, identity: reservationIdentity(po.id, lineId, allocation.warehouseId), number: `RSV-${Date.now()}-${index}`, poId: po.id, po: po.number, lineId, sku, warehouse: allocation.warehouseId, qty: allocation.qty, status: 'Reserved', createdBy: currentActor }))
      if (!reservations.length) return { ok: false, reason: 'Insufficient available stock.', backordered: qty }
      const now = new Date().toISOString()
      setState((prev) => ({ ...prev, reservations: [...reservations, ...prev.reservations], inventoryOps: prev.inventoryOps.map((row) => { const allocated = result.allocations.filter((item) => item.warehouseId === row.warehouse && item.sku === row.sku).reduce((sum, item) => sum + item.qty, 0); return allocated ? { ...row, reserved: Number(row.reserved || 0) + allocated, available: Math.max(0, Number(row.available || 0) - allocated) } : row }), movements: [...result.allocations.map((item) => ({ id: `${po.id}-${lineId}-${item.warehouseId}-reservation`, date: now, sku, quantity: -item.qty, type: 'Reservation', reference: po.number || po.id, warehouse: item.warehouseId, user: currentActor.name })), ...prev.movements], audit: [{ id: `${po.id}-${lineId}-reservation-audit`, actor: currentActor, action: 'PO_CONFIRMED_RESERVED', entityType: 'purchaseOrder', entityId: po.id, timestamp: now, before: { status: po.status }, after: { status: 'Confirmed', reserved: qty - result.backordered, backordered: result.backordered } }, ...prev.audit] }))
      return { ok: true, duplicate: false, reservations, backordered: result.backordered }
    },
    approveReservation: (id) => {
      if (!canWarehouseMutate()) return false
      const res = state.reservations.find((r) => r.id === id)
      if (!res || res.status !== 'Pending') return false
      const row = state.inventoryOps.find((r) => r.sku === res.sku)
      if (!canReserve(row, res.qty)) return false
      mutate('reservations', id, { status: 'Reserved' })
      if (res) {
        inventoryPatch(res.sku, (row) => ({
          reserved: row.reserved + Number(res.qty),
          available: Math.max(0, row.available - Number(res.qty)),
          onHand: Math.max(0, row.onHand),
        }))
        pushMovement({ sku: res.sku, product: res.product, quantity: -Number(res.qty), type: 'Reservation', reference: res.number, warehouse: res.warehouse })
      }
      return true
    },

    releaseReservation: (id) => {
      if (!canWarehouseMutate()) return false
      const res = state.reservations.find((r) => r.id === id)
      if (!res || res.status !== 'Reserved') return false
      mutate('reservations', id, { status: 'Released' })
      if (res) {
        inventoryPatch(res.sku, (row) => ({
          reserved: Math.max(0, row.reserved - Number(res.qty)),
          available: row.available + Number(res.qty),
        }))
        pushMovement({ sku: res.sku, product: res.product, quantity: Number(res.qty), type: 'Release', reference: res.number, warehouse: res.warehouse })
        addAudit({ action: 'RESERVATION_RELEASED', entityType: 'reservation', entityId: id, quantity: Number(res.qty), before: { status: 'Reserved', reserved: res.qty }, after: { status: 'Released', reserved: 0 }, related: { poId: res.poId, productId: res.sku, warehouseId: res.warehouse } })
      }
      return true
    },

    transferStock: ({ transactionId = `TR-${Date.now()}`, sku, sourceWarehouse, destinationWarehouse, quantity } = {}, options = {}) => {
      const currentActor = actor(options.actor || options)
      const transaction = transferInventory(state, { transactionId, sku, sourceWarehouse, destinationWarehouse, quantity }, currentActor)
      if (!transaction.result.ok || transaction.result.duplicate) return transaction.result
      setState(transaction.state)
      return transaction.result
    },

    reallocateReservation: (id) => canWarehouseMutate() && mutate('reservations', id, { status: 'Allocated' }),
    rejectReservation: (id) => canWarehouseMutate() && mutate('reservations', id, { status: 'Rejected' }),

    // ---------- Receiving ----------
    arriveReceiving: (id) => canWarehouseMutate() && mutate('receiving', id, (r) => ({ status: r.status === 'Expected' ? 'Arrived' : r.status })),
    startInboundInspection: (id) => canWarehouseMutate() && mutate('receiving', id, { status: 'Inspecting' }),
    recordReceived: (id, qty) => canWarehouseMutate() && mutate('receiving', id, (r) => ({ received: Math.min(Number(r.qty), Math.max(0, Number(qty) + Number(r.received))) })),
    flagDiscrepancy: (id, note) => canWarehouseMutate() && mutate('receiving', id, { status: 'Discrepancy', discrepancyNote: note }),
    resolveDiscrepancy: (id) => canWarehouseMutate() && mutate('receiving', id, { status: 'Inspecting', discrepancyNote: undefined }),
    completeReceiving: (id, bin) => {
      if (!canWarehouseMutate()) return false
      const rec = state.receiving.find((r) => r.id === id)
      const inventoryRow = rec && state.inventoryOps.find((r) => r.sku === rec.sku && (!rec.warehouse || r.warehouse === rec.warehouse))
      if (!rec || rec.status === 'Completed') return false
      mutate('receiving', id, { status: 'Completed', bin: bin || rec?.bin })
      if (rec) {
        inventoryPatch(rec.sku, (row) => ({
          available: row.available + Number(rec.received || 0),
          onHand: row.onHand + Number(rec.received || 0),
          status: row.available + Number(rec.received || 0) >= row.reorderPoint ? 'Healthy' : row.status,
        }))
        pushMovement({ sku: rec.sku, product: rec.product, quantity: Number(rec.received || 0), type: 'Receiving', reference: rec.number, warehouse: rec.warehouse })
        addAudit({ action: 'STOCK_RECEIVED', entityType: 'receiving', entityId: id, quantity: Number(rec.received || 0), before: { available: inventoryRow?.available, onHand: inventoryRow?.onHand }, after: { available: Number(inventoryRow?.available || 0) + Number(rec.received || 0), onHand: Number(inventoryRow?.onHand || 0) + Number(rec.received || 0) }, related: { poId: rec.po, productId: rec.sku, warehouseId: rec.warehouse } })
      }
      return true
    },

    // ---------- Picking ----------
    startPick: (id) =>
      canWarehouseMutate() && mutate('picking', id, { status: 'Picking' }),
    recordPicked: (id, qty) => {
      if (!canWarehouseMutate()) return false
      const pk = state.picking.find((p) => p.id === id)
      const row = pk && state.inventoryOps.find((r) => r.sku === pk.sku)
      const n = Number(qty)
      if (!pk || pk.status !== 'Picking' || !Number.isInteger(n) || n <= 0 || n > Number(pk.qty) - Number(pk.picked || 0) || !pickDelta(row, n).ok) return false
      mutate('picking', id, (r) => ({ picked: Number(r.picked || 0) + n }))
      return true
    },
    reportShortage: (id, reason) =>
      mutate('picking', id, { status: 'Shortage', shortageReason: reason }),
    completePick: (id) => {
      if (!canWarehouseMutate()) return false
      const pk = state.picking.find((p) => p.id === id)
      const row = pk && state.inventoryOps.find((r) => r.sku === pk.sku)
      if (!pk || pk.status === 'Picked' || !canPick(row, pk.picked || 0)) return false
      mutate('picking', id, { status: 'Picked' })
      if (pk) {
        inventoryPatch(pk.sku, (row) => ({ reserved: Math.max(0, row.reserved - Number(pk.picked || 0)) }))
        pushMovement({ sku: pk.sku, product: pk.product, quantity: -(Number(pk.picked) || 0), type: 'Pick', reference: pk.number, warehouse: pk.warehouse })
        addAudit({ action: 'STOCK_PICKED', entityType: 'picking', entityId: id, quantity: Number(pk.picked || 0), before: { reserved: row?.reserved }, after: { reserved: Math.max(0, Number(row?.reserved || 0) - Number(pk.picked || 0)) }, related: { poId: pk.po, productId: pk.sku, warehouseId: pk.warehouse } })
      }
      return true
    },

    // ---------- Packing ----------
    startPacking: (id) =>
      canWarehouseMutate() && mutate('packing', id, { status: 'Packing' }),
    completePacking: (id) => canWarehouseMutate() && (() => {
      const pack = state.packing.find((item) => item.id === id)
      const pick = pack && state.picking.find((item) => item.number === pack.pick || (item.po === pack.po && item.sku === pack.sku))
      if (!pack || pack.status !== 'Packing' || !pick || Number(pick.picked || 0) < Number(pack.qty || 0)) return false
      const result = mutate('packing', id, { status: 'Ready to Ship', packed: Number(pack.qty || 0) })
      addAudit({ action: 'STOCK_PACKED', entityType: 'packing', entityId: id, quantity: Number(pack.qty || 0), before: { status: 'Packing', packed: 0 }, after: { status: 'Ready to Ship', packed: Number(pack.qty || 0) }, related: { poId: pack.po, productId: pack.sku, warehouseId: pack.warehouse } })
      return result
    })(),
    preparePlan: (id) => mutate('plans', id, { status: 'Packed' }),

    // ---------- Shipment planning ----------
    createPlan: (input) => {
      const number = `SHP-2026-${String(7722 + state.plans.length).padStart(3, '0')}`
      patch('plans', (list) => [
        { id: Date.now(), number, status: 'Planned', priority: 'Medium', events: [{ label: 'Plan created', detail: 'Created from shipment planning workspace', time: `${TODAY} 08:00` }], ...input },
        ...list,
      ])
      return number
    },
    advancePlan: (id, status, note = '') =>
      mutate('plans', id, (p) => ({
        status,
        events: [...(p.events || []), { label: status, detail: note || p.number, time: `${TODAY} 12:00` }],
      })),
    cancelPlan: (id) =>
      mutate('plans', id, { status: 'Cancelled' }),

    // ---------- Shipments ----------
    createShipmentFromPO: (input, options = {}) => {
      try {
        const result = createShipmentTransaction(state, input, actor(options.actor || options))
        if (!result.duplicate) setState(result.state)
        return { ok: true, ...result }
      } catch (error) { return { ok: false, reason: error.message } }
    },
    transitionShipment: (shipmentId, target, data = {}, options = {}) => {
      try { setState(transitionShipment(state, shipmentId, target, actor(options.actor || options), data)); return { ok: true } }
      catch (error) { return { ok: false, reason: error.message } }
    },
    confirmDelivery: (shipmentId, input = {}, options = {}) => {
      try {
        const current = state.shipments.find((row) => row.shipmentId === shipmentId || row.shipmentNumber === shipmentId)
        const target = Number(input.deliveredQuantity || 0) < Number(current?.dispatchedQuantity || 0) ? 'Partially Delivered' : 'Delivered'
        setState(transitionShipment(state, shipmentId, target, actor(options.actor || options), { deliveredQuantity: Number(input.deliveredQuantity || 0), proofOfDelivery: input }, new Date().toISOString())); return { ok: true }
      }
      catch (error) { return { ok: false, reason: error.message } }
    },
    recordShipmentDiscrepancy: (shipmentId, input = {}, options = {}) => {
      try { const result = recordShipmentDiscrepancy(state, shipmentId, input, actor(options.actor || options)); if (!result.duplicate) setState(result.state); return { ok: true, ...result } }
      catch (error) { return { ok: false, reason: error.message } }
    },
    getShipment: (shipmentId, candidate = {}) => {
      const currentActor = actor(candidate)
      const shipment = state.shipments.find((row) => row.shipmentId === shipmentId || row.shipmentNumber === shipmentId)
      if (!shipment) return null
      if (currentActor.role === 'buyer' && String(shipment.buyerId) !== String(currentActor.buyerId)) return null
      return shipment
    },
    getPOShipmentReconciliation: (poId) => {
      const po = state.purchaseOrders.find((row) => String(row.id) === String(poId) || String(row.number) === String(poId))
      return reconcilePOShipment(po, state.packing, state.shipments)
    },

    // ---------- Deliveries ----------
    markDelivery: (id, pod) =>
      mutate('deliveries', id, { status: 'Delivered', pod: pod || 'Signed — delivered', date: TODAY }),

    // ---------- Exceptions ----------
    assignException: (id, owner) =>
      mutate('exceptions', id, { status: 'Assigned', owner }),
    addExceptionNote: (id, text) =>
      mutate('exceptions', id, (e) => ({
        note: text,
        timeline: [...(e.timeline || []), { time: `${TODAY} 14:00`, by: 'Lucas Meyer', text }],
      })),
    resolveException: (id, text) =>
      mutate('exceptions', id, (e) => ({
        status: 'Resolved',
        resolutionNote: text,
        timeline: [...(e.timeline || []), { time: `${TODAY} 16:30`, by: 'Lucas Meyer', text: text || 'Resolved.' }],
      })),
  }

  return <ErpContext.Provider value={erp}>{children}</ErpContext.Provider>
}

export function useErp() {
  const ctx = useContext(ErpContext)
  if (!ctx) throw new Error('useErp must be used inside <ErpProvider>')
  return ctx
}
