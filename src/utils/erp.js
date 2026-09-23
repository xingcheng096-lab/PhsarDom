export const TODAY = '2026-09-11'

export function daysDiff(from, to = TODAY) {
  const a = new Date(`${String(from).slice(0, 10)}T12:00:00`)
  const b = new Date(`${String(to).slice(0, 10)}T12:00:00`)
  return Math.round((b - a) / 86400000)
}

export function money(value) {
  return `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function num(value) {
  return Number(value || 0).toLocaleString('en-US')
}

// Merge static invoice with live erp payment/void overrides.
export function invoiceView(invoice, overrides = {}) {
  const ov = overrides[invoice.number]
  if (!ov) return invoice
  const paid = ov.voided ? invoice.amount : Number(ov.paid ?? invoice.paid ?? 0)
  let status = invoice.status
  if (ov.voided) status = 'Cancelled'
  else if (paid > 0 && paid >= invoice.amount) status = 'Paid'
  else if (paid > 0) status = 'Partially Paid'
  else if (daysDiff(invoice.due) > 0 && !['Cancelled'].includes(invoice.status)) status = 'Overdue'
  return { ...invoice, status, paid }
}

export function outstanding(invoice, overrides) {
  const v = invoiceView(invoice, overrides)
  return Math.max(0, v.amount - (v.paid || 0))
}

export function agingBuckets(invoices, overrides = {}) {
  const safeInvoices = Array.isArray(invoices) ? invoices : []
  const buckets = [
    { name: 'Current', min: -1, max: 0, amount: 0, count: 0 },
    { name: '1–30 days', min: 1, max: 30, amount: 0, count: 0 },
    { name: '31–60 days', min: 31, max: 60, amount: 0, count: 0 },
    { name: '61–90 days', min: 61, max: 90, amount: 0, count: 0 },
    { name: '90+ days', min: 91, max: 999999, amount: 0, count: 0 },
  ]
  safeInvoices.forEach((inv) => {
    const v = invoiceView(inv, overrides)
    if (v.status === 'Cancelled' || v.status === 'Paid') return
    const bal = outstanding(inv, overrides)
    const days = daysDiff(v.due)
    const bucket = buckets.find((b) => days >= b.min && days <= b.max) || buckets[0]
    bucket.amount += bal
    bucket.count += 1
  })
  return buckets
}

// Total open exposure for a buyer from static invoices + live overrides + issued credit notes.
export function buyerExposure(buyerName, invoices, overrides = {}, creditNotes = []) {
  const safeInvoices = Array.isArray(invoices) ? invoices : []
  const safeCreditNotes = Array.isArray(creditNotes) ? creditNotes : []
  const open = safeInvoices
    .filter((inv) => inv.buyer === buyerName)
    .reduce((sum, inv) => sum + outstanding(inv, overrides), 0)
  const issuedCredits = safeCreditNotes
    .filter((cn) => cn.buyer === buyerName && ['Issued', 'Applied'].includes(cn.status))
    .reduce((sum, cn) => sum + (cn.amount || 0), 0)
  return { open, credits: issuedCredits, net: Math.max(0, open - issuedCredits) }
}

// Total shipped quantity for a PO (static shipments with their assigned quantity map).
export function poShippedQty(poNumber, shipments, shipmentQty = {}) {
  const safeShipments = Array.isArray(shipments) ? shipments : []
  return safeShipments
    .filter((s) => s.po === poNumber)
    .reduce((sum, s) => sum + (shipmentQty[s.number] ?? 0), 0)
}

// Remaining fulfillment position for an open PO: ordered - shipped - planned (live plans excluded delivered/cancelled).
export function fulfillment(po, shipments, shipmentQty = {}, plans = []) {
  const shipped = poShippedQty(po.number, shipments, shipmentQty)
  const safePlans = Array.isArray(plans) ? plans : []
  const planned = safePlans
    .filter((p) => p.po === po.number && !['Delivered', 'Cancelled'].includes(p.status))
    .reduce((sum, p) => sum + (p.qty || 0), 0)
  const remaining = Math.max(0, po.ordered - shipped - planned)
  return { ...po, shipped, planned, remaining }
}

export function sumBy(items, getter) {
  const safeItems = Array.isArray(items) ? items : []
  return safeItems.reduce((sum, item) => sum + (Number(getter(item)) || 0), 0)
}
