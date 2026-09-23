import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Banknote, Building2, FileCheck2, Landmark, ShieldAlert, TrendingUp } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { InfoBox, StatCard } from '../../components/cards/DashboardCards'
import { Alert, Card, Modal, SelectInput, StatusBadge, TextInput, Textarea } from '../../components/ui'
import { buyers, contracts, invoices as staticInvoices } from '../../data'
import { money, num, invoiceView, outstanding, buyerExposure } from '../../utils/erp'
import { useErp } from '../../services/erpStore'
import { useSession } from '../../services/session'

const tabs = ['Credit & Risk', 'Invoices', 'Payments']

export default function FinanceBuyerDetailPage() {
  const { id } = useParams()
  const erp = useErp()
  const buyer = buyers.find((b) => b.id === Number(id)) || buyers.find((b) => String(b.id) === String(id))
  const [tab, setTab] = useState('Credit & Risk')
  const [newReq, setNewReq] = useState(false)
  const [pay, setPay] = useState(null)
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({ requestedLimit: '', terms: 'Net-30', purpose: '' })

  const invoices = useMemo(() => (buyer ? staticInvoices.filter((i) => i.buyer === buyer.business).map((i) => invoiceView(i, erp.invoiceOverrides)) : []) /* eslint-disable-line */, [buyer, erp.invoiceOverrides])
  const credits = (erp.creditRequests || []).filter((r) => r.buyer === buyer?.business)
  const latestApproved = credits.filter((r) => r.status === 'Approved').sort((a, b) => (b.decidedOn || '').localeCompare(a.decidedOn || ''))[0]
  const effectiveLimit = latestApproved ? latestApproved.requestedLimit : (buyer?.creditLimit || 0)
  const openInv = invoices.filter((i) => i.status !== 'Paid' && i.status !== 'Cancelled')
  const openAmt = openInv.reduce((s, i) => s + outstanding(i, {}), 0)
  const exposure = buyerExposure(buyer?.business, staticInvoices, erp.invoiceOverrides, erp.creditNotes)
  const payments = (erp.payments || []).filter((p) => p.buyer === buyer?.business)
  const contract = (buyer ? contracts.find((c) => c.buyer === buyer.business) : null)

  if (!buyer) return <div className="surface-card p-10 text-center"><h1 className="text-xl font-semibold">Buyer not found</h1></div>

  const pendingReq = credits.find((r) => r.status === 'Pending')

  const startPay = (inv) => { setPay(inv); setForm({ amount: String(outstanding(inv, {})), method: 'Wire transfer', reference: '' }) }

  const doRequest = (e) => {
    e.preventDefault()
    const requestedLimit = Number(form.requestedLimit)
    if (!requestedLimit || requestedLimit <= buyer.creditLimit) { setNotice('Requested limit must exceed the current limit.'); return }
    const number = erp.createCreditRequest({ buyer: buyer.business, currentLimit: buyer.creditLimit, requestedLimit, terms: form.terms, risk: buyer.risk || 'Low', priority: 'Medium', purpose: form.purpose || 'Increase requested from buyer 360 workspace.', impact: `New limit ${money(requestedLimit)} pending approval.` })
    setNotice(`${number} created and queued for credit decision.`)
    setNewReq(false)
    setForm({ requestedLimit: '', terms: 'Net-30', purpose: '' })
  }

  const doPay = (e) => {
    e.preventDefault()
    const amount = Number(form.amount)
    if (!amount || amount <= 0) { setNotice('Enter a valid amount.'); return }
    erp.recordPayment({ invoiceNumber: pay.number, buyer: pay.buyer, amount, method: form.method, reference: form.reference || 'REF-DEMO' })
    setNotice(`${money(amount)} recorded against ${pay.number}.`)
    setPay(null)
  }

  const pct = Math.min(100, Math.round((openAmt / effectiveLimit) * 100))

  return (
    <>
      <PageHeader
        title={buyer.business}
        description={`Buyer credit 360 · ${buyer.industry} · ${buyer.contact}`}
        actions={<><button className="btn-secondary" onClick={() => { const inv = openInv.find((i) => outstanding(i, {}) > 0); if (inv) startPay(inv); else alert('No open invoices for this buyer.') }}><Banknote size={15} />Record payment</button><button className="btn-primary" onClick={() => setNewReq(true)}><Landmark size={15} />Request credit increase</button></>}
      />
      {notice && <div className="mb-4"><Alert onClose={() => setNotice('')}>{notice}</Alert></div>}
      {pendingReq && <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs"><ShieldAlert size={14} className="text-amber-600" /><span className="font-semibold text-amber-900">Pending credit decision</span><span className="text-amber-800">{pendingReq.number} · {money(pendingReq.currentLimit)} → {money(pendingReq.requestedLimit)}</span><StatusBadge status={pendingReq.status} /></div>}

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Credit limit" value={money(effectiveLimit)} icon={Building2} tone="blue" trend={latestApproved ? 'updated by credit decision' : undefined} context={buyer.risk} />
        <StatCard label="Open receivable" value={money(openAmt)} icon={TrendingUp} tone="amber" trend={`${openInv.length} invoices`} />
        <InfoBox label="Issued credits" value={money(exposure.credits)} icon={FileCheck2} tone="green" context="counter currency" />
        <InfoBox label="Risk level" value={<StatusBadge status={buyer.risk} />} icon={ShieldAlert} tone={String(buyer.risk).toLowerCase() === 'high' ? 'red' : String(buyer.risk).toLowerCase() === 'medium' ? 'amber' : 'green'} context={buyer.status} />
      </div>

      <div className="mb-4 flex gap-1 border-b">
        {tabs.map((t) => <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-xs font-semibold ${tab === t ? 'border-b-2 border-brand-600 text-brand-700' : 'text-slate-500'}`}>{t}</button>)}
      </div>

      {tab === 'Credit & Risk' && (
        <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
          <div className="space-y-5">
            <Card title="Credit utilization" subtitle={`${money(openAmt)} open against ${money(effectiveLimit)} approved line`} bodyClassName="p-5">
              <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${pct > 85 ? 'bg-red-500' : pct > 60 ? 'bg-amber-500' : 'bg-brand-600'}`} style={{ width: `${pct}%` }} /></div>
              <div className="mt-3 flex justify-between text-xs"><span className="text-slate-500">Utilization</span><strong className={pct > 85 ? 'text-red-600' : pct > 60 ? 'text-amber-700' : 'text-slate-800'}>{pct}%</strong></div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-3"><small className="text-[11px] text-slate-500">Account status</small><strong className="mt-1 block"><StatusBadge status={buyer.status} /></strong></div>
                <div className="rounded-lg bg-slate-50 p-3"><small className="text-[11px] text-slate-500">Credit terms</small><strong className="mt-1 block text-slate-800">{latestApproved?.terms || newReq.terms || 'Net-30'}{contract ? ` · ${contract.number}` : ''}</strong></div>
                <div className="rounded-lg bg-slate-50 p-3"><small className="text-[11px] text-slate-500">Open invoices</small><strong className="mt-1 block text-slate-800">{num(openInv.length)} · {money(exposure.open)}</strong></div>
                <div className="rounded-lg bg-slate-50 p-3"><small className="text-[11px] text-slate-500">Issued credits</small><strong className="mt-1 block text-slate-800">{money(exposure.credits)}</strong></div>
              </div>
            </Card>
            <Card title="Credit line history" subtitle="Requests and decisions affecting this account" bodyClassName="p-0">
              {credits.length ? <table className="w-full text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="p-3 text-left">Request</th><th className="p-3 text-right">Limit</th><th className="p-3 text-left">Terms</th><th className="p-3 text-left">Submitted</th><th className="p-3 text-left">Status</th></tr></thead><tbody>{credits.map((c) => <tr key={c.id} className="border-t"><td className="p-3 font-semibold">{c.number}</td><td className="p-3 text-right">{money(c.currentLimit)} → <strong>{money(c.requestedLimit)}</strong></td><td className="p-3">{c.terms}</td><td className="p-3">{c.submitted}</td><td className="p-3"><StatusBadge status={c.status} /></td></tr>)}</tbody></table> : <p className="p-5 text-sm text-slate-500">No credit requests on file.</p>}
            </Card>
          </div>
          <div className="space-y-5">
            <Card title="Recent credit activity" bodyClassName="p-5">
              <ol className="space-y-3">{(credits.slice(0, 3).flatMap((c) => [...(c.history || [])].slice(-1).map((h) => ({ ...h, request: c.number, status: c.status })))).map((h, i) => (
                <li key={i} className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700"><ShieldAlert size={14} /></span><div className="min-w-0"><strong className="block text-xs text-slate-800">{h.actor || h.user} · <span className="font-normal text-slate-500">{h.request}</span></strong><small className="block text-slate-500">{h.action} — {h.comment}</small><small className="block text-[10px] text-slate-400">{h.time}</small></div></li>
              ))}</ol>
            </Card>
            <Card title="Contract & terms" bodyClassName="p-5">
              {contract ? (<><div className="flex items-center justify-between"><span className="text-xs text-slate-500">{contract.number}</span><StatusBadge status={contract.status} /></div><div className="mt-3 grid grid-cols-2 gap-3 text-xs"><span className="rounded-md bg-slate-50 p-2"><small className="block text-slate-500">Value</small><strong className="text-slate-800">{money(contract.value)}</strong></span><span className="rounded-md bg-slate-50 p-2"><small className="block text-slate-500">Terms</small><strong className="text-slate-800">{contract.terms}</strong></span></div></>) : <p className="text-sm text-slate-500">No active contract.</p>}
            </Card>
          </div>
        </div>
      )}

      {tab === 'Invoices' && (
        <Card title="Open & recent invoices" bodyClassName="p-0">
          <table className="w-full min-w-[680px] text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="p-3 text-left">Invoice</th><th className="p-3 text-right">Amount</th><th className="p-3 text-right">Paid</th><th className="p-3 text-right">Balance</th><th className="p-3 text-left">Due</th><th className="p-3 text-left">Status</th><th className="p-3 text-right">Action</th></tr></thead><tbody>{invoices.map((inv) => { const bal = outstanding(inv, {}); return <tr key={inv.id} className="border-t hover:bg-slate-50/60"><td className="p-3 font-semibold">{inv.number}</td><td className="p-3 text-right">{money(inv.amount)}</td><td className="p-3 text-right">{money(inv.paid || 0)}</td><td className="p-3 text-right"><span className={bal > 0 ? 'text-amber-700' : 'text-emerald-700'}>{money(bal)}</span></td><td className="p-3">{inv.due}</td><td className="p-3"><StatusBadge status={inv.status} /></td><td className="p-3 text-right">{(bal > 0 && inv.status !== 'Cancelled') && <button className="btn-secondary !px-2.5 !py-1 text-[11px]" onClick={() => startPay(inv)}><Banknote size={13} />Pay</button>}</td></tr> }) }</tbody></table>
        </Card>
      )}

      {tab === 'Payments' && (
        <Card title="Payment history" bodyClassName="p-0">
          {payments.length ? <table className="w-full text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="p-3 text-left">Payment</th><th className="p-3 text-left">Invoice</th><th className="p-3 text-left">Date</th><th className="p-3 text-left">Method</th><th className="p-3 text-right">Amount</th></tr></thead><tbody>{payments.map((p) => <tr key={p.id} className="border-t"><td className="p-3 font-semibold">{p.number}</td><td className="p-3">{p.invoice}</td><td className="p-3">{p.date}</td><td className="p-3">{p.method}</td><td className="p-3 text-right font-semibold">{money(p.amount)}</td></tr>)}</tbody></table> : <p className="p-5 text-sm text-slate-500">No payment history for this buyer yet.</p>}
        </Card>
      )}

      <Modal open={!!newReq} title="Request credit increase" onClose={() => setNewReq(false)}>
        <form onSubmit={doRequest} className="space-y-3">
          <div className="rounded-lg bg-slate-50 p-3 text-xs"><span className="text-slate-500">Current limit · </span><strong className="text-slate-800">{money(effectiveLimit)}</strong></div>
          <TextInput label="Requested limit (USD)" type="number" min={effectiveLimit + 1} step="1000" required value={form.requestedLimit} onChange={(e) => setForm({ ...form, requestedLimit: e.target.value })} />
          <SelectInput label="Terms" value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })}>{['Net-30', 'Net-60', 'Net-90'].map((t) => <option key={t}>{t}</option>)}</SelectInput>
          <Textarea label="Purpose" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="Business justification..." />
          <div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setNewReq(false)}>Cancel</button><button className="btn-primary">Create request</button></div>
        </form>
      </Modal>

      <Modal open={!!pay} title={`Record payment · ${pay?.number}`} onClose={() => setPay(null)}>
        <form onSubmit={doPay} className="space-y-3">
          <TextInput label="Amount (USD)" type="number" min="0.01" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <SelectInput label="Method" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>{['Wire transfer', 'ACH', 'Check', 'Credit card'].map((m) => <option key={m}>{m}</option>)}</SelectInput>
          <TextInput label="Reference (optional)" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="e.g. bank reference" />
          <div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setPay(null)}>Cancel</button><button className="btn-primary"><Banknote size={14} />Record payment</button></div>
        </form>
      </Modal>
    </>
  )
}
