import { useNavigate } from 'react-router-dom'
import AuthPageShell from '../../components/auth/AuthPageShell'
import { useAuth } from '../../hooks/useAuth.jsx'
import { PUBLIC_ROUTES } from '../../routes/public-routes'

export default function AccessDeniedPage() {
  const { signOut, userProfile } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate(PUBLIC_ROUTES.home, { replace: true })
  }

  return (
    <AuthPageShell title="Access denied" description="Your SportsHub account cannot access this page.">
      <div className="grid gap-4">
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          Current status: {userProfile?.status || 'Unavailable'}
        </p>
        <button onClick={handleSignOut} className="rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700">
          Sign out
        </button>
      </div>
    </AuthPageShell>
  )
}
