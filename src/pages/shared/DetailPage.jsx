import { useEffect, useState } from 'react'
import { AlertTriangle, ArrowRight, BadgeCheck, Banknote, Check, CheckCircle2, ClipboardCopy, Clock3, Download, Eye, FileSearch, FileText, Handshake, MessageSquare, Package, Send, ShieldAlert, Truck, Undo2, X } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import { Stepper, Timeline } from '../../components/common/Timeline'
import { Alert, Card, ConfirmDialog, Modal, SelectInput, StatusBadge, Textarea, TextInput } from '../../components/ui'
import { activityLogs, buyers, contracts, inventory, invoices, products, purchaseOrders, quotations, rfqs, shipments, stockMovements, warehouses } from '../../data'
import { currency, number, titleCase } from '../../utils/format'

const sources = { buyers, products, rfqs, quotations, purchaseOrders, contracts, invoices, shipments, warehouses, inventory }
const pathMap = { rfqs: 'rfqs', quotations: 'quotations', purchaseOrders: 'purchase-orders', contracts: 'contracts', invoices: 'invoices', shipments: 'shipments', buyers: 'buyers', inventory: 'inventory' }
const tabMap = {
  products: ['Overview', 'Pricing', 'Specifications', 'Documents', 'Activity'],
  buyers: ['Overview', 'Documents', 'Verification', 'RFQs', 'Quotations', 'POs', 'Invoices', 'Activity'],
  rfqs: ['Workspace', 'Documents', 'Activity'],
  quotations: ['Overview', 'Pricing', 'Documents', 'Activity'],
  purchaseOrders: ['Overview', 'Items', 'Payments', 'Documents', 'Activity'],
  contracts: ['Overview', 'Milestones', 'Documents', 'Activity'],
  invoices: ['Overview', 'Payments', 'Documents', 'Activity'],
  shipments: ['Tracking', 'Packages', 'Documents', 'Activity'],
  warehouses: ['Overview', 'Stock', 'Bins', 'Activity'],
  inventory: ['Overview', 'Movements', 'Activity'],
}
const quoteSteps = ['Draft', 'Manager Review', 'Sent to Buyer', 'Negotiation', 'Accepted']
const poSteps = ['Created', 'Approved', 'Processing', 'Partially Shipped', 'Completed']
const verificationSteps = [
  ['Registration', 'Company profile submitted and contact verified'],
  ['Documents Submitted', 'Business documents uploaded for review'],
  ['Under Review', 'Verification team checking submitted documents'],
  ['Verification', 'Risk assessment and credit evaluation'],
  ['Approved', 'Account verified for wholesale purchasing'],
]

function rootFor(location) { return location.pathname.split('/')[1] }
function linkFor(root, type, id) { return `/${root}/${pathMap[type]}/${id}` }
function statusActive(type, status) {
  if (type === 'quotations') return ['Draft', 'Manager Review', 'Sent', 'Negotiating', 'Accepted'].indexOf(status) >= 0 ? quoteSteps.indexOf(status === 'Sent' ? 'Sent to Buyer' : status) : status === 'Sent' ? 2 : 1
  if (type === 'purchaseOrders') return ['Pending', 'Approved', 'Processing', 'Partially Shipped', 'Completed'].indexOf(status)
  return Math.max(0, ['Pending', 'Under Review', 'Quoted', 'Negotiating', 'Accepted'].indexOf(status))
}

function KeyValue({ label, children, className = '' }) {
  return <div className={className}><dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 break-words font-medium text-slate-800">{children}</dd></div>
}
function DetailGrid({ row, type }) {
  const exclude = ['id', 'image', 'tiers', 'description', 'specs', 'documents', 'notes', 'negotiations', 'approval', 'items', 'events', 'paymentSchedule', 'milestones', 'quotation', 'quote', 'listPrice', 'unitPrice', 'quantity', 'salesRep', 'submittedBy', 'verifiedAt', 'risk', 'group']
  const order = Object.keys(row).filter((key) => !exclude.includes(key))
  const format = (key, value) => {
    if (key === 'status' || key === 'terms' && typeof value === 'string' && value.startsWith('Net')) return value
    if (key === 'status') return <StatusBadge status={value} />
    if (typeof value === 'number' && ['amount', 'value', 'price', 'targetPrice', 'creditLimit', 'paid'].includes(key)) return currency(value)
    if (key === 'quantity' || key === 'stock' || key === 'ordered' || key === 'shipped' || key === 'remaining' || key === 'moq') return number(value)
    if (typeof value === 'string' && value.match(/^202\d(-|\s)/)) return value
    return String(value ?? '—')
  }
  return <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">{order.map((key) => <KeyValue label={titleCase(key)} key={key}>{format(key, row[key])}</KeyValue>)}</dl>
}
function StatTile({ label, value, tone = 'slate', sub }) {
  const tones = { green: 'text-emerald-600', amber: 'text-amber-600', red: 'text-red-600', blue: 'text-blue-600', violet: 'text-violet-600', slate: 'text-slate-900' }
  return <Card bodyClassName="p-4"><small className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</small><strong className={`mt-1 block text-2xl ${tones[tone]}`}>{value}</strong>{sub && <span className="mt-1 block text-xs text-slate-500">{sub}</span>}</Card>
}
function UnderlineLink({ root, type, row, children }) {
  return <Link to={linkFor(root, type, row.id)} className="font-semibold text-brand-700 hover:underline">{children || row.number || row.name}</Link>
}
function DocumentCard({ doc, verification = false }) {
  const [preview, setPreview] = useState(false)
  const download = () => { const body = `PhsarDom document\n${doc.name}\nType: ${doc.type || 'Document'}\nUploaded: ${doc.uploaded || 'N/A'}\nStatus: ${doc.status || 'Pending'}`; const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([body], { type: 'text/plain' })); link.download = doc.name.replace(/\.[^.]+$/, '') + '.txt'; link.click(); URL.revokeObjectURL(link.href) }
  const verified = String(doc.status || '').toLowerCase()
  const tone = verified.includes('verified') ? 'emerald' : verified.includes('under') || verified.includes('pending') ? 'amber' : 'slate'
  const tones = { emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700', amber: 'border-amber-200 bg-amber-50 text-amber-700', slate: 'border-slate-200 bg-slate-100 text-slate-600' }
  return <div className="rounded-lg border border-slate-200 p-4 transition hover:border-brand-300 hover:shadow-sm">
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-600"><FileText size={18} /></span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <strong className="truncate text-xs text-slate-800">{doc.name}</strong>
          {doc.status && <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tones[tone]}`}>{doc.status}</span>}
        </div>
        <small className="mt-1 block text-slate-500">{doc.type || 'Document'} · uploaded {doc.uploaded}</small>
      </div>
    </div>
    <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
      <button onClick={() => setPreview(true)} className="btn-secondary !px-2.5 !py-1 text-[11px]"><Eye size={13} /> Preview</button>
      <button onClick={download} className="btn-secondary !px-2.5 !py-1 text-[11px]"><Download size={13} /> Download</button>
      {verification && <span className="ml-auto flex items-center gap-1 text-[11px] text-slate-500">{verified.includes('verified') ? <CheckCircle2 size={13} className="text-emerald-600" /> : <Clock3 size={13} className="text-amber-500" />}{verified.includes('verified') ? 'Verified' : 'In verification'}</span>}
    </div>
    <Modal open={preview} title={doc.name} onClose={() => setPreview(false)}><div className="space-y-3"><div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-700"><strong className="block text-slate-900">{doc.type || 'Document'}</strong><span className="block">Uploaded {doc.uploaded || 'N/A'}</span><span className="block">Status: {doc.status || 'Pending'}</span><p className="mt-4 border-t border-slate-200 pt-4">This local preview represents the document record available in the wholesale account workspace.</p></div><button className="btn-primary" onClick={download}><Download size={14} />Download local copy</button></div></Modal>
  </div>
}
function DocumentsSection({ docs, verification = false }) {
  const list = Array.isArray(docs) && docs.length ? docs : [{ id: 1, name: 'Business License 2026.pdf', type: 'Business License', uploaded: '2026-01-12', status: 'Verified' }, { id: 2, name: 'IRS Tax Certificate.pdf', type: 'Tax Certificate', uploaded: '2026-01-12', status: 'Verified' }, { id: 3, name: 'Company Registration.pdf', type: 'Company Registration', uploaded: '2026-01-12', status: 'Verified' }]
  return <Card title="Submitted Documents" subtitle="Commercial verification records" bodyClassName="p-5">{list.length ? <div className="grid gap-4 md:grid-cols-2">{list.map((doc) => <DocumentCard doc={doc} key={doc.id} verification={verification} />)}</div> : <p className="text-sm text-slate-500">No documents uploaded yet.</p>}</Card>
}
function ActivitySection({ type, rowId }) {
  const items = activityLogs.length ? activityLogs.slice(0, 4) : []
  return <Card title="Activity History" subtitle="Audit trail for this record">{items.map((log, index) => <div className="flex gap-3 border-b py-3 first:pt-0 last:border-0" key={log.id}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700"><Send size={14} /></span><div className="min-w-0"><strong className="text-xs">{log.description}</strong><small className="mt-1 block">{log.user} · {log.role} · {log.time} · {log.ip}</small></div></div>)}</Card>
}
function NegotiationThread({ negotiations }) {
  const items = Array.isArray(negotiations) && negotiations.length ? negotiations : []
  if (!items.length) return <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">No negotiation activity yet. Counter offers will appear here.</div>
  return <ol className="space-y-3">{items.map((entry, index) => {
    const isBuyer = /Buyer/i.test(entry.role)
    const statusTone = entry.status === 'Accepted' ? 'text-emerald-600' : entry.status === 'Rejected' ? 'text-red-600' : entry.status === 'Countered' || entry.status === 'Offered' ? 'text-brand-700' : 'text-slate-500'
    return <li className="flex gap-3" key={index}>
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${isBuyer ? 'bg-blue-50 text-blue-600' : 'bg-brand-50 text-brand-700'}`}>{/^[A-Z]/.test(entry.user) ? entry.user.split(' ').map((x) => x[0]).slice(0, 2).join('') : 'AE'}</span>
      <div className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50/50 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-800">{entry.user} <span className="font-normal text-slate-500">· {entry.role}</span></span>
          <span className={`text-[11px] font-semibold ${statusTone}`}>{entry.status}</span>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
          {entry.price != null && <span className="rounded bg-white px-2 py-0.5 font-semibold text-slate-700">{currency(entry.price)}/unit</span>}
          {entry.quantity != null && <span className="rounded bg-white px-2 py-0.5 text-slate-600">{number(entry.quantity)} qty</span>}
          {entry.terms && <span className="rounded bg-white px-2 py-0.5 text-slate-600">{entry.terms}</span>}
        </div>
        {entry.comment && <p className="mt-1.5 text-xs leading-5 text-slate-600">{entry.comment}</p>}
        <small className="mt-1.5 block text-[10px] text-slate-400">{entry.time}</small>
      </div>
    </li>
  })}</ol>
}
function CommercialSummary({ quote }) {
  const quantity = quote.quantity || 240
  const unitPrice = quote.unitPrice || quote.amount / quantity
  const subtotal = unitPrice * quantity
  const shipping = quote.shipping ?? 360
  const tax = quote.tax ?? Math.round(subtotal * 0.08)
  const total = subtotal + shipping + tax
  const discountPct = quote.listPrice ? Math.round((1 - unitPrice / quote.listPrice) * 1000) / 10 : quote.discount || 0
  return <dl className="space-y-3 text-sm">
    <div className="flex justify-between"><dt className="text-slate-500">Quantity</dt><dd>{number(quantity)} units</dd></div>
    {quote.listPrice && <div className="flex justify-between"><dt className="text-slate-500">List unit price</dt><dd className="text-slate-400 line-through">{currency(quote.listPrice)}</dd></div>}
    <div className="flex justify-between"><dt className="text-slate-500">Offered unit price</dt><dd className="font-semibold">{currency(unitPrice)}</dd></div>
    <div className="flex justify-between"><dt className="text-slate-500">Discount vs list</dt><dd className={discountPct > 10 ? 'font-semibold text-amber-600' : 'text-slate-600'}>{discountPct}% {discountPct > 10 && <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold">Approval</span>}</dd></div>
    <div className="flex justify-between border-t border-slate-100 pt-3"><dt className="text-slate-500">Subtotal</dt><dd className="font-semibold">{currency(subtotal)}</dd></div>
    <div className="flex justify-between"><dt className="text-slate-500">Shipping</dt><dd>{currency(shipping)}</dd></div>
    <div className="flex justify-between"><dt className="text-slate-500">Tax (est.)</dt><dd>{currency(tax)}</dd></div>
    <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold text-slate-950"><dt>Grand total</dt><dd>{currency(total)}</dd></div>
    <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs"><span><small className="block text-slate-500">Payment terms</small><strong>{quote.terms || 'Net-30'}</strong></span><span><small className="block text-slate-500">Delivery</small><strong className="break-words">{quote.delivery || 'Delivered DDP'}</strong></span></div>
  </dl>
}
function ApprovalBanner({ quote }) {
  const approval = quote.approval
  if (!approval || !approval.required) return null
  const status = approval.status || 'Pending'
  const tones = { Pending: 'border-amber-200 bg-amber-50', Approved: 'border-emerald-200 bg-emerald-50', Rejected: 'border-red-200 bg-red-50' }
  return <div className={`rounded-lg border p-4 ${tones[status] || tones.Pending}`}>
    <div className="flex items-center gap-2">
      <ShieldAlert size={16} className={status === 'Approved' ? 'text-emerald-600' : status === 'Rejected' ? 'text-red-600' : 'text-amber-600'} />
      <strong className="text-xs">{status === 'Pending' ? 'Manager approval required' : `Manager approval ${status.toLowerCase()}`}</strong>
      <StatusBadge status={status} />
    </div>
    <div className="mt-3 grid gap-2 text-xs sm:grid-cols-4">
      <span><small className="block text-slate-500">Standard price</small><strong>{currency(approval.standardPrice)}</strong></span>
      <span><small className="block text-slate-500">Proposed price</small><strong>{currency(approval.proposedPrice)}</strong></span>
      <span><small className="block text-slate-500">Variance</small><strong>{Math.round((1 - approval.proposedPrice / approval.standardPrice) * 1000) / 10}%</strong></span>
      <span><small className="block text-slate-500">Submitted by</small><strong>{approval.requestedBy || '—'}</strong></span>
    </div>
    {status === 'Pending' && <p className="mt-3 text-[11px] text-slate-500">Discount exceeds the {approval.threshold}% approval threshold. The Sales Manager must approve, reject, or request a revision before this quote can be finalized.</p>}
  </div>
}
function ProductPricingPanel({ product }) {
  const [quantity, setQuantity] = useState(product.moq)
  const activeTier = [...product.tiers].reverse().find((t) => quantity >= t.min) || product.tiers[0]
  const nextTier = product.tiers.find((t) => t.min > quantity)
  const unitPrice = activeTier.price
  const subtotal = quantity * unitPrice
  const firstSubtotal = quantity * product.tiers[0].price
  const savings = Math.max(0, firstSubtotal - subtotal)
  const isBest = activeTier.max === null
  const contractPrice = Math.round(unitPrice * 0.94 * 100) / 100
  return <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
    <Card title="Tier pricing" subtitle="Wholesale unit price by order quantity" bodyClassName="p-0">
      <div className="overflow-x-auto"><table className="w-full min-w-[480px] text-sm">
        <thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="p-3 text-left">Quantity</th><th className="p-3 text-left">Unit price</th><th className="p-3 text-right">Tier</th></tr></thead>
        <tbody>{product.tiers.map((t) => { const active = quantity >= t.min && (!t.max || quantity <= t.max); const best = t.max === null; return <tr key={t.min} className={`border-t ${active ? 'bg-brand-50' : 'hover:bg-slate-50'}`}><td className="p-3 font-semibold">{t.min}{t.max ? ` - ${t.max}` : '+'}</td><td className="p-3 font-semibold">{currency(t.price)}</td><td className="p-3 text-right">{best ? <span className="inline-flex rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">Best price</span> : active ? <span className="inline-flex rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700">Current tier</span> : null}</td></tr> }) }</tbody>
      </table></div>
    </Card>
    <Card title="Quantity price calculator" subtitle="Estimate your wholesale cost" bodyClassName="p-5">
      <label className="block"><span className="form-label">Order quantity</span>
        <input type="number" min={product.moq} value={quantity} onChange={(e) => setQuantity(Math.max(product.moq, Number(e.target.value) || product.moq))} className="form-control" />
        <span className="mt-1.5 block text-xs text-slate-500">Minimum order {product.moq} {product.unit}s</span>
      </label>
      <dl className="mt-4 space-y-2.5 border-t border-slate-100 pt-4 text-sm"><div className="flex justify-between"><dt className="text-slate-500">Unit price</dt><dd className="font-semibold">{currency(unitPrice)}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd className="font-semibold">{currency(subtotal)}</dd></div>{savings > 0 && <div className="flex justify-between text-emerald-700"><dt>Savings vs first tier</dt><dd className="font-semibold">-{currency(savings)}</dd></div>}{isBest && <div className="rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-700">You reached the best available wholesale price.</div>}</dl>
      {nextTier ? <p className="mt-3 rounded-md bg-brand-50 px-3 py-2 text-xs text-brand-800">Add {number(nextTier.min - quantity)} more units to unlock {currency(nextTier.price)}/unit.</p> : <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-700">Best price applied for this quantity.</p>}
      <div className="mt-4 rounded-lg border border-violet-200 bg-violet-50 p-3"><div className="flex items-center justify-between text-xs"><span className="font-semibold text-violet-700">Your contract price</span><span className="font-bold text-violet-800">{currency(contractPrice)}</span></div><small className="mt-1 block text-[11px] text-violet-600">Exclusive to verified PhsarDom buyers on active contracts.</small></div>
      <Link to="/buyer/rfqs/new" className="btn-primary mt-5 w-full py-2.5 text-xs">Request a quote <ArrowRight size={14} /></Link>
    </Card>
  </div>
}
function WorkspacePart({ title, children, action }) { return <Card title={title} action={action} bodyClassName="p-5">{children}</Card> }

export default function DetailPage({ type, title }) {
  const { id } = useParams()
  const location = useLocation()
  const root = rootFor(location)
  const found = (sources[type] || []).find((item) => item.id === Number(id))
  const availableTabs = tabMap[type] || ['Overview', 'Documents', 'Activity']
  const [tab, setTab] = useState(availableTabs[0])
  const [row, setRow] = useState(found)
  const [notice, setNotice] = useState('')
  const [modal, setModal] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [form, setForm] = useState({ reason: '', targetDoc: '', price: '', quantity: '', terms: 'Net-30', comment: '', note: '' })
  const isBuyer = root === 'buyer'
  const isManager = root === 'manager'
  const isStaff = root === 'manager' || root === 'admin' || root === 'sales'

  useEffect(() => { setTab(availableTabs[0]); setRow(found); setNotice(''); setModal(null); setConfirm(null) }, [id, type, availableTabs])

  if (!found || !row) return <div className="surface-card p-10 text-center"><h1 className="text-xl font-semibold">Record not found</h1><p className="mt-2 text-slate-500">This record may have been removed or the address is invalid.</p><Link to={`/admin/dashboard`} className="btn-primary mt-5">Return to dashboard</Link></div>

  const heading = row.number || row.name || row.business
  const copy = async () => { await navigator.clipboard?.writeText(heading); setNotice(`${heading} copied to clipboard.`) }
  const now = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  const bump = (patch) => setRow((current) => ({ ...current, ...patch }))
  const openModal = (kind) => { setForm({ reason: '', targetDoc: '', price: row.unitPrice || '', quantity: row.quantity || '', terms: row.terms || 'Net-30', comment: '', note: '' }); setModal(kind) }

  const verification = type === 'buyers' ? verificationSteps.map(([label, sub], index) => ({ label, sub, done: ['Approved'].includes(row.status) ? index < 4 : index < ({ Pending: 1, 'Under Review': 2, 'Need More Information': 2, Rejected: 3, Suspended: 2, Approved: 4 }[row.status] || 1), current: index === ({ Pending: 1, 'Under Review': 2, 'Need More Information': 2, Rejected: 3, Suspended: 2, Approved: 4 }[row.status] || 1) })) : []

  const headerActions = []
  if (type === 'buyers' && (root === 'admin' || root === 'sales')) {
    if (['Pending', 'Under Review', 'Need More Information'].includes(row.status)) headerActions.push(<button className="btn-primary" key="approve" onClick={() => setConfirm('approve')}><BadgeCheck size={15} /> Approve Buyer</button>)
    if (['Pending', 'Under Review', 'Need More Information'].includes(row.status)) headerActions.push(<button className="btn-secondary" key="reject" onClick={() => openModal('reject')}>Reject</button>)
    if (['Pending', 'Under Review', 'Need More Information'].includes(row.status)) headerActions.push(<button className="btn-secondary" key="info" onClick={() => openModal('requestInfo')}>Request More Info</button>)
    if (row.status === 'Approved') headerActions.push(<button className="btn-secondary" key="suspend" onClick={() => setConfirm('suspend')}>Suspend</button>)
    headerActions.push(<button className="btn-secondary" key="note" onClick={() => openModal('note')}><MessageSquare size={15} /> Add Note</button>)
  }
  if (type === 'quotations' && isBuyer) {
    if (['Sent', 'Negotiating'].includes(row.status)) headerActions.push(<button className="btn-primary" key="accept" onClick={() => setConfirm('acceptQuote')}><Check size={15} /> Accept Quote</button>)
    if (['Sent', 'Negotiating'].includes(row.status)) headerActions.push(<button className="btn-secondary" key="rejectQ" onClick={() => setConfirm('rejectQuote')}><X size={15} /> Reject Quote</button>)
    if (['Sent', 'Negotiating'].includes(row.status)) headerActions.push(<button className="btn-secondary" key="counter" onClick={() => openModal('counter')}><Handshake size={15} /> Counter Offer</button>)
  }
  if (type === 'quotations' && isManager && row.approval?.required && row.approval?.status === 'Pending') {
    headerActions.push(<button className="btn-primary" key="appr" onClick={() => setConfirm('approveQuote')}><BadgeCheck size={15} /> Approve</button>)
    headerActions.push(<button className="btn-secondary" key="rej" onClick={() => openModal('revision')}>Reject</button>)
    headerActions.push(<button className="btn-secondary" key="rev" onClick={() => openModal('revision')}><Undo2 size={15} /> Request Revision</button>)
  }
  if (type === 'quotations' && root === 'sales' && row.status === 'Draft') headerActions.push(<button className="btn-primary" key="send" onClick={() => setConfirm('sendQuote')}><Send size={15} /> Send to Buyer</button>)
  if (type === 'purchaseOrders' && (root === 'admin' || root === 'sales') && row.remaining > 0) headerActions.push(<button className="btn-primary" key="ship" onClick={() => setConfirm('ship')}><Truck size={15} /> Record Shipment</button>)
  if (type === 'contracts' && (root === 'admin' || root === 'sales') && row.status === 'Expiring') headerActions.push(<button className="btn-primary" key="renew" onClick={() => setConfirm('renew')}>Renew Contract</button>)
  if (type === 'products') headerActions.push(<button className="btn-secondary" key="copy" onClick={copy}><ClipboardCopy size={15} /> Copy SKU</button>)

  let activeIndex = -1
  if (type === 'quotations') { const map = { Draft: 0, 'Manager Review': 1, Sent: 2, Negotiating: 3, Accepted: 4 }; activeIndex = map[row.status] ?? 1 }
  if (type === 'purchaseOrders') { const map = { Pending: 0, Approved: 1, Processing: 2, 'Partially Shipped': 3, Completed: 4 }; activeIndex = map[row.status] ?? 0 }

  const panel = () => {
    if (tab === 'Documents') return <DocumentsSection docs={row.documents} verification={type === 'buyers'} />
    if (tab === 'Activity') return <ActivitySection type={type} rowId={row.id} />

    if (type === 'buyers') {
      const scopedRfqs = rfqs.filter((item) => item.buyer === row.business)
      const scopedQuotes = quotations.filter((item) => item.buyer === row.business)
      const scopedPos = purchaseOrders.filter((item) => item.buyer === row.business)
      const scopedInv = invoices.filter((item) => item.buyer === row.business)
      const used = row.creditLimit ? Math.round(row.creditLimit * 0.65) : 0
      const pct = Math.min(100, Math.round((used / row.creditLimit) * 100))
      if (tab === 'Overview') return <>
        <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatTile label="Credit Limit" value={currency(row.creditLimit)} tone="blue" /><StatTile label="Credit Used" value={currency(used)} tone="amber" /><StatTile label="Available Credit" value={currency(Math.max(0, row.creditLimit - used))} tone="green" /><StatTile label="Risk Level" value={row.risk || 'Low'} tone={String(row.risk).toLowerCase() === 'high' ? 'red' : String(row.risk).toLowerCase() === 'medium' ? 'amber' : 'green'} /></div>
        <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
          <Card title="Business Information" subtitle="Registered company profile" bodyClassName="p-5"><DetailGrid row={row} type={type} /></Card>
          <div className="space-y-5">
            <Card title="Credit Utilization" bodyClassName="p-5"><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-600" style={{ width: `${pct}%` }} /></div><div className="mt-3 flex justify-between text-xs"><span className="text-slate-500">{currency(used)} used</span><span className="font-semibold">{pct}%</span></div><div className="mt-4 grid grid-cols-2 gap-3 text-xs"><span className="rounded-md bg-slate-50 p-2"><small className="block text-slate-500">Buyer group</small><strong>{row.group || 'Unassigned'}</strong></span><span className="rounded-md bg-slate-50 p-2"><small className="block text-slate-500">Account status</small><strong><StatusBadge status={row.status} /></strong></span></div></Card>
            <Card title="Internal Notes" subtitle={`${(row.notes || []).length} note(s)`} bodyClassName="p-5">{row.notes && row.notes.length ? <ol className="space-y-3">{row.notes.map((note, index) => <li key={index} className="rounded-md bg-slate-50 p-3"><p className="text-xs leading-5 text-slate-700">{note.body}</p><small className="mt-1.5 block text-[10px] text-slate-400">{note.author} · {note.time}</small></li>)}</ol> : <p className="text-sm text-slate-500">No internal notes yet.</p>}</Card>
          </div>
        </div>
      </>
      if (tab === 'Verification') return <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Verification Timeline" subtitle="Buyer onboarding & verification status" bodyClassName="p-5"><ol className="space-y-0">{verification.map((step, index) => <li className="relative flex gap-3 pb-6 last:pb-0" key={index}><span className={`relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${step.done ? 'border-emerald-500 bg-emerald-500 text-white' : step.current ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 bg-white text-slate-400'}`}>{step.done ? <Check size={14} /> : index + 1}</span>{index < verification.length - 1 && <span className={`absolute left-[13px] top-7 h-full w-0.5 ${step.done ? 'bg-emerald-200' : 'bg-slate-200'}`} />}<span><strong className="block text-xs font-semibold text-slate-800">{step.label}</strong><small className="mt-0.5 block text-slate-500">{step.sub}</small></span></li>)}</ol></Card>
        <div className="space-y-5">
          <Card title="Verification Actions" subtitle="Manage this buyer account" bodyClassName="p-5"><div className="flex flex-wrap gap-2">{headerActions.filter(Boolean).map((node, i) => <span key={i}>{node}</span>)}<button className="btn-secondary" onClick={copy}><ClipboardCopy size={15} /> Copy reference</button></div><p className="mt-3 text-xs text-slate-500">Approve unlocks wholesale purchasing. Rejection is recorded on the audit log with a required reason.</p></Card>
          <Card title="Approval & Suspension History" bodyClassName="p-5"><ol className="space-y-2 text-xs"><li className="flex items-center gap-2 border-b border-slate-100 pb-2 last:border-0"><ShieldAlert size={13} className="text-brand-600" /><span className="text-slate-600">Account created</span><span className="ml-auto text-slate-400">{row.registered}</span></li><li className="flex items-center gap-2 border-b border-slate-100 pb-2 last:border-0"><CheckCircle2 size={13} className="text-emerald-600" /><span className="text-slate-600">{row.status === 'Approved' ? 'Verified by compliance' : row.status === 'Suspended' ? 'Account suspended' : 'Verification in progress'}</span><span className="ml-auto text-slate-400">{row.verifiedAt || row.registered}</span></li><li className="flex items-center gap-2"><StatusBadge status={row.status} /><span className="ml-auto text-slate-400">Current</span></li></ol></Card>
        </div>
      </div>
      if (tab === 'RFQs') return <Card title="Requested Quotes" bodyClassName="p-0">{scopedRfqs.length ? <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="p-3 text-left">RFQ</th><th className="p-3 text-left">Product</th><th className="p-3 text-right">Quantity</th><th className="p-3 text-right">Target</th><th className="p-3 text-left">Rep</th><th className="p-3 text-left">Status</th></tr></thead><tbody>{scopedRfqs.map((item) => <tr className="border-t hover:bg-slate-50" key={item.id}><td className="p-3"><UnderlineLink root={root} type="rfqs" row={item} /></td><td className="p-3">{item.product}</td><td className="p-3 text-right">{number(item.quantity)}</td><td className="p-3 text-right">{currency(item.targetPrice)}</td><td className="p-3">{item.rep}</td><td className="p-3"><StatusBadge status={item.status} /></td></tr>)}</tbody></table></div> : <p className="p-5 text-sm text-slate-500">No RFQs for this buyer.</p>}</Card>
      if (tab === 'Quotations') return <Card title="Quotations" bodyClassName="p-0">{scopedQuotes.length ? <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="p-3 text-left">Quote</th><th className="p-3 text-left">RFQ</th><th className="p-3 text-right">Amount</th><th className="p-3 text-right">Discount</th><th className="p-3 text-left">Expiry</th><th className="p-3 text-left">Status</th></tr></thead><tbody>{scopedQuotes.map((item) => <tr className="border-t hover:bg-slate-50" key={item.id}><td className="p-3"><UnderlineLink root={root} type="quotations" row={item} /></td><td className="p-3">{item.rfq}</td><td className="p-3 text-right font-semibold">{currency(item.amount)}</td><td className="p-3 text-right">{item.discount}%</td><td className="p-3">{item.expiry}</td><td className="p-3"><StatusBadge status={item.status} /></td></tr>)}</tbody></table></div> : <p className="p-5 text-sm text-slate-500">No quotations yet.</p>}</Card>
      if (tab === 'POs') return <Card title="Purchase Orders" bodyClassName="p-0">{scopedPos.length ? <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="p-3 text-left">PO</th><th className="p-3 text-left">Quote</th><th className="p-3 text-right">Amount</th><th className="p-3 text-left">Terms</th><th className="p-3 text-left">Delivery</th><th className="p-3 text-left">Status</th></tr></thead><tbody>{scopedPos.map((item) => <tr className="border-t hover:bg-slate-50" key={item.id}><td className="p-3"><UnderlineLink root={root} type="purchaseOrders" row={item} /></td><td className="p-3">{item.quote}</td><td className="p-3 text-right font-semibold">{currency(item.amount)}</td><td className="p-3">{item.terms}</td><td className="p-3">{item.delivery}</td><td className="p-3"><StatusBadge status={item.status} /></td></tr>)}</tbody></table></div> : <p className="p-5 text-sm text-slate-500">No purchase orders yet.</p>}</Card>
      if (tab === 'Invoices') return <Card title="Invoices" bodyClassName="p-0">{scopedInv.length ? <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="p-3 text-left">Invoice</th><th className="p-3 text-left">PO</th><th className="p-3 text-right">Amount</th><th className="p-3 text-right">Balance</th><th className="p-3 text-left">Due</th><th className="p-3 text-left">Status</th></tr></thead><tbody>{scopedInv.map((item) => <tr className="border-t hover:bg-slate-50" key={item.id}><td className="p-3"><UnderlineLink root={root} type="invoices" row={item} /></td><td className="p-3">{item.po}</td><td className="p-3 text-right font-semibold">{currency(item.amount)}</td><td className="p-3 text-right">{currency(Math.max(0, item.amount - (item.paid || 0)))}</td><td className="p-3">{item.due}</td><td className="p-3"><StatusBadge status={item.status} /></td></tr>)}</tbody></table></div> : <p className="p-5 text-sm text-slate-500">No invoices yet.</p>}</Card>
      return <Card title="Overview" bodyClassName="p-5"><DetailGrid row={row} type={type} /></Card>
    }

    if (type === 'products') {
      if (tab === 'Overview') return <DetailGrid row={row} type={type} />
      if (tab === 'Pricing') return <ProductPricingPanel product={row} />
      if (tab === 'Specifications') return <Card title="Product Specifications" subtitle={`${row.sku} · Category: ${row.category}`} bodyClassName="p-5"><dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 md:grid-cols-3">{Object.entries(row.specs || {}).map(([label, value]) => <KeyValue label={label} key={label}>{value}</KeyValue>)}</dl></Card>
      return null
    }

    if (type === 'rfqs') {
      if (tab === 'Workspace') return <div className="grid gap-5 xl:grid-cols-[1fr_1.15fr]">
        <div className="space-y-5">
          <Card title="Request Details" bodyClassName="p-5"><DetailGrid row={{ ...row, targetPrice: undefined }} type={type} /><div className="mt-5 grid gap-4 sm:grid-cols-2"><KeyValue label="Target Unit Price">{currency(row.targetPrice)}</KeyValue><KeyValue label="Required Delivery">{row.delivery || '—'}</KeyValue><KeyValue label="Shipping Destination">{row.location || '—'}</KeyValue><KeyValue label="Payment Terms">{row.terms || 'Net-30'}</KeyValue></div><div className="mt-5 rounded-lg bg-slate-50 p-4"><small className="form-label">Buyer notes</small><p className="mt-1 text-sm leading-6 text-slate-700">{row.message || 'No notes provided.'}</p></div></Card>
          <Card title="Workflow Status" bodyClassName="p-5"><Timeline items={['Draft', 'Submitted', 'Under Review', 'Quoted', 'Negotiating', 'Accepted']} active={Math.max(0, ['Draft', 'Submitted', 'Under Review', 'Quoted', 'Negotiating', 'Accepted'].indexOf(row.status))} /></Card>
        </div>
        <Card title="Quote Workspace" subtitle="Current negotiation position" bodyClassName="p-5">
          <NegotiationThread negotiations={row.negotiations || [{ user: row.buyer, role: 'Buyer', price: row.targetPrice, quantity: row.quantity, terms: row.terms, comment: row.message, time: `${row.created} 10:30`, status: 'Requested' }]} />
          <div className="mt-5 border-t border-slate-100 pt-4">
            {root === 'sales' || root === 'manager' ? <div className="flex flex-wrap gap-2"><button className="btn-primary" onClick={() => alert('Quote draft created from this RFQ (demo).')}><FileSearch size={15} /> Create quote</button><button className="btn-secondary" onClick={() => alert('RFQ marked as quoted (demo).')}>Mark as Quoted</button></div> : <Link to="/buyer/rfqs/new" className="btn-secondary"><Send size={15} /> Submit revision</Link>}
            <p className="mt-3 text-xs text-slate-500">Negotiation entries from the buyer and account executive appear real-time once a quote is sent.</p>
          </div>
        </Card>
      </div>
      return null
    }

    if (type === 'quotations') {
      if (tab === 'Pricing') return <PricingSection quote={row} />
      if (tab === 'Overview') return <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
        <div className="space-y-5">
          <Card title="Commercial Summary" bodyClassName="p-5"><CommercialSummary quote={row} /></Card>
          <ApprovalBanner quote={row} />
        </div>
        <Card title="Negotiation History" subtitle="Full buyer ↔ sales negotiation thread" bodyClassName="p-5">
          <NegotiationThread negotiations={row.negotiations} />
        </Card>
      </div>
      return null
    }

    if (type === 'purchaseOrders') {
      const pct = Math.min(100, Math.round((row.shipped / row.ordered) * 100))
      if (tab === 'Items') return <Card title="Order Items" subtitle={row.number} bodyClassName="p-0"><div className="overflow-x-auto"><table className="w-full min-w-[520px] text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="p-3 text-left">Product / Service</th><th className="p-3 text-right">Ordered</th><th className="p-3 text-right">Shipped</th><th className="p-3 text-right">Remaining</th><th className="p-3 text-right">Amount</th></tr></thead><tbody><tr className="border-t"><td className="p-3 font-semibold">{row.quote ? `${quotations.find((q) => q.number === row.quote)?.buyer === row.buyer ? 'Wholesale line item' : 'Wholesale line item'}` : 'Wholesale line item'}<small className="ml-2 text-slate-400">{row.supplier} · {row.quote}</small></td><td className="p-3 text-right">{number(row.ordered)}</td><td className="p-3 text-right font-semibold text-brand-700">{number(row.shipped)}</td><td className="p-3 text-right">{number(row.remaining)}</td><td className="p-3 text-right font-semibold">{currency(row.amount)}</td></tr></tbody></table></div></Card>
      if (tab === 'Payments') return <Card title="Payment Schedule" subtitle={row.terms} bodyClassName="p-0">{row.paymentSchedule ? <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="p-3 text-left">Milestone</th><th className="p-3 text-right">Percentage</th><th className="p-3 text-right">Amount</th><th className="p-3 text-left">Due</th><th className="p-3 text-left">Status</th></tr></thead><tbody>{row.paymentSchedule.map((m, index) => <tr className="border-t" key={index}><td className="p-3 font-semibold">{m.label}</td><td className="p-3 text-right">{m.percent}%</td><td className="p-3 text-right">{currency(m.amount)}</td><td className="p-3">{m.due}</td><td className="p-3"><StatusBadge status={m.status} /></td></tr>)}</tbody></table></div> : <p className="p-5 text-sm text-slate-500">Payment schedule pending.</p>}</Card>
      if (tab === 'Overview') return <div className="space-y-5">
        <Card title="PO Status Timeline" subtitle={row.number} bodyClassName="p-5"><div className="overflow-x-auto pb-1"><Stepper items={poSteps} active={activeIndex} /></div></Card>
        <div className="grid gap-5 lg:grid-cols-3">
          <Card title="Shipment Progress" subtitle={`${number(row.shipped)} of ${number(row.ordered)} units delivered`} bodyClassName="p-5"><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} /></div><div className="mt-3 flex justify-between text-xs"><span className="text-slate-500">Shipped</span><span className="font-semibold">{pct}%</span></div><div className="mt-4 grid grid-cols-3 gap-2 text-center"><span className="rounded-md bg-slate-50 p-2"><small className="block text-slate-500">Ordered</small><strong>{number(row.ordered)}</strong></span><span className="rounded-md bg-emerald-50 p-2"><small className="block text-emerald-600">Shipped</small><strong className="text-emerald-700">{number(row.shipped)}</strong></span><span className="rounded-md bg-amber-50 p-2"><small className="block text-amber-600">Remaining</small><strong className="text-amber-700">{number(row.remaining)}</strong></span></div>{row.remaining === 0 && <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-700">Order fully shipped.</p>}</Card>
          <Card title="Order Summary" bodyClassName="p-5"><dl className="space-y-3 text-sm"><div className="flex justify-between"><dt className="text-slate-500">Supplier</dt><dd className="text-right font-semibold">{row.supplier}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Quote reference</dt><dd>{row.quote || '—'}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Payment terms</dt><dd>{row.terms}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Delivery address</dt><dd className="max-w-[45%] text-right">{row.deliveryAddress}</dd></div><div className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold"><dt>Order total</dt><dd>{currency(row.amount)}</dd></div></dl></Card>
          <Card title="Delivery Milestones" bodyClassName="p-5"><ol className="space-y-0">{row.milestones?.map((m, index) => <li className="relative flex gap-3 pb-5 last:pb-0" key={index}><span className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${m.status === 'Completed' ? 'border-emerald-500 bg-emerald-500 text-white' : m.status === 'In Progress' ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 bg-white text-slate-400'}`}>{m.status === 'Completed' ? <Check size={12} /> : index + 1}</span>{index < row.milestones.length - 1 && <span className={`absolute left-[11px] top-6 h-full w-0.5 ${m.status === 'Completed' ? 'bg-emerald-200' : 'bg-slate-200'}`} />}<span><strong className="block text-xs font-semibold text-slate-800">{m.label}</strong><small className="mt-0.5 block text-slate-500">{m.date}{m.status !== 'Completed' && m.status !== 'In Progress' ? ' · Sched.' : ` · ${m.status}`}</small></span></li>)}</ol></Card>
        </div>
      </div>
      return null
    }

    if (type === 'contracts') {
      if (tab === 'Milestones') return <Card title="Contract Milestones" subtitle="Commitment and renewal checkpoints" bodyClassName="p-5"><ol className="space-y-0">{row.milestones?.map((m, index) => <li className="relative flex gap-3 pb-5 last:pb-0" key={index}><span className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${m.status === 'Completed' ? 'border-emerald-500 bg-emerald-500 text-white' : m.status === 'In Progress' ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 bg-white text-slate-400'}`}>{m.status === 'Completed' ? <Check size={12} /> : index + 1}</span>{index < row.milestones.length - 1 && <span className={`absolute left-[11px] top-6 h-full w-0.5 ${m.status === 'Completed' ? 'bg-emerald-200' : 'bg-slate-200'}`} />}<span><strong className="block text-xs font-semibold text-slate-800">{m.label}</strong><small className="mt-0.5 block text-slate-500">{m.date} · {m.status}</small></span></li>)}</ol></Card>
      if (tab === 'Overview') return <div className="space-y-5">
        {row.status === 'Expiring' && <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><AlertTriangle size={18} /><div><strong>Contract expires on {row.end}</strong><p className="text-xs">Renewal proposal due {row.renews}. Renew now to keep uninterrupted wholesale pricing and reserved stock.</p></div><button className="btn-primary ml-auto !py-1.5 text-xs" onClick={() => setConfirm('renew')}>Renew Contract</button></div>}
        {row.status === 'Pending Approval' && <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800"><Clock3 size={18} /><div><strong>Pending legal approval</strong><p className="text-xs">Terms drafted · awaiting legal review and buyer sign-off.</p></div></div>}
        <div className="grid gap-5 xl:grid-cols-2"><Card title="Contract Terms" bodyClassName="p-5"><DetailGrid row={row} type={type} /></Card><Card title="Contract Summary" bodyClassName="p-5"><dl className="space-y-3 text-sm"><div className="flex justify-between"><dt className="text-slate-500">Agreed MOQ</dt><dd className="font-semibold">{number(row.moq)} units / quarter</dd></div><div className="flex justify-between"><dt className="text-slate-500">Payment terms</dt><dd>{row.terms}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Renewal reminder</dt><dd className="font-semibold text-amber-600">{row.renews}</dd></div><div className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold"><dt>Contract value</dt><dd>{currency(row.value)}</dd></div></dl><div className="mt-4 flex flex-wrap gap-2"><button className="btn-secondary" onClick={() => alert('Renewal proposal drafted (demo).')}><FileText size={14} /> Draft renewal</button><button className="btn-secondary" onClick={() => alert('Contract summary downloaded (demo).')}><Download size={14} /> Export summary</button></div></Card></div>
      </div>
      return null
    }

    if (type === 'invoices') {
      const balance = Math.max(0, row.amount - (row.paid || 0))
      const pct = Math.min(100, Math.round(((row.paid || 0) / row.amount) * 100))
      const overdue = row.status === 'Overdue'
      if (tab === 'Payments') return <Card title="Payment Activity" subtitle={`${currency(row.paid)} paid of ${currency(row.amount)}`} bodyClassName="p-5"><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} /></div><div className="mt-3 grid grid-cols-3 gap-2 text-center"><span className="rounded-md bg-slate-50 p-2"><small className="block text-slate-500">Invoiced</small><strong>{currency(row.amount)}</strong></span><span className="rounded-md bg-emerald-50 p-2"><small className="block text-emerald-600">Paid</small><strong className="text-emerald-700">{currency(row.paid || 0)}</strong></span><span className={`rounded-md p-2 ${balance === 0 ? 'bg-emerald-50' : 'bg-amber-50'}`}><small className={`block ${balance === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>Balance due</small><strong>{currency(balance)}</strong></span></div><div className="mt-4 space-y-2">{row.creditNotes?.map((cn) => <div className="flex items-center justify-between rounded-md bg-slate-50 p-3 text-xs" key={cn.id}><span className="flex items-center gap-2"><Banknote size={14} className="text-brand-600" /><span className="font-semibold">{cn.number}</span><span className="text-slate-500">{cn.reason}</span></span><span className="font-semibold text-emerald-600">-{currency(cn.amount)}</span></div>)}<p className="text-xs text-slate-500">Credit notes are netted against the outstanding balance.</p></div></Card>
      if (tab === 'Overview') return <div className="space-y-5">
        {overdue && <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertTriangle size={18} /><div><strong>Invoice is past due</strong><p className="text-xs">Due {row.due}. Outstanding balance {currency(balance)} requires immediate follow-up.</p></div></div>}
        <Card title="Invoice" subtitle={`${row.number} · ${row.status}`} bodyClassName="p-0">
          <div className="grid gap-6 border-b border-slate-100 p-5 sm:grid-cols-[1fr_auto]">
            <div><p className="text-xs font-semibold uppercase tracking-wide text-brand-700">PhsarDom B2B Wholesale</p><small className="mt-1 block text-slate-500">990 Jackson Blvd, Chicago, IL · billing@phsardom.com</small></div>
            <div className="text-left sm:text-right"><p className="font-semibold">{heading}</p><small className="block text-slate-500">PO {row.po}{row.contract ? ` · ${row.contract}` : ''}</small><small className="mt-1 block text-slate-500">Issued {row.paid ? '—' : '—'}</small></div>
          </div>
          <div className="p-5"><div className="rounded-lg bg-slate-50 p-4"><small className="form-label">Billed to</small><strong className="block text-sm">{row.buyer}</strong><small className="block text-slate-500">Net-{row.terms.replace('Net-', '')} · due {row.due}</small></div>
            <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[480px] text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="p-3 text-left">Line item</th><th className="p-3 text-right">Qty</th><th className="p-3 text-right">Unit</th><th className="p-3 text-right">Amount</th></tr></thead><tbody>{row.items?.map((line, index) => <tr className="border-t" key={index}><td className="p-3 font-semibold">{line.name}</td><td className="p-3 text-right">{number(line.qty)}</td><td className="p-3 text-right">{line.unit > 0 ? currency(line.unit) : '—'}</td><td className="p-3 text-right font-semibold">{currency(line.qty * line.unit)}</td></tr>)}</tbody></table></div>
            <dl className="mt-4 ml-auto w-full max-w-xs space-y-2 text-sm"><div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd>{currency(row.amount)}</dd></div>{row.creditNotes?.map((cn) => <div className="flex justify-between text-emerald-600" key={cn.id}><dt>Credit note ({cn.number})</dt><dd>-{currency(cn.amount)}</dd></div>)}<div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold"><dt>Grand total</dt><dd>{currency(row.amount)}</dd></div><div className="flex justify-between"><dt className="text-emerald-600">Paid to date</dt><dd className="font-semibold text-emerald-600">{currency(row.paid || 0)}</dd></div><div className="flex justify-between text-amber-700"><dt>Balance due</dt><dd className="font-bold">{currency(balance)}</dd></div></dl>
          </div>
        </Card>
      </div>
      return null
    }

    if (type === 'shipments') {
      if (tab === 'Tracking') return <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <Card title="Tracking Timeline" subtitle={`${heading} · ${row.status}`} bodyClassName="p-5"><ol className="space-y-0">{row.events?.map((ev, index) => { return <li className="relative flex gap-3 pb-6 last:pb-0" key={index}><span className={`relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${ev.status === 'completed' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200 bg-white text-slate-400'}`}>{ev.status === 'completed' ? <Check size={14} /> : index + 1}</span>{index < row.events.length - 1 && <span className={`absolute left-[15px] top-8 h-full w-0.5 ${ev.status === 'completed' ? 'bg-emerald-200' : 'bg-slate-200'}`} />}<span className="min-w-0"><strong className="block text-xs font-semibold text-slate-800">{ev.label}</strong><small className="mt-0.5 block text-slate-500">{ev.detail}{ev.time ? ` · ${ev.time}` : ''}</small></span></li> })}</ol></Card>
        <Card title="Shipment Information" bodyClassName="p-5"><dl className="space-y-3 text-sm"><div className="flex justify-between"><dt className="text-slate-500">Carrier</dt><dd className="font-semibold">{row.carrier}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Tracking number</dt><dd className="font-semibold">{row.tracking}</dd></div><div className="flex justify-between"><dt className="text-slate-500">PO reference</dt><dd><UnderlineLink root={root} type="purchaseOrders" row={purchaseOrders.find((p) => p.number === row.po) || { id: 1, number: row.po }} /></dd></div><div className="flex justify-between"><dt className="text-slate-500">Dispatched</dt><dd>{row.dispatch}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Expected delivery</dt><dd>{row.expected}</dd></div><div className="flex justify-between border-t border-slate-100 pt-3"><dt className="text-slate-500">Status</dt><dd><StatusBadge status={row.status} /></dd></div></dl><button onClick={() => alert('Tracking page refreshed (demo).')} className="btn-secondary mt-4 w-full"><Truck size={15} /> Refresh tracking</button></Card>
      </div>
      if (tab === 'Packages') return <Card title="Packages & Freight" bodyClassName="p-5"><div className="grid gap-4 sm:grid-cols-3"><StatTile label="Packages" value={number(row.packages)} tone="blue" /><StatTile label="Total weight" value={row.weight} tone="violet" /><StatTile label="Freight terms" value="DDP" tone="green" /></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><span className="rounded-md bg-slate-50 p-3"><small className="block text-slate-500">Origin</small><strong className="text-sm">{row.origin}</strong></span><span className="rounded-md bg-slate-50 p-3"><small className="block text-slate-500">Destination</small><strong className="text-sm">{row.destination}</strong></span></div></Card>
      return null
    }

    if (type === 'warehouses') {
      const stock = inventory.filter((item) => item.warehouse === row.code)
      if (tab === 'Stock') return <Card title={`Stock at ${row.name}`} bodyClassName="p-0">{stock.length ? <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="p-3 text-left">Product</th><th className="p-3 text-left">SKU</th><th className="p-3 text-left">Bin</th><th className="p-3 text-right">On hand</th><th className="p-3 text-right">Reserved</th><th className="p-3 text-right">Available</th><th className="p-3 text-left">Status</th></tr></thead><tbody>{stock.map((item) => <tr className="border-t hover:bg-slate-50" key={item.id}><td className="p-3 font-semibold">{item.product}</td><td className="p-3">{item.sku}</td><td className="p-3">{item.bin}</td><td className="p-3 text-right">{number(item.onHand)}</td><td className="p-3 text-right">{number(item.reserved)}</td><td className="p-3 text-right font-semibold">{number(item.available)}</td><td className="p-3"><StatusBadge status={item.status} /></td></tr>)}</tbody></table></div> : <p className="p-5 text-sm text-slate-500">No stock records for this warehouse.</p>}</Card>
      if (tab === 'Bins') return <Card title="Bin Locations" bodyClassName="p-5">{stock.map((item) => <div className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0" key={item.id}><span className="flex items-center gap-3"><Package size={15} className="text-brand-600" /><div><strong className="block text-xs">{item.sku}</strong><small className="text-slate-500">{item.product}</small></div></span><span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold">{item.bin}</span></div>)}</Card>
      if (tab === 'Overview') return <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]"><Card title="Warehouse Details" bodyClassName="p-5"><DetailGrid row={row} type={type} /></Card><div className="grid gap-5"><StatTile label="Active Products" value={number(stock.length)} tone="blue" /><StatTile label="Total On Hand" value={number(stock.reduce((sum, item) => sum + item.onHand, 0))} tone="green" /><StatTile label="Reserved Stock" value={number(stock.reduce((sum, item) => sum + item.reserved, 0))} tone="amber" /></div></div>
      return null
    }

    if (type === 'inventory') {
      if (tab === 'Overview') return <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]"><Card title="Stock Position" bodyClassName="p-5"><DetailGrid row={row} type={type} /></Card><div className="space-y-5"><div className="grid grid-cols-2 gap-4"><StatTile label="On Hand" value={number(row.onHand)} tone="blue" /><StatTile label="Reserved" value={number(row.reserved)} tone="amber" /><StatTile label="Available" value={number(row.available)} tone="green" /><StatTile label="Backorder" value={number(row.backordered)} tone={row.backordered ? 'red' : 'slate'} /></div>{row.available <= row.reorderPoint && <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><ShieldAlert size={18} /><div><strong>Reorder threshold reached</strong><p className="text-xs">Available stock is at or below the {number(row.reorderPoint)} reorder point. Raise a replenishment order.</p></div></div>}</div></div>
      if (tab === 'Movements') return <Card title="Stock Movement History" subtitle={`${row.sku} · ${row.product}`} bodyClassName="p-0"><div className="overflow-x-auto"><table className="w-full min-w-[560px] text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="p-3 text-left">Date</th><th className="p-3 text-left">Type</th><th className="p-3 text-right">Qty</th><th className="p-3 text-left">Reference</th><th className="p-3 text-left">User</th><th className="p-3 text-left">Warehouse</th></tr></thead><tbody>{stockMovements.map((m) => m.sku === row.sku && <tr className="border-t" key={m.id}><td className="p-3">{m.date}</td><td className="p-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${m.quantity > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{m.type}</span></td><td className={`p-3 text-right font-semibold ${m.quantity > 0 ? 'text-emerald-600' : 'text-amber-600'}`}>{m.quantity > 0 ? `+${number(m.quantity)}` : number(m.quantity)}</td><td className="p-3">{m.reference}</td><td className="p-3">{m.user}</td><td className="p-3">{m.warehouse}</td></tr>)}</tbody></table></div></Card>
      return null
    }

    return <Card title="Overview" bodyClassName="p-5"><DetailGrid row={{ ...row, status: row.status }} type={type} /></Card>
  }

  const modalTitle = { reject: 'Reject buyer', requestInfo: 'Request more information', counter: 'Counter offer', note: 'Add internal note', revision: 'Request revision / reject quote', sendQuote: 'Send quote to buyer' }[modal]
  const modalBody = (() => {
    if (modal === 'reject') return <div className="space-y-3"><TextInput label="Rejection reason" required placeholder="e.g. Unable to verify business license" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} /><p className="text-xs text-slate-500">The reason is shown on the verification timeline and recorded on the audit log.</p></div>
    if (modal === 'requestInfo') return <div className="space-y-4"><TextInput label="What is missing?" required placeholder="e.g. Updated business license" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} /><div><span className="form-label">Related document</span><SelectInput value={form.targetDoc} onChange={(e) => setForm((f) => ({ ...f, targetDoc: e.target.value }))}><option value="">Select document</option>{(row.documents || []).map((doc) => <option key={doc.id}>{doc.name}</option>)}</SelectInput></div></div>
    if (modal === 'counter') return <div className="space-y-3"><div className="grid gap-3 sm:grid-cols-2"><TextInput label="Proposed unit price (USD)" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} /><TextInput label="Quantity" type="number" min="1" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} /></div><SelectInput label="Payment terms" value={form.terms} onChange={(e) => setForm((f) => ({ ...f, terms: e.target.value }))}><option>Net-30</option><option>Net-60</option><option>Net-90</option></SelectInput><Textarea label="Comments" placeholder="Explain your counter offer" value={form.comment} onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))} /></div>
    if (modal === 'note') return <div className="space-y-3"><Textarea label="Internal note" required placeholder="Visible only to staff" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} /></div>
    if (modal === 'revision') return <div className="space-y-3"><TextInput label="Reason (required to reject)" placeholder="e.g. Discount too aggressive for this account" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} /><button className="btn-secondary w-full !py-2 text-xs" onClick={() => { const entry = { user: isManager ? 'Rachel Evans' : root === 'sales' ? 'Daniel Brooks' : 'System', role: 'Sales Manager', price: row.unitPrice || null, quantity: row.quantity || null, terms: row.terms || null, comment: form.comment || 'Revision requested on the proposed quote.', time: now, status: 'Revision Requested' }; bump({ negotiations: [...(row.negotiations || []), entry], status: 'Negotiating' }); setNotice('Revision requested. Back to negotiation.'); setModal(null) }}>Request revision</button></div>
    if (modal === 'sendQuote') return null
    return null
  })()

  const modals = <></>
  const confirmActions = (() => {
    if (confirm === 'approve') return { title: 'Approve buyer', message: `Verify ${row.business} and grant full wholesale purchasing access?`, confirmText: 'Approve', onConfirm: () => { bump({ status: 'Approved', verifiedAt: now.split(',')[0] }); setNotice(`${row.business} approved and verified.`) } }
    if (confirm === 'suspend') return { title: 'Suspend buyer', message: `Suspend ${row.business}? Purchasing will be blocked until reinstated.`, confirmText: 'Suspend', danger: true, onConfirm: () => { bump({ status: 'Suspended' }); setNotice(`${row.business} suspended.`) } }
    if (confirm === 'acceptQuote') return { title: 'Accept quote', message: `Accept ${heading} at ${currency(row.unitPrice)}/unit? A purchase order will be generated from this quote.`, confirmText: 'Accept Quote', onConfirm: () => { bump({ status: 'Accepted', negotiations: [...(row.negotiations || []), { user: row.buyer.split(' ')[0] === 'Atlas' ? 'Maya Chen' : row.buyer, role: 'Buyer', price: row.unitPrice, quantity: row.quantity, terms: row.terms, comment: 'Quote accepted.', time: now, status: 'Accepted' }] }); setNotice('Quote accepted. Purchase order workflow started.') } }
    if (confirm === 'rejectQuote') return { title: 'Reject quote', message: `Reject ${heading}? The negotiation thread stays visible on the record.`, confirmText: 'Reject Quote', danger: true, onConfirm: () => { bump({ status: 'Rejected', negotiations: [...(row.negotiations || []), { user: row.buyer.split(' ')[0] === 'Atlas' ? 'Maya Chen' : row.buyer, role: 'Buyer', price: null, quantity: row.quantity, terms: row.terms, comment: 'Quote rejected by buyer.', time: now, status: 'Rejected' }] }); setNotice('Quote rejected.') } }
    if (confirm === 'approveQuote') return { title: 'Approve quote pricing', message: `Approve ${heading}? The discount is within the ${row.approval?.threshold}% threshold review and will be released to the buyer.`, confirmText: 'Approve', onConfirm: () => { bump({ status: 'Sent', approval: { ...row.approval, status: 'Approved' } }); setNotice('Pricing approved. Sent to buyer.') } }
    if (confirm === 'sendQuote') return { title: 'Send quote to buyer', message: `Send ${heading} to ${row.buyer}? The negotiation thread becomes visible to the buyer.`, confirmText: 'Send Quote', onConfirm: () => { bump({ status: 'Sent' }); setNotice('Quote sent to buyer.') } }
    if (confirm === 'ship') return { title: 'Record shipment', message: `Record a shipment of ${number(row.remaining)} remaining units for ${heading}?`, confirmText: 'Record Shipment', onConfirm: () => { const shipped = row.remaining; const milestones = row.milestones.map((m) => { const firstPending = row.milestones.find((x) => x.status === 'Pending'); return m === firstPending ? { ...m, status: 'Completed' } : m }); bump({ shipped: row.shipped + shipped, remaining: 0, status: shipped > 0 && row.shipped === 0 ? 'Partially Shipped' : 'Completed', milestones }); setNotice(`Shipment recorded. ${number(shipped)} units in transit.`) } }
    if (confirm === 'renew') return { title: 'Renew contract', message: `Renew ${row.number} for another 12 months at the agreed terms?`, confirmText: 'Renew', onConfirm: () => { const [y, m, d] = row.end.split('-'); const newEnd = `${Number(y) + 1}-${m}-${d}`; bump({ status: 'Active', end: newEnd, renews: `${Math.max(0, Number(y) + 1)}-${m}-15` }); setNotice('Contract renewed and extended.') } }
    return null
  })()

  return <div className="min-w-0">
    <PageHeader title={heading} description={`${title} · ${row.status}`} actions={headerActions.filter(Boolean)} />
    {notice && <div className="mb-4"><Alert type="success" onClose={() => setNotice('')}>{notice}</Alert></div>}
    <div className="mb-5 flex gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1">
      {availableTabs.map((name) => <button key={name} onClick={() => setTab(name)} className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition ${tab === name ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{name === 'POs' ? 'P.O.s' : name}</button>)}
    </div>
    <div className="min-w-0">{panel()}</div>
    <ConfirmDialog open={!!confirm} title={confirmActions?.title || ''} message={confirmActions?.message || ''} confirmText={confirmActions?.confirmText} danger={confirmActions?.danger} onClose={() => setConfirm(null)} onConfirm={() => confirmActions?.onConfirm()} />
    <Modal open={!!modal} title={modalTitle || ''} onClose={() => setModal(null)} footer={modal === 'counter' || modal === 'reject' || modal === 'requestInfo' || modal === 'note' ? <><button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn-primary" onClick={() => { if (modal === 'counter') { const price = Number(form.price); if (!price) { alert('Enter a proposed price.'); return } bump({ unitPrice: price, quantity: Number(form.quantity) || row.quantity, negotiations: [...(row.negotiations || []), { user: 'Maya Chen', role: 'Buyer', price, quantity: Number(form.quantity) || row.quantity, terms: form.terms, comment: form.comment || 'Counter offer submitted.', time: now, status: 'Countered' }] }); setNotice('Counter offer submitted. Waiting for the account executive.'); } else if (modal === 'reject') { if (!form.reason) { alert('A rejection reason is required.'); return } bump({ status: 'Rejected' }); setNotice(`${row.business} rejected. Reason recorded.`); } else if (modal === 'requestInfo') { if (!form.reason) { alert('Describe what information is missing.'); return } bump({ status: 'Need More Information' }); setNotice('More information requested from buyer.'); } else if (modal === 'note') { if (!form.note) { alert('Write a note.'); return } const notes = [...(row.notes || [])]; notes.push({ author: root === 'admin' ? 'Alex Morgan' : root === 'manager' ? 'Rachel Evans' : 'Daniel Brooks', time: now, body: form.note }); bump({ notes }); setNotice('Internal note added.'); } setModal(null) }}>Confirm</button></> : modal === 'revision' ? null : undefined}>{modalBody}</Modal>
  </div>
}

function PricingSection({ quote }) {
  const quantity = quote.quantity || 240
  const unitPrice = quote.unitPrice || quote.amount / quantity
  const listPrice = quote.listPrice || Math.round(unitPrice * 1.12 * 100) / 100
  const subtotal = unitPrice * quantity
  const shipping = quote.shipping ?? 360
  const tax = quote.tax ?? Math.round(subtotal * 0.08)
  return <div className="grid gap-5 xl:grid-cols-3"><Card title="Pricing Breakdown" subtitle="Unit pricing across the quote" className="xl:col-span-2" bodyClassName="p-0"><div className="overflow-x-auto"><table className="w-full min-w-[560px]"><thead className="bg-slate-50 text-xs text-slate-500"><tr>{['Quantity', 'List price', 'Offered price', 'Discount', 'Subtotal'].map((x) => <th className="p-3 text-left" key={x}>{x}</th>)}</tr></thead><tbody><tr className="border-t"><td className="p-3 font-semibold">{number(quantity)}</td><td className="p-3 text-slate-400 line-through">{currency(listPrice)}</td><td className="p-3 font-semibold">{currency(unitPrice)}</td><td className="p-3 font-semibold text-brand-700">{Math.round((1 - unitPrice / listPrice) * 1000) / 10}%</td><td className="p-3 font-semibold">{currency(subtotal)}</td></tr></tbody></table></div></Card><Card title="Commercial Summary"><CommercialSummary quote={quote} /></Card></div>
}
