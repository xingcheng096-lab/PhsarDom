import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '../../services/session'
import AccessDeniedPage from '../../pages/AccessDeniedPage'

export default function RoleGuard({ roles, children }) {
  const { user } = useSession()
  const location = useLocation()
  if (!user) {
    const from = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?from=${from}`} replace />
  }
  if (!roles.includes(user.key)) return <AccessDeniedPage requiredRoles={roles} />
  return children
}