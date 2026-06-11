import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthPageShell from '../../components/auth/AuthPageShell'
import { ROLES, STATUSES } from '../../contexts/AuthContext'
import { useAuth } from '../../hooks/useAuth'
import { useSportManagement } from '../../hooks/useSportManagement'
import { useAvailableTeams } from '../../hooks/useTeamManagement'
import { useRegistration } from '../../hooks/useRegistrationManagement'
import { getDashboardPath } from '../../routes/navConfig'
import { PUBLIC_ROUTES } from '../../routes/public-routes'
import { toastError } from '../../utils/toast'

function inputClass() {
  return 'min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
}

export default function ApprovalPendingPage() {
  const { refreshUser, signOut, userProfile } = useAuth()
  const navigate = useNavigate()
  const registration = useRegistration()
  const isPlayer = userProfile?.role === ROLES.PLAYER
  const isRejectedPlayer = isPlayer && userProfile?.status === STATUSES.REJECTED
  const [sportId, setSportId] = useState('')
  const [teamId, setTeamId] = useState('')
  const [message, setMessage] = useState('')
  const { sports, loading: sportsLoading, error: sportsError } = useSportManagement()
  const { teams, loading: teamsLoading, error: teamsError } = useAvailableTeams(sportId)

  const selectedTeam = useMemo(() => teams.find((team) => team.id === teamId) || null, [teamId, teams])
  const userFullName = userProfile?.displayName || 'SportsHub User'

  useEffect(() => {
    if (userProfile?.status === STATUSES.APPROVED) {
      navigate(getDashboardPath(userProfile.role), { replace: true })
      return
    }

    if (userProfile?.status === STATUSES.REJECTED && userProfile?.role !== ROLES.PLAYER) {
      navigate(PUBLIC_ROUTES.accessDenied, { replace: true })
    }
  }, [navigate, userProfile?.role, userProfile?.status])

  const handleSignOut = async () => {
    await signOut()
    navigate(PUBLIC_ROUTES.home, { replace: true })
  }

  const submitReapplication = async (event) => {
    event.preventDefault()
    if (!selectedTeam) {
      toastError('Select a team before submitting.')
      return
    }

    await registration.createJoinRequest(selectedTeam, message)
    setSportId('')
    setTeamId('')
    setMessage('')
    await refreshUser()
  }

  return (
    <AuthPageShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-950">
            {isRejectedPlayer ? 'Application rejected' : 'Approval pending'}
        </h1>
          <p className="mb-8">
            Hello {userFullName}, {" "}
            {isRejectedPlayer
              ? 'Your previous application was rejected. Choose a new sport and team, add a short note, and submit again for coach review. Please wait for coach approval, thank you.'
              : isPlayer
                ? 'Your team join request is currently under coach review. Please wait for approval from your coach, thank you.'
                : 'Your account is waiting for organizer approval. Please wait for approval from the organizer, thank you.'}
          </p>

        {isRejectedPlayer ? (
          <form onSubmit={submitReapplication} className="grid gap-5 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Sport
                <select
                  required
                  className={inputClass()}
                  value={sportId}
                  disabled={sportsLoading}
                  onChange={(event) => {
                    setSportId(event.target.value)
                    setTeamId('')
                  }}
                >
                  <option value="">{sportsLoading ? 'Loading sports...' : 'Select sport'}</option>
                  {sports.map((sport) => (
                    <option key={sport.id} value={sport.id}>
                      {sport.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Team
                <select
                  required
                  className={inputClass()}
                  value={teamId}
                  disabled={!sportId || teamsLoading}
                  onChange={(event) => setTeamId(event.target.value)}
                >
                  <option value="">
                    {!sportId ? 'Select sport first' : teamsLoading ? 'Loading teams...' : 'Select team'}
                  </option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} - {team.coachName || 'Coach'}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Message to coach
              <textarea
                className={`${inputClass()} min-h-24 py-3 resize-none`}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Optional note"
              />
            </label>

            {sportsError || teamsError || registration.error ? (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {sportsError || teamsError || registration.error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={registration.loading || !teamId}
              className="rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Submit new application
            </button>
          </form>
        ) : null}

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSignOut}
            className="w-full rounded-xl cursor-pointer border border-slate-200 bg-white px-4 py-2.5 font-bold text-slate-800 transition hover:bg-slate-50"
          >
            Sign out
          </button>
          <button
            onClick={refreshUser}
            className="w-full rounded-xl cursor-pointer bg-blue-600 px-4 py-2.5 font-bold text-white transition hover:bg-blue-700"
          >
            Check status
          </button>
          
        </div>
      </div>
    </AuthPageShell>
  )
}
