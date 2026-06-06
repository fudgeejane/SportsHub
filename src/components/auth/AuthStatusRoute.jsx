import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { PUBLIC_ROUTES } from '../../routes/public-routes'

export default function AuthStatusRoute({ children }) {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!currentUser) {
    return <Navigate to={PUBLIC_ROUTES.home} replace />
  }

  return children
}
