import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { STATUSES } from '../../contexts/AuthContext'
import { useAuth } from '../../hooks/useAuth.jsx'
import { isFirebaseConfigComplete } from '../../firebase'
import { PUBLIC_ROUTES } from '../../routes/public-routes'
import AuthDialog from './AuthDialog'
import { getFriendlyAuthError } from './authModalHelpers'

export default function SignInModal({ onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { checkUserStatus, currentUser, loading: authLoading, userProfile, signIn } = useAuth()
  const [form, setForm] = useState({
    email: location.state?.email || '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Check both location.state and URL query parameters for emailVerified
  const emailVerifiedFromState = location.state?.emailVerified
  const emailVerifiedFromQuery = searchParams.get('emailVerified') === 'true'
  const emailVerified = emailVerifiedFromState || emailVerifiedFromQuery

  const statusMessage = emailVerified
    ? 'Email verified. Sign in to access your dashboard.'
    : location.state?.verifyError
      ? 'Verification link is invalid or expired. Sign in or request a new verification email.'
      : null

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  useEffect(() => {
    if (authLoading || !currentUser || !userProfile) return

    if (!currentUser.emailVerified && !userProfile.emailVerified) {
      navigate(PUBLIC_ROUTES.verifyEmail, { replace: true })
      return
    }

    if (userProfile.status === STATUSES.REJECTED && userProfile.role !== 'PLAYER') {
      navigate(PUBLIC_ROUTES.accessDenied, { replace: true })
      return
    }

    if (userProfile.status !== STATUSES.APPROVED) {
      navigate(PUBLIC_ROUTES.approvalPending, { replace: true })
      return
    }
  }, [authLoading, currentUser, navigate, userProfile])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!isFirebaseConfigComplete) {
      setError('Firebase config is incomplete. Check your VITE_FIREBASE_* values in .env and restart the dev server.')
      return
    }

    setLoading(true)

    try {
      const user = await signIn(form.email, form.password)
      const profile = await checkUserStatus(user.uid)

      if (!user.emailVerified && !profile?.emailVerified) {
        navigate(PUBLIC_ROUTES.verifyEmail, { replace: true })
        return
      }

      if (profile?.status === STATUSES.REJECTED && profile?.role !== 'PLAYER') {
        navigate(PUBLIC_ROUTES.accessDenied, { replace: true })
        return
      }

      if (profile?.status !== STATUSES.APPROVED) {
        navigate(PUBLIC_ROUTES.approvalPending, { replace: true })
        return
      }

      navigate('/dashboard', { replace: true })
    } catch (authError) {
      setError(getFriendlyAuthError(authError))
    } finally {
      setLoading(false)
    }
  }

  const openSignUp = () => {
    navigate(PUBLIC_ROUTES.signUp, { replace: true, state: { restoreScrollY: window.scrollY } })
  }

  const openForgotPassword = () => {
    navigate(PUBLIC_ROUTES.forgotPassword, { replace: true, state: { restoreScrollY: window.scrollY } })
  }

  return (
    <AuthDialog title="Welcome back" onClose={onClose}>
      {statusMessage ? (
        <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{statusMessage}</p>
      ) : null}

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Email
          <input
            required
            type="email"
            name="email"
            value={form.email}
            onChange={updateField}
            className='rounded-lg border border-slate-200 px-4 py-2 outline-none transition focus:border-cyan-500'
            placeholder="you@email.com"
            autoComplete="off"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Password
          <input
            required
            type="password"
            name="password"
            value={form.password}
            onChange={updateField}
            className='rounded-lg border border-slate-200 px-4 py-2 outline-none transition focus:border-cyan-500'
            placeholder="Minimum 6 characters"
          />
        </label>

        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg cursor-pointer bg-blue-500 hover:bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Please wait...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <button type="button" onClick={openForgotPassword} className="cursor-pointer hover:underline font-semibold text-blue-600 hover:text-blue-700">
              Forgot password?
            </button>
        <button type="button" onClick={openSignUp} className="cursor-pointer hover:underline font-semibold text-slate-700 hover:text-slate-950">
          Need an account?
        </button>
      </div>
    </AuthDialog>
  )
}
