import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { PUBLIC_ROUTES } from '../../routes/public-routes'

export default function AuthStatusRoute({ children }) {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="font-semibold text-slate-600">Loading...</p>
      </main>
    )
  }

  if (!currentUser) {
    return <Navigate to={PUBLIC_ROUTES.signIn} replace />
  }

  return children
}
