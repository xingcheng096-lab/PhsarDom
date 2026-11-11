import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { Alert, EmptyState, StatusBadge } from '../../components/ui'
import { adminApi } from '../../services/apiClient'

export default function AdminKycPage() {
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const load = () => { setLoading(true); adminApi.kyc().then((result) => setRows(result.data || [])).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [])
  const review = async (row, status) => {
    const rejection_reason = status === 'Rejected' ? window.prompt('Rejection reason') : null
    if (status === 'Rejected' && !rejection_reason?.trim()) return
    setError(''); setMessage('')
    try { await adminApi.reviewKyc(row.id, { status, rejection_reason }); setMessage(`${row.business?.legal_name || 'Business'} marked ${status}.`); load() } catch (requestError) { setError(requestError.message) }
  }
  return <div className="space-y-5"><PageHeader title="Pending Buyer Verification" description="Review KYC submissions persisted in the Laravel database." />{error && <Alert>{error}</Alert>}{message && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}{loading ? <p role="status">Loading KYC queue...</p> : rows.length === 0 ? <EmptyState title="No pending submissions" text="All current buyer submissions have been reviewed." /> : <div className="surface-card overflow-x-auto"><table className="w-full min-w-[680px] text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="p-3">Business</th><th className="p-3">Status</th><th className="p-3">Submitted</th><th className="p-3">Actions</th></tr></thead><tbody>{rows.map((row) => <tr className="border-t" key={row.id}><td className="p-3"><strong>{row.business?.legal_name}</strong><span className="block text-xs text-slate-500">KYC #{row.id}</span></td><td className="p-3"><StatusBadge status={row.status}/></td><td className="p-3 text-xs text-slate-500">{row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}</td><td className="p-3"><div className="flex gap-2"><button className="btn-primary" onClick={() => review(row, 'Approved')}><Check size={14}/> Approve</button><button className="btn-secondary" onClick={() => review(row, 'Rejected')}><X size={14}/> Reject</button></div></td></tr>)}</tbody></table></div>}</div>
}
