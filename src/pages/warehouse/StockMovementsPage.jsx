import { useMemo, useState } from 'react'
import { ArrowDownToLine, ArrowUpFromLine, History, Scale3D } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { InfoBox, StatCard } from '../../components/cards/DashboardCards'
import DataTable from '../../components/tables/DataTable'
import { num, sumBy } from '../../utils/erp'
import { useErp } from '../../services/erpStore'

export default function StockMovementsPage() {
  const erp = useErp()
  const [type, setType] = useState('')
  const rows = useMemo(() => [...erp.movements].reverse(), [erp.movements])
  const filtered = type ? rows.filter((r) => r.type === type) : rows
  const inbound = rows.filter((r) => r.quantity > 0)
  const outbound = rows.filter((r) => r.quantity < 0)
  const types = [...new Set(rows.map((r) => r.type))]

  const columns = [
    { key: 'date', label: 'Time' },
    { key: 'sku', label: 'SKU', primary: true },
    { key: 'product', label: 'Product' },
    { key: 'quantity', label: 'Qty', render: (v) => <span className={v > 0 ? 'font-semibold text-emerald-700' : v < 0 ? 'font-semibold text-red-600' : ''}>{v > 0 ? `+${num(v)}` : num(v)}</span>, className: 'text-right' },
    { key: 'type', label: 'Type', render: (v) => <StatusChip v={v} /> },
    { key: 'reference', label: 'Reference' },
    { key: 'user', label: 'User' },
    { key: 'warehouse', label: 'WH' },
  ]

  return (
    <>
      <PageHeader title="Stock Movements" description="Posting ledger for inventory — reservations, picks, receiving, adjustments, allocations, and releases." />
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Movements (all time)" value={num(rows.length)} icon={History} tone="blue" trend="this period" />
        <InfoBox label="Inbound units" value={`+${num(sumBy(inbound, (r) => r.quantity))}`} icon={ArrowDownToLine} tone="green" context="receiving & adjustments" />
        <InfoBox label="Outbound units" value={num(sumBy(outbound, (r) => r.quantity))} icon={ArrowUpFromLine} tone="red" context="picks & shipments" />
        <InfoBox label="Adjustments" value={num(rows.filter((r) => r.type === 'Adjustment').length)} icon={Scale3D} tone="violet" context="cycle-count variances" />
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <button onClick={() => setType('')} className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${!type ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 bg-white text-slate-600'}`}>All</button>
        {types.map((t) => <button key={t} onClick={() => setType(type === t ? '' : t)} className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${type === t ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 bg-white text-slate-600'}`}>{t}</button>)}
      </div>

      <DataTable rows={filtered} columns={columns} caption="Stock movement ledger" pageSize={10} />
    </>
  )
}

function StatusChip({ v }) {
  const tone = { Receiving: 'bg-emerald-50 text-emerald-700', Reservation: 'bg-amber-50 text-amber-800', Pick: 'bg-sky-50 text-sky-700', Shipment: 'bg-violet-50 text-violet-700', Allocation: 'bg-indigo-50 text-indigo-700', Release: 'bg-slate-100 text-slate-600', Adjustment: 'bg-orange-50 text-orange-700', Return: 'bg-red-50 text-red-700' }
  return <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${tone[v] || 'bg-slate-100 text-slate-600'}`}>{v}</span>
}