const FINANCE_ROLES = ['admin', 'finance', 'manager']

export function minor(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) throw new Error('Invalid monetary amount.')
  return Math.round(n * 100)
}

export function moneyFromMinor(value) { return Number(value || 0) / 100 }

export function dueDate(issueDate, terms = 'Net-30') {
  const match = String(terms).match(/Net-(30|60|90)/i)
  if (!match) throw new Error('Unsupported payment terms.')
  const date = new Date(`${issueDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + Number(match[1]))
  return date.toISOString().slice(0, 10)
}

export function financeActor(actor) {
  if (!actor?.id || !actor?.role) throw new Error('A valid finance actor is required.')
  return actor
}

export function canFinance(actor, action = 'edit') {
  return Boolean(actor?.id && FINANCE_ROLES.includes(actor.role) && (action !== 'approve' || ['admin', 'finance', 'manager'].includes(actor.role)))
}

export function creditExposure(state, buyerId) {
  if (buyerId == null) return 0
  return (state.invoices || []).filter((invoice) => String(invoice.buyerId) === String(buyerId)).reduce((sum, invoice) => sum + minor(invoice.outstanding ?? 0), 0) / 100
}

export function getCreditAccount(state, buyerId, defaults = {}) {
  const saved = (state.creditAccounts || []).find((account) => String(account.buyerId) === String(buyerId))
  const creditLimit = Number(saved?.creditLimit ?? defaults.creditLimit ?? 0)
  const currentExposure = creditExposure(state, buyerId)
  return { buyerId, creditLimit, approvedTerms: saved?.approvedTerms || defaults.approvedTerms || 'Net-30', currentExposure, availableCredit: Math.max(0, creditLimit - currentExposure), creditStatus: saved?.creditStatus || (currentExposure > creditLimit ? 'Hold' : 'Active') }
}

export function setCreditAccount(state, buyerId, input, actor) {
  if (!canFinance(actor, 'approve')) throw new Error('Unauthorized credit-limit action.')
  const creditLimit = Number(input.creditLimit)
  if (!Number.isFinite(creditLimit) || creditLimit < 0) throw new Error('Credit limit must be non-negative.')
  const current = getCreditAccount(state, buyerId, input)
  if (input.creditStatus === 'Active' && current.currentExposure > creditLimit) throw new Error('Credit limit is below current exposure.')
  const next = { ...current, ...input, buyerId, creditLimit, currentExposure: current.currentExposure, availableCredit: Math.max(0, creditLimit - current.currentExposure) }
  const accounts = [...(state.creditAccounts || []).filter((item) => String(item.buyerId) !== String(buyerId)), next]
  return { ...state, creditAccounts: accounts, audit: [{ id: `finance-credit-${buyerId}-${Date.now()}`, actor, action: 'CREDIT_LIMIT_UPDATED', entityType: 'creditAccount', entityId: buyerId, timestamp: new Date().toISOString(), before: current, after: next, buyerId }, ...(state.audit || [])] }
}

export function calculateInvoice({ lineItems = [], discount = 0, tax = 0, currency = 'USD' }) {
  const lines = lineItems.map((line) => ({ ...line, quantity: Number(line.quantity ?? line.qty), unitPriceMinor: minor(line.unitPrice ?? line.unit ?? 0), lineTotalMinor: Math.round(Number(line.quantity ?? line.qty) * minor(line.unitPrice ?? line.unit ?? 0)) }))
  if (lines.some((line) => !Number.isInteger(line.quantity) || line.quantity <= 0)) throw new Error('Invoice quantities must be positive integers.')
  const subtotalMinor = lines.reduce((sum, line) => sum + line.lineTotalMinor, 0)
  const discountMinor = minor(discount)
  const taxMinor = minor(tax)
  const totalMinor = Math.max(0, subtotalMinor - discountMinor + taxMinor)
  return { currency, lineItems: lines, subtotal: moneyFromMinor(subtotalMinor), discount: moneyFromMinor(discountMinor), tax: moneyFromMinor(taxMinor), total: moneyFromMinor(totalMinor), subtotalMinor, totalMinor }
}

export function generateInvoice(state, po, actor, options = {}) {
  if (!po) throw new Error('Purchase order not found.')
  if (!canFinance(actor, 'create')) throw new Error('Unauthorized finance action.')
  const existing = (state.invoices || []).find((item) => item.poId === po.id || item.po === po.number)
  if (existing) return { state, invoice: existing, duplicate: true }
  const quantity = Number(options.quantity ?? po.ordered ?? po.quantity)
  if (!Number.isInteger(quantity) || quantity <= 0 || quantity > Number(po.ordered ?? po.quantity)) throw new Error('Invoice quantity exceeds PO eligibility.')
  const unitPrice = Number(options.unitPrice ?? po.unitPrice ?? (Number(po.amount || 0) / quantity))
  const calc = calculateInvoice({ lineItems: [{ productId: po.productId || po.sku || po.product, description: po.product, quantity, unitPrice }], discount: options.discount || 0, tax: options.tax || 0, currency: options.currency || 'USD' })
  const account = getCreditAccount(state, po.buyerId, { creditLimit: po.creditLimit, creditStatus: po.creditStatus })
  if (po.buyerId != null && (account.creditStatus === 'Hold' || (account.creditLimit > 0 && account.currentExposure + calc.total > account.creditLimit))) throw new Error('Buyer credit limit or hold prevents invoicing.')
  const invoice = { invoiceId: `INV-${Date.now()}`, invoiceNumber: `INV-2026-${String(Date.now()).slice(-6)}`, poId: po.id, po: po.number, buyerId: po.buyerId, buyer: po.buyer, currency: calc.currency, issueDate: options.issueDate || new Date().toISOString().slice(0, 10), dueDate: dueDate(options.issueDate || new Date().toISOString().slice(0, 10), options.paymentTerms || po.terms || 'Net-30'), paymentTerms: options.paymentTerms || po.terms || 'Net-30', ...calc, amountPaid: 0, creditApplied: 0, outstanding: calc.total, status: 'Issued', createdBy: actor, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  return { state: { ...state, invoices: [invoice, ...(state.invoices || [])], audit: [{ id: `finance-${invoice.invoiceId}`, actor, action: 'INVOICE_GENERATED', entityType: 'invoice', entityId: invoice.invoiceId, timestamp: invoice.createdAt, before: null, after: invoice, poId: po.id, buyerId: po.buyerId }, ...(state.audit || [])] }, invoice, duplicate: false }
}

export function recordPayment(state, invoiceId, payment, actor) {
  if (!canFinance(actor, 'edit')) throw new Error('Unauthorized finance action.')
  const invoice = (state.invoices || []).find((item) => item.invoiceId === invoiceId || item.invoiceNumber === invoiceId)
  if (!invoice) throw new Error('Invoice not found.')
  const amountMinor = minor(payment.amount)
  const outstandingMinor = minor(invoice.outstanding)
  if (amountMinor <= 0 || amountMinor > outstandingMinor) throw new Error('Payment exceeds outstanding balance.')
  if (!payment.reference) throw new Error('Payment reference is required.')
  if ((state.payments || []).some((item) => item.reference === payment.reference)) throw new Error('Duplicate payment reference.')
  const nextPaid = moneyFromMinor(minor(invoice.amountPaid) + amountMinor)
  const nextOutstanding = moneyFromMinor(outstandingMinor - amountMinor)
  const nextInvoice = { ...invoice, amountPaid: nextPaid, outstanding: nextOutstanding, status: nextOutstanding === 0 ? 'Paid' : 'Partially Paid', updatedAt: new Date().toISOString() }
  const savedPayment = { paymentId: `PAY-${Date.now()}`, invoiceId: invoice.invoiceId, buyerId: invoice.buyerId, amount: moneyFromMinor(amountMinor), paymentMethod: payment.paymentMethod || payment.method, reference: payment.reference, paymentDate: payment.paymentDate || new Date().toISOString().slice(0, 10), recordedBy: actor, status: 'Recorded' }
  return { ...state, invoices: state.invoices.map((item) => item.invoiceId === invoice.invoiceId ? nextInvoice : item), payments: [savedPayment, ...(state.payments || [])], audit: [{ id: `finance-${savedPayment.paymentId}`, actor, action: 'PAYMENT_RECORDED', entityType: 'invoice', entityId: invoice.invoiceId, timestamp: new Date().toISOString(), before: invoice, after: nextInvoice, amount: savedPayment.amount }, ...(state.audit || [])] }
}

export function issueCreditNote(state, invoiceId, credit, actor) {
  if (!canFinance(actor, 'approve')) throw new Error('Unauthorized credit action.')
  const invoice = (state.invoices || []).find((item) => item.invoiceId === invoiceId || item.invoiceNumber === invoiceId)
  if (!invoice) throw new Error('Invoice not found.')
  const amountMinor = minor(credit.amount)
  const creditedMinor = minor(invoice.creditApplied || 0)
  if (amountMinor <= 0 || creditedMinor + amountMinor > minor(invoice.total ?? invoice.amount)) throw new Error('Credit exceeds eligible invoice balance.')
  if (!String(credit.reference || '').trim()) throw new Error('Credit note reference is required.')
  if ((state.creditNotes || []).some((item) => item.reference === credit.reference)) throw new Error('Duplicate credit note reference.')
  const next = { ...invoice, creditApplied: moneyFromMinor(creditedMinor + amountMinor), outstanding: Math.max(0, moneyFromMinor(minor(invoice.outstanding ?? invoice.total ?? invoice.amount) - amountMinor)), updatedAt: new Date().toISOString() }
  const note = { creditNoteId: `CN-${Date.now()}`, invoiceId: invoice.invoiceId, buyerId: invoice.buyerId, reason: credit.reason, amount: moneyFromMinor(amountMinor), reference: credit.reference, createdBy: actor, createdAt: new Date().toISOString(), status: 'Issued' }
  return { ...state, invoices: state.invoices.map((item) => item.invoiceId === invoice.invoiceId ? next : item), creditNotes: [note, ...(state.creditNotes || [])], audit: [{ id: `finance-${note.creditNoteId}`, actor, action: 'CREDIT_NOTE_ISSUED', entityType: 'invoice', entityId: invoice.invoiceId, timestamp: note.createdAt, before: invoice, after: next, creditNoteId: note.creditNoteId }, ...(state.audit || [])] }
}
