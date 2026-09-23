import { useMemo } from 'react'
import { BarChart3, Clock3, HandCoins, TriangleAlert, Wallet } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { InfoBox, StatCard } from '../../components/cards/DashboardCards'
import { CategoryBarChart, StatusDonutChart } from '../../components/charts/BusinessCharts'
import DataTable from '../../components/tables/DataTable'
import { StatusBadge } from '../../components/ui'
import { invoices } from '../../data'
import { TODAY, agingBuckets, invoiceView, money, outstanding, sumBy } from '../../utils/erp'
import { useErp } from '../../services/erpStore'

export default function AgingPage() {
  const erp = useErp()
  const rows = useMemo(() => invoices.map((i) => ({ ...invoiceView(i, erp.invoiceOverrides), balance: outstanding(i, {}) })), [erp.invoiceOverrides])
  const buckets = useMemo(() => agingBuckets(rows), [rows])
  const active = rows.filter((r) => r.status !== 'Cancelled')
  const totalAR = sumBy(active, (r) => r.balance)
  const overdue = sumBy(active.filter((r) => r.balance > 0 && new Date(r.due) < new Date(TODAY)), (r) => r.balance)
  const overduePct = totalAR ? Math.round((overdue / totalAR) * 100) : 0

  const tableRows = useMemo(() => {
    const labelOf = (due) => { const d = new Date(due); const n = new Date(TODAY); const v = Math.floor((n - d) / 86400000); if (v <= 0) return 'Current'; if (v <= 30) return '1–30 days'; if (v <= 60) return '31–60 days'; if (v <= 90) return '61–90 days'; return '90+ days' }
    return active.map((r) => ({ ...r, bucket: r.status === 'Paid' ? 'Paid' : r.balance <= 0 ? 'Paid' : labelOf(r.due) })).sort((a, b) => orderBucket(a.bucket) - orderBucket(b.bucket))
  }, [active, rows])

  function orderBucket(b) { return ['90+ days', '61–90 days', '31–60 days', '1–30 days', 'Current', 'Paid'].indexOf(b) }

  const bucketLabels = Object.keys(buckets).filter((k) => k !== 'Paid')

  return (
    <>
      <PageHeader title="Invoice Aging" description="Outstanding balances bucketed by days past due. Aging reflows the moment a payment is recorded." />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total A/R" value={money(totalAR)} icon={Wallet} tone="blue" trend={`${active.length} open invoices`} />
        <StatCard label="Overdue total" value={money(overdue)} icon={TriangleAlert} tone="amber" trend={`${overduePct}% of A/R`} context="past due" />
        <InfoBox label="Aged 90+ days" value={money(sumBy(tableRows.filter((r) => r.bucket === '90+ days'), (r) => r.balance))} icon={Clock3} tone="red" context="Escalation list" />
        <InfoBox label="Collected / current" value={money(sumBy(tableRows.filter((r) => r.bucket === 'Current'), (r) => r.balance))} icon={HandCoins} tone="green" context="not yet due" />
      </div>

      <div className="mb-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div className="surface-card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800"><BarChart3 size={15} className="text-brand-600" />Aged receivables (open balance)</h3>
          <CategoryBarChart data={bucketLabels.map((k) => ({ category: k, value: Math.round(buckets[k]) }))} labelKey="category" />
        </div>
        <div className="surface-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-800">Share of overdue</h3>
          <StatusDonutChart data={bucketLabels.map((k) => ({ name: k, value: buckets[k] }))} label="Aging distribution" />
        </div>
      </div>

      <DataTable
        rows={tableRows}
        caption="Invoice aging detail"
        columns={[
          { key: 'number', label: 'Invoice', primary: true },
          { key: 'buyer', label: 'Buyer' },
          { key: 'po', label: 'PO' },
          { key: 'amount', label: 'Amount', render: (v) => money(v), className: 'text-right' },
          { key: 'balance', label: 'Balance', render: (v, row) => <span className={row.bucket !== 'Paid' && row.balance > 0 ? 'font-semibold text-amber-700' : 'text-slate-600'}>{money(v)}</span>, className: 'text-right' },
          { key: 'due', label: 'Due' },
          { key: 'days', label: 'Days', render: (v, row) => row.status === 'Paid' || row.balance <= 0 ? '—' : Math.max(0, Math.floor((new Date(TODAY) - new Date(row.due)) / 86400000)), className: 'text-right' },
          { key: 'status', label: 'Status' },
          { key: 'bucket', label: 'Bucket', render: (v) => <StatusBadge status={v} /> },
        ]}
      />
    </>
  )
}