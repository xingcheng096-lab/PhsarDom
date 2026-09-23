import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Anchor, PackageCheck, Timer, Truck } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { InfoBox, StatCard } from '../../components/cards/DashboardCards'
import DataTable from '../../components/tables/DataTable'
import { shipments as staticShipments } from '../../data'
import { num } from '../../utils/erp'
import { useErp } from '../../services/erpStore'
import { can } from '../../services/permissions'
import { useSession } from '../../services/session'

export default function ShipmentsPage() {
  const { user } = useSession()
  const roleKey = user?.key
  const erp = useErp()
  const navigate = useNavigate()

  const plans = useMemo(() => [...erp.plans].reverse(), [erp.plans])
  const staticRows = staticShipments.map((s) => ({ ...s, source: 'static', qty: num(s.quantity), amount: s.amount }))
  const canManage = can(roleKey, 'shipments', 'edit') || can(roleKey, 'shipments', 'approve')

  const columns = [
    { key: 'number', label: 'Shipment', primary: true },
    { key: 'po', label: 'PO' },
    { key: 'buyer', label: 'Buyer' },
    { key: 'carrier', label: 'Carrier' },
    { key: 'service', label: 'Service' },
    { key: 'qty', label: 'Units', className: 'text-right' },
    { key: 'dispatch', label: 'Dispatch' },
    { key: 'eta', label: 'ETA' },
    { key: 'status', label: 'Status' },
  ]

  const planRows = plans.map((p) => ({ ...p, qty: num(p.qty), po: p.po, carrier: p.carrier, service: p.service, dispatch: p.shipDate, eta: p.eta, status: p.status, source: 'plan', id: p.id }))

  const routeTo = (row) => {
    if (row.source === 'plan') navigate(`/logistics/shipments/${row.id}`)
    else navigate(`/logistics/shipments/${row.number}`)
  }

  return (
    <>
      <PageHeader title="Shipments" description="Combined view of static shipments and live ERP shipment plans. Open a row to track and advance it." />
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Shipments + plans" value={num(staticRows.length + plans.length)} icon={Truck} tone="blue" trend={`${plans.length} live ERP plans`} />
        <StatCard label="On the move" value={num([...plans, ...staticRows].filter((r) => ['Dispatched', 'In Transit', 'Planned', 'Packed'].includes(r.status)).length)} icon={Anchor} tone="amber" trend="in flight / queued" />
        <InfoBox label="Delivered" value={num([...plans, ...staticRows].filter((r) => r.status === 'Delivered').length)} icon={PackageCheck} tone="green" context="POD captured" />
        <InfoBox label="Exceptions" value={num(erp.exceptions.filter((r) => r.status !== 'Resolved').length)} icon={Timer} tone="red" context="open on shipments" />
      </div>

      <DataTable rows={[...planRows, ...staticRows]} columns={columns} caption="Shipment register" onView={routeTo} pageSize={8} toolbar={canManage ? <span className="text-xs text-slate-500">{plans.length} plans awaiting dispatch</span> : undefined} />
      <div className="mt-3 text-xs text-slate-500">Plan rows created in <Link to="/logistics/shipment-planning" className="font-semibold text-brand-700 hover:underline">Shipment Planning</Link> merge here with static shipment history. Tracking advances in the detail view.</div>
    </>
  )
}
