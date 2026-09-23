import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Boxes, MapPin, Package, Warehouse } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { InfoBox, StatCard } from '../../components/cards/DashboardCards'
import { Alert, Card, Modal, StatusBadge } from '../../components/ui'
import { inventory, warehouses } from '../../data'
import { num } from '../../utils/erp'
import { useErp } from '../../services/erpStore'
import { useSession } from '../../services/session'
import { fieldAccess, can } from '../../services/permissions'

const binTone = { 'A-01': 'border-brand-300 bg-brand-50', 'A-02': 'border-sky-300 bg-sky-50', 'B-01': 'border-emerald-300 bg-emerald-50', 'B-02': 'border-amber-300 bg-amber-50', 'Dock': 'border-slate-300 bg-slate-50' }

export default function LocationsPage() {
  const { user } = useSession()
  const roleKey = user?.key
  const erp = useErp()
  const [selected, setSelected] = useState(warehouses[0]?.code || 'WHD')
  const [selectedBin, setSelectedBin] = useState(null)
  const wh = warehouses.find((w) => w.code === selected)
  const stock = erp.inventoryOps
  const canReserve = can(roleKey, 'inventory', 'approve')
  const ownsAdjust = fieldAccess(roleKey, 'Stock Adjustment')

  const whBin = (bin) => stock.filter((r) => r.warehouse === wh?.code && r.bin === bin)
  const whBins = [...new Set(stock.filter((r) => r.warehouse === wh?.code).map((r) => r.bin).filter(Boolean))]
  const bins = whBins.length ? whBins : ['A1-01']
  const binScale = (bin) => {
    const rows = whBin(bin)
    if (!rows.length) return 0
    const max = Math.max(...whBins.map((b) => whBin(b).reduce((s, r) => s + r.onHand, 0)), 1)
    return Math.round((rows.reduce((s, r) => s + r.onHand, 0) / max) * 100)
  }

  return (
    <>
      <PageHeader title="Locations & Stock Positions" description="Warehouse layout with live on-hand, reserved, and allocated positions per bin." actions={<span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600"><MapPin size={13} />{warehouses.length} warehouses</span>} />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Warehouse on hand" value={num(stock.reduce((s, r) => s + r.onHand, 0))} icon={Boxes} tone="blue" trend={`${stock.length} SKUs`} />
        <StatCard label="Reserved units" value={num(stock.reduce((s, r) => s + r.reserved, 0))} icon={Package} tone="amber" trend="awaiting picks" />
        <InfoBox label="Allocated stock" value={num(stock.reduce((s, r) => s + r.allocated, 0))} icon={Warehouse} tone="violet" context="committed to shipments" />
        <InfoBox label={`Adjust access · ${ownsAdjust || 'Hidden'}`} value={canReserve ? 'Full' : 'View only'} icon={MapPin} tone={canReserve ? 'green' : 'slate'} context="via can()/fieldAccess()" />
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {warehouses.map((w) => <button key={w.code} onClick={() => setSelected(w.code)} className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${selected === w.code ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>{w.code} · {w.name}</button>)}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
        <div className="space-y-5">
          <Card title={`${wh?.name || selected} · bin map`} subtitle={`${wh?.address || ''}`} bodyClassName="p-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bins.map((bin) => {
                const rows = whBin(bin)
                const onHand = rows.reduce((s, r) => s + r.onHand, 0)
                const scale = binScale(bin)
                return (
                  <button key={bin} onClick={() => setSelectedBin({ bin, rows, onHand })} className={`rounded-xl border p-4 text-left transition ${binTone[bin] || binTone['A-01']}`}>
                    <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-800">{bin}</span><MapPin size={13} className="text-slate-400" /></div>
                    <strong className="mt-2 block text-2xl text-slate-900">{num(onHand)}</strong>
                    <small className="block text-[11px] text-slate-500">{rows.length} SKU positions · {formatUnits(onHand, scale)}</small>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/70"><div className={`h-full rounded-full ${scale > 85 ? 'bg-red-500' : scale > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, scale)}%` }} /></div>
                  </button>
                )
              })}
            </div>
          </Card>

          <Card title={`Stock at ${selected}`} subtitle="Live positions from the ERP inventory ledger" bodyClassName="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="p-3 text-left">SKU</th><th className="p-3 text-left">Product</th><th className="p-3 text-left">Bin</th><th className="p-3 text-right">Available</th><th className="p-3 text-right">Reserved</th><th className="p-3 text-right">Allocated</th><th className="p-3 text-right">On hand</th></tr></thead><tbody>{whBin(selected).map((r) => <tr key={`${r.sku}-${r.bin}`} className="border-t hover:bg-slate-50/60"><td className="p-3 font-semibold">{r.sku}</td><td className="p-3">{r.product}</td><td className="p-3">{r.bin}</td><td className="p-3 text-right text-emerald-700">{num(r.available)}</td><td className="p-3 text-right text-amber-700">{num(r.reserved)}</td><td className="p-3 text-right text-violet-700">{num(r.allocated)}</td><td className="p-3 text-right font-semibold">{num(r.onHand)}</td></tr>)}</tbody></table>
            </div>
            <div className="grid gap-3 border-t border-slate-200 p-4 sm:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-3 text-center"><small className="block text-[11px] font-semibold text-slate-500">Low-stock SKUs</small><strong className="mt-1 block text-slate-800">{num(stock.filter((r) => r.available <= (r.reorder || 0) && r.onHand > 0).length)}</strong></div>
              <div className="rounded-lg bg-slate-50 p-3 text-center"><small className="block text-[11px] font-semibold text-slate-500">Out of stock</small><strong className="mt-1 block text-slate-800">{num(stock.filter((r) => r.available <= 0 && r.onHand <= 0).length)}</strong></div>
              <div className="rounded-lg bg-slate-50 p-3 text-center"><small className="block text-[11px] font-semibold text-slate-500">At/Danger capacity</small><strong className="mt-1 block text-slate-800">{num(whBins.filter((b) => binScale(b) > 85).length)}</strong></div>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Inbound pipeline" subtitle="Receiving documents feeding these bins" bodyClassName="p-0">
            <ul className="divide-y divide-slate-100">{erp.receiving.slice(0, 5).map((rcv) => (
              <li key={rcv.id} className="flex items-center justify-between gap-3 p-3">
                <span className="min-w-0"><strong className="block text-xs text-slate-800">{rcv.number}</strong><small className="block truncate text-[11px] text-slate-500">{rcv.buyer} · {num(rcv.expected)} units</small></span>
                <StatusBadge status={rcv.status} />
              </li>
            ))}</ul>
          </Card>
          <Card title="Live KPI feed" bodyClassName="p-5">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Reservations awaiting approval</span><strong className="text-amber-700">{num(erp.reservations.filter((r) => r.status === 'Pending').length)}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Receiving expected this week</span><strong className="text-slate-800">{num(erp.receiving.filter((r) => !['Arrived', 'Completed'].includes(r.status)).length)}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Picks in progress</span><strong className="text-slate-800">{num(erp.picking.filter((r) => r.status === 'Picking' || r.status === 'Assigned').length)}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Pending stock adjustments</span><strong className="text-violet-700">{num(erp.stockCounts.filter((c) => c.adjustment === 'Pending' && c.adjudicated).length)}</strong></div>
            </div>
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-500">Stock adjustments and reservations require {canReserve ? 'approval authority (approve) — you can resolve them in the Approval Center.' : 'warehouse/Admin approval — raise a cycle count and it flows to the Approval Center.'} Runtime access is enforced by <code className="rounded bg-white px-1 py-0.5">can()</code>/<code className="rounded bg-white px-1 py-0.5">fieldAccess()</code>.</div>
            <Link to={`/${roleKey}/reservations`} className="btn-secondary mt-4 w-full justify-center !py-2 text-xs">Open reservations queue</Link>
          </Card>
          {!canReserve && <Alert>View-only warehouse session — live reservations fall to the warehouse manager in this demo.</Alert>}
        </div>
      </div>
      <Modal open={!!selectedBin} title={`Bin ${selectedBin?.bin || ''}`} onClose={() => setSelectedBin(null)}>{selectedBin && <div className="space-y-3"><p className="text-sm text-slate-600">{num(selectedBin.rows.length)} SKU positions · {num(selectedBin.onHand)} units on hand.</p>{selectedBin.rows.length ? <ul className="divide-y rounded-lg border border-slate-200">{selectedBin.rows.map((row) => <li key={row.sku} className="flex justify-between p-3 text-xs"><span><strong>{row.sku}</strong><span className="ml-2 text-slate-500">{row.product}</span></span><strong>{num(row.onHand)}</strong></li>)}</ul> : <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">No stock positions in this bin.</p>}</div>}</Modal>
    </>
  )
}

function formatUnits(onHand, scale) {
  return `${num(onHand)} units${scale > 85 ? ' · over 85% relative fill' : ''}`
}
