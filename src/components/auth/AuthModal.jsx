import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { ROLES } from '../../contexts/AuthContext'
import { useAuth } from '../../hooks/useAuth.jsx'
import { isFirebaseConfigComplete } from '../../firebase'
import { PUBLIC_ROUTES } from '../../routes/public-routes'
import ForgotPasswordModal from './ForgotPasswordModal'

const roleOptions = [
  { value: ROLES.PLAYER, label: 'Player' },
  { value: ROLES.COACH, label: 'Coach' },
  { value: ROLES.FACILITATOR, label: 'Facilitator' },
  { value: ROLES.COMMUNITY_ORGANIZER, label: 'Community Organizer' },
]

function getFriendlyAuthError(error) {
  const code = error?.code || ''

  if (code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.' || code.includes('api-key-not-valid')) {
    return 'Firebase API key is invalid. Replace VITE_FIREBASE_API_KEY with the Web API key from your Firebase project settings, then restart the dev server.'
  }

  if (code === 'auth/invalid-email') return 'Enter a valid email address.'
  if (code === 'auth/email-already-in-use') return 'This email is already registered. Try signing in instead.'
  if (code === 'auth/weak-password') return 'Password should be at least 6 characters.'
  if (code === 'auth/invalid-credential') return 'Email or password is incorrect.'
  if (code === 'auth/popup-closed-by-user') return 'Google sign-in was closed before it finished.'

  return error?.message || 'Something went wrong. Please try again.'
}

export default function AuthModal({ mode = 'sign-in', onClose }) {
  const isSignUp = mode === 'sign-up'
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const [showForgotPassword, setShowForgotPassword] = useState(mode === 'forgot-password')
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    role: ROLES.PLAYER,
    age: '',
    gender: '',
    contactNumber: '',
    preferredSport: '',
    skillLevel: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!isFirebaseConfigComplete) {
      setError('Firebase config is incomplete. Check your VITE_FIREBASE_* values in .env and restart the dev server.')
      return
    }

    setLoading(true)

    try {
      if (isSignUp) {
        await signUp(form)
        navigate(PUBLIC_ROUTES.verifyEmail, { replace: true })
      } else {
        await signIn(form.email, form.password)
        navigate('/dashboard', { replace: true })
      }
    } catch (authError) {
      setError(getFriendlyAuthError(authError))
    } finally {
      setLoading(false)
    }
  }

  const handleModeSwitch = (event) => {
    event.preventDefault()
    setShowForgotPassword(false)
    navigate(isSignUp ? PUBLIC_ROUTES.signIn : PUBLIC_ROUTES.signUp, {
      replace: true,
      state: { restoreScrollY: window.scrollY },
    })
  }

  const handleForgotPassword = (event) => {
    event.preventDefault()
    setError('')
    setShowForgotPassword(true)
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/40 px-4 backdrop-blur-sm">
      {showForgotPassword ? <ForgotPasswordModal onBack={() => setShowForgotPassword(false)} onClose={onClose} /> : (
      <div className="max-h-[92svh] w-full max-w-md overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-600">SportsHub</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">{isSignUp ? 'Create your account' : 'Welcome back'}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            aria-label="Close authentication modal"
          >
            <X size={18} />
          </button>
        </div>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          {isSignUp ? (
            <>
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Full name
                <input
                  required
                  name="displayName"
                  value={form.displayName}
                  onChange={updateField}
                  className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-500"
                  placeholder="Juan Dela Cruz"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Age
                  <input
                    name="age"
                    type="number"
                    min="1"
                    value={form.age}
                    onChange={updateField}
                    className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-500"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Gender
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={updateField}
                    className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-500"
                  >
                    <option value="">Select</option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Prefer not to say</option>
                  </select>
                </label>
              </div>
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Contact number
                <input
                  name="contactNumber"
                  value={form.contactNumber}
                  onChange={updateField}
                  className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-500"
                  placeholder="09xx xxx xxxx"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Preferred sport
                  <input
                    name="preferredSport"
                    value={form.preferredSport}
                    onChange={updateField}
                    className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-500"
                    placeholder="Basketball"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Skill level
                  <select
                    name="skillLevel"
                    value={form.skillLevel}
                    onChange={updateField}
                    className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-500"
                  >
                    <option value="">Select</option>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                    <option>Competitive</option>
                  </select>
                </label>
              </div>
            </>
          ) : null}

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Email
            <input
              required
              type="email"
              name="email"
              value={form.email}
              onChange={updateField}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-500"
              placeholder="you@sportshub.com"
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
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-500"
              placeholder="Minimum 6 characters"
            />
          </label>

          {isSignUp ? (
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Role
              <select
                name="role"
                value={form.role}
                onChange={updateField}
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-500"
              >
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>

        </form>

        <div className="mt-5 flex items-center justify-between gap-3 text-sm">
          <a href={PUBLIC_ROUTES.forgotPassword} onClick={handleForgotPassword} className="font-semibold text-blue-600 hover:text-blue-700">
            Forgot password?
          </a>
          <a
            href={isSignUp ? PUBLIC_ROUTES.signIn : PUBLIC_ROUTES.signUp}
            onClick={handleModeSwitch}
            className="font-semibold text-slate-700 hover:text-slate-950"
          >
            {isSignUp ? 'Already have an account?' : 'Need an account?'}
          </a>
        </div>
      </div>
      )}
    </div>
  )
}
