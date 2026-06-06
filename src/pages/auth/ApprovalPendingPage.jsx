import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthPageShell from '../../components/auth/AuthPageShell'
import { STATUSES } from '../../contexts/AuthContext'
import { useAuth } from '../../hooks/useAuth.jsx'
import { getDashboardPath } from '../../routes/navConfig'
import { PUBLIC_ROUTES } from '../../routes/public-routes'

export default function ApprovalPendingPage() {
  const { refreshUser, signOut, userProfile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (userProfile?.status === STATUSES.APPROVED) {
      navigate(getDashboardPath(userProfile.role), { replace: true })
      return
    }

    if (userProfile?.status === STATUSES.REJECTED) {
      navigate(PUBLIC_ROUTES.accessDenied, { replace: true })
    }
  }, [navigate, userProfile?.role, userProfile?.status])

  const handleSignOut = async () => {
    await signOut()
    navigate(PUBLIC_ROUTES.home, { replace: true })
  }

  return (
    <AuthPageShell title="Approval pending" description="Your account is waiting for a Community Organizer to approve access.">
      <div className="grid gap-4">
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          Current status: {userProfile?.status || 'PENDING'}
        </p>
        <button onClick={refreshUser} className="rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700">
          Check status
        </button>
        <button onClick={handleSignOut} className="rounded-2xl border border-slate-200 px-4 py-3 font-bold text-slate-800 transition hover:bg-slate-50">
          Sign out
        </button>
      </div>
    </AuthPageShell>
  )
}
