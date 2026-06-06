import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROLES } from '../../contexts/AuthContext'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useAvailableSports } from '../../hooks/useAvailableSports'
import { isFirebaseConfigComplete } from '../../firebase'
import { PUBLIC_ROUTES } from '../../routes/public-routes'
import AuthDialog from './AuthDialog'
import { getFriendlyAuthError, roleOptions } from './authModalHelpers'

export default function SignUpModal({ onClose }) {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const { sports, loading: sportsLoading, error: sportsError } = useAvailableSports()
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    role: ROLES.PLAYER,
    age: '',
    gender: '',
    contactNumber: '',
    preferredSportId: '',
    preferredSport: '',
    preferredSportTeamStructure: null,
    skillLevel: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const isPlayer = form.role === ROLES.PLAYER

  const updateField = (event) => {
    const { name, value } = event.target

    if (name === 'preferredSportId') {
      const sport = sports.find((entry) => entry.id === value)
      setForm((current) => ({
        ...current,
        preferredSportId: value,
        preferredSport: sport?.name || '',
        preferredSportTeamStructure: sport?.teamStructure || null,
      }))
      return
    }

    setForm((current) => {
      const next = { ...current, [name]: value }
      if (name === 'role' && value !== ROLES.PLAYER) {
        next.skillLevel = ''
      }
      return next
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!isFirebaseConfigComplete) {
      setError('Firebase config is incomplete. Check your VITE_FIREBASE_* values in .env and restart the dev server.')
      return
    }

    if (!form.preferredSportId || !form.preferredSportTeamStructure) {
      setError('Select a preferred sport from organizer-created sports.')
      return
    }

    setLoading(true)

    try {
      await signUp(form)
      navigate(PUBLIC_ROUTES.home, {
        replace: true,
        state: {
          signupSuccess: true,
          restoreScrollY: 0,
        },
      })
    } catch (authError) {
      setError(getFriendlyAuthError(authError))
    } finally {
      setLoading(false)
    }
  }

  const openSignIn = () => {
    navigate(PUBLIC_ROUTES.signIn, { replace: true, state: { restoreScrollY: window.scrollY } })
  }

  return (
    <AuthDialog title="Create your account" onClose={onClose}>
      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Full name
          <input
            required
            name="displayName"
            value={form.displayName}
            onChange={updateField}
            className="rounded-lg border border-slate-200 px-4 py-2  outline-none transition focus:border-cyan-500"
            placeholder="Juan Dela Cruz"
          />
        </label>

        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Email
          <input
            required
            type="email"
            name="email"
            value={form.email}
            onChange={updateField}
            className="rounded-lg border border-slate-200 px-4 py-2  outline-none transition focus:border-cyan-500"
            placeholder="you@sportshub.com"
          />
        </label>

        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Password
          <input
            required
            type="password"
            name="password"
            value={form.password}
            onChange={updateField}
            className="rounded-lg border border-slate-200 px-4 py-2  outline-none transition focus:border-cyan-500"
            placeholder="Minimum 6 characters"
          />
        </label>

        <div className="flex items-center gap-4 text-sm font-semibold text-slate-700">
          <span>Role:</span>

          {roleOptions.map((role) => (
            <label key={role.value} className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="role"
                value={role.value}
                checked={form.role === role.value}
                onChange={updateField}
                className="accent-blue-500"
              />
              <span>{role.label}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Age
            <input
              name="age"
              type="number"
              min="1"
              value={form.age}
              onChange={updateField}
            className="rounded-lg border border-slate-200 px-4 py-2  outline-none transition focus:border-cyan-500"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Gender
            <select
              name="gender"
              value={form.gender}
              onChange={updateField}
            className="rounded-lg border border-slate-200 px-4 py-2  outline-none transition focus:border-cyan-500"
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
            className="rounded-lg border border-slate-200 px-4 py-2  outline-none transition focus:border-cyan-500"
            placeholder="09xx xxx xxxx"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Preferred sport
          <select
            required
            name="preferredSportId"
            value={form.preferredSportId}
            onChange={updateField}
            disabled={sportsLoading || !sports.length}
            className="rounded-lg border border-slate-200 px-4 py-2 outline-none transition focus:border-cyan-500 disabled:opacity-60"
          >
            <option value="">
              {sportsLoading ? 'Loading sports...' : sports.length ? 'Select sport' : 'No organizer sports available'}
            </option>
            {sports.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>
        </label>
        {sportsError ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{sportsError}</p> : null}
        {!sportsLoading && !sports.length ? (
          <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            An organizer must create sports with team structure before signup is available.
          </p>
        ) : null}

        {isPlayer ? (
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Skill level
            <select
              name="skillLevel"
              value={form.skillLevel}
              onChange={updateField}
            className="rounded-lg border border-slate-200 px-4 py-2  outline-none transition focus:border-cyan-500"
            >
              <option value="">Select</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
              <option>Competitive</option>
            </select>
          </label>
        ) : null}

        

        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading || sportsLoading}
          className="rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Please wait...' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-5 flex justify-end text-sm">
        <button type="button" onClick={openSignIn} className="font-semibold text-slate-700 hover:text-slate-950">
          Already have an account?
        </button>
      </div>
    </AuthDialog>
  )
}
