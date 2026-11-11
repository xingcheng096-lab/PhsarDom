const roles = new Set(['admin', 'finance', 'manager'])
const cents = (value) => Math.round((Number(value) || 0) * 100)
export function validateCommissionRule(rule, state = {}) {
  if (!rule?.salespersonId || !Number.isFinite(Number(rule.rate)) || Number(rule.rate) < 0 || Number(rule.rate) > 100) throw new Error('A valid salesperson and commission rate from 0 to 100 are required.')
  if ((state.users || []).length && !state.users.some((user) => String(user.id) === String(rule.salespersonId))) throw new Error('Salesperson not found.')
  return { ...rule, rate: Number(rule.rate), status: rule.status || 'Active' }
}
export function calculateCommissionLedger(state = {}, rules = []) {
  const payments = state.payments || []
  return payments.map((payment) => {
    const po = (state.purchaseOrders || []).find((row) => row.number === payment.po || row.id === payment.poId)
    const rule = rules.find((item) => item.status === 'Active' && (!item.effectiveDate || item.effectiveDate <= (payment.date || '9999-12-31')))
    const eligible = cents(payment.amount)
    const id = `commission:${payment.id || payment.number}`
    const prior = (state.commissionLedger || []).find((item) => item.id === id)
    return { id, paymentId: payment.id || payment.number, sourcePO: po?.number, sourceInvoice: payment.invoiceNumber, salespersonId: rule?.salespersonId || po?.salespersonId, ruleSnapshot: rule ? { id: rule.id, rate: rule.rate } : null, eligibleAmount: eligible / 100, commissionAmount: rule ? cents(eligible / 100 * rule.rate / 100) / 100 : 0, status: prior?.status || 'Pending', ...(prior?.approvedBy ? { approvedBy: prior.approvedBy, approvedAt: prior.approvedAt } : {}), ...(prior?.paidBy ? { paidBy: prior.paidBy, paidAt: prior.paidAt } : {}), calculatedAt: payment.date || new Date().toISOString() }
  })
}
export function commissionActionAllowed(actor) { return Boolean(actor?.id && roles.has(actor.role)) }
export function decideCommission(state, commissionId, decision, actor, now = new Date().toISOString()) {
  if (!commissionActionAllowed(actor)) throw new Error('Unauthorized commission approval action.')
  const row = (state.commissionLedger || []).find((item) => item.id === commissionId)
  if (!row) throw new Error('Commission entry not found.')
  if (decision !== 'Approved' || row.status !== 'Pending') throw new Error('Invalid commission approval transition.')
  const updated = { ...row, status: 'Approved', approvedBy: actor, approvedAt: now }
  return { ...state, commissionLedger: state.commissionLedger.map((item) => item.id === commissionId ? updated : item), audit: [{ id: `${commissionId}:approved`, actor, action: 'COMMISSION_APPROVED', entityType: 'commission', entityId: commissionId, timestamp: now, before: { status: row.status }, after: { status: updated.status } }, ...(state.audit || [])] }
}
export function payCommission(state, commissionId, actor, now = new Date().toISOString()) {
  if (!commissionActionAllowed(actor)) throw new Error('Unauthorized commission payout action.')
  const row = (state.commissionLedger || []).find((item) => item.id === commissionId)
  if (!row) throw new Error('Commission entry not found.')
  if (row.status !== 'Approved') throw new Error('Only approved commission can be simulated as paid.')
  const updated = { ...row, status: 'Paid (Simulated)', paidBy: actor, paidAt: now }
  return { ...state, commissionLedger: state.commissionLedger.map((item) => item.id === commissionId ? updated : item), audit: [{ id: `${commissionId}:paid`, actor, action: 'COMMISSION_PAID_SIMULATED', entityType: 'commission', entityId: commissionId, timestamp: now, before: { status: row.status }, after: { status: updated.status } }, ...(state.audit || [])] }
}
