import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Check, Clock, Eye, Flag, Search, Send, UserPlus, X, SlidersHorizontal } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { ConfirmDialog, EmptyState, Modal, SelectInput, StatusBadge, Textarea, Alert } from '../../components/ui'
import { approvalRequests, approvalTypes, approvalTypeByKey, delegates } from '../../data/approvals'
import { can } from '../../services/permissions'
import { useSession } from '../../services/session'
import { useErp } from '../../services/erpStore'
import { buyers, quotations, purchaseOrders, contracts, invoices, inventory } from '../../data'

const priorityTone = { High: 'bg-red-50 text-red-700', Medium: 'bg-amber-50 text-amber-800', Low: 'bg-slate-100 text-slate-600' }
const fmt = (v) => `$${Number(v || 0).toLocaleString('en-US')}`
const resourceResolver = {
  buyers: { list: buyers, key: 'id', match: 'relatedId' },
  quotations: { list: quotations, key: 'number', match: 'relatedId' },
  purchaseOrders: { list: purchaseOrders, key: 'number', match: 'relatedId' },
  contracts: { list: contracts, key: 'number', match: 'relatedId' },
  invoices: { list: invoices, key: 'number', match: 'relatedId' },
  inventory: { list: inventory, key: 'sku', match: 'relatedId' },
}
const moduleRoute = {
  buyers: 'buyers', quotations: 'quotations', purchaseOrders: 'purchase-orders', contracts: 'contracts', invoices: 'invoices', inventory: 'inventory',
}
const allowLink = { admin: true, manager: true, sales: true }

function resolveRecord(req) {
  const res = resourceResolver[approvalTypeByKey[req.typeKey]?.module]
  if (!res) return null
  return res.list.find((r) => String(r[res.key]) === String(req.relatedId)) || null
}

// Operational requests surfaced from the live ERP store (finance, warehouse, inventory, logistics).
function buildDynamicRows(erp) {
  const rows = []
  ;(Array.isArray(erp.creditRequests) ? erp.creditRequests : []).forEach((r) => {
    if (r.status !== 'Pending') return
    rows.push({
      id: `erp-credit-${r.id}`, requestId: r.approvalId || r.number, typeKey: 'credit', related: r.buyer, relatedId: r.buyer,
      requestedBy: r.requestedBy, department: 'Finance', date: r.submitted, priority: r.priority || 'Medium', status: 'Pending',
      reason: `Credit limit increase ${fmt(r.currentLimit)} → ${fmt(r.requestedLimit)} (${r.terms}). ${r.purpose}`, impact: r.impact,
      history: r.history || [], _erp: { src: 'credit', refId: r.id },
    })
  })
  ;(Array.isArray(erp.creditNotes) ? erp.creditNotes : []).forEach((cn) => {
    if (cn.status !== 'Pending Approval') return
    rows.push({
      id: `erp-cn-${cn.id}`, requestId: cn.approvalId || cn.number, typeKey: 'creditnote', related: cn.invoice, relatedId: cn.invoice,
      requestedBy: 'Elena Petrova', department: 'Finance', date: '2026-09-09', priority: 'Medium', status: 'Pending',
      reason: `${fmt(cn.amount)} credit against ${cn.invoice} for ${cn.buyer}. ${cn.reason}`, impact: 'Reduces the receivable balance when issued.',
      history: cn.history || [], _erp: { src: 'creditnote', refId: cn.id },
    })
  })
  ;(Array.isArray(erp.stockCounts) ? erp.stockCounts : []).forEach((c) => {
    if (!c.adjudicated || c.adjustment !== 'Pending') return
    rows.push({
      id: `erp-stock-${c.id}`, requestId: c.number, typeKey: 'stock', related: c.sku, relatedId: c.sku,
      requestedBy: 'Amelia Scott', department: 'Warehouse', date: c.adjustmentAt || c.countedAt, priority: Math.abs(c.variance) > 10 ? 'High' : 'Medium', status: 'Pending',
      reason: `Cycle-count variance ${c.variance > 0 ? '+' : ''}${c.variance} on ${c.product} (${c.sku}) at ${c.warehouse} · ${c.bin}.`,
      impact: `Adjusts book stock from ${c.systemQty.toLocaleString()} to ${c.counted.toLocaleString()}; movement logged on approval.`,
      history: [{ user: 'Amelia Scott', action: 'Submitted', comment: `Cycle count logged ${c.countedAt}.`, time: `${c.countedAt} 14:22` }],
      _erp: { src: 'stock', refId: c.id },
    })
  })
  return rows
}

export default function ApprovalCenterPage({ kind: propKind }) {
  const { user } = useSession()
  const routeKind = useParams()?.kind
  const roleKey = user?.key
  const erp = useErp()
  const [rows, setRows] = useState(approvalRequests)
  const [view, setView] = useState('Pending')
  const [category, setCategory] = useState(propKind || routeKind || 'All')
  const [detail, setDetail] = useState(null)
  const [decision, setDecision] = useState(null)
  const [delegation, setDelegation] = useState(null)
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState('')
  const [department, setDepartment] = useState('')
  const [sort, setSort] = useState('newest')

  const dynamic = useMemo(
    () => buildDynamicRows(erp),
    [erp.creditRequests, erp.stockCounts, erp.creditNotes],
  )

  const merged = useMemo(() => {
    const dynKeys = new Set(dynamic.map((d) => `${d.typeKey}|${d.related}`))
    return [...dynamic, ...rows.filter((s) => !dynKeys.has(`${s.typeKey}|${s.related}`))]
  }, [dynamic, rows])

  const pendingCount = merged.filter((r) => r.status === 'Pending').length
  const categories = useMemo(() => ['All', ...approvalTypes.map((t) => t.key)], [])

  const filtered = merged.filter(
    (r) =>
      (category === 'All' || r.typeKey === category) &&
      (view === 'Pending' ? r.status === 'Pending' : r.status !== 'Pending') &&
      (!priority || r.priority === priority) && (!department || r.department === department) &&
      `${r.requestId} ${r.related} ${r.requestedBy} ${r.reason}`.toLowerCase().includes(search.toLowerCase()),
  ).sort((a, b) => sort === 'priority' ? ({ Critical: 0, High: 1, Medium: 2, Low: 3 }[a.priority] ?? 9) - ({ Critical: 0, High: 1, Medium: 2, Low: 3 }[b.priority] ?? 9) : sort === 'oldest' ? String(a.date || '').localeCompare(String(b.date || '')) : String(b.date || '').localeCompare(String(a.date || '')))

  const patch = (id, fn) => setRows((prev) => prev.map((r) => (r.id === id ? fn(r) : r)))

  const dispatchErp = (row, action, comment = '', delegateTo = '') => {
    const src = row._erp.src
    const refId = row._erp.refId
    if (src === 'credit') erp.applyCreditDecision(refId, action === 'Approve' ? 'Approved' : action === 'Reject' ? 'Rejected' : action === 'Revision' ? 'Revision Requested' : 'Delegated', comment, delegateTo)
    if (src === 'reservation') (action === 'Approve' ? erp.approveReservation(refId) : erp.rejectReservation(refId))
    if (src === 'stock') erp.applyStockDecision(refId, action === 'Approve' ? 'Approved' : 'Rejected', comment)
    if (src === 'creditnote') erp.applyCreditNoteDecision(refId, action === 'Approve' ? 'Approved' : 'Rejected', comment)
  }

  const applyDecision = (row, action, comment = '', delegateTo = '') => {
    const statusMap = { Approve: 'Approved', Reject: 'Rejected', Revision: 'Revision Requested', Delegate: 'Delegated' }
    if (row._erp) {
      dispatchErp(row, action, comment, delegateTo)
      setNotice(`${row.requestId} → ${statusMap[action]}. ${comment || ''}`)
      return
    }
    const entry = { user: user?.name || roleKey, action: statusMap[action], comment: comment || (action === 'Approve' ? 'Approved without amendments.' : `Delegated to ${delegateTo}.`), time: '2026-09-10 09:00' }
    patch(row.id, (r) => ({ ...r, status: statusMap[action], decision: { action: statusMap[action], by: user?.name, when: '2026-09-10', comment, delegateTo }, history: [...(r.history || []), entry] }))
    setNotice(`${row.requestId} → ${statusMap[action]}. ${comment || ''}`)
  }

  const canAct = (row) => row.status === 'Pending' && can(roleKey, approvalTypeByKey[row.typeKey]?.module, 'approve')

  return (
    <>
      <PageHeader
        title="Approval Center"
        description="Centralized enterprise approvals — buyer, pricing, credit, contract, PO, stock, reservation, and credit-note decisions."
        actions={<span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800"><Flag size={13} />{pendingCount} pending across {categories.length - 1} request types</span>}
      />
      {notice && <div className="mb-4"><Alert onClose={() => setNotice('')}>{notice}</Alert></div>}

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[['Pending', merged.filter((r) => r.status === 'Pending').length, 'text-amber-700'], ['Approved today', merged.filter((r) => r.status === 'Approved' && String(r.date) === '2026-09-10').length, 'text-emerald-700'], ['Rejected', merged.filter((r) => r.status === 'Rejected').length, 'text-red-700'], ['High priority', merged.filter((r) => ['High', 'Critical'].includes(r.priority) && r.status === 'Pending').length, 'text-violet-700'], ['Awaiting my action', merged.filter((r) => canAct(r)).length, 'text-brand-700']].map(([label, value, tone]) => <button key={label} onClick={() => { if (label === 'Pending' || label === 'Awaiting my action') setView('Pending'); if (label === 'High priority') setPriority('High') }} className="surface-card p-4 text-left transition hover:-translate-y-px hover:shadow-md"><span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</span><strong className={`mt-1 block text-2xl ${tone}`}>{value}</strong></button>)}
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {categories.map((c) => {
          const count = merged.filter((r) => (c === 'All' ? true : r.typeKey === c) && r.status === 'Pending').length
          return (
            <button key={c} onClick={() => setCategory(c)} className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold transition ${category === c ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
              {c === 'All' ? 'All types' : approvalTypeByKey[c].label}
              {count > 0 && <span className={`ml-1.5 rounded-full px-1.5 text-[10px] ${category === c ? 'bg-white/20' : 'bg-amber-100 text-amber-800'}`}>{count}</span>}
            </button>
          )
        })}
      </div>

      <div className="mb-4 flex gap-1 border-b">
        {['Pending', 'History'].map((v) => (
          <button key={v} onClick={() => setView(v)} className={`px-4 py-2.5 text-xs font-semibold ${view === v ? 'border-b-2 border-brand-600 text-brand-700' : 'text-slate-500'}`}>
            {v === 'Pending' ? 'Pending Queue' : 'Decision History'}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 sm:flex-row sm:flex-wrap sm:items-center"><label className="relative min-w-0 flex-1 sm:min-w-64"><span className="sr-only">Search approvals</span><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="form-control pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search approval ID, requester, company, or record..." /></label><select className="form-control sm:w-40" value={priority} onChange={(e) => setPriority(e.target.value)} aria-label="Filter by priority"><option value="">All priorities</option>{['Critical', 'High', 'Medium', 'Low'].map((x) => <option key={x}>{x}</option>)}</select><select className="form-control sm:w-40" value={department} onChange={(e) => setDepartment(e.target.value)} aria-label="Filter by department"><option value="">All departments</option>{[...new Set(merged.map((r) => r.department).filter(Boolean))].map((x) => <option key={x}>{x}</option>)}</select><select className="form-control sm:w-36" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort approvals"><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="priority">Priority</option></select><button className="btn-secondary" onClick={() => { setSearch(''); setPriority(''); setDepartment(''); setSort('newest') }}><SlidersHorizontal size={14} />Clear</button></div>

      {filtered.length ? (
        <div className="space-y-3">
          {filtered.map((row) => {
            const type = approvalTypeByKey[row.typeKey]
            const record = resolveRecord(row)
            const linked = allowLink[roleKey] && record && moduleRoute[type.module]
            return (
              <section key={row.id} className="surface-card transition duration-200 hover:-translate-y-px hover:shadow-md">
                <div className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-sm">{row.requestId}</strong>
                      <StatusBadge status={row.status} />
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{type.label}</span>
                      {row._erp && <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">Live ERP</span>}
                      <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${priorityTone[row.priority]}`}>{row.priority} priority</span>
                    </div>
                    <div className="mt-3 grid gap-x-6 gap-y-1.5 text-xs sm:grid-cols-2 xl:grid-cols-4">
                      <div><span className="text-slate-500">Related record · </span><strong className="text-slate-800">{row.related}</strong>{' '}{linked && <Link to={`/${roleKey}/${moduleRoute[type.module]}/${record.id}`} className="text-brand-700 hover:underline">#{row.relatedId}</Link>}</div>
                      <div><span className="text-slate-500">Requested by · </span><strong className="text-slate-800">{row.requestedBy}</strong></div>
                      <div><span className="text-slate-500">Department · </span><strong className="text-slate-800">{row.department}</strong></div>
                      <div><span className="text-slate-500">Submitted · </span><strong className="text-slate-800">{row.date}</strong></div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600"><span className="font-semibold text-slate-700">Reason: </span>{row.reason}</p>
                    <p className="mt-1 text-[11px] text-slate-400"><span className="font-semibold">Impact · </span>{row.impact}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <button onClick={() => setDetail(row)} className="btn-ghost"><Eye size={15} />Review</button>
                    {canAct(row) && (
                      <>
                        <button onClick={() => setDecision({ row, action: 'Approve' })} className="btn-success"><Check size={15} />Approve</button>
                        <button onClick={() => setDecision({ row, action: 'Revision' })} className="btn-secondary"><X size={15} />Revise</button>
                        <button onClick={() => setDecision({ row, action: 'Reject' })} className="btn-danger"><X size={15} />Reject</button>
                        <button onClick={() => setDelegation(row)} className="btn-ghost"><UserPlus size={15} />Delegate</button>
                      </>
                    )}
                    {!canAct(row) && row.status === 'Pending' && <span className="text-[11px] text-slate-400">Read-only — requires {roleKey ? roleKey.replace(/^\w/, (c) => c.toUpperCase()) : ''} approve permission</span>}
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        <div className="surface-card">
          <EmptyState title={view === 'Pending' ? "You're all caught up" : 'No decision history'} text={view === 'Pending' ? 'There are no approval requests in this queue.' : 'Completed decisions will appear here.'} />
        </div>
      )}

      <Modal open={!!detail} title={`Approval Review · ${detail?.requestId}`} onClose={() => setDetail(null)}>
        {detail && (
          <>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <StatusBadge status={detail.status} />
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{approvalTypeByKey[detail.typeKey].label}</span>
              {detail.priority === 'High' && <span className="rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">{detail.priority} priority</span>}
              {detail._erp && <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">Live ERP request — reflects department operations</span>}
            </div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ['Request ID', detail.requestId], ['Related Record', detail.related],
                ['Requested By', detail.requestedBy], ['Department', detail.department],
                ['Submitted', detail.date], ['Status', detail.status],
                ['Business Impact', detail.impact],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md bg-slate-50 p-3">
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="mt-1 text-xs font-semibold leading-5 text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3">
              <span className="text-xs font-semibold text-amber-900">Request reason</span>
              <p className="mt-1 text-xs leading-5 text-amber-900">{detail.reason}</p>
            </div>
            <div className="mt-4">
              <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500"><Clock size={13} />Approval history / timeline</h4>
              <ol className="relative ml-2 space-y-4 border-l border-slate-200 pl-4">
                {(detail.history || []).map((entry, i) => (
                  <li key={i} className="relative">
                    <span className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ring-2 ring-white ${entry.action === 'Approved' ? 'bg-emerald-500' : entry.action === 'Rejected' ? 'bg-red-500' : 'bg-brand-500'}`} />
                    <div className="flex flex-wrap items-center gap-x-2 text-xs"><strong className="text-slate-800">{entry.user}</strong><span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">{entry.action}</span><time className="text-slate-400">{entry.time}</time></div>
                    {entry.comment && <p className="mt-0.5 text-xs text-slate-600">{entry.comment}</p>}
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}
      </Modal>

      <ConfirmDialog open={decision?.action === 'Approve'} title={`Approve ${decision?.row.requestId}`} message={`Approve this ${approvalTypeByKey[decision?.row.typeKey]?.label.toLowerCase()} request for ${decision?.row.related}?`} confirmText="Approve" onClose={() => setDecision(null)} onConfirm={() => { applyDecision(decision.row, 'Approve'); setDecision(null) }} />

      <Modal open={!!decision && decision.action !== 'Approve'} title={`${decision?.action === 'Reject' ? 'Reject' : 'Request revision for'} ${decision?.row.requestId}`} onClose={() => setDecision(null)}>
        <form onSubmit={(e) => { e.preventDefault(); applyDecision(decision.row, decision.action, new FormData(e.currentTarget).get('reason')); setDecision(null) }}>
          <Textarea required name="reason" label="Decision reason" placeholder="Document the reason and required next steps..." />
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setDecision(null)} className="btn-secondary">Cancel</button>
            <button className={decision?.action === 'Reject' ? 'btn-danger' : 'btn-primary'}><Send size={14} />Submit decision</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!delegation} title={`Delegate · ${delegation?.requestId}`} onClose={() => setDelegation(null)}>
        <form onSubmit={(e) => { e.preventDefault(); const data = new FormData(e.currentTarget); applyDecision(delegation, 'Delegate', data.get('note') || '', data.get('delegateTo')); setDelegation(null) }}>
          <SelectInput name="delegateTo" label="Delegate to" required>
            <option value="">Select a delegate...</option>
            {delegates.map((d) => <option key={d.key} value={d.label}>{d.label}</option>)}
          </SelectInput>
          <div className="mt-3"><Textarea name="note" label="Note (optional)" placeholder="Context for the delegate..." /></div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setDelegation(null)} className="btn-secondary">Cancel</button>
            <button className="btn-primary"><ArrowRight size={14} />Delegate request</button>
          </div>
        </form>
      </Modal>
    </>
  )
}
