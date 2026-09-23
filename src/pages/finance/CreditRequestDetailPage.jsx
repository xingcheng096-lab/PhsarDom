import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BadgeCheck, Building2, Check, Landmark, ShieldAlert, X } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { Alert, Card, ConfirmDialog, Modal, StatusBadge, Textarea } from '../../components/ui'
import { buyers, invoices } from '../../data'
import { money, num, buyerExposure, TODAY } from '../../utils/erp'
import { useErp } from '../../services/erpStore'
import { can } from '../../services/permissions'
import { useSession } from '../../services/session'

export default function CreditRequestDetailPage() {
  const { id } = useParams()
  const { user } = useSession()
  const roleKey = user?.key
  const erp = useErp()
  const row = erp.creditRequests.find((r) => r.id === Number(id)) || erp.creditRequests.find((r) => String(r.id) === String(id))
  const [confirm, setConfirm] = useState(null)
  const [reject, setReject] = useState(null)
  const [notice, setNotice] = useState('')

  if (!row) return <div className="surface-card p-10 text-center"><h1 className="text-xl font-semibold">Request not found</h1><Link to="/finance/credit-requests" className="btn-primary mt-5">Back to credit requests</Link></div>

  const buyer = buyers.find((b) => b.business === row.buyer)
  const exposure = buyerExposure(row.buyer, invoices, erp.invoiceOverrides, erp.creditNotes)
  const pending = row.status === 'Pending'
  const canManage = can(roleKey, 'credit', 'approve')

  return (
    <>
      <PageHeader
        title={row.number}
        description={`Credit limit request · ${row.buyer}`}
        breadcrumbs={[{ label: 'Credit Requests', to: '/finance/credit-requests' }, { label: row.number }]}
        actions={pending && canManage ? (
          <>
            <button className="btn-success" onClick={() => setConfirm(true)}><Check size={15} />Approve</button>
            <button className="btn-danger" onClick={() => setReject(true)}><X size={15} />Reject</button>
          </>
        ) : (
          <StatusBadge status={row.status} />
        )}
      />
      {notice && <div className="mb-4"><Alert onClose={() => setNotice('')}>{notice}</Alert></div>}

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card bodyClassName="p-4"><small className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Current limit</small><strong className="mt-1 block text-2xl text-slate-900">{money(row.currentLimit)}</strong><span className="mt-1 block text-xs text-slate-500">{row.terms}</span></Card>
        <Card bodyClassName="p-4"><small className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Requested limit</small><strong className="mt-1 block text-2xl text-brand-700">{money(row.requestedLimit)}</strong><span className="mt-1 block text-xs text-amber-700">{row.status === 'Pending' ? `+${money(row.requestedLimit - row.currentLimit)} increase` : `${((row.requestedLimit - row.currentLimit) / row.currentLimit) * 100}% increase`}</span></Card>
        <Card bodyClassName="p-4"><small className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Open exposure</small><strong className="mt-1 block text-2xl text-slate-900">{money(exposure.open)}</strong><span className="mt-1 block text-xs text-slate-500">Issued credit notes {money(exposure.credits)}</span></Card>
        <Card bodyClassName="p-4"><small className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Risk profile</small><strong className="mt-1 block text-2xl"><StatusBadge status={row.risk} /></strong>{buyer && <span className="mt-1 block text-xs text-slate-500">{buyer.industry} · {buyer.contact}</span>}</Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5">
          <Card title="Request details" bodyClassName="p-5">
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {[
                ['Buyer', row.buyer], ['Requested by', row.requestedBy], ['Submitted', row.submitted], ['Payment terms', row.terms],
                ['Priority', row.priority], ['Status', <StatusBadge key="s" status={row.status} />],
              ].map(([label, value]) => <div key={label}><dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 font-medium text-slate-800">{value}</dd></div>)}
            </dl>
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <span className="text-xs font-semibold text-amber-900">Purpose</span>
              <p className="mt-1 text-sm leading-6 text-amber-900">{row.purpose}</p>
            </div>
            {row.decisionComment && <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4"><span className="text-xs font-semibold text-emerald-800">Decision note ({row.decidedBy}, {row.decidedOn})</span><p className="mt-1 text-sm text-emerald-900">{row.decisionComment}</p></div>}
          </Card>

          <Card title="Decision history" subtitle="Audit trail" bodyClassName="p-0">
            <ol className="relative ml-5 space-y-4 border-l border-slate-200 p-5 pl-6">
              {(row.history || []).map((entry, i) => (
                <li key={i} className="relative">
                  <span className={`absolute -left-[27px] top-1 h-2.5 w-2.5 rounded-full ring-2 ring-white ${entry.action === 'Approved' ? 'bg-emerald-500' : entry.action === 'Rejected' ? 'bg-red-500' : 'bg-brand-500'}`} />
                  <div className="flex flex-wrap items-center gap-x-2 text-xs"><strong className="text-slate-800">{entry.user}</strong><span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">{entry.action}</span><time className="text-slate-400">{entry.time}</time></div>
                  {entry.comment && <p className="mt-0.5 text-xs text-slate-600">{entry.comment}</p>}
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Buyer credit profile" subtitle="Live from the finance workspace" bodyClassName="p-5">
            {buyer ? (
              <>
                <div className="flex items-center justify-between"><span className="text-xs text-slate-500">{buyer.business}</span><Link to={`/finance/buyers/${buyer.id}`} className="text-xs font-semibold text-brand-700 hover:underline">Open 360 →</Link></div>
                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Credit limit</span><strong>{money(buyer.creditLimit)}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Open invoices</span><strong>{money(exposure.open)}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Issued credits</span><strong>{money(exposure.credits)}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Net exposure</span><strong>{money(exposure.net)}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Risk level</span><StatusBadge status={row.risk} /></div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-600" style={{ width: `${Math.min(100, (exposure.net / row.requestedLimit) * 100)}%` }} /></div>
                <small className="mt-1 block text-[10px] text-slate-400">{num(exposure.net)} of {money(row.requestedLimit)} used if approved</small>
              </>
            ) : <p className="text-sm text-slate-500">Buyer record unavailable.</p>}
          </Card>
          <Card title="Account context" bodyClassName="p-5">
            <dl className="space-y-3 text-xs">
              <div className="flex justify-between"><dt className="text-slate-500">Account status</dt><dd>{buyer ? <StatusBadge status={buyer.status} /> : '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Industry</dt><dd className="font-semibold text-slate-700">{buyer?.industry || '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Payment terms</dt><dd className="font-semibold text-slate-700">{row.terms}</dd></div>
            </dl>
          </Card>
        </div>
      </div>

      <ConfirmDialog open={!!confirm} title={`Approve ${row.number}`} message={`Approve the limit increase to ${money(row.requestedLimit)} for ${row.buyer}?`} confirmText="Approve" onClose={() => setConfirm(false)} onConfirm={() => { erp.applyCreditDecision(row.id, 'Approved', 'Approved by credit officer.'); setNotice(`${row.number} approved — new limit ${money(row.requestedLimit)} active today.`); setConfirm(false) }} />
      <Modal open={!!reject} title={`Reject · ${row.number}`} onClose={() => setReject(false)}>
        <form onSubmit={(e) => { e.preventDefault(); const reason = new FormData(e.currentTarget).get('reason'); erp.applyCreditDecision(row.id, 'Rejected', reason); setNotice(`${row.number} rejected. Reason recorded on the request.`); setReject(false) }}>
          <Textarea required name="reason" label="Rejection reason" placeholder="Document the decision and next steps..." />
          <div className="mt-4 flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setReject(false)}>Cancel</button><button className="btn-danger">Reject request</button></div>
        </form>
      </Modal>
    </>
  )
}