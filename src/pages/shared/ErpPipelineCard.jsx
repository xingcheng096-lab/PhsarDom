import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, CheckCircle2, Circle } from 'lucide-react'
import { Card } from '../../components/ui'
import { StatusBadge } from '../../components/ui'
import { purchaseOrders, quotations, shipments } from '../../data'
import { shipmentQty } from '../../data/erpData'
import { fulfillment } from '../../utils/erp'
import { useErp } from '../../services/erpStore'

const stepFor = (label, id, status, meta = '', link = '') => ({
  label, id, status, meta, link,
})

export default function ErpPipelineCard() {
  const erp = useErp()
  const po = purchaseOrders.find((p) => p.number === 'PO-2026-2141')
  const q = quotations.find((x) => x.number === 'QT-2026-0826')
  const res = erp.reservations.find((r) => r.number === 'RSV-2026-815')
  const pk = erp.picking.find((p) => p.number === 'PK-2026-901')
  const pkg = erp.packing.find((p) => p.number === 'PKG-2026-501')
  const plan = erp.plans.find((p) => p.number === 'SHP-2026-7720')
  const fpo = fulfillment(po, shipments, shipmentQty, erp.plans)

  const steps = [
    stepFor('Quote accepted', 'QT-2026-0826', q?.status || 'Accepted', '240-unit · Net-60', '/sales/quotations'),
    stepFor('Purchase order', 'PO-2026-2141', po?.status || '—', `${Number(po?.ordered || 0).toLocaleString()} chairs · $${Number(po?.amount || 0).toLocaleString()}`, '/finance/buyers/1'),
    stepFor('Credit clearing', 'CR-2026-012', 'Approved', 'Limit $250k → $300k', '/finance/credit-requests'),
    stepFor('Warehouse reservation', res?.number || 'RSV-2026-815', res?.status || 'Creative', `${Number(res?.qty || 0).toLocaleString()} units · ${res?.warehouse || 'WH-CHI-01'}`, '/warehouse/reservations'),
    stepFor('Inventory picking', pk?.number || 'PK-2026-901', pk?.status || 'Waiting', `${Number(pk?.picked || 0)} / ${Number(pk?.qty || 0).toLocaleString()} picked`, '/inventory-staff/picking'),
    stepFor('Packing', pkg?.number || 'PKG-2026-501', pkg?.status || 'Waiting', `${pkg?.packages || 12} packages · ${pkg?.weight || '1,940 kg'}`, '/inventory-staff/packing'),
    stepFor('Shipment plan', plan?.number || 'SHP-2026-7720', plan?.status || 'Planned', `${plan?.carrier || 'TransCon Logistics'} · ${plan?.service || 'Express LTL'}`, '/logistics/shipment-planning'),
    stepFor('Invoice', 'INV-2026-3901', 'Partially Paid', 'Balance $34.2K after deposit', '/finance/invoices'),
  ]

  return (
    <Card
      title="Connected transaction · PO-2026-2141"
      subtitle="PO-2026-2141 → Atlas Hospitality · 1,240 ergonomic task chairs — one order flowing through Finance, Warehouse, Inventory, and Logistics."
      action={
        <Link to="/logistics/shipment-planning" className="btn-secondary !px-3 !py-1.5 text-[11px]">
          Open pipeline <ArrowUpRight size={13} />
        </Link>
      }
      bodyClassName="p-0"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="p-3 text-left">Step</th>
              <th className="p-3 text-left">Reference</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Detail</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {steps.map((s) => (
              <tr key={s.id} className="border-t hover:bg-slate-50/60">
                <td className="p-3">
                  <span className="flex items-center gap-2 font-medium text-slate-800">
                    {['Approved', 'Picked', 'Ready to Ship', 'Partially Paid', 'Accepted'].includes(s.status) ? (
                      <CheckCircle2 size={15} className="text-emerald-600" />
                    ) : (
                      <Circle size={15} className="text-slate-300" />
                    )}
                    {s.label}
                  </span>
                </td>
                <td className="p-3">
                  {s.link ? (
                    <Link to={s.link} className="font-semibold text-brand-700 hover:underline">
                      {s.id}
                    </Link>
                  ) : (
                    <span className="font-semibold text-slate-700">{s.id}</span>
                  )}
                </td>
                <td className="p-3"><StatusBadge status={s.status} /></td>
                <td className="p-3 text-xs text-slate-500">{s.meta}</td>
                <td className="p-3 text-right"><ArrowRight size={14} className="ml-auto text-slate-300" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-xs">
        <span className="text-slate-500">
          Order position · <strong className="text-slate-800">{Number(fpo.shipped || 0).toLocaleString()} shipped</strong> / {Number(po?.ordered || 0).toLocaleString()} ordered ·{' '}
          <strong className={fpo.remaining > 0 ? 'text-amber-700' : 'text-emerald-700'}>{fpo.remaining > 0 ? `${fpo.remaining.toLocaleString()} remaining` : 'fully covered'}</strong>
        </span>
        <span className="hidden text-slate-400 sm:block">State changes here reflect in every department in real time.</span>
      </div>
    </Card>
  )
}