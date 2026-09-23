import { useMemo, useState } from 'react'
import { Box, Check, PackageCheck, Truck } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { InfoBox, StatCard } from '../../components/cards/DashboardCards'
import DataTable from '../../components/tables/DataTable'
import { Alert, Modal, StatusBadge } from '../../components/ui'
import { num, sumBy } from '../../utils/erp'
import { useErp } from '../../services/erpStore'

export default function PackingPage() {
  const erp = useErp()
  const [notice, setNotice] = useState('')
  const [act, setAct] = useState(null)
  const rows = useMemo(() => [...erp.packing].reverse(), [erp.packing])
  const waiting = rows.filter((r) => r.status === 'Waiting')
  const packingRow = rows.filter((r) => r.status === 'Packing')
  const ready = rows.filter((r) => r.status === 'Ready to Ship')
  const step = act

  const columns = [
    { key: 'number', label: 'Pack', primary: true },
    { key: 'pick', label: 'Pick' },
    { key: 'po', label: 'PO' },
    { key: 'buyer', label: 'Buyer' },
    { key: 'product', label: 'Product' },
    { key: 'qty', label: 'Units', render: (v) => num(v), className: 'text-right' },
    { key: 'packages', label: 'Pkgs' },
    { key: 'weight', label: 'Weight' },
    { key: 'status', label: 'Status' },
  ]

  const runStart = () => { erp.startPacking(step.id); setNotice(`${step.number} opened on the pack line.`); setAct(null) }
  const runComplete = () => { erp.completePacking(step.id); setNotice(`${step.number} packed to Ready to Ship — tendered to logistics.`); setAct(null) }

  const actions = (row) => {
    if (row.status === 'Waiting') return <button className="btn-primary !px-2.5 !py-1 text-[11px]" onClick={(e) => { e.stopPropagation(); setAct(row) }}><Box size={13} />Start packing</button>
    if (row.status === 'Packing') return <button className="btn-success !px-2.5 !py-1 text-[11px]" onClick={(e) => { e.stopPropagation(); setAct(row) }}><Check size={13} />Complete pack</button>
    return null
  }

  return (
    <>
      <PageHeader title="Packing" description="Build pallets, verify counts, and tender shipments. Completing a pack moves the line to Ready to Ship." />
      {notice && <div className="mb-4"><Alert onClose={() => setNotice('')}>{notice}</Alert></div>}

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Waiting" value={num(waiting.length)} icon={Box} tone="amber" trend={`${num(sumBy(waiting, (r) => r.qty))} units`} />
        <StatCard label="On the pack line" value={num(packingRow.length)} icon={PackageCheck} tone="blue" trend="packout in progress" />
        <InfoBox label="Ready to ship" value={num(ready.length)} icon={Truck} tone="green" context="tendered to carriers" />
        <InfoBox label="Total units packed" value={num(sumBy(rows, (r) => r.qty))} icon={Check} tone="violet" context="all pack lines" />
      </div>

      <DataTable rows={rows} columns={[...columns, { key: 'workflow', label: 'Workflow', render: (v, row) => actions(row) }]} caption="Packing lines" />

      <Modal open={!!step} title={step?.status === 'Packing' ? `Complete pack · ${step?.number}` : `Start pack · ${step?.number}`} onClose={() => setAct(null)}>
        {step && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">{step?.product} · <strong>{num(step.qty)}</strong> units · <strong>{step.packages}</strong> packages · <strong>{step.weight}</strong></p>
            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">{step?.note}</div>
            <div className="flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setAct(null)}>Cancel</button>
              {step.status === 'Packing'
                ? <button className="btn-success" onClick={runComplete}><Check size={14} />Complete pack → Ready to Ship</button>
                : <button className="btn-primary" onClick={runStart}><Box size={14} />Start packing</button>}
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}