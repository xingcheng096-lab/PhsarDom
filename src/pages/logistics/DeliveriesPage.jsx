import { useMemo, useState } from 'react'
import { Check, ClipboardCheck, Truck } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { InfoBox, StatCard } from '../../components/cards/DashboardCards'
import DataTable from '../../components/tables/DataTable'
import { Alert, ConfirmDialog, StatusBadge } from '../../components/ui'
import { num, sumBy } from '../../utils/erp'
import { useErp } from '../../services/erpStore'

export default function DeliveriesPage() {
  const erp = useErp()
  const [notice, setNotice] = useState('')
  const [confirm, setConfirm] = useState(null)
  const rows = useMemo(() => [...erp.deliveries].reverse(), [erp.deliveries])
  const delivered = rows.filter((r) => r.status === 'Delivered')
  const scheduled = rows.filter((r) => r.status === 'Scheduled')
  const inTransit = rows.filter((r) => r.status === 'In Transit')

  const columns = [
    { key: 'number', label: 'Delivery', primary: true },
    { key: 'shipment', label: 'Shipment' },
    { key: 'buyer', label: 'Buyer' },
    { key: 'truck', label: 'Truck' },
    { key: 'driver', label: 'Driver' },
    { key: 'date', label: 'Date' },
    { key: 'site', label: 'Site' },
    { key: 'status', label: 'Status' },
    { key: 'pod', label: 'POD', render: (v) => v && v !== '—' ? <span className="inline-flex items-center gap-1 text-emerald-700"><ClipboardCheck size={12} />{v}</span> : <span className="text-slate-400">—</span> },
  ]

  const actions = (row) => row.status !== 'Delivered'
    ? <button className="btn-success !px-2.5 !py-1 text-[11px]" onClick={(e) => { e.stopPropagation(); setConfirm(row) }}><Check size={13} />Capture POD</button>
    : null

  return (
    <>
      <PageHeader title="Last-Mile Deliveries" description="Final-mile legs, drivers, and proof of delivery. Capturing a POD closes the delivery and the linked shipment." />
      {notice && <div className="mb-4"><Alert onClose={() => setNotice('')}>{notice}</Alert></div>}

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Scheduled legs" value={num(scheduled.length)} icon={Truck} tone="amber" trend="awaiting dispatch" />
        <StatCard label="In transit" value={num(inTransit.length)} icon={Truck} tone="blue" trend="on the road" />
        <InfoBox label="Delivered / POD" value={num(delivered.length)} icon={ClipboardCheck} tone="green" context="proof captured" />
        <InfoBox label="Delivered units" value={num(sumBy(delivered, (r) => r.qty || 0))} icon={Check} tone="violet" context="across legs" />
      </div>

      <DataTable rows={rows} columns={[...columns, { key: 'workflow', label: 'Workflow', render: (v, row) => actions(row) }]} caption="Delivery register" />

      <ConfirmDialog open={!!confirm} title={`Capture POD · ${confirm?.number}`} message={`Mark delivery ${confirm?.number} (${confirm?.buyer}) as delivered with a signed proof? The leg closes and the shipment status advances.`} confirmText="Capture POD" onClose={() => setConfirm(null)} onConfirm={() => { erp.markDelivery(confirm.id, 'Signed — POD on file'); setNotice(`${confirm.number} delivered — POD captured for ${confirm.buyer}.`); setConfirm(null) }} />
    </>
  )
}