import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Banknote, Boxes, ClipboardCheck, Landmark, PackageSearch, Receipt, RefreshCw, ShieldAlert, Truck, Users, Clock, AlertTriangle, RadioTower, Package } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { InfoBox } from '../../components/cards/DashboardCards'
import { StatusBadge } from '../../components/ui'
import ErpPipelineCard from './ErpPipelineCard'
import { useSession, ROLE_MAP, ROLES } from '../../services/session'
import { useErp } from '../../services/erpStore'
import { buyers, invoices, inventory, stockMovements, shipments, purchaseOrders, activityLogs, quotations } from '../../data'

const fmtCurrency = (n) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

function MiniTable({ columns, rows, empty }) {
  if (!rows.length) return <div className="surface-card p-6 text-center text-xs text-slate-400">{empty || 'No records to show.'}</div>
  return (
    <div className="surface-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>{columns.map((c) => <th key={c.key} className="table-cell">{c.label}</th>)}</tr>
          </thead>
          <tbody>{rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50">
              {columns.map((c) => (
                <td key={c.key} className="table-cell text-xs">
                  {c.render ? c.render(row[c.key], row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}

export default function DepartmentHome({ roleKey }) {
  const { user } = useSession()
  const role = ROLE_MAP[roleKey]
  const activeRole = user?.key || roleKey
  const erp = useErp()

  const live = useMemo(() => {
    const creditPending = erp.creditRequests.filter((r) => r.status === 'Pending').length
    const cnPending = erp.creditNotes.filter((r) => r.status === 'Pending Approval').length
    const resPending = erp.reservations.filter((r) => r.status === 'Pending').length
    const recvOpen = erp.receiving.filter((r) => !['Completed'].includes(r.status)).length
    const adjPending = erp.stockCounts.filter((c) => c.adjustment === 'Pending' && c.adjudicated).length
    const picksOpen = erp.picking.filter((r) => ['Waiting', 'Assigned', 'Picking'].includes(r.status)).length
    const packsOpen = erp.packing.filter((r) => r.status !== 'Ready to Ship' && r.status !== 'Completed').length
    const plansOpen = erp.plans.filter((p) => !['Cancelled', 'Delivered'].includes(p.status)).length
    const excOpen = erp.exceptions.filter((e) => e.status !== 'Resolved').length
    const deliverySched = erp.deliveries.filter((d) => d.status !== 'Delivered').length
    const payments = erp.payments.length
    return { creditPending, cnPending, resPending, recvOpen, adjPending, picksOpen, packsOpen, plansOpen, excOpen, deliverySched, payments }
  }, [erp])

  const livePanels = {
    finance: [
      ["Pending credit decisions", live.creditPending, Banknote, "violet"],
      ["Payments recorded", live.payments, Receipt, "green"],
      ["Pending credit notes", live.cnPending, ClipboardCheck, "amber"],
    ],
    warehouse: [
      ["Reservations pending", live.resPending, Boxes, "amber"],
      ["Receiving open", live.recvOpen, Truck, "blue"],
      ["Stock adjustments pending", live.adjPending, ShieldAlert, "violet"],
    ],
    inventory: [
      ["Pick waves open", live.picksOpen, Package, "blue"],
      ["Packing queue", live.packsOpen, PackageSearch, "amber"],
      ["Adjustments in approval", live.adjPending, ShieldAlert, "violet"],
    ],
    logistics: [
      ["Shipment plans open", live.plansOpen, Truck, "blue"],
      ["Delivery legs open", live.deliverySched, Clock, "amber"],
      ["Exceptions open", live.excOpen, ShieldAlert, "red"],
    ],
    support: [
      ["Open exceptions", live.excOpen, ShieldAlert, "red"],
      ["Open credit notes", live.cnPending, Receipt, "amber"],
      ["Reservations pending", live.resPending, Boxes, "violet"],
    ],
  }

  const stats = useMemo(() => {
    const overdueInv = invoices.filter((i) => i.status === 'Overdue')
    const outInv = invoices.filter((i) => i.status !== 'Paid')
    const lowStock = inventory.filter((i) => i.status === 'Low Stock')
    const backordered = inventory.filter((i) => i.status === 'Backordered' || i.backordered > 0)
    const inTransit = shipments.filter((s) => s.status === 'In Transit')
    const delayed = shipments.filter((s) => s.status === 'Delayed')
    const pendingPOs = purchaseOrders.filter((p) => ['Pending', 'Processing'].includes(p.status))
    const processing = purchaseOrders.filter((p) => p.status === 'Processing')
    const partial = purchaseOrders.filter((p) => p.status === 'Partially Shipped')
    const pendingBuyers = buyers.filter((b) => b.status === 'Pending')
    const openQuotes = quotations.filter((q) => ['Draft', 'Negotiating', 'Sent'].includes(q.status))
    return { overdueInv, outInv, lowStock, backordered, inTransit, delayed, pendingPOs, processing, partial, pendingBuyers, openQuotes }
  }, [])

  const layouts = {
    finance: {
      title: 'Finance Dashboard', subtitle: 'Credit, receivables & cash position · Finance / Credit Officer workspace',
      tiles: [
        { label: 'Accounts Receivable', value: fmtCurrency(stats.outInv.reduce((s, i) => s + i.amount - i.paid, 0)), context: `${stats.outInv.length} open invoices`, icon: Banknote, tone: 'blue' },
        { label: 'Overdue Exposure', value: fmtCurrency(stats.overdueInv.reduce((s, i) => s + i.amount, 0)), context: `${stats.overdueInv.length} overdue invoice${stats.overdueInv.length === 1 ? '' : 's'}`, icon: AlertTriangle, tone: 'red' },
        { label: 'Credit Utilization', value: `${Math.round((buyers.reduce((s, b) => s + b.creditLimit, 0) ? (stats.pendingBuyers.length / buyers.length) * 100 : 0))}%`, context: `${stats.pendingBuyers.length} buyer in review`, icon: Landmark, tone: 'violet' },
        { label: 'Issued Credit Notes', value: `${invoices.reduce((s, i) => s + (i.creditNotes || []).length, 0)}`, context: 'Across current invoices', icon: Receipt, tone: 'amber' },
      ],
      table: { title: 'Receivables requiring attention', columns: [{ key: 'number', label: 'Invoice' }, { key: 'buyer', label: 'Buyer' }, { key: 'amount', label: 'Amount', render: (v) => fmtCurrency(v) }, { key: 'due', label: 'Due' }, { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> }], rows: stats.overdueInv,
        empty: 'No overdue receivables — all invoices within terms.' },
    },
    warehouse: {
      title: 'Warehouse Operations', subtitle: 'Stock position & warehouse activities · Warehouse Manager workspace',
      tiles: [
        { label: 'On Hand', value: inventory.reduce((s, i) => s + i.onHand, 0).toLocaleString(), context: 'across all locations', icon: Boxes, tone: 'blue' },
        { label: 'Reserved', value: inventory.reduce((s, i) => s + i.reserved, 0).toLocaleString(), context: 'held for open orders', icon: ClipboardCheck, tone: 'violet' },
        { label: 'Low Stock Lines', value: `${stats.lowStock.length}`, context: `${stats.backordered.filter((b) => b.backordered > 0).length} backordered`, icon: AlertTriangle, tone: 'amber' },
        { label: 'Orders in Processing', value: `${stats.processing.length}`, context: `${stats.partial.length} partially shipped`, icon: PackageSearch, tone: 'green' },
      ],
      table: { title: 'Stock lines below reorder point', columns: [{ key: 'sku', label: 'SKU' }, { key: 'product', label: 'Product' }, { key: 'available', label: 'Available', render: (v) => v.toLocaleString() }, { key: 'reorderPoint', label: 'Reorder Pt.' }, { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> }], rows: stats.lowStock.concat(stats.backordered).slice(0, 6),
        empty: 'All stock lines above reorder thresholds.' },
    },
    inventory: {
      title: 'Inventory Operations', subtitle: 'Receiving, picking, counting & stock-level health · Inventory Staff workspace',
      tiles: [
        { label: 'Available Units', value: inventory.reduce((s, i) => s + i.available, 0).toLocaleString(), context: 'net of reservations', icon: Boxes, tone: 'blue' },
        { label: 'Movements Today', value: `${stockMovements.length}`, context: 'latest stock activities', icon: RefreshCw, tone: 'violet' },
        { label: 'Low / Backorder', value: `${stats.lowStock.length + stats.backordered.length}`, context: 'lines need action', icon: AlertTriangle, tone: 'amber' },
        { label: 'Receiving', value: `${stats.pendingPOs.length}`, context: 'purchase order intakes', icon: PackageSearch, tone: 'green' },
      ],
      table: { title: 'Recent stock movements', columns: [{ key: 'date', label: 'Date' }, { key: 'product', label: 'Product' }, { key: 'type', label: 'Type', render: (v) => <StatusBadge status={v} /> }, { key: 'quantity', label: 'Qty', render: (v) => <span className={v < 0 ? 'text-red-600' : 'text-emerald-700'}>{v > 0 ? `+${v}` : v}</span> }, { key: 'warehouse', label: 'Warehouse' }], rows: stockMovements,
        empty: 'No movements recorded.' },
    },
    logistics: {
      title: 'Logistics Control Tower', subtitle: 'Shipment planning, delivery & carrier performance · Logistics Coordinator workspace',
      tiles: [
        { label: 'Active Shipments', value: `${stats.inTransit.length + 1}`, context: `${stats.inTransit.length} in transit + dispatched`, icon: Truck, tone: 'blue' },
        { label: 'Delivered On Time', value: `${shipments.filter((s) => s.status === 'Delivered').length}/4`, context: 'latest batch', icon: Clock, tone: 'green' },
        { label: 'Exceptions', value: `${stats.delayed.length}`, context: `${stats.delayed.length} delayed shipment`, icon: ShieldAlert, tone: 'red' },
        { label: 'Awaiting Dispatch', value: `${stats.pendingPOs.length}`, context: 'purchase orders queued', icon: PackageSearch, tone: 'amber' },
      ],
      table: { title: 'Active & exception shipments', columns: [{ key: 'number', label: 'Shipment' }, { key: 'buyer', label: 'Buyer' }, { key: 'carrier', label: 'Carrier' }, { key: 'expected', label: 'Expected' }, { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> }], rows: shipments.filter((s) => s.status !== 'Delivered'),
        empty: 'All shipments delivered.' },
    },
    support: {
      title: 'Support & Audit', subtitle: 'Customer service queue and audit trail · Customer Support / Audit Viewer workspace',
      tiles: [
        { label: 'Open RFQs', value: `${stats.openQuotes.length}`, context: `${stats.pendingBuyers.length} buyer pending verification`, icon: Users, tone: 'blue' },
        { label: 'Shipments In Motion', value: `${stats.inTransit.length + 1}`, context: `${stats.delayed.length} exception`, icon: Truck, tone: 'violet' },
        { label: 'Outstanding Invoices', value: `${stats.outInv.length}`, context: fmtCurrency(stats.outInv.reduce((s, i) => s + i.amount - i.paid, 0)), icon: Receipt, tone: 'amber' },
        { label: 'Audit Events', value: `${activityLogs.length}`, context: 'recorded system activities', icon: ClipboardCheck, tone: 'green' },
      ],
      table: { title: 'Recent system activity', columns: [{ key: 'time', label: 'Time' }, { key: 'user', label: 'User' }, { key: 'module', label: 'Module' }, { key: 'action', label: 'Action', render: (v) => <StatusBadge status={v} /> }, { key: 'description', label: 'Description' }], rows: activityLogs.slice(0, 5),
        empty: 'No activity recorded.' },
    },
  }

  const cfg = layouts[roleKey] || layouts.finance
  const canReview = activeRole && ['manager', 'admin', 'finance', 'warehouse'].includes(activeRole)
  const livePanel = livePanels[roleKey] || livePanels.finance

  return (
    <div className="page-enter space-y-5">
      <PageHeader
        title={cfg.title}
        description={cfg.subtitle}
        actions={canReview ? <Link to="/approvals" className="btn-primary"><ClipboardCheck size={15} />Open Approval Center</Link> : undefined}
      />

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <ErpPipelineCard />
        <div className="surface-card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800"><RadioTower size={15} className="text-brand-600" />Live operational counters</h3>
          <ul className="space-y-3">
            {livePanel.map(([label, value, Icon, tone]) => (
              <li key={label} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
                <span className="flex items-center gap-2 text-xs font-medium text-slate-600"><Icon size={14} className="text-slate-400" />{label}</span>
                <strong className={`text-sm font-bold ${tone === 'red' ? 'text-red-600' : tone === 'amber' ? 'text-amber-700' : tone === 'green' ? 'text-emerald-700' : 'text-brand-700'}`}>{value}</strong>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11px] leading-4 text-slate-400">Counters read the live ERP store — acting on any department page updates these immediately.</p>
        </div>
      </div>

      <div className="mt-2 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cfg.tiles.map((t) => <InfoBox key={t.label} {...t} />)}
      </div>
      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">{cfg.table.title}</h2>
        <MiniTable columns={cfg.table.columns} rows={cfg.table.rows} empty={cfg.table.empty} />
      </div>
      <div className="flex items-center justify-between rounded-lg border border-dashed border-slate-300 bg-white/70 px-4 py-3">
        <p className="text-xs text-slate-500"><strong className="text-slate-700">{role?.label}</strong> workspace · operational workspaces are live — receivables, warehouse, inventory, logistics, and the audit-side views are wired to the Phase 2 ERP store. Role access is enforced by the permission model.</p>
        <span className="hidden h-6 items-center gap-1.5 rounded-full bg-brand-50 px-2.5 text-[10px] font-semibold text-brand-700 sm:flex"><ShieldAlert size={11} />RBAC enabled</span>
      </div>
    </div>
  )
}

export const DEPARTMENT_HOME_ROLES = ROLES.filter((r) => ['finance', 'warehouse', 'inventory', 'logistics', 'support'].includes(r.key))