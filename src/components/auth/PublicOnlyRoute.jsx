import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getDashboardPath } from '../../routes/navConfig'

export default function PublicOnlyRoute({ children }) {
  const { currentUser, loading, userProfile } = useAuth()

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="font-semibold text-slate-600">Loading...</p>
      </main>
    )
  }

  if (currentUser) {
    return <Navigate to={getDashboardPath(userProfile?.role)} replace />
  }

  return children
}
