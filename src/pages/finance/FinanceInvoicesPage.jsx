import { useMemo, useState } from 'react'
import { Banknote, Receipt, TriangleAlert, Wallet } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { InfoBox, StatCard } from '../../components/cards/DashboardCards'
import DataTable from '../../components/tables/DataTable'
import { Alert, Card, ConfirmDialog, Modal, SelectInput, StatusBadge, TextInput } from '../../components/ui'
import { invoices } from '../../data'
import { TODAY, daysDiff, invoiceView, money, num, outstanding, sumBy } from '../../utils/erp'
import { useErp } from '../../services/erpStore'
import { can } from '../../services/permissions'
import { useSession } from '../../services/session'

function InvoiceDetail({ inv, erp }) {
  const payments = (erp.payments || []).filter((p) => p.invoice === inv.number)
  const credits = [...(inv.creditNotes || []), ...(erp.creditNotes || []).filter((cn) => cn.invoice === inv.number && cn.number !== 'CN-2026-0312')]
  const uniq = credits.filter((cn, i) => credits.findIndex((x) => x.number === cn.number) === i)
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-3"><small className="text-[11px] text-slate-500">Invoice amount</small><strong className="mt-1 block text-lg text-slate-900">{money(inv.amount)}</strong></div>
        <div className="rounded-lg bg-slate-50 p-3"><small className="text-[11px] text-slate-500">Paid to date</small><strong className="mt-1 block text-lg text-emerald-700">{money(inv.paid || 0)}</strong></div>
        <div className="rounded-lg bg-slate-50 p-3"><small className="text-[11px] text-slate-500">Open balance</small><strong className="mt-1 block text-lg text-amber-700">{money(outstanding(inv, {}))}</strong></div>
      </div>
      {inv.items?.length > 0 && (
        <Card title="Line items" bodyClassName="p-0">
          <table className="w-full text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="p-3 text-left">Item</th><th className="p-3 text-right">Qty</th><th className="p-3 text-right">Unit</th><th className="p-3 text-right">Total</th></tr></thead><tbody>{inv.items.map((it, i) => <tr key={i} className="border-t"><td className="p-3">{it.name}</td><td className="p-3 text-right">{num(it.qty)}</td><td className="p-3 text-right">{money(it.unit)}</td><td className="p-3 text-right font-semibold">{money(it.qty * it.unit)}</td></tr>)}</tbody></table>
        </Card>
      )}
      <Card title="Payments" subtitle="Collected against this invoice" bodyClassName="p-0">
        {payments.length ? (
          <table className="w-full text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="p-3 text-left">Payment</th><th className="p-3 text-left">Date</th><th className="p-3 text-left">Method</th><th className="p-3 text-right">Amount</th></tr></thead><tbody>{payments.map((p) => <tr key={p.id} className="border-t"><td className="p-3 font-semibold">{p.number}</td><td className="p-3">{p.date}</td><td className="p-3">{p.method}</td><td className="p-3 text-right font-semibold">{money(p.amount)}</td></tr>)}</tbody></table>
        ) : (
          <p className="p-4 text-sm text-slate-500">No payments yet.</p>
        )}
      </Card>
      {uniq.length > 0 && (
        <Card title="Credit notes on this invoice" bodyClassName="p-4">
          <ul className="space-y-2">{uniq.map((cn) => <li key={cn.number} className="flex items-center justify-between rounded-md bg-slate-50 p-2 text-xs"><span className="font-semibold text-slate-700">{cn.number}</span><span className="text-slate-500">{cn.reason}</span><span className="flex items-center gap-2"><StatusBadge status={cn.status} /><strong>{money(cn.amount)}</strong></span></li>)}</ul>
        </Card>
      )}
    </div>
  )
}

export default function FinanceInvoicesPage() {
  const { user } = useSession()
  const roleKey = user?.key
  const erp = useErp()
  const [createdInvoices, setCreatedInvoices] = useState([])
  const [detail, setDetail] = useState(null)
  const [payFor, setPayFor] = useState(null)
  const [voidFor, setVoidFor] = useState(null)
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({ amount: '', method: 'Wire transfer', reference: '' })

  const rows = useMemo(() => [...createdInvoices, ...invoices].map((inv) => invoiceView(inv, erp.invoiceOverrides)), [createdInvoices, erp.invoiceOverrides])
  const active = rows.filter((r) => r.status !== 'Cancelled')
  const collected = sumBy(active, (r) => Math.min(r.paid || 0, r.amount))
  const open = sumBy(active, (r) => outstanding(r, {}))
  const overdue = sumBy(active.filter((r) => r.status === 'Overdue'), (r) => outstanding(r, {}))
  const canEdit = can(roleKey, 'invoices', 'edit') || can(roleKey, 'invoices', 'approve')

  const columns = [
    { key: 'number', label: 'Invoice', primary: true },
    { key: 'buyer', label: 'Buyer' },
    { key: 'po', label: 'PO' },
    { key: 'amount', label: 'Amount', render: (v) => money(v), className: 'text-right' },
    { key: 'paid', label: 'Paid', render: (v, row) => money(v || 0), className: 'text-right' },
    { key: 'balance', label: 'Balance', render: (v, row) => <span className={outstanding(row, {}) > 0 ? 'text-amber-700' : 'text-emerald-700'}>{money(outstanding(row, {}))}</span>, className: 'text-right' },
    { key: 'due', label: 'Due' },
    { key: 'status', label: 'Status' },
  ]

  const pendingBalance = payFor ? outstanding(payFor, {}) : 0
  const doPay = (e) => {
    e.preventDefault()
    const amount = Number(form.amount)
    if (!amount || amount <= 0 || amount > pendingBalance) { setNotice(`Enter a payment amount up to $${pendingBalance.toLocaleString()}.`); return }
    erp.recordPayment({ invoiceNumber: payFor.number, buyer: payFor.buyer, amount, method: form.method, reference: form.reference || 'REF-DEMO' })
    setNotice(`${money(amount)} recorded against ${payFor.number}.`)
    setPayFor(null)
    setForm({ amount: '', method: 'Wire transfer', reference: '' })
  }

  return (
    <>
      <PageHeader
        title="Invoices & Receivables"
        description="Ledger of issued invoices, balances, and collected cash. Payments recorded here update aging and buyer credit exposure in real time."
        actions={<button className="btn-secondary" onClick={() => { const csv = ['Invoice,Buyer,Amount,Due,Status', ...rows.map((r) => [r.number, r.buyer, r.amount, r.due, r.status].map((v) => `"${String(v ?? '').replaceAll('"', '""')}"`).join(','))].join('\n'); const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); link.download = 'invoices.csv'; link.click(); URL.revokeObjectURL(link.href); setNotice(`${num(rows.length)} invoices exported.`) }}>Export CSV</button>}
      />
      {notice && <div className="mb-4"><Alert onClose={() => setNotice('')}>{notice}</Alert></div>}

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open receivables" value={money(open)} icon={Wallet} tone="blue" trend="24.6k" context="vs last month" />
        <StatCard label="Collected YTD" value={money(collected)} icon={Banknote} tone="green" trend="4.2%" context="collection rate" />
        <StatCard label="Overdue balance" value={money(overdue)} icon={TriangleAlert} tone="amber" trend="9 invoices" context="across 3 buyers" />
        <InfoBox label="Aged 90+ days" value={money(sumBy(active.filter((r) => r.status === 'Overdue' && daysDiff(r.due) > 90), (r) => outstanding(r, {})))} icon={Receipt} tone="red" context="Needs escalation review" />
      </div>

      <DataTable
        rows={rows}
        columns={[...columns, ...(canEdit ? [{ key: 'workflow', label: 'Actions', render: (v, row) => <div className="flex flex-wrap justify-end gap-1"><button className="btn-secondary !px-2 !py-1 text-[11px]" onClick={(e) => { e.stopPropagation(); setPayFor(row) }} disabled={outstanding(row, {}) <= 0}>Record payment</button>{row.status !== 'Cancelled' && <button className="btn-danger !px-2 !py-1 text-[11px]" onClick={(e) => { e.stopPropagation(); setVoidFor(row) }}>Void</button>}</div> }] : [])]}
        caption="Finance invoice ledger"
        onView={(row) => setDetail(row)}
        toolbar={canEdit ? <button className="btn-primary !py-2 text-xs" onClick={() => { const id = Date.now(); setCreatedInvoices((current) => [{ id, number: `INV-DRAFT-${String(id).slice(-4)}`, buyer: 'New buyer invoice', po: 'Pending PO', amount: 0, paid: 0, due: TODAY, terms: 'Net-30', status: 'Draft', items: [] }, ...current]); setNotice('Invoice draft created and added to the ledger.') }}>Issue invoice</button> : undefined}
      />

      <Modal open={!!detail} title={`Invoice · ${detail?.number}`} onClose={() => setDetail(null)}>
        {detail && (<><div className="mb-3 flex flex-wrap items-center gap-2"><StatusBadge status={detail.status} /><span className="text-xs text-slate-500">{detail.buyer} · {detail.po} · due {detail.due} · {daysDiff(detail.due)}d outstanding</span></div><InvoiceDetail inv={detail} erp={erp} /></>)}
      </Modal>

      <ConfirmDialog open={!!voidFor} title={`Void ${voidFor?.number}`} message={`Void ${voidFor?.number} (${money(voidFor?.amount)})? The invoice is removed from aging and receivables.`} confirmText="Void invoice" danger onClose={() => setVoidFor(null)} onConfirm={() => { erp.voidInvoice(voidFor.number); setNotice(`${voidFor.number} voided.`); setVoidFor(null) }} />

      <Modal open={!!payFor} title={`Record payment · ${payFor?.number}`} onClose={() => setPayFor(null)}>
        <form onSubmit={doPay} className="space-y-3">
          <div className="rounded-lg bg-slate-50 p-3 text-xs"><span className="text-slate-500">Open balance · </span><strong className="text-slate-800">{money(pendingBalance)}</strong> · due {payFor?.due} {daysDiff(payFor?.due) > 0 ? <span className="font-semibold text-red-600">({daysDiff(payFor?.due)}d overdue)</span> : null}</div>
          <TextInput label="Payment amount" type="number" min="0.01" step="0.01" max={pendingBalance} required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
          <SelectInput label="Method" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
            {['Wire transfer', 'ACH', 'Check', 'Credit card'].map((m) => <option key={m}>{m}</option>)}
          </SelectInput>
          <TextInput label="Reference (optional)" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="e.g. bank reference" />
          <div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setPayFor(null)}>Cancel</button><button className="btn-primary"><Banknote size={14} />Record payment</button></div>
        </form>
      </Modal>
    </>
  )
}
