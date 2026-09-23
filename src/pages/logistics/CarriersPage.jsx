import { useMemo } from 'react'
import { Bus, CheckCircle2, RadioTower, Star } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { InfoBox, StatCard } from '../../components/cards/DashboardCards'
import DataTable from '../../components/tables/DataTable'
import { StatusBadge } from '../../components/ui'
import { num } from '../../utils/erp'
import { useErp } from '../../services/erpStore'

export default function CarriersPage() {
  const erp = useErp()
  const rows = useMemo(() => [...erp.carriers].reverse(), [erp.carriers])
  const active = rows.filter((r) => r.status === 'Active')
  const used = rows.filter((r) => r.active > 0)

  const columns = [
    { key: 'name', label: 'Carrier', primary: true },
    { key: 'service', label: 'Service' },
    { key: 'onTime', label: 'On-time', render: (v) => <span className="font-semibold text-emerald-700">{v}</span>, className: 'text-right' },
    { key: 'active', label: 'Active routes', render: (v) => num(v), className: 'text-right' },
    { key: 'contact', label: 'Contact' },
    { key: 'status', label: 'Status' },
  ]

  return (
    <>
      <PageHeader title="Carriers" description="Approved freight partners, service classes, and performance. Carrier selection drives shipment plans." />
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active carriers" value={num(active.length)} icon={Bus} tone="blue" trend="approved partners" />
        <StatCard label="With live routes" value={num(used.length)} icon={RadioTower} tone="amber" trend="in use this period" />
        <InfoBox label="Best on-time" value={rows.reduce((best, r) => (parseFloat(r.onTime) > parseFloat(best?.onTime || '0') ? r : best), rows[0])?.name || '—'} icon={Star} tone="green" context="performance leader" />
        <InfoBox label="Carriers in plans" value={num(erp.plans.filter((p) => p.status !== 'Cancelled').reduce((s, p) => s + (p.carrier ? 1 : 0), 0))} icon={CheckCircle2} tone="violet" context="allocation count" />
      </div>
      <DataTable rows={rows} columns={columns} caption="Carrier register" />
    </>
  )
}