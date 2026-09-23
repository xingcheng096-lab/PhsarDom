import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowRight, MapPin, RotateCcw } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { Alert, Card, ConfirmDialog, StatusBadge } from '../../components/ui'
import { shipments as staticShipments } from '../../data'
import { money, num } from '../../utils/erp'
import { useErp } from '../../services/erpStore'
import { useSession } from '../../services/session'

const nextStep = {
  Planned: ['Packed', 'Ready to ship'],
  Packed: ['Dispatched', 'In transit'],
  Dispatched: ['In Transit', 'On the road'],
  'In Transit': ['Partially Delivered', 'First drop'],
}

export default function ShipmentDetailPage() {
  const { id } = useParams()
  const { user } = useSession()
  const roleKey = user?.key
  const erp = useErp()
  const [advance, setAdvance] = useState(null)
  const [notice, setNotice] = useState('')

  const plan = erp.plans.find((p) => p.id === Number(id)) || erp.plans.find((p) => p.number === id)
  const stat = staticShipments.find((s) => s.number === id || s.number === String(id))
  const row = plan || stat

  if (!row) return <div className="surface-card p-10 text-center"><h1 className="text-xl font-semibold">Shipment not found</h1></div>

  const isPlan = !!plan
  const status = row.status
  const events = plan ? (plan.events || []) : []
  const next = nextStep[status]

  const doAdvance = () => {
    erp.advancePlan(plan.id, advance.target, advance.note)
    setNotice(`${plan.number} ${advance.label} — status now ${advance.target}.`)
    setAdvance(null)
  }
  const doCancel = () => {
    erp.cancelPlan(plan.id)
    setNotice(`${plan.number} cancelled — removed from dispatch queue.`)
  }

  return (
    <>
      <PageHeader
        title={row.number}
        description={`${isPlan ? 'Shipment plan' : 'Shipment'} · ${row.po || row.po_number || ''} · ${row.buyer}`}
        breadcrumbs={[{ label: 'Shipments', to: `/${roleKey}/shipments` }, { label: row.number }]}
        actions={<StatusBadge status={status} />}
      />
      {notice && <div className="mb-4"><Alert onClose={() => setNotice('')}>{notice}</Alert></div>}

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card bodyClassName="p-4"><small className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Units</small><strong className="mt-1 block text-2xl text-slate-900">{num(row.qty)}</strong><span className="mt-1 block text-xs text-slate-500">{row.carrier} · {row.service}</span></Card>
        <Card bodyClassName="p-4"><small className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Dispatch</small><strong className="mt-1 block text-2xl text-slate-900">{row.dispatch || row.shipDate || '—'}</strong><span className="mt-1 block text-xs text-slate-500">ETA {row.eta || '—'}</span></Card>
        <Card bodyClassName="p-4"><small className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Ship site</small><strong className="mt-1 block truncate text-2xl text-slate-900"><MapPin size={17} className="mr-1 inline text-slate-400" />{row.site || '—'}</strong><span className="mt-1 block text-xs text-slate-500">{row.po || 'No PO link'}</span></Card>
        <Card bodyClassName="p-4"><small className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Volume</small><strong className="mt-1 block text-2xl text-slate-900">{isPlan ? num(row.qty) : row.amount ? money(row.amount) : num(row.qty)}</strong><span className="mt-1 block text-xs text-slate-500">{isPlan ? 'plan quantity' : 'shipment value'}</span></Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <div className="space-y-5">
          {isPlan && events.length > 0 && (
            <Card title="Tracking timeline" subtitle="Advancements logged against this plan" bodyClassName="p-5">
              <ol className="relative ml-5 space-y-4 border-l border-slate-200 pl-6">
                {events.map((ev, i) => (
                  <li key={i} className="relative">
                    <span className={`absolute -left-[27px] top-1 h-2.5 w-2.5 rounded-full ring-2 ring-white ${ev.label === 'Delivered' ? 'bg-emerald-500' : ev.label === 'Dispatched' || ev.label === 'In Transit' ? 'bg-sky-500' : 'bg-brand-500'}`} />
                    <div className="flex flex-wrap items-center gap-x-2 text-xs"><strong className="text-slate-800">{ev.label}</strong><time className="text-slate-400">{ev.time}</time></div>
                    {ev.detail && <p className="mt-0.5 text-xs text-slate-600">{ev.detail}</p>}
                  </li>
                ))}
              </ol>
            </Card>
          )}
          {!isPlan && (
            <Card title="Static shipment record" subtitle="Historical shipment in the ERP register" bodyClassName="p-5">
              <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {[['Number', row.number], ['PO', row.po], ['Buyer', row.buyer], ['Carrier', row.carrier], ['Service', row.service], ['Status', <StatusBadge key="s" status={row.status} />]].map(([l, v]) => <div key={l}><dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{l}</dt><dd className="mt-1 font-medium text-slate-800">{v}</dd></div>)}
              </dl>
            </Card>
          )}

          {next && (
            <Card title="Advance shipment" subtitle="Push this plan to the next milestone" bodyClassName="p-5">
              <div className="flex flex-wrap gap-2">
                {next.map(([target, label]) => (
                  <button key={target} className="btn-primary" onClick={() => setAdvance({ target, label })}><ArrowRight size={14} />{label}</button>
                ))}
                <button className="btn-danger" onClick={() => setAdvance({ type: 'cancel' })}><RotateCcw size={14} />Cancel plan</button>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-5">
          <Card title="Carrier & route" bodyClassName="p-5">
            <dl className="space-y-3 text-xs">
              <div className="flex justify-between"><dt className="text-slate-500">Carrier</dt><dd className="font-semibold text-slate-800">{row.carrier}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Service class</dt><dd className="font-semibold text-slate-800">{row.service}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Ship date</dt><dd className="font-semibold text-slate-800">{row.shipDate || row.dispatch || '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">ETA</dt><dd className="font-semibold text-slate-800">{row.eta || '—'}</dd></div>
            </dl>
          </Card>
          {isPlan && <Card title="Dispatch actions" bodyClassName="p-5">
            <p className="text-xs leading-5 text-slate-600">The plan advances through <strong>Planned → Packed → Dispatched → In Transit → Partially Delivered</strong> and feeds the unified Shipments register. Delivery POD capture lives in <strong>Deliveries</strong>.</p>
          </Card>}
        </div>
      </div>

      <ConfirmDialog open={advance?.type !== 'cancel' && !!advance} title={`${advance?.label} · ${plan?.number}`} message={`Advance ${plan?.number} to "${advance?.target}"? The event is appended to the tracking timeline and visible on the register.`} confirmText="Save" onClose={() => setAdvance(null)} onConfirm={doAdvance} />
      <ConfirmDialog open={advance?.type === 'cancel'} title={`Cancel plan · ${plan?.number}`} message={`Cancel ${plan?.number}? Its quantity is released back to the unshipped balance for re-planning.`} confirmText="Cancel plan" danger onClose={() => setAdvance(null)} onConfirm={doCancel} />
    </>
  )
}