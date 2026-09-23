import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Boxes, PackageX, Timer, Truck } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { InfoBox, StatCard } from '../../components/cards/DashboardCards'
import DataTable from '../../components/tables/DataTable'
import { Alert, StatusBadge } from '../../components/ui'
import { num, sumBy } from '../../utils/erp'
import { useErp } from '../../services/erpStore'

export default function BackordersPage() {
  const erp = useErp()
  const rows = useMemo(() => [...erp.backorders].reverse(), [erp.backorders])
  const pending = rows.filter((r) => r.status !== 'Filled' && r.status !== 'Released')
  const resolved = rows.filter((r) => r.status === 'Filled' || r.status === 'Released')
  const openQty = sumBy(pending, (r) => r.qty)

  const columns = [
    { key: 'number', label: 'Backorder', primary: true },
    { key: 'buyer', label: 'Buyer' },
    { key: 'po', label: 'PO' },
    { key: 'sku', label: 'SKU' },
    { key: 'product', label: 'Product' },
    { key: 'qty', label: 'Open qty', render: (v) => num(v), className: 'text-right' },
    { key: 'raised', label: 'Raised' },
    { key: 'eta', label: 'ETA' },
    { key: 'status', label: 'Status' },
  ]

  return (
    <>
      <PageHeader title="Backorders" description="Sales orders partially filled against inbound replenishment. Backorders close when receiving posts stock." />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open backorders" value={rows.length - resolved.length} icon={PackageX} tone="amber" trend={`${num(openQty)} units on hold`} />
        <StatCard label="Filled / released" value={resolved.length} icon={Boxes} tone="green" trend="cleared this cycle" />
        <InfoBox label="Matches receiving lines" value={num(erp.receiving.filter((r) => r.status === 'Completed').length)} icon={Truck} tone="blue" context="completed inbound" />
        <InfoBox label="Longest wait" value={pending.length ? `${num(Math.max(...pending.map((r) => Math.floor((new Date('2026-09-11') - new Date(r.raised)) / 86400000))))} days` : '—'} icon={Timer} tone="violet" context="since raised" />
      </div>

      <DataTable rows={rows} columns={columns} caption="Backorder register" />
      {pending.length === 0 && <div className="mt-4"><Alert>No open backorders — fulfillment is current.</Alert></div>}
      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">Backorders are cleared when their linked receiving line completes put-away (Receiving → Put away), which posts units to available stock. See <Link to={`/warehouse/receiving`} className="font-semibold text-brand-700 hover:underline">Inbound Receiving</Link>.</div>
    </>
  )
}