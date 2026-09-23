import { useMemo, useState } from 'react'
import { Check, ClipboardList, PackageOpen, Timer } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { InfoBox, StatCard } from '../../components/cards/DashboardCards'
import DataTable from '../../components/tables/DataTable'
import { Alert, Modal, StatusBadge, Textarea, TextInput } from '../../components/ui'
import { num, sumBy } from '../../utils/erp'
import { useErp } from '../../services/erpStore'

export default function PickingPage() {
  const erp = useErp()
  const [notice, setNotice] = useState('')
  const [act, setAct] = useState(null)
  const [qty, setQty] = useState('')
  const [reason, setReason] = useState('')
  const rows = useMemo(() => [...erp.picking].reverse(), [erp.picking])
  const waiting = rows.filter((r) => r.status === 'Waiting')
  const assigned = rows.filter((r) => r.status === 'Assigned')
  const inProgress = rows.filter((r) => r.status === 'Picking')
  const shortages = rows.filter((r) => r.status === 'Shortage')

  const step = act?.row
  const columns = [
    { key: 'number', label: 'Pick', primary: true },
    { key: 'po', label: 'PO' },
    { key: 'buyer', label: 'Buyer' },
    { key: 'sku', label: 'SKU' },
    { key: 'product', label: 'Product' },
    { key: 'qty', label: 'Required', render: (v) => num(v), className: 'text-right' },
    { key: 'picked', label: 'Picked', render: (v, row) => <span className={row.picked >= row.qty ? 'text-emerald-700' : 'text-slate-700'}>{num(v)}</span>, className: 'text-right' },
    { key: 'bin', label: 'Bin' },
    { key: 'neededBy', label: 'Needed by' },
    { key: 'status', label: 'Status' },
  ]

  const openAct = (row, type) => { setAct({ row, type }); setQty(String(row.qty - row.picked)); setReason('') }

  const runStart = () => { erp.startPick(step.id); setNotice(`${step.number} released to the floor — status Picking.`); setAct(null) }
  const runRecord = (e) => {
    e.preventDefault()
    const n = Number(qty)
    if (!n || n <= 0) { setNotice('Enter a quantity greater than zero.'); return }
    erp.recordPicked(step.id, n)
    setNotice(`${num(n)} units picked on ${step.number} (${num(Math.min(step.picked + n, step.qty))}/${num(step.qty)}).`)
    setAct(null)
  }
  const runShortage = (e) => {
    e.preventDefault()
    erp.reportShortage(step.id, reason)
    setNotice(`${step.number} flagged as Shortage — ${reason || 'insufficient stock at bin'}.`)
    setAct(null)
  }
  const runComplete = () => {
    erp.completePick(step.id)
    setNotice(`${step.number} complete — ${num(step.picked)} units confirmed picked. Reserved stock decremented and movement posted.`)
    setAct(null)
  }
  const pickable = rows.filter((r) => r.status === 'Waiting' || r.status === 'Assigned' || r.status === 'Picking')

  const actions = (row) => {
    if (row.status === 'Waiting' || row.status === 'Assigned') return <button className="btn-primary !px-2.5 !py-1 text-[11px]" onClick={(e) => { e.stopPropagation(); openAct(row, 'start') }}><Timer size={13} />Start picking</button>
    if (row.status === 'Picking') return <span className="flex flex-wrap gap-1.5">
      <button className="btn-secondary !px-2.5 !py-1 text-[11px]" onClick={(e) => { e.stopPropagation(); openAct(row, 'record') }}><PackageOpen size={13} />Record</button>
      <button className="btn-secondary !px-2.5 !py-1 text-[11px]" onClick={(e) => { e.stopPropagation(); openAct(row, 'shortage') }}>Shortage</button>
      <button className="btn-success !px-2.5 !py-1 text-[11px]" onClick={(e) => { e.stopPropagation(); openAct(row, 'complete') }}><Check size={13} />Complete</button>
    </span>
    return null
  }

  return (
    <>
      <PageHeader title="Picking" description="Release pick waves, record picks by unit, flag shortages, and complete. Completing a pick decrements reserved stock and posts the ledger movement." />
      {notice && <div className="mb-4"><Alert onClose={() => setNotice('')}>{notice}</Alert></div>}

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Waiting / assigned" value={num(waiting.length + assigned.length)} icon={ClipboardList} tone="amber" trend={`${num(sumBy(pickable.filter((r) => r.status !== 'Picking'), (r) => r.qty))} units queued`} />
        <StatCard label="In progress" value={num(inProgress.length)} icon={Timer} tone="blue" trend={`${num(sumBy(inProgress, (r) => r.picked || 0))}/${num(sumBy(inProgress, (r) => r.qty))}`} />
        <InfoBox label="Shortages flagged" value={num(shortages.length)} icon={Timer} tone="red" context="reconciliation needed" />
        <InfoBox label="Picks completed" value={num(rows.filter((r) => r.status === 'Picked').length)} icon={Check} tone="green" context="parked to packing" />
      </div>

      <DataTable rows={rows} columns={[...columns, { key: 'workflow', label: 'Workflow', render: (v, row) => actions(row) }]} caption="Pick waves" />

      <Modal open={act?.type === 'start' && !!step} title={`Start picking · ${step?.number}`} onClose={() => setAct(null)}>
        <div className="space-y-3">
          <p className="text-sm text-slate-600">Release <strong>{step?.number}</strong> to the floor — {step?.product} · bin <strong>{step?.bin}</strong> · <strong>{num(step?.qty)}</strong> units required.</p>
          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">{step && `Picking ${num(step.qty - step.picked)} units from reserved stock.`} Record picks as units come off the shelf.</div>
          <div className="flex justify-end gap-2"><button className="btn-secondary" onClick={() => setAct(null)}>Cancel</button><button className="btn-primary" onClick={runStart}>Start picking</button></div>
        </div>
      </Modal>

      <Modal open={act?.type === 'record' && !!step} title={`Record picked · ${step?.number}`} onClose={() => setAct(null)}>
        <form onSubmit={runRecord} className="space-y-3">
          <div className="rounded-lg bg-slate-50 p-3 text-xs"><span className="text-slate-500">{step?.product} · required </span><strong className="text-slate-800">{num(step?.qty)}</strong><span className="text-slate-500"> · picked </span><strong className="text-slate-800">{num(step?.picked)}</strong></div>
          <TextInput label="Units picked" type="number" min="1" max={step?.qty - step?.picked} required value={qty} onChange={(e) => setQty(e.target.value)} />
          <div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setAct(null)}>Cancel</button><button className="btn-primary">Record</button></div>
        </form>
      </Modal>

      <Modal open={act?.type === 'shortage' && !!step} title={`Report shortage · ${step?.number}`} onClose={() => setAct(null)}>
        <form onSubmit={runShortage} className="space-y-3">
          <Textarea label="Shortage reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. 12 units short at bin A4-13" />
          <div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setAct(null)}>Cancel</button><button className="btn-danger">Flag shortage</button></div>
        </form>
      </Modal>

      <Modal open={act?.type === 'complete' && !!step} title={`Complete pick · ${step?.number}`} onClose={() => setAct(null)}>
        <p className="text-sm text-slate-600">Confirm <strong>{num(step?.picked || 0)}</strong> units picked for <strong>{step?.product}</strong>. Reserved stock decrements and a <strong>Pick</strong> movement is posted.</p>
        <div className="mt-4 flex justify-end gap-2"><button className="btn-secondary" onClick={() => setAct(null)}>Cancel</button><button className="btn-success" onClick={runComplete}><Check size={14} />Complete pick</button></div>
      </Modal>
    </>
  )
}
