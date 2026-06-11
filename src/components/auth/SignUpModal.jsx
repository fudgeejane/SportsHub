import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROLES } from '../../contexts/AuthContext'
import { useAuth } from '../../hooks/useAuth'
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

    if (name === 'contactNumber') {
      const digits = value.replace(/\D/g, '').slice(0, 11)

      let formatted = digits
      if (digits.length > 4) {
        formatted = `${digits.slice(0, 4)} ${digits.slice(4, 7)}`
      }
      if (digits.length > 7) {
        formatted = `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`
      }

      setForm((current) => ({
        ...current,
        [name]: formatted,
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
      <div className="mt-6 flex max-h-[calc(92svh-200px)] flex-col">
        <form id="signup-form" className="flex-1 overflow-y-auto pr-2" onSubmit={handleSubmit}>
          <div className="grid gap-4 pb-4">
            {/* Account Credentials Section */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Account Credentials</p>
              <label className="grid gap-1 text-sm font-semibold text-slate-700">
                Full name
                <input 
                  required 
                  name="displayName" 
                  value={form.displayName} 
                  onChange={updateField} 
                  className={inputClass} placeholder="Juan Dela Cruz" 
                  autoComplete="off"
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
                  className={inputClass} 
                  placeholder="you@sportshub.com" 
                  autoComplete="off"
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
                  className={inputClass} 
                  placeholder="Minimum 6 characters" 
                  autoComplete="off"
                />
              </label>
            </div>

            {/* Role Selection */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Select Your Role</p>
              <div className="grid grid-cols-3 gap-2">
                {roleOptions.map((role) => (
                  <label key={role.value} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 transition hover:border-cyan-400 hover:bg-cyan-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                    <input type="radio" name="role" value={role.value} checked={form.role === role.value} onChange={updateField} className="accent-blue-500" />
                    <span className="text-xs font-semibold text-slate-700">{role.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Personal Information</p>
              
              <div className="flex items-center gap-2">
                <label className="grid gap-1 text-sm font-semibold text-slate-700">
                  Age
                  <input 
                    name="age" 
                    type="number" 
                    min="1" 
                    value={form.age} 
                    onChange={updateField} 
                    placeholder="Input your age" 
                    className={inputClass} 
                    autoComplete="off"
                  />
                </label>
                <label className="grid gap-1 text-sm font-semibold text-slate-700">
                  Gender
                  <select name="gender" value={form.gender} onChange={updateField} className={inputClass}>
                    <option value="">Select</option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Prefer not to say</option>
                  </select>
                </label>
              </div>

              <label className="grid gap-1 text-sm font-semibold text-slate-700">
                Contact number
                <input
                  name="contactNumber"
                  value={form.contactNumber}
                  onChange={updateField}
                  className={inputClass}
                  placeholder="0912 345 6789"
                  maxLength={13}
                  autoComplete="off"
                />
              </label>
            </div>

            {/* Sports Section - Only for Players */}
            {signup.isPlayer ? (
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Sports Preference</p>
                
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

                <label className="grid gap-1 text-sm font-semibold text-slate-700">
                  Skill level
                  <select required name="skillLevel" value={form.skillLevel} onChange={updateField} className={inputClass}>
                    <option value="">Select</option>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                    <option>Competitive</option>
                  </select>
                </label>

                {signup.sportsError && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{signup.sportsError}</p>}
                {signup.teamsError && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{signup.teamsError}</p>}
              </div>
            ) : null}

            {/* Error Messages */}
            {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>}
          </div>
        </form>

        {/* Fixed Footer Section */}
        <div className="border-t border-slate-100 pt-4">
          <button
            type="submit"
            form="signup-form"
            disabled={loading || signup.sportsLoading}
            onClick={handleSubmit}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 font-bold text-white transition hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Please wait...' : 'Sign Up'}
          </button>

          <div className="mt-3 text-center text-sm">
            <button type="button" onClick={openSignIn} className="cursor-pointer hover:underline font-semibold text-slate-600 transition hover:text-slate-900">
              Already have an account? 
            </button>
          </div>
        </div>
      </div>
    </AuthDialog>
  )
}
