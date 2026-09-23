import { useMemo, useState } from 'react'
import { CheckCircle2, ClipboardCheck, Hash, Send, Scale3D } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { InfoBox, StatCard } from '../../components/cards/DashboardCards'
import DataTable from '../../components/tables/DataTable'
import { Alert, ConfirmDialog, Modal, SelectInput, StatusBadge, TextInput } from '../../components/ui'
import { num } from '../../utils/erp'
import { useErp } from '../../services/erpStore'
import { useSession } from '../../services/session'

export default function StockCountPage() {
  const { user } = useSession()
  const erp = useErp()
  const [notice, setNotice] = useState('')
  const [newCount, setNewCount] = useState(false)
  const [submitFor, setSubmitFor] = useState(null)
  const [form, setForm] = useState({ sku: '', counted: '' })

  const rows = useMemo(() => [...erp.stockCounts].reverse(), [erp.stockCounts])
  const skus = erp.inventoryOps
  const openVar = rows.filter((r) => r.status === 'Variance' && !r.adjudicated)
  const pendingApprove = rows.filter((r) => r.adjustment === 'Pending')
  const approved = rows.filter((r) => r.adjustment === 'Approved')

  const columns = [
    { key: 'number', label: 'Count', primary: true },
    { key: 'sku', label: 'SKU' },
    { key: 'product', label: 'Product' },
    { key: 'warehouse', label: 'WH' },
    { key: 'bin', label: 'Bin' },
    { key: 'systemQty', label: 'Book', render: (v) => num(v), className: 'text-right' },
    { key: 'counted', label: 'Counted', render: (v) => num(v), className: 'text-right' },
    { key: 'variance', label: 'Variance', render: (v) => <span className={v > 0 ? 'font-semibold text-emerald-700' : v < 0 ? 'font-semibold text-red-600' : 'text-slate-600'}>{v > 0 ? `+${num(v)}` : num(v)}</span>, className: 'text-right' },
    { key: 'status', label: 'Status' },
    { key: 'adj', label: 'Adjustment', render: (v, row) => row.adjustment ? row.adjustment === 'Pending' ? <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800"><Hash size={11} />Awaiting approval</span> : <StatusBadge status={`${row.adjustment}`} /> : <span className="text-[11px] text-slate-400">—</span> },
  ]

  const doCreate = (e) => {
    e.preventDefault()
    const row = skus.find((r) => r.sku === form.sku)
    const counted = Number(form.counted)
    if (!row || counted < 0 || Number.isNaN(counted)) { setNotice('Select a SKU and enter a valid counted quantity.'); return }
    const number = erp.createStockCount({ sku: row.sku, counted, bin: row.bin, warehouse: row.warehouse })
    setNotice(`${number} logged for ${row.sku} — ${counted === row.onHand ? 'matched, no adjustment.' : `variance ${counted > row.onHand ? '+' : ''}${counted - row.onHand} detected.`}`)
    setNewCount(false)
    setForm({ sku: '', counted: '' })
  }

  return (
    <>
      <PageHeader
        title="Cycle Counts"
        description="Physical counts against book stock. Variances submit as stock adjustments that flow to the warehouse manager for approval."
        actions={<button className="btn-primary" onClick={() => setNewCount(true)}><ClipboardCheck size={15} />New count</button>}
      />
      {notice && <div className="mb-4"><Alert onClose={() => setNotice('')}>{notice}</Alert></div>}

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open variances" value={num(openVar.length)} icon={Scale3D} tone="amber" trend="awaiting submission" />
        <StatCard label="Pending approval" value={num(pendingApprove.length)} icon={Send} tone="violet" trend="in Approval Center" />
        <InfoBox label="Adjusted this cycle" value={num(approved.length)} icon={CheckCircle2} tone="green" context="book ↔ counted reconciled" />
        <InfoBox label="Counts logged" value={num(rows.length)} icon={ClipboardCheck} tone="blue" context="all-time" />
      </div>

      <DataTable rows={rows} columns={[...columns, { key: 'workflow', label: 'Workflow', render: (v, row) => row.status === 'Variance' && !row.adjudicated
        ? <button className="btn-secondary !px-2.5 !py-1 text-[11px]" onClick={(e) => { e.stopPropagation(); setSubmitFor(row) }}><Send size={13} />Submit adjustment</button>
        : null }]} caption="Cycle count register" />

      <ConfirmDialog open={!!submitFor} title={`Submit adjustment · ${submitFor?.number}`} message={`Submit the ${submitFor?.variance > 0 ? '+' : ''}${num(submitFor?.variance)} variance on ${submitFor?.sku} (${num(submitFor?.systemQty)} → ${num(submitFor?.counted)}) for warehouse approval? It lands in the Approval Center.`} confirmText="Submit" onClose={() => setSubmitFor(null)} onConfirm={() => { erp.submitStockCount(submitFor.id); setNotice(`${submitFor.number} submitted — ${submitFor.sku} variance queued in the Approval Center.`); setSubmitFor(null) }} />

      <Modal open={!!newCount} title="New cycle count" onClose={() => setNewCount(false)}>
        <form onSubmit={doCreate} className="space-y-3">
          <SelectInput label="SKU" required value={form.sku} onChange={(e) => { const row = skus.find((r) => r.sku === e.target.value); setForm({ ...form, sku: e.target.value, counted: String(row?.onHand ?? '') }) }}>
            <option value="">Select SKU...</option>
            {skus.map((r) => <option key={r.sku} value={r.sku}>{r.sku} · {r.product} ({num(r.onHand)} on hand)</option>)}
          </SelectInput>
          <TextInput label="Counted quantity" type="number" min="0" required value={form.counted} onChange={(e) => setForm({ ...form, counted: e.target.value })} />
          <div className="rounded-lg bg-slate-50 p-3 text-xs"><span className="text-slate-500">Book on hand · </span><strong className="text-slate-800">{(() => { const r = skus.find((x) => x.sku === form.sku); return r ? num(r.onHand) : '—' })()}</strong>{' '}<span className="text-slate-500">· variance will be computed on submit</span></div>
          <div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setNewCount(false)}>Cancel</button><button className="btn-primary">Log count</button></div>
        </form>
      </Modal>
    </>
  )
}
