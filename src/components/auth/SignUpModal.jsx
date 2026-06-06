import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROLES } from '../../contexts/AuthContext'
import { useAuth } from '../../hooks/useAuth.jsx'
import { isFirebaseConfigComplete } from '../../firebase'
import { PUBLIC_ROUTES } from '../../routes/public-routes'
import AuthDialog from './AuthDialog'
import { getFriendlyAuthError, roleOptions } from './authModalHelpers'

export default function SignUpModal({ onClose }) {
  const navigate = useNavigate()
  const { signUp } = useAuth()
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
      await signUp(form)
      navigate(PUBLIC_ROUTES.verifyEmail, { replace: true })
    } catch (authError) {
      setError(getFriendlyAuthError(authError))
    } finally {
      setLoading(false)
    }
  }

  const openSignIn = (event) => {
    event.preventDefault()
    navigate(PUBLIC_ROUTES.signIn, { replace: true, state: { restoreScrollY: window.scrollY } })
  }

  return (
    <AuthDialog title="Create your account" onClose={onClose}>
      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
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

        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Please wait...' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-5 flex justify-end text-sm">
        <a href={PUBLIC_ROUTES.signIn} onClick={openSignIn} className="font-semibold text-slate-700 hover:text-slate-950">
          Already have an account?
        </a>
      </div>
    </AuthDialog>
  )
}
