import { useMemo, useState } from 'react'
import { CalendarDays, MapPin, Route, Send } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { InfoBox, StatCard } from '../../components/cards/DashboardCards'
import { Alert, Modal, SelectInput, TextInput } from '../../components/ui'
import { purchaseOrders, shipments as staticShipments } from '../../data'
import { shipmentQty } from '../../data/erpData'
import { TODAY, fulfillment, num, poShippedQty } from '../../utils/erp'
import { useErp } from '../../services/erpStore'

export default function ShipmentPlanningPage() {
  const erp = useErp()
  const [notice, setNotice] = useState('')
  const [newPlan, setNewPlan] = useState(false)
  const [form, setForm] = useState({ po: '', qty: '', carrier: 'TransCon Logistics', service: 'Express LTL', eta: '', site: '' })

  const shipments = Array.isArray(erp.shipments) ? erp.shipments : staticShipments
  const plans = Array.isArray(erp.plans) ? erp.plans : []
  const soon = plans.filter((p) => p.status === 'Planned' || p.status === 'Dispatched' || p.status === 'Packed')
  const shippedToday = useMemo(() => Object.values(shipmentQty || {}).reduce((total, quantity) => total + Number(quantity || 0), 0), [])
  const remFor = useMemo(() => {
    const map = {}
    purchaseOrders.forEach((po) => { const position = fulfillment({ ...po, ordered: po.ordered ?? po.quantity ?? 0 }, shipments, shipmentQty, plans); map[po.number] = Math.max(0, Number(po.quantity ?? po.ordered ?? 0) - position.shipped - position.planned) })
    return map
  }, [shipments, plans])
  const totalRemaining = Object.values(remFor).reduce((a, b) => a + b, 0)
  const totalPlanned = plans.reduce((s, p) => s + Number(p.qty), 0)

  const doCreate = (e) => {
    e.preventDefault()
    const po = purchaseOrders.find((p) => p.number === form.po)
    const qty = Number(form.qty)
    if (!po || !qty || qty <= 0) { setNotice('Select a purchase order and enter a quantity greater than zero.'); return }
    const rem = remFor[po.number] ?? 0
    if (qty > rem) { setNotice(`Only ${num(rem)} units remain unshipped on ${po.number}.`); return }
    const number = erp.createPlan({ po: po.number, buyer: po.buyer, qty, carrier: form.carrier, service: form.service, site: form.site || `${po.buyer} site`, shipDate: TODAY, eta: form.eta, priority: qty >= 1000 ? 'High' : 'Medium' })
    setNotice(`${number} planned — ${num(qty)} units of ${po.number} (${num(rem - qty)} remaining).`)
    setNewPlan(false)
    setForm({ po: '', qty: '', carrier: 'TransCon Logistics', service: 'Express LTL', eta: '', site: '' })
  }

  const options = purchaseOrders.filter((p) => remFor[p.number] > 0)

  return (
    <>
      <PageHeader title="Shipment Planning" description="Create shipment plans against purchase-order balances. Any plan qty automatically reduces the unshipped remainder." actions={<button className="btn-primary" onClick={() => setNewPlan(true)}><Route size={15} />New shipment plan</button>} />
      {notice && <div className="mb-4"><Alert onClose={() => setNotice('')}>{notice}</Alert></div>}

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active plans" value={num(plans.length)} icon={Route} tone="blue" trend={`${num(soon.length)} open`} />
        <StatCard label="Units in plan queue" value={num(totalPlanned)} icon={Send} tone="amber" trend="awaiting dispatch" />
        <InfoBox label="Total remaining on POs" value={num(totalRemaining)} icon={CalendarDays} tone="violet" context="unshipped units" />
        <InfoBox label="Units shipped to date" value={num(shippedToday)} icon={MapPin} tone="green" context="across static shipments" />
      </div>

      <div className="surface-card mb-5 p-5">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Open purchase-order balances</h3>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {purchaseOrders.map((po) => {
            const rem = remFor[po.number] ?? 0
            const done = po.quantity - rem
            return (
              <div key={po.number} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between"><strong className="text-xs text-slate-800">{po.number}</strong><span className="text-[10px] text-slate-400">{po.buyer}</span></div>
                <div className="mt-2 text-xs"><span className="text-slate-500">Ordered </span><strong className="text-slate-800">{num(po.quantity)}</strong><span className="text-slate-500"> · shipped </span><strong className="text-emerald-700">{num(done)}</strong><span className="text-slate-500"> · remaining </span><strong className={rem > 0 ? 'text-amber-700' : 'text-slate-400'}>{num(rem)}</strong></div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-600" style={{ width: `${Math.min(100, Math.round((done / po.quantity) * 100))}%` }} /></div>
              </div>
            )
          })}
        </div>
      </div>

      <Modal open={!!newPlan} title="New shipment plan" onClose={() => setNewPlan(false)}>
        <form onSubmit={doCreate} className="space-y-3">
          <SelectInput label="Purchase order" required value={form.po} onChange={(e) => { const po = purchaseOrders.find((p) => p.number === e.target.value); const rem = po ? (remFor[po.number] ?? 0) : 0; setForm({ ...form, po: e.target.value, site: po ? `${po.buyer} site` : '', qty: String(po && rem <= 2000 ? rem : '') }) }}>
            <option value="">Select PO with remaining balance...</option>
            {options.map((po) => <option key={po.number} value={po.number}>{po.number} · {po.buyer} ({num(remFor[po.number])} remaining)</option>)}
          </SelectInput>
          <TextInput label="Quantity to ship" type="number" min="1" required value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
          <SelectInput label="Carrier" value={form.carrier} onChange={(e) => setForm({ ...form, carrier: e.target.value })}>{['TransCon Logistics', 'DHL Freight', 'FedEx Freight', 'XPO Logistics', 'Old Dominion'].map((c) => <option key={c}>{c}</option>)}</SelectInput>
          <SelectInput label="Service class" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>{['Express LTL', 'Standard LTL', 'Full Truckload'].map((s) => <option key={s}>{s}</option>)}</SelectInput>
          <TextInput label="ETA" type="date" value={form.eta} onChange={(e) => setForm({ ...form, eta: e.target.value })} />
          <TextInput label="Delivery site" value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} placeholder="Consignee site" />
          <div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setNewPlan(false)}>Cancel</button><button className="btn-primary"><Route size={14} />Create plan</button></div>
        </form>
      </Modal>
    </>
  )
}
