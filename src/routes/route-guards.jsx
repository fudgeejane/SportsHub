import { Navigate, useLocation } from 'react-router-dom'
import { PUBLIC_ROUTES } from './public-routes'

export function createProtectedRouteGuard(isAuthenticated) {
  return function ProtectedRoute({ children }) {
    const location = useLocation()

    if (!isAuthenticated) {
      return <Navigate to={PUBLIC_ROUTES.home} replace state={{ from: location }} />
    }

    return children
  }
}

export function isPublicPath(pathname) {
  return Object.values(PUBLIC_ROUTES).includes(pathname)
}
