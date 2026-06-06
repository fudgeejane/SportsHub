import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { getDashboardPath } from '../../routes/navConfig'

export default function PublicOnlyRoute({ children }) {
  const { currentUser, loading, userProfile } = useAuth()

  if (loading) {
    return null
  }

  if (currentUser) {
    return <Navigate to={getDashboardPath(userProfile?.role)} replace />
  }

  return children
}
