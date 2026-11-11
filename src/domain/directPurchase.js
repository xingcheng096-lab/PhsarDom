import { getCreditAccount } from './finance'
import { priceForQuantity } from './pricing'

export function createDirectPurchaseTransaction(state, input = {}, actor = {}, { buyers = [], products = [] } = {}) {
  if (actor.role !== 'buyer' || !actor.buyerId) throw new Error('A valid buyer session is required for direct purchase.')
  const buyer = buyers.find((row) => String(row.id) === String(actor.buyerId))
  if (!buyer || String(buyer.status || '').trim().toLowerCase() !== 'approved') throw new Error('Only an approved buyer can buy directly.')
  if (input.buyerId != null && String(input.buyerId) !== String(buyer.id)) throw new Error('Buyer ownership is invalid.')
  const product = products.find((row) => String(row.id) === String(input.productId) || row.sku === input.sku)
  if (!product || product.status === 'Draft' || product.status === 'Discontinued') throw new Error('Product is not available for direct purchase.')
  const pricing = priceForQuantity(input.quantity, product, buyer.group)
  if (!pricing.ok) throw new Error(pricing.reason || 'A valid published price is required.')
  if (Number(product.stock || 0) < pricing.quantity) throw new Error('Insufficient available stock for direct purchase.')
  const account = getCreditAccount(state, buyer.id, buyer)
  if (account.creditStatus === 'Hold' || (account.creditLimit > 0 && account.currentExposure + pricing.total > account.creditLimit)) throw new Error('Buyer credit limit or hold prevents direct purchase.')
  const idempotencyKey = String(input.idempotencyKey || '')
  if (!idempotencyKey) throw new Error('A purchase confirmation reference is required.')
  const duplicate = (state.purchaseOrders || []).find((row) => row.source === 'DIRECT_PURCHASE' && row.idempotencyKey === idempotencyKey)
  if (duplicate) return { state, duplicate: true, purchaseOrder: duplicate }
  const now = new Date().toISOString()
  const purchaseOrder = {
    id: `DPO-${Date.now()}`, number: `PO-DIRECT-${String(Date.now()).slice(-6)}`, source: 'DIRECT_PURCHASE', idempotencyKey,
    buyer: buyer.business, buyerId: buyer.id, productId: product.id, sku: product.sku, product: product.name,
    quantity: pricing.quantity, ordered: pricing.quantity, unitPrice: pricing.unitPrice, amount: pricing.total,
    terms: account.approvedTerms || 'Net-30', status: 'Pending', created: now.slice(0, 10), createdAt: now,
    shipped: 0, remaining: pricing.quantity, createdBy: actor,
  }
  return {
    state: {
      ...state,
      purchaseOrders: [purchaseOrder, ...(state.purchaseOrders || [])],
      audit: [{ id: `direct-po-${purchaseOrder.id}`, actor, action: 'DIRECT_PURCHASE_ORDER_CREATED', entityType: 'purchaseOrder', entityId: purchaseOrder.id, timestamp: now, before: null, after: purchaseOrder, buyerId: buyer.id, productId: product.id }, ...(state.audit || [])],
    },
    duplicate: false,
    purchaseOrder,
    pricing,
  }
}
