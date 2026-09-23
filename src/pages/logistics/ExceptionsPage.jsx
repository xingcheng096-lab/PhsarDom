import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, UserPlus, MessageSquareText } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { InfoBox, StatCard } from '../../components/cards/DashboardCards'
import DataTable from '../../components/tables/DataTable'
import { Alert, Modal, SelectInput, StatusBadge, Textarea } from '../../components/ui'
import { num } from '../../utils/erp'
import { useErp } from '../../services/erpStore'
import { can } from '../../services/permissions'
import { useSession } from '../../services/session'

export default function ExceptionsPage() {
  const { user } = useSession()
  const roleKey = user?.key
  const erp = useErp()
  const [notice, setNotice] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ text: '' })
  const rows = useMemo(() => [...(Array.isArray(erp.exceptions) ? erp.exceptions : [])].reverse(), [erp.exceptions])
  const open = rows.filter((r) => r.status !== 'Resolved')
  const assigned = rows.filter((r) => r.status === 'Assigned')
  const resolved = rows.filter((r) => r.status === 'Resolved')
  const canResolve = can(roleKey, 'shipments', 'edit') || can(roleKey, 'shipments', 'approve')

  const columns = [
    { key: 'number', label: 'Exception', primary: true },
    { key: 'shipment', label: 'Shipment' },
    { key: 'buyer', label: 'Buyer' },
    { key: 'type', label: 'Type', render: (v) => <StatusBadge status={v} /> },
    { key: 'severity', label: 'Severity' },
    { key: 'reported', label: 'Reported' },
    { key: 'owner', label: 'Owner', render: (v) => v || <span className="text-slate-400">unassigned</span> },
    { key: 'status', label: 'Status' },
  ]

  const openModal = (row, type) => { setModal({ row, type }); setForm({ text: '' }) }

  const submit = (e) => {
    e.preventDefault()
    const { row, type } = modal
    if (type === 'assign') { erp.assignException(row.id, form.text || 'Lucas Meyer'); setNotice(`${row.number} assigned to ${form.text || 'Lucas Meyer'}.`) }
    if (type === 'note') { erp.addExceptionNote(row.id, form.text); setNotice(`Note added to ${row.number}.`) }
    if (type === 'resolve') { erp.resolveException(row.id, form.text); setNotice(`${row.number} resolved — ${form.text || 'closure recorded'}.`) }
    setModal(null)
  }

  const actions = (row) => {
    if (row.status === 'Resolved') return null
    return <span className="flex flex-wrap gap-1.5">
      {!row.owner && <button className="btn-secondary !px-2.5 !py-1 text-[11px]" onClick={(e) => { e.stopPropagation(); openModal(row, 'assign') }}><UserPlus size={13} />Assign</button>}
      <button className="btn-secondary !px-2.5 !py-1 text-[11px]" onClick={(e) => { e.stopPropagation(); openModal(row, 'note') }}><MessageSquareText size={13} />Note</button>
      {canResolve && <button className="btn-success !px-2.5 !py-1 text-[11px]" onClick={(e) => { e.stopPropagation(); openModal(row, 'resolve') }}>Resolve</button>}
    </span>
  }

  const titleFor = ({ type, row }) => type === 'assign' ? `Assign · ${row.number}` : type === 'note' ? `Add note · ${row.number}` : `Resolve · ${row.number}`

  return (
    <>
      <PageHeader title="Shipment Exceptions" description="Delays, shortages, damaged units, and POD gaps. Assign ownership, append notes, and close tickets." />
      {notice && <div className="mb-4"><Alert onClose={() => setNotice('')}>{notice}</Alert></div>}

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open exceptions" value={num(open.length)} icon={AlertTriangle} tone="amber" trend={`${num(assigned.length)} owned`} />
        <StatCard label="Resolved" value={num(resolved.length)} icon={CheckCircle2} tone="green" trend="SLA tracked" />
        <InfoBox label="High severity" value={num(open.filter((r) => r.severity === 'High').length)} icon={AlertTriangle} tone="red" context="escalate now" />
        <InfoBox label="Linked to Atlas order" value={num(open.filter((r) => r.buyer === 'Atlas Hospitality Group').length)} icon={MessageSquareText} tone="violet" context="PO-2026-2141 context" />
      </div>

      <DataTable rows={rows} columns={[...columns, { key: 'workflow', label: 'Workflow', render: (v, row) => actions(row) }]} caption="Exceptions register" />

      <Modal open={!!modal} title={titleFor(modal?.row ? modal : { type: 'resolve', row: { number: 'Missing reference' } })} onClose={() => setModal(null)}>
        <form onSubmit={submit} className="space-y-3">
          <div className="rounded-lg bg-slate-50 p-3 text-xs"><span className="text-slate-500">{modal?.row?.shipment} · </span><strong className="text-slate-800">{modal?.row?.number}</strong><span className="text-slate-500"> · {modal?.row?.type} · severity </span><strong className="text-slate-800">{modal?.row?.severity}</strong></div>
          {modal?.type === 'assign'
            ? <SelectInput label="Assign to" value={form.text || 'Lucas Meyer'} onChange={(e) => setForm({ ...form, text: e.target.value })}>{['Lucas Meyer', 'Amelia Scott', 'Grace Kim', 'Robert King'].map((o) => <option key={o}>{o}</option>)}</SelectInput>
            : <Textarea label="Note / resolution" required value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder={modal?.type === 'resolve' ? 'How was this resolved?' : 'Add context for the team...'} />}
          <div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className={modal?.type === 'resolve' ? 'btn-success' : 'btn-primary'}>{modal?.type === 'assign' ? 'Assign owner' : modal?.type === 'note' ? 'Add note' : 'Mark resolved'}</button></div>
        </form>
      </Modal>
    </>
  )
}
