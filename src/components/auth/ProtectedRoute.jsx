import { Navigate, useLocation } from 'react-router-dom'
import { ROLES, STATUSES } from '../../contexts/AuthContext'
import { useAuth } from '../../hooks/useAuth'
import { PUBLIC_ROUTES } from '../../routes/public-routes'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, loading, userProfile } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="font-semibold text-slate-600">Checking access...</p>
      </main>
    )
  }

  if (!currentUser) {
    return <Navigate to={PUBLIC_ROUTES.signIn} replace state={{ from: location }} />
  }

  const adminVerifiedInApp =
    userProfile?.role === ROLES.COMMUNITY_ORGANIZER &&
    userProfile?.status === STATUSES.APPROVED &&
    userProfile?.emailVerified === true

  if (!currentUser.emailVerified && !adminVerifiedInApp) {
    return <Navigate to={PUBLIC_ROUTES.verifyEmail} replace />
  }

  if (userProfile?.status === STATUSES.PENDING) {
    return <Navigate to={PUBLIC_ROUTES.approvalPending} replace />
  }

  if (userProfile?.status === STATUSES.REJECTED) {
    return <Navigate to={PUBLIC_ROUTES.accessDenied} replace />
  }

  if (userProfile?.status !== STATUSES.APPROVED) {
    return <Navigate to={PUBLIC_ROUTES.approvalPending} replace />
  }

  if (allowedRoles?.length && !allowedRoles.includes(userProfile.role)) {
    return <Navigate to={PUBLIC_ROUTES.accessDenied} replace />
  }

  return children
}
