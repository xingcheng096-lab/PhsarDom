import { useMemo, useState } from 'react'
import { Archive, Check, Globe, PackageCheck, RotateCcw, X } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { InfoBox, StatCard } from '../../components/cards/DashboardCards'
import DataTable from '../../components/tables/DataTable'
import { Alert, ConfirmDialog, Modal, StatusBadge, Textarea } from '../../components/ui'
import { num, sumBy } from '../../utils/erp'
import { useErp } from '../../services/erpStore'
import { can } from '../../services/permissions'
import { useSession } from '../../services/session'

export default function ReservationsPage() {
  const { user } = useSession()
  const roleKey = user?.key
  const erp = useErp()
  const [notice, setNotice] = useState('')
  const [act, setAct] = useState(null)
  const [form, setForm] = useState({ note: '' })
  const rows = useMemo(() => [...erp.reservations].reverse(), [erp.reservations])
  const canAct = can(roleKey, 'inventory', 'approve')

  const pending = rows.filter((r) => r.status === 'Pending')
  const reserved = rows.filter((r) => r.status === 'Reserved')
  const allocated = rows.filter((r) => r.status === 'Allocated')
  const released = rows.filter((r) => r.status === 'Released')

  const columns = [
    { key: 'number', label: 'Reservation', primary: true },
    { key: 'buyer', label: 'Buyer' },
    { key: 'po', label: 'PO' },
    { key: 'product', label: 'Product' },
    { key: 'qty', label: 'Units', render: (v) => num(v), className: 'text-right' },
    { key: 'warehouse', label: 'WH' },
    { key: 'bin', label: 'Bin' },
    { key: 'neededBy', label: 'Needed by' },
    { key: 'status', label: 'Status' },
  ]

  const actBtn = (row, type, label, icon, cls) => <button className={`${cls} !px-2.5 !py-1 text-[11px]`} onClick={(e) => { e.stopPropagation(); setAct({ row, type }); setForm({ note: '' }) }}>{icon}{label}</button>

  const actionCell = (row) => {
    if (row.status === 'Pending') {
      return canAct
        ? <span className="flex flex-wrap gap-1.5">{actBtn(row, 'approve', 'Approve', <Check size={13} />, 'btn-success')}{actBtn(row, 'release', 'Release', <RotateCcw size={13} />, 'btn-secondary')}{actBtn(row, 'reject', 'Reject', <X size={13} />, 'btn-danger')}</span>
        : <span className="text-[11px] text-slate-400">View only — requires warehouse/Admin approve</span>
    }
    if (row.status === 'Reserved') return actBtn(row, 'reallocate', 'Reallocate', <Archive size={13} />, 'btn-secondary')
    return null
  }

  const doApprove = () => {
    erp.approveReservation(act.row.id)
    setNotice(`${act.row.number} reserved — ${num(act.row.qty)} units moved from available to reserved at ${act.row.warehouse}/${act.row.bin}.`)
  }
  const doRelease = () => {
    erp.releaseReservation(act.row.id)
    setNotice(`${act.row.number} released — reserved units returned to available.`)
  }
  const doReject = () => {
    erp.rejectReservation(act.row.id)
    setNotice(`${act.row.number} rejected. ${form.note || 'Reservation closed.'}`)
  }
  const doReallocate = () => {
    erp.reallocateReservation(act.row.id, form.note)
    setNotice(`${act.row.number} reallocated — reservation fully allocated to warehouse stock.`)
  }

  return (
    <>
      <PageHeader
        title="Stock Reservations"
        description="Units tagged against purchase-order releases before picking. Approving a reservation moves available stock to reserved instantly."
        actions={canAct ? <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"><PackageCheck size={13} />Approval authority active</span> : <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{roleKey} · view only</span>}
      />
      {notice && <div className="mb-4"><Alert onClose={() => setNotice('')}>{notice}</Alert></div>}

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending approval" value={pending.length} icon={Globe} tone="amber" trend={`${num(sumBy(pending, (r) => r.qty))} units to commit`} />
        <StatCard label="Reserved" value={reserved.length} icon={PackageCheck} tone="blue" trend="awaiting pick waves" />
        <InfoBox label="Allocated to shipments" value={allocated.length} icon={Archive} tone="violet" context={`${num(sumBy(allocated, (r) => r.qty))} units committed`} />
        <InfoBox label="Released" value={released.length} icon={RotateCcw} tone="slate" context="returned to available" />
      </div>

      <DataTable
        rows={rows}
        caption="Stock reservation register"
        columns={[...columns, ...(canAct ? [{ key: 'workflow', label: 'Workflow', render: (v, row) => actionCell(row) }] : [])]}
      />
      {!canAct && <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800"><Globe size={13} className="mr-1.5 inline" />Your role ({roleKey}) cannot approve reservations here — raise them via the reservation request in the Approval Center or ask the warehouse manager.</div>}

      <ConfirmDialog open={act?.type === 'approve'} title={`Approve ${act?.row?.number}`} message={`Commit ${num(act?.row?.qty)} units of ${act?.row?.product} (${act?.row?.sku}) at ${act?.row?.warehouse} for ${act?.row?.buyer}? Available stock decreases, reserved increases.`} confirmText="Approve reservation" onClose={() => setAct(null)} onConfirm={doApprove} />
      <ConfirmDialog open={act?.type === 'release'} title={`Release ${act?.row?.number}`} message={`Release the reservation for ${act?.row?.product}? Units return from reserved to available.`} confirmText="Release units" onClose={() => setAct(null)} onConfirm={doRelease} />
      <Modal open={act?.type === 'reject'} title={`Reject · ${act?.row?.number}`} onClose={() => setAct(null)}>
        <form onSubmit={(e) => { e.preventDefault(); doReject() }} className="space-y-3">
          <div className="rounded-lg bg-slate-50 p-3 text-xs"><span className="text-slate-500">{act?.row?.product} · </span><strong className="text-slate-800">{num(act?.row?.qty)}</strong><span className="text-slate-500"> units requested for {act?.row?.buyer}</span></div>
          <Textarea label="Reason (optional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Why is this reservation rejected?" />
          <div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setAct(null)}>Cancel</button><button className="btn-danger"><X size={14} />Reject reservation</button></div>
        </form>
      </Modal>
      <Modal open={act?.type === 'reallocate'} title={`Reallocate · ${act?.row?.number}`} onClose={() => setAct(null)}>
        <form onSubmit={(e) => { e.preventDefault(); doReallocate() }} className="space-y-3">
          <Textarea label="Note (optional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="e.g. allocation to SHP-2026-7720 wave" />
          <div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setAct(null)}>Cancel</button><button className="btn-secondary"><Archive size={14} />Reallocate</button></div>
        </form>
      </Modal>
    </>
  )
}