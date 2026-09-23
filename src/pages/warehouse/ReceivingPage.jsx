import { useMemo, useState } from 'react'
import { Check, ClipboardCheck, FlaskConical, Inbox, Truck } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { InfoBox, StatCard } from '../../components/cards/DashboardCards'
import DataTable from '../../components/tables/DataTable'
import { Alert, Card, ConfirmDialog, Modal, StatusBadge, TextInput } from '../../components/ui'
import { num, sumBy } from '../../utils/erp'
import { useErp } from '../../services/erpStore'
import { useSession } from '../../services/session'

export default function ReceivingPage() {
  const { user } = useSession()
  const erp = useErp()
  const [notice, setNotice] = useState('')
  const [act, setAct] = useState(null)
  const [qty, setQty] = useState('')
  const [note, setNote] = useState('')
  const [form, setForm] = useState({ note: '' })

  const rows = useMemo(() => [...erp.receiving].reverse(), [erp.receiving])
  const expected = rows.filter((r) => r.status === 'Expected')
  const arrived = rows.filter((r) => r.status === 'Arrived')
  const inspecting = rows.filter((r) => r.status === 'Inspecting')
  const discrepancy = rows.filter((r) => r.status === 'Discrepancy')

  const columns = [
    { key: 'number', label: 'Receiving', primary: true },
    { key: 'po', label: 'PO' },
    { key: 'supplier', label: 'Supplier' },
    { key: 'product', label: 'Product' },
    { key: 'qty', label: 'Qty', render: (v) => num(v), className: 'text-right' },
    { key: 'received', label: 'Received', render: (v, row) => <span className={row.received >= row.qty ? 'text-emerald-700' : 'text-amber-700'}>{num(v)}</span>, className: 'text-right' },
    { key: 'warehouse', label: 'WH' },
    { key: 'bin', label: 'Bin' },
    { key: 'expected', label: 'Expected' },
    { key: 'status', label: 'Status' },
  ]

  const openAct = (row, type) => { setAct({ row, type }); setQty(String(row.qty - row.received)); setNote(''); setForm({ note: '' }) }
  const step = act?.row

  const runInspection = () => {
    erp.startInboundInspection(step.id)
    setNotice(`${step.number} moved to Inspecting — QC sampling in progress.`)
    setAct(null)
  }
  const runArrival = () => {
    erp.arriveReceiving(step.id)
    setNotice(`${step.number} arrived on dock. Release paperwork signed.`)
    setAct(null)
  }
  const runReceive = (e) => {
    e.preventDefault()
    const n = Number(qty)
    if (!n || n <= 0) { setNotice('Enter a quantity greater than zero.'); return }
    erp.recordReceived(step.id, n)
    setNotice(`${num(n)} units recorded on ${step.number}.`)
    setAct(null)
  }
  const runFlag = (e) => {
    e.preventDefault()
    const text = form.note || 'Quantity/condition discrepancy flagged by receiving.'
    erp.flagDiscrepancy(step.id, text)
    setNotice(`Discrepancy flagged on ${step.number}: ${text}`)
    setAct(null)
  }
  const runComplete = (e) => {
    e.preventDefault()
    const bin = form.note || step.bin
    erp.completeReceiving(step.id, bin)
    setNotice(`${step.number} completed — ${num(step.received)} units put away${bin ? ` to ${bin}` : ''} and posted to stock.`)
    setAct(null)
  }
  const runResolve = () => {
    erp.resolveDiscrepancy(step.id)
    setNotice(`${step.number} discrepancy resolved — back to inspection.`)
    setAct(null)
  }

  const actions = (row) => {
    if (row.status === 'Expected') return <button className="btn-secondary !px-2.5 !py-1 text-[11px]" onClick={(e) => { e.stopPropagation(); openAct(row, 'arrive') }}><Truck size={13} />Arrive</button>
    if (row.status === 'Arrived') return <button className="btn-primary !px-2.5 !py-1 text-[11px]" onClick={(e) => { e.stopPropagation(); openAct(row, 'inspect') }}><FlaskConical size={13} />Start inbound QC</button>
    if (row.status === 'Inspecting') return <span className="flex flex-wrap gap-1.5">
      <button className="btn-secondary !px-2.5 !py-1 text-[11px]" onClick={(e) => { e.stopPropagation(); openAct(row, 'receive') }}><ClipboardCheck size={13} />Record</button>
      <button className="btn-secondary !px-2.5 !py-1 text-[11px]" onClick={(e) => { e.stopPropagation(); openAct(row, 'flag') }}><Inbox size={13} />Flag issue</button>
      <button className="btn-success !px-2.5 !py-1 text-[11px]" onClick={(e) => { e.stopPropagation(); openAct(row, 'complete') }}><Check size={13} />Put away</button>
    </span>
    if (row.status === 'Discrepancy') return <span className="flex flex-wrap gap-1.5">
      <button className="btn-secondary !px-2.5 !py-1 text-[11px]" onClick={(e) => { e.stopPropagation(); openAct(row, 'resolve') }}>Resolve</button>
      <button className="btn-success !px-2.5 !py-1 text-[11px]" onClick={(e) => { e.stopPropagation(); openAct(row, 'complete') }}><Check size={13} />Put away</button>
    </span>
    return null
  }

  return (
    <>
      <PageHeader title="Inbound Receiving" description="Carrier receipts, dock arrival, QC inspection, discrepancy handling, and put-away. Completing put-away posts units to live stock." />
      {notice && <div className="mb-4"><Alert onClose={() => setNotice('')}>{notice}</Alert></div>}

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Expected" value={num(expected.length)} icon={Truck} tone="blue" trend={`${num(sumBy(expected, (r) => r.qty))} units inbound`} />
        <StatCard label="On dock" value={num(arrived.length)} icon={Inbox} tone="amber" trend="awaiting QC" />
        <StatCard label="In inspection" value={num(inspecting.length)} icon={FlaskConical} tone="violet" trend="QC sampling" />
        <InfoBox label="Discrepancies flagged" value={num(discrepancy.length)} icon={ClipboardCheck} tone="red" context={`received ${num(sumBy(rows, (r) => r.received))} of ${num(sumBy(rows, (r) => r.qty))} total`} />
      </div>

      <DataTable
        rows={rows}
        caption="Inbound receiving register"
        columns={[...columns, { key: 'actions', label: 'Workflow', render: (v, row) => actions(row) }]}
        initialFilter=""
      />
      {discrepancy.length > 0 && <Card title="Open discrepancies" bodyClassName="p-4"><ul className="space-y-2">{discrepancy.map((d) => <li key={d.id} className="rounded-md border border-red-100 bg-red-50 p-2.5 text-xs"><strong className="text-red-800">{d.number}</strong> · {d.product} <span className="text-red-600">{d.discrepancyNote}</span></li>)}</ul></Card>}

      <ConfirmDialog open={act?.type === 'arrive'} title={`Arrive ${step?.number}`} message={`Confirm carrier arrival for ${step?.number} (${step?.product})? Status moves from Expected to Arrived.`} confirmText="Mark arrived" onClose={() => setAct(null)} onConfirm={runArrival} />
      <ConfirmDialog open={act?.type === 'inspect'} title={`Start inbound QC · ${step?.number}`} message={`Begin inspection for ${step?.product}. The line moves to Inspecting and awaits received quantity.`} confirmText="Start inspection" onClose={() => setAct(null)} onConfirm={runInspection} />

      <Modal open={act?.type === 'receive'} title={`Record received · ${step?.number}`} onClose={() => setAct(null)}>
        <form onSubmit={runReceive} className="space-y-3">
          <div className="rounded-lg bg-slate-50 p-3 text-xs"><span className="text-slate-500">{step?.product} · ordered </span><strong className="text-slate-800">{num(step?.qty)}</strong><span className="text-slate-500"> · already received </span><strong className="text-slate-800">{num(step?.received)}</strong></div>
          <TextInput label="Quantity received" type="number" min="1" max={step?.qty - step?.received} required value={qty} onChange={(e) => setQty(e.target.value)} />
          <div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setAct(null)}>Cancel</button><button className="btn-primary">Record</button></div>
        </form>
      </Modal>

      <Modal open={act?.type === 'flag'} title={`Flag discrepancy · ${step?.number}`} onClose={() => setAct(null)}>
        <form onSubmit={runFlag} className="space-y-3">
          <div className="rounded-lg bg-slate-50 p-3 text-xs"><span className="text-slate-500">{step?.product} at {step?.bin} · </span><strong className="text-slate-800">{num(step?.received)}/{num(step?.qty)}</strong><span className="text-slate-500"> received</span></div>
          <TextInput label="Discrepancy note" required value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="e.g. 3 cartons damaged on pallet 2" />
          <div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setAct(null)}>Cancel</button><button className="btn-danger">Flag discrepancy</button></div>
        </form>
      </Modal>

      <Modal open={act?.type === 'complete'} title={`Complete put-away · ${step?.number}`} onClose={() => setAct(null)}>
        <form onSubmit={runComplete} className="space-y-3">
          <div className="rounded-lg bg-slate-50 p-3 text-xs"><span className="text-slate-500">Putting away </span><strong className="text-slate-800">{num(step?.received)}</strong><span className="text-slate-500"> units of </span><strong className="text-slate-800">{step?.product}</strong><span className="text-slate-500"> to warehouse </span><strong className="text-slate-800">{step?.warehouse}</strong></div>
          <TextInput label="Target bin" value={form.note || ''} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder={step?.bin} />
          <div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setAct(null)}>Cancel</button><button className="btn-success"><Check size={14} />Complete & post to stock</button></div>
        </form>
      </Modal>

      <ConfirmDialog open={act?.type === 'resolve'} title={`Resolve discrepancy · ${step?.number}`} message={`Mark the discrepancy on ${step?.number} as resolved and return the line to inspection?`} confirmText="Resolve" onClose={() => setAct(null)} onConfirm={runResolve} />
    </>
  )
}
