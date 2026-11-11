const transitions = {
  quotations: { Draft: ['Sent', 'Rejected'], Sent: ['Negotiating', 'Accepted', 'Rejected', 'Expired'], Negotiating: ['Sent', 'Accepted', 'Rejected', 'Expired'] },
  purchaseOrders: { Draft: ['Pending', 'Cancelled'], Pending: ['Approved', 'Cancelled'], Approved: ['Processing', 'Cancelled'], Processing: ['Partially Shipped', 'Completed', 'Cancelled'], 'Partially Shipped': ['Completed', 'Cancelled'] },
  shipments: { Planned: ['Picking', 'Cancelled'], Picking: ['Packed', 'Cancelled'], Packed: ['Dispatched', 'Cancelled'], Dispatched: ['In Transit'], 'In Transit': ['Partially Delivered', 'Delivered', 'Delayed'], 'Partially Delivered': ['Delivered'] },
}

export function canTransition(type, from, to) { return from === to || Boolean(transitions[type]?.[from]?.includes(to)) }
export function isExpired(expiry, today = new Date().toISOString().slice(0, 10)) { return Boolean(expiry) && String(expiry).slice(0, 10) < today }
export function discountNeedsApproval(discount, threshold = 5) { return Number(discount || 0) > Number(threshold) }
export function canAcceptQuote(quote, today = new Date().toISOString().slice(0, 10)) { return ['Sent', 'Negotiating'].includes(quote?.status) && !isExpired(quote.expiry, today) && quote?.approval?.status !== 'Pending' }
