import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getDashboardPath } from '../../routes/navConfig'

export default function RoleRedirect() {
  const { userProfile } = useAuth()
  return <Navigate to={getDashboardPath(userProfile?.role)} replace />
}
