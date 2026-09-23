import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Landmark, ShieldCheck, TrendingUp, TriangleAlert } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { InfoBox, StatCard } from '../../components/cards/DashboardCards'
import DataTable from '../../components/tables/DataTable'
import { Alert, ConfirmDialog, Modal, SelectInput, StatusBadge, TextInput, Textarea } from '../../components/ui'
import { buyers } from '../../data'
import { money, num } from '../../utils/erp'
import { useErp } from '../../services/erpStore'
import { can } from '../../services/permissions'
import { useSession } from '../../services/session'

export default function CreditRequestsPage() {
  const { user } = useSession()
  const roleKey = user?.key
  const erp = useErp()
  const navigate = useNavigate()
  const [confirm, setConfirm] = useState(null)
  const [rejectFor, setRejectFor] = useState(null)
  const [newFor, setNewFor] = useState(null)
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({})

  const rows = erp.creditRequests
  const pending = rows.filter((r) => r.status === 'Pending')
  const approved = rows.filter((r) => r.status === 'Approved')
  const requested = pending.reduce((s, r) => s + (r.requestedLimit - r.currentLimit), 0)
  const canManage = can(roleKey, 'credit', 'approve') || can(roleKey, 'credit', 'edit')

  const columns = [
    { key: 'number', label: 'Request', primary: true },
    { key: 'buyer', label: 'Buyer' },
    { key: 'limits', label: 'Credit limit', render: (v, row) => <span>{money(row.currentLimit)} → <strong className="text-brand-700">{money(row.requestedLimit)}</strong></span> },
    { key: 'delta', label: 'Increase', render: (v, row) => <span className={row.requestedLimit - row.currentLimit > 0 ? 'font-semibold text-amber-700' : ''}>+{money(row.requestedLimit - row.currentLimit)}</span>, className: 'text-right' },
    { key: 'terms', label: 'Terms' },
    { key: 'risk', label: 'Risk' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'status', label: 'Status' },
  ]

  const doCreate = (e) => {
    e.preventDefault()
    const buyer = buyers.find((b) => b.business === form.buyer)
    const requestedLimit = Number(form.requestedLimit)
    if (!buyer || !requestedLimit) { setNotice('Select a buyer and enter the new limit.'); return }
    const number = erp.createCreditRequest({ buyer: buyer.business, currentLimit: buyer.creditLimit, requestedLimit, terms: form.terms || buyer.terms || 'Net-30', risk: buyer.risk || 'Low', priority: form.priority || 'Medium', purpose: form.purpose || 'Manual credit increase from finance workspace.', impact: 'Pending credit officer decision.' })
    setNotice(`${number} created for ${buyer.business}.`)
    setNewFor(null)
    setForm({})
  }

  return (
    <>
      <PageHeader
        title="Credit Requests"
        description="Credit limit increases raised by account executives and finance. Approvals post back to the buyer's credit profile."
        actions={<button className="btn-primary" onClick={() => setNewFor(true)}><Landmark size={15} />New request</button>}
      />
      {notice && <div className="mb-4"><Alert onClose={() => setNotice('')}>{notice}</Alert></div>}

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending decisions" value={pending.length} icon={TriangleAlert} tone="amber" trend={`${pending.filter((r) => r.priority === 'High').length} high priority`} />
        <StatCard label="Pending limit increase" value={money(requested)} icon={TrendingUp} tone="blue" trend={`${pending.length} accounts`} />
        <StatCard label="Approved this period" value={approved.length} icon={ShieldCheck} tone="green" trend="last 14 days" />
        <InfoBox label="Buyers on credit" value={num(buyers.length)} icon={Landmark} tone="violet" context="7 approved / suspended mix" />
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        caption="Credit limit requests"
        initialFilter="Pending"
        onView={(row) => navigate(`/finance/credit-requests/${row.id}`)}
        toolbar={canManage ? <span className="text-xs text-slate-500">{pending.length} waiting for decision</span> : undefined}
      />

      <ConfirmDialog open={!!confirm} title={`Approve ${confirm?.number}`} message={`Approve the limit increase to ${money(confirm?.requestedLimit)} for ${confirm?.buyer}? The new limit posts to the buyer credit profile.`} confirmText="Approve" onClose={() => setConfirm(null)} onConfirm={() => { erp.applyCreditDecision(confirm.id, 'Approved', 'Approved by finance.'); setNotice(`${confirm.number} approved — new limit ${money(confirm.requestedLimit)} active.`); setConfirm(null) }} />

      <Modal open={!!rejectFor} title={`Reject · ${rejectFor?.number}`} onClose={() => setRejectFor(null)}>
        <form onSubmit={(e) => { e.preventDefault(); const reason = new FormData(e.currentTarget).get('reason'); erp.applyCreditDecision(rejectFor.id, 'Rejected', reason); setNotice(`${rejectFor.number} rejected. Reason recorded.`); setRejectFor(null) }}>
          <Textarea required name="reason" label="Rejection reason" placeholder="Document the decision..." />
          <div className="mt-4 flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setRejectFor(null)}>Cancel</button><button className="btn-danger">Reject request</button></div>
        </form>
      </Modal>

      <Modal open={!!newFor} title="New credit limit request" onClose={() => setNewFor(null)}>
        <form onSubmit={doCreate} className="space-y-3">
          <SelectInput label="Buyer" required value={form.buyer || ''} onChange={(e) => { const b = buyers.find((x) => x.business === e.target.value); setForm({ ...form, buyer: e.target.value, currentLimit: b?.creditLimit }) }}>
            <option value="">Select buyer...</option>
            {buyers.map((b) => <option key={b.id} value={b.business}>{b.business}</option>)}
          </SelectInput>
          <div className="rounded-lg bg-slate-50 p-3 text-xs"><span className="text-slate-500">Current limit · </span><strong className="text-slate-800">{money(form.currentLimit || 0)}</strong></div>
          <TextInput label="Requested limit (USD)" type="number" min="1" step="1000" required value={form.requestedLimit || ''} onChange={(e) => setForm({ ...form, requestedLimit: e.target.value })} />
          <SelectInput label="Terms" value={form.terms || 'Net-30'} onChange={(e) => setForm({ ...form, terms: e.target.value })}>{['Net-30', 'Net-60', 'Net-90'].map((t) => <option key={t}>{t}</option>)}</SelectInput>
          <SelectInput label="Priority" value={form.priority || 'Medium'} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{['High', 'Medium', 'Low'].map((t) => <option key={t}>{t}</option>)}</SelectInput>
          <Textarea label="Purpose (optional)" value={form.purpose || ''} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="Business justification..." />
          <div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setNewFor(null)}>Cancel</button><button className="btn-primary">Create request</button></div>
        </form>
      </Modal>
    </>
  )
}
