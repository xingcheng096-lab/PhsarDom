const key = (type) => `meridian-demo-${type}`
const uniqueId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
import { buyers as seedBuyers } from '../data'
import { products as seedProducts, quotations as seedQuotations, rfqs as seedRfqs } from '../data'
import { validateQuantity } from '../domain/pricing'
const APPROVAL_DISCOUNT_THRESHOLD = 5

export function getStoredRecords(type, defaults) {
  try {
    const stored = JSON.parse(localStorage.getItem(key(type)) || '[]')
    return [...stored.filter((item) => !item._deleted), ...defaults.filter((item) => !stored.some((saved) => saved.id === item.id))]
  } catch {
    return defaults
  }
}

export function ownsBuyerRecord(record, buyer) {
  if (!record || !buyer) return false
  if (record.buyerId != null && buyer.buyerId != null) return String(record.buyerId) === String(buyer.buyerId)
  if (record.buyer) return record.buyer === buyer.buyerBusiness
  if (record.business) return String(record.id) === String(buyer.buyerId)
  return false
}

export function saveRecord(type, record) {
  const stored = getStoredRecords(type, [])
  const normalized = { ...record, id: record.id || uniqueId() }
  const next = stored.some((item) => item.id === normalized.id) ? stored.map((item) => item.id === normalized.id ? normalized : item) : [normalized, ...stored]
  localStorage.setItem(key(type), JSON.stringify(next))
  return normalized
}

export function createRFQ(input, actor = {}) {
  if (actor.role !== 'buyer' || !actor.buyerId) throw new Error('Only an approved buyer can create an RFQ.')
  const buyer = getStoredRecords('buyers', seedBuyers).find((item) => String(item.id) === String(actor.buyerId))
  if (!buyer || String(buyer.status).toLowerCase() !== 'approved') throw new Error('Only an approved buyer can create an RFQ.')
  if (input.buyer !== buyer.business) throw new Error('RFQ buyer ownership is invalid.')
  const product = seedProducts.find((item) => item.name === input.product)
  const quantity = validateQuantity(input.quantity, product?.moq || 1)
  if (!quantity.ok) throw new Error(quantity.reason)
  const saved = saveRecord('rfqs', { ...input, buyer: buyer.business, buyerId: buyer.id, quantity: quantity.quantity, status: 'New', createdBy: { id: actor.id || actor.buyerId, name: actor.name, role: actor.role }, created: input.created || new Date().toISOString().slice(0, 10) })
  return saved
}

export function createQuotation(input, actor = {}) {
  if (!['sales', 'manager'].includes(actor.role) || !actor.id || !actor.name) throw new Error('Only an authorized sales actor can create a quotation.')
  const rfq = getStoredRecords('rfqs', seedRfqs).find((item) => item.number === input.rfq || String(item.id) === String(input.rfqId))
  if (!rfq) throw new Error('Source RFQ not found.')
  if (input.buyer !== rfq.buyer || (input.product && input.product !== rfq.product)) throw new Error('Quotation buyer/product linkage is invalid.')
  return saveRecord('quotations', { ...input, rfq: rfq.number, rfqId: rfq.id, buyer: rfq.buyer, buyerId: rfq.buyerId, product: rfq.product, createdBy: { id: actor.id, name: actor.name, role: actor.role }, status: input.status || 'Draft' })
}

export function appendHistory(record, entry) {
  return { ...record, history: [...(record.history || []), entry] }
}

export function decideBuyer(id, status, reason = '', actor = {}) {
  if (!['Approved', 'Rejected'].includes(status) || (status === 'Rejected' && !String(reason).trim())) throw new Error('A rejection reason is required.')
  const buyer = getStoredRecords('buyers', seedBuyers).find((item) => String(item.id) === String(id))
  if (!buyer) throw new Error('Buyer not found.')
  const next = { ...buyer, status, verifiedAt: status === 'Approved' ? new Date().toISOString().slice(0, 10) : '', decisionReason: reason, decision: { status, reason, actor: actor.name || 'Demo reviewer', role: actor.label || 'Reviewer', at: new Date().toISOString() } }
  saveRecord('buyers', next)
  return next
}

export function appendNegotiation(type, id, entry) {
  const records = getStoredRecords(type, [])
  const record = records.find((item) => item.id === id)
  if (!record) throw new Error(`${type} record not found.`)
  const next = saveRecord(type, appendHistory({ ...record, negotiations: [...(record.negotiations || []), entry] }, entry))
  return next
}

export function decideQuotation(id, status, { reason = '', actor = {}, threshold = APPROVAL_DISCOUNT_THRESHOLD } = {}) {
  if (!['Approved', 'Rejected', 'Revision Requested'].includes(status)) throw new Error('Invalid quotation decision.')
  if (status !== 'Approved' && !String(reason).trim()) throw new Error('A decision reason is required.')
  const quotes = getStoredRecords('quotations', seedQuotations)
  const quote = quotes.find((item) => item.id === id)
  if (!quote) throw new Error('Quotation not found.')
  if (quote.approval?.status && quote.approval.status !== 'Pending') throw new Error('Quotation has already been decided.')
  const approval = { required: true, threshold, status, reason, requestedBy: quote.approval?.requestedBy || quote.createdBy || 'Account Executive', decidedBy: actor.name || 'Sales Manager', decidedRole: actor.label || 'Sales Manager', decidedAt: new Date().toISOString(), history: [...(quote.approval?.history || []), { status, reason, actor: actor.name || 'Sales Manager', at: new Date().toISOString() }] }
  const nextStatus = status === 'Approved' ? 'Sent' : status === 'Revision Requested' ? 'Negotiating' : 'Rejected'
  return saveRecord('quotations', { ...quote, status: nextStatus, approval })
}

export function submitCounterOffer(id, offer, actor = {}) {
  if (actor.role !== 'buyer' || !actor.name || !actor.buyerId) throw new Error('Only the buyer can submit a counteroffer.')
  const quotes = getStoredRecords('quotations', seedQuotations)
  const quote = quotes.find((item) => item.id === id)
  if (!quote || !['Sent', 'Negotiating'].includes(quote.status)) throw new Error('Quotation is not open for negotiation.')
  if (quote.buyerId != null ? String(quote.buyerId) !== String(actor.buyerId) : quote.buyer !== actor.buyerBusiness) throw new Error('Buyer does not own this quotation.')
  if (quote.expiry && quote.expiry < new Date().toISOString().slice(0, 10)) throw new Error('Quotation has expired.')
  const entry = {
    ...offer,
    price: offer.price ?? offer.unitPrice,
    actorId: actor.id ?? actor.buyerId,
    user: actor.name,
    role: 'Buyer',
    status: 'Countered',
    time: new Date().toISOString()
  }
  return saveRecord('quotations', { ...quote, ...offer, status: 'Negotiating', negotiations: [...(quote.negotiations || []), entry] })
}

export function submitRevisedOffer(id, offer, actor = {}) {
  if (!['sales', 'manager'].includes(actor.role)) throw new Error('Only sales staff can revise a quotation.')
  const quotes = getStoredRecords('quotations', [])
  const quote = quotes.find((item) => item.id === id)
  if (!quote || quote.status !== 'Negotiating') throw new Error('Quotation is not awaiting a revised offer.')
  const next = { ...quote, ...offer, status: offer.approval?.required ? 'Manager Review' : 'Sent', negotiations: [...(quote.negotiations || []), { ...offer, user: actor.name || 'Sales', role: 'Account Executive', status: 'Revised', time: new Date().toISOString() }] }
  return saveRecord('quotations', next)
}

export function convertQuoteToPO(quote, { buyer, actor = {} } = {}) {
  if (!quote || quote.status !== 'Accepted') throw new Error('Only an accepted quotation can convert to a purchase order.')
  const existing = getStoredRecords('purchaseOrders', []).find((po) => po.quote === quote.number)
  if (existing) return existing
  if (!actor.role || !['buyer', 'sales', 'manager'].includes(actor.role)) throw new Error('Unauthorized quote conversion.')
  if (actor.role === 'buyer' && buyer && (actor.buyerId == null || String(actor.buyerId) !== String(buyer.id))) throw new Error('Buyer does not own this quotation.')
  if (buyer && !['Approved', 'Verified'].includes(buyer.status)) throw new Error('Buyer is not eligible for purchasing.')
  const po = saveRecord('purchaseOrders', { number: `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`, buyer: quote.buyer, buyerId: quote.buyerId, quote: quote.number, rfq: quote.rfq, product: quote.product, quantity: Number(quote.quantity), ordered: Number(quote.quantity), unitPrice: Number(quote.unitPrice || 0), amount: Number(quote.amount || 0), terms: quote.terms, delivery: quote.delivery, status: 'Pending', created: new Date().toISOString().slice(0, 10), createdBy: actor.name || 'Demo user' })
  return po
}

export function removeRecord(type, id) {
  const stored = getStoredRecords(type, [])
  const existing = stored.find((item) => item.id === id)
  const next = existing ? stored.map((item) => item.id === id ? { ...item, _deleted: true } : item) : [{ id, _deleted: true }, ...stored]
  localStorage.setItem(key(type), JSON.stringify(next))
}
