import { useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useSportsSystem } from '../../hooks/useSportsSystem.jsx'

function inputClass() {
  return 'min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
}

export default function PlayerTeamsPage() {
  const { currentUser } = useAuth()
  const system = useSportsSystem()
  const [sportId, setSportId] = useState('')
  const [messages, setMessages] = useState({})

  const activeMemberships = useMemo(
    () => system.members.filter((member) => member.playerId === currentUser?.uid && member.status === 'ACTIVE'),
    [currentUser?.uid, system.members],
  )

  const currentTeamIds = useMemo(() => new Set(activeMemberships.map((member) => member.teamId)), [activeMemberships])
  const activeSports = useMemo(() => system.sports.filter((sport) => sport.status === 'ACTIVE'), [system.sports])

  const pendingRequests = useMemo(
    () => system.requests.filter((request) => request.playerId === currentUser?.uid && request.status === 'PENDING'),
    [currentUser?.uid, system.requests],
  )

  const eligibleTeams = useMemo(
    () =>
      system.teams.filter((team) => {
        if (team.status !== 'ACTIVE' || !team.coachId) return false
        if (sportId && team.sportId !== sportId) return false
        if (currentTeamIds.has(team.id)) return false

        const sport = activeSports.find((entry) => entry.id === team.sportId)
        if (!sport) return false

        const rosterCount = system.members.filter((member) => member.teamId === team.id && member.status === 'ACTIVE').length
        if (team.maxPlayers && rosterCount >= team.maxPlayers) return false

        return true
      }),
    [activeSports, currentTeamIds, sportId, system.members, system.teams],
  )

  const requestTeam = async (team) => {
    const currentMembership = activeMemberships.find((member) => member.sportId === team.sportId) || activeMemberships[0]
    await system.createJoinRequest(team, messages[team.id] || '', {
      previousMembershipId: currentMembership?.id || '',
      previousTeamId: currentMembership?.teamId || '',
      previousTeamName: currentMembership?.teamName || '',
    })
    setMessages((current) => ({ ...current, [team.id]: '' }))
  }

  return (
    <section className="grid gap-5">
      {system.error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{system.error}</p> : null}
      {system.loading ? <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">Loading teams...</p> : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <h2 className="text-xl font-black text-slate-950">Current Team</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {activeMemberships.map((membership) => (
            <article key={membership.id} className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="font-black text-slate-950">{membership.teamName}</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">{membership.sportName}</p>
              <p className="mt-1 text-sm text-slate-600">Coach: {membership.coachName || membership.coachId || 'Coach'}</p>
            </article>
          ))}
          {!activeMemberships.length ? <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No approved team membership yet.</p> : null}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <div className="mb-5">
          <h2 className="text-xl font-black text-slate-950">Available Teams</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Select a sport, then request to join or transfer to an eligible team.</p>
        </div>

        <label className="mb-5 grid max-w-md gap-1 text-sm font-bold text-slate-700">
          Sport
          <select className={inputClass()} value={sportId} onChange={(event) => setSportId(event.target.value)}>
            <option value="">All sports</option>
            {activeSports.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 lg:grid-cols-2">
          {eligibleTeams.map((team) => {
            const roster = system.members.filter((member) => member.teamId === team.id && member.status === 'ACTIVE')
            const hasPendingRequest = pendingRequests.some((request) => request.teamId === team.id)

            return (
              <article key={team.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black text-slate-950">{team.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{team.sportName}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">Coach: {team.coachName}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                    {roster.length}/{team.maxPlayers || 'Open'}
                  </span>
                </div>
                <textarea
                  className={`${inputClass()} mt-4 min-h-20 w-full py-3`}
                  placeholder="Optional message to coach"
                  value={messages[team.id] || ''}
                  onChange={(event) => setMessages({ ...messages, [team.id]: event.target.value })}
                />
                <button
                  type="button"
                  disabled={hasPendingRequest}
                  onClick={() => requestTeam(team)}
                  className="mt-3 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {hasPendingRequest ? 'Pending Request' : activeMemberships.length ? 'Request Transfer' : 'Request to Join'}
                </button>
              </article>
            )
          })}
          {!eligibleTeams.length ? <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No eligible teams found for the selected sport.</p> : null}
        </div>
      </section>
    </section>
  )
}
