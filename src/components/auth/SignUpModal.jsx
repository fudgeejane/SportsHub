import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROLES } from '../../contexts/AuthContext'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useSignup } from '../../hooks/useSignup'
import { isFirebaseConfigComplete } from '../../firebase'
import { PUBLIC_ROUTES } from '../../routes/public-routes'
import AuthDialog from './AuthDialog'
import { toastError } from '../../utils/toast'
import { getFriendlyAuthError, roleOptions } from './authModalHelpers'

const inputClass = 'rounded-lg border border-slate-200 px-4 py-2 outline-none transition focus:border-cyan-500'

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
    preferredSportId: '',
    preferredSport: '',
    preferredSportTeamStructure: null,
    selectedTeamId: '',
    selectedTeamName: '',
    skillLevel: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const signup = useSignup(form)

  const updateField = (event) => {
    const { name, value } = event.target

    if (name === 'preferredSportId') {
      setForm((current) => ({
        ...current,
        preferredSportId: value,
        preferredSport: signup.sports.find((entry) => entry.id === value)?.name || '',
        preferredSportTeamStructure: signup.sports.find((entry) => entry.id === value)?.teamStructure || null,
        selectedTeamId: '',
        selectedTeamName: '',
      }))
      return
    }

    if (name === 'selectedTeamId') {
      const team = signup.teams.find((entry) => entry.id === value)
      setForm((current) => ({
        ...current,
        selectedTeamId: value,
        selectedTeamName: team?.name || '',
      }))
      return
    }

    setForm((current) => {
      const next = { ...current, [name]: value }
      if (name === 'role' && value !== ROLES.PLAYER) {
        next.skillLevel = ''
        next.preferredSportId = ''
        next.preferredSport = ''
        next.preferredSportTeamStructure = null
        next.selectedTeamId = ''
        next.selectedTeamName = ''
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

    const validationError = signup.validate()
    if (validationError) {
      setError(validationError)
      toastError(validationError)
      return
    }

    setLoading(true)

    try {
      await signUp(signup.signupPayload)
      navigate(PUBLIC_ROUTES.home, {
        replace: true,
        state: {
          signupSuccess: true,
          playerJoinPending: signup.isPlayer,
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
          <input required name="displayName" value={form.displayName} onChange={updateField} className={inputClass} placeholder="Juan Dela Cruz" />
        </label>

        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Email
          <input required type="email" name="email" value={form.email} onChange={updateField} className={inputClass} placeholder="you@sportshub.com" />
        </label>

        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Password
          <input required type="password" name="password" value={form.password} onChange={updateField} className={inputClass} placeholder="Minimum 6 characters" />
        </label>

        <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-700">
          <span>Role:</span>
          {roleOptions.map((role) => (
            <label key={role.value} className="flex cursor-pointer items-center gap-1">
              <input type="radio" name="role" value={role.value} checked={form.role === role.value} onChange={updateField} className="accent-blue-500" />
              <span>{role.label}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Age
            <input name="age" type="number" min="1" value={form.age} onChange={updateField} className={inputClass} />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Gender
            <select name="gender" value={form.gender} onChange={updateField} className={inputClass}>
              <option value="">Select</option>
              <option>Female</option>
              <option>Male</option>
              <option>Prefer not to say</option>
            </select>
          </label>
        </div>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Contact number
          <input name="contactNumber" value={form.contactNumber} onChange={updateField} className={inputClass} placeholder="09xx xxx xxxx" />
        </label>

        {signup.isPlayer ? (
          <>
            <label className="grid gap-1 text-sm font-semibold text-slate-700">
              Sport
              <select
                required
                name="preferredSportId"
                value={form.preferredSportId}
                onChange={updateField}
                disabled={signup.sportsLoading || !signup.sports.length}
                className={`${inputClass} disabled:opacity-60`}
              >
                <option value="">
                  {signup.sportsLoading ? 'Loading sports...' : signup.sports.length ? 'Select sport' : 'No sports available'}
                </option>
                {signup.sports.map((sport) => (
                  <option key={sport.id} value={sport.id}>
                    {sport.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-sm font-semibold text-slate-700">
              Team
              <select
                required
                name="selectedTeamId"
                value={form.selectedTeamId}
                onChange={updateField}
                disabled={!form.preferredSportId || signup.teamsLoading || !signup.teams.length}
                className={`${inputClass} disabled:opacity-60`}
              >
                <option value="">
                  {!form.preferredSportId
                    ? 'Select a sport first'
                    : signup.teamsLoading
                      ? 'Loading teams...'
                      : signup.teams.length
                        ? 'Select team'
                        : 'No teams available for this sport'}
                </option>
                {signup.teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} - {team.coachName || 'Coach'}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Skill level
              <select required name="skillLevel" value={form.skillLevel} onChange={updateField} className={inputClass}>
                <option value="">Select</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
                <option>Competitive</option>
              </select>
            </label>
          </>
        ) : null}
        {signup.sportsError ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{signup.sportsError}</p> : null}
        {signup.teamsError ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{signup.teamsError}</p> : null}

        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading || signup.sportsLoading}
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
