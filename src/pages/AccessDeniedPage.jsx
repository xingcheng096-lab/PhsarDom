import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useSession } from '../services/session'
import { ROLES } from '../services/session'

export default function AccessDeniedPage({ requiredRoles = [] }) {
  const { user, login } = useSession()
  const navigate = useNavigate()
  const allowed = ROLES.filter((r) => requiredRoles.includes(r.key))
  const switchTo = (r) => { login(r.key); navigate(r.home) }
  return (
    <div className="page-enter flex min-h-[70vh] items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center shadow-card">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
          <ShieldAlert size={28} className="text-red-600" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">403 · Permission denied</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          You are signed in as <strong className="text-slate-700">{user?.name}</strong> ({user?.label}).
          This department requires{' '}
          {allowed.length ? <strong className="text-slate-700">{allowed.map((r) => r.label).join(', ')}</strong> : 'authorization'} access.
        </p>
        {allowed.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400"><ShieldCheck size={13} />Sign in with an authorized role</p>
            <div className="flex flex-wrap justify-center gap-2">
              {allowed.map((r) => (
                <button key={r.key} onClick={() => switchTo(r)} className="btn-secondary">
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link to={user?.home || '/login'} className="btn-primary"><ArrowLeft size={15} />Back to my dashboard</Link>
        </div>
        <p className="mt-6 text-[11px] text-slate-400">PhsarDom Role-Based Access Control · routes are guarded by ERP role, module, and action permission model.</p>
      </div>
    </div>
  )
}