import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FileCheck2, Receipt, Stamp, Wallet } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { InfoBox, StatCard } from '../../components/cards/DashboardCards'
import DataTable from '../../components/tables/DataTable'
import { Alert, ConfirmDialog, Modal, SelectInput, StatusBadge, Textarea, TextInput } from '../../components/ui'
import { invoices as staticInvoices } from '../../data'
import { money, invoiceView, outstanding } from '../../utils/erp'
import { useErp } from '../../services/erpStore'
import { can } from '../../services/permissions'
import { useSession } from '../../services/session'

export default function CreditNotesPage() {
  const { user } = useSession()
  const roleKey = user?.key
  const erp = useErp()
  const navigate = useNavigate()
  const location = useLocation()
  const root = location.pathname.split('/')[1]
  const [notice, setNotice] = useState('')
  const [approveFor, setApproveFor] = useState(null)
  const [cancelFor, setCancelFor] = useState(null)
  const [newFor, setNewFor] = useState(false)
  const [form, setForm] = useState({ invoice: '', amount: '', reason: '' })

  const rows = useMemo(() => [...erp.creditNotes].reverse(), [erp.creditNotes])
  const pending = rows.filter((r) => r.status === 'Pending Approval')
  const issued = rows.filter((r) => r.status === 'Issued')
  const applied = rows.filter((r) => r.status === 'Applied')
  const openInvoices = staticInvoices.filter((i) => outstanding(invoiceView(i, erp.invoiceOverrides), {}) > 0 && i.status !== 'Cancelled')
  const canManage = can(roleKey, 'invoices', 'approve') || can(roleKey, 'invoices', 'edit')

  const columns = [
    { key: 'number', label: 'Credit note', primary: true },
    { key: 'buyer', label: 'Buyer' },
    { key: 'invoice', label: 'Invoice' },
    { key: 'reason', label: 'Reason' },
    { key: 'amount', label: 'Amount', render: (v) => money(v), className: 'text-right' },
    { key: 'status', label: 'Status' },
    ...(canManage ? [{ key: 'decision', label: 'Actions', render: (v, row) => row.status === 'Pending Approval'
      ? <span className="flex gap-1.5"><button className="btn-success !px-2.5 !py-1 text-[11px]" onClick={(e) => { e.stopPropagation(); setApproveFor(row) }}>Approve</button><button className="btn-danger !px-2.5 !py-1 text-[11px]" onClick={(e) => { e.stopPropagation(); setCancelFor(row) }}>Reject</button></span>
      : <button className="btn-ghost !px-2.5 !py-1 text-[11px]" onClick={(e) => { e.stopPropagation(); navigate(`/${root}/credit-notes/${row.number}`) }}>View</button> }] : []),
  ]

  const doIssue = async (e) => {
    e.preventDefault()
    const inv = openInvoices.find((i) => i.number === form.invoice)
    const amount = Number(form.amount)
    if (!inv || !amount || amount > outstanding(invoiceView(inv, erp.invoiceOverrides), {})) { setNotice('Select an open invoice and enter an amount within its balance.'); return }
    const number = erp.issueCreditNote({ buyer: inv.buyer, invoice: inv.number, amount, reason: form.reason || 'Manual credit requested by finance.', related: '' })
    setNotice(`${number} drafted — now in Pending Approval. Email to buyer optional.`)
    setNewFor(false)
    setForm({ invoice: '', amount: '', reason: '' })
  }

  return (
    <>
      <PageHeader
        title="Credit Notes"
        description="Customer credits raised against invoices. Drafted notes await approval, then post against the buyer account."
        actions={canManage ? <button className="btn-primary" onClick={() => setNewFor(true)}><Receipt size={15} />New credit note</button> : <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">Read-only register</span>}
      />
      {notice && <div className="mb-4"><Alert onClose={() => setNotice('')}>{notice}</Alert></div>}

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending approval" value={pending.length} icon={Stamp} tone="amber" trend={`${money(pending.reduce((s, r) => s + r.amount, 0))} in queue`} />
        <StatCard label="Issued credits" value={issued.length} icon={FileCheck2} tone="blue" trend="awaiting application" />
        <StatCard label="Applied to invoices" value={applied.length} icon={Wallet} tone="green" trend={`${money(applied.reduce((s, r) => s + r.amount, 0))} offset`} />
        <InfoBox label="Total credit exposure" value={money(rows.reduce((s, r) => s + r.amount, 0) - applied.reduce((s, r) => s + r.amount, 0))} icon={Receipt} tone="violet" context="pending + issued, awaiting apply" />
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        caption="Credit note register"
        onView={(row) => navigate(`/${root}/credit-notes/${row.number}`)}
      />

      <ConfirmDialog open={!!approveFor} title={`Approve ${approveFor?.number}`} message={`Issue credit of ${money(approveFor?.amount)} to ${approveFor?.buyer} against ${approveFor?.invoice}? The note posts to the account register.`} confirmText="Approve & issue" onClose={() => setApproveFor(null)} onConfirm={() => { erp.applyCreditNoteDecision(approveFor.id, 'Approved', 'Approved by finance.'); setNotice(`${approveFor.number} issued to ${approveFor.buyer}.`); setApproveFor(null) }} />
      <Modal open={!!cancelFor} title={`Reject · ${cancelFor?.number}`} onClose={() => setCancelFor(null)}>
        <form onSubmit={(e) => { e.preventDefault(); const reason = new FormData(e.currentTarget).get('reason'); erp.applyCreditNoteDecision(cancelFor.id, 'Rejected', reason); setNotice(`${cancelFor.number} cancelled. Reason recorded.`); setCancelFor(null) }}>
          <Textarea required name="reason" label="Rejection reason" placeholder="Document the decision..." />
          <div className="mt-4 flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setCancelFor(null)}>Cancel</button><button className="btn-danger">Cancel credit note</button></div>
        </form>
      </Modal>

      <Modal open={!!newFor} title="New credit note" onClose={() => setNewFor(false)}>
        <form onSubmit={doIssue} className="space-y-3">
          <SelectInput label="Invoice" required value={form.invoice} onChange={(e) => { const inv = openInvoices.find((i) => i.number === e.target.value); setForm({ ...form, invoice: e.target.value, buyer: inv?.buyer, amount: form.amount || String(outstanding(invoiceView(inv, erp.invoiceOverrides), {})) }) }}>
            <option value="">Select an open invoice...</option>
            {openInvoices.map((i) => <option key={i.number} value={i.number}>{i.number} · {i.buyer} (${outstanding(invoiceView(i, erp.invoiceOverrides), {}).toLocaleString()} open)</option>)}
          </SelectInput>
          <TextInput label="Amount (USD)" type="number" min="0.01" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <Textarea label="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Why is the credit being issued?" />
          <div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setNewFor(false)}>Cancel</button><button className="btn-primary">Draft credit note</button></div>
        </form>
      </Modal>
    </>
  )
}
