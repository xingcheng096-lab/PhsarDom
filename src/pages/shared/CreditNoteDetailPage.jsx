import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, FileCheck2, Receipt, X } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { Alert, Card, ConfirmDialog, Modal, StatusBadge, Textarea } from '../../components/ui'
import { invoices as staticInvoices } from '../../data'
import { money, invoiceView, outstanding } from '../../utils/erp'
import { useErp } from '../../services/erpStore'
import { can } from '../../services/permissions'
import { useSession } from '../../services/session'

export default function CreditNoteDetailPage() {
  const { number } = useParams()
  const { user } = useSession()
  const roleKey = user?.key
  const erp = useErp()
  const [approve, setApprove] = useState(false)
  const [cancel, setCancel] = useState(false)
  const [notice, setNotice] = useState('')

  const cn = erp.creditNotes.find((r) => r.number === number) || erp.creditNotes.find((r) => r.number.toLowerCase() === String(number).toLowerCase())
  if (!cn) return <div className="surface-card p-10 text-center"><h1 className="text-xl font-semibold">Credit note not found</h1><Link className="btn-primary mt-5" to={`/${roleKey}/credit-notes`}>Back to credit notes</Link></div>

  const inv = staticInvoices.find((i) => i.number === cn.invoice)
  const balance = inv ? outstanding(invoiceView(inv, erp.invoiceOverrides), {}) : 0
  const canAct = can(roleKey, 'invoices', 'approve')
  const showActions = cn.status === 'Pending Approval' && canAct

  return (
    <>
      <PageHeader
        title={cn.number}
        description={`Customer credit · ${cn.buyer}`}
        breadcrumbs={[{ label: 'Credit Notes', to: `/${roleKey}/credit-notes` }, { label: cn.number }]}
        actions={showActions ? (<><button className="btn-success" onClick={() => setApprove(true)}><Check size={15} />Approve</button><button className="btn-danger" onClick={() => setCancel(true)}><X size={15} />Reject</button></>) : <StatusBadge status={cn.status} />}
      />
      {notice && <div className="mb-4"><Alert onClose={() => setNotice('')}>{notice}</Alert></div>}
      {!canAct && <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600"><FileCheck2 size={13} className="mr-1.5 inline" />Read-only view — issuance decisions are reserved for finance/Admin.</div>}

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <div className="space-y-5">
          <Card title="Credit note" bodyClassName="p-5">
            <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {[['Number', cn.number], ['Buyer', cn.buyer], ['Invoice', cn.invoice], ['Status', <StatusBadge key="s" status={cn.status} />], ['Issued', cn.issued || '—'], ['Related', cn.related || '—']].map(([l, v]) => <div key={l}><dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{l}</dt><dd className="mt-1 font-medium text-slate-800">{v}</dd></div>)}
            </div>
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4"><span className="text-xs font-semibold text-slate-600">Reason</span><p className="mt-1 text-sm leading-6 text-slate-800">{cn.reason}</p></div>
          </Card>

          {inv && (
            <Card title="Linked invoice" subtitle={inv.number} bodyClassName="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm"><span className="text-slate-500">Open balance after this credit · </span><strong className={balance > 0 ? 'text-amber-700' : 'text-emerald-700'}>{money(Math.max(0, balance))}</strong></div>
                <Link to={`/${roleKey}/buyers/${inv.buyer}`} className="text-xs font-semibold text-brand-700 hover:underline">Open buyer 360 →</Link>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                <span className="rounded-md bg-slate-50 p-2"><small className="block text-slate-500">Invoice total</small><strong className="text-slate-800">{money(inv.amount)}</strong></span>
                <span className="rounded-md bg-slate-50 p-2"><small className="block text-slate-500">Paid to date</small><strong className="text-emerald-700">{money(inv.paid || 0)}</strong></span>
                <span className="rounded-md bg-slate-50 p-2"><small className="block text-slate-500">This credit</small><strong className="text-brand-700">{money(cn.amount)}</strong></span>
              </div>
            </Card>
          )}

          <Card title="Timeline" subtitle="Audit trail" bodyClassName="p-0">
            <ol className="relative ml-5 space-y-4 border-l border-slate-200 p-5 pl-6">
              {(cn.history || []).map((h, i) => (
                <li key={i} className="relative">
                  <span className={`absolute -left-[27px] top-1 h-2.5 w-2.5 rounded-full ring-2 ring-white ${h.action === 'Issued' ? 'bg-emerald-500' : h.action === 'Applied' ? 'bg-sky-500' : h.action === 'Cancelled' ? 'bg-red-500' : 'bg-brand-500'}`} />
                  <div className="flex flex-wrap items-center gap-x-2 text-xs"><strong className="text-slate-800">{h.user}</strong><span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">{h.action}</span><time className="text-slate-400">{h.time || ''}</time></div>
                  {h.comment && <p className="mt-0.5 text-xs text-slate-600">{h.comment}</p>}
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-5">
          <Card bodyClassName="p-5 text-center">
            <small className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Credit amount</small>
            <strong className="mt-1 block text-3xl text-brand-700">{money(cn.amount)}</strong>
            <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500"><Receipt size={13} />Freight / product credit register</span>
          </Card>
        </div>
      </div>

      <ConfirmDialog open={approve} title={`Approve ${cn.number}`} message={`Issue this credit of ${money(cn.amount)} to ${cn.buyer}? It will post to the account register as Issued.`} confirmText="Approve & issue" onClose={() => setApprove(false)} onConfirm={() => { erp.applyCreditNoteDecision(cn.id, 'Approved', 'Approved by finance.'); setNotice(`${cn.number} issued to ${cn.buyer}.`); setApprove(false) }} />
      <Modal open={cancel} title={`Reject · ${cn.number}`} onClose={() => setCancel(false)}>
        <form onSubmit={(e) => { e.preventDefault(); const reason = new FormData(e.currentTarget).get('reason'); erp.applyCreditNoteDecision(cn.id, 'Rejected', reason); setNotice(`${cn.number} cancelled. Reason recorded.`); setCancel(false) }}>
          <Textarea required name="reason" label="Rejection reason" placeholder="Document the decision..." />
          <div className="mt-4 flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setCancel(false)}>Cancel</button><button className="btn-danger">Cancel credit note</button></div>
        </form>
      </Modal>
    </>
  )
}