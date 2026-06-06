import { useMemo } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useSportsSystem } from '../../hooks/useSportsSystem.jsx'
import { formatDate } from '../../utils/dateFormat'

function isIncoming(value) {
  if (!value) return false
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date >= today
}

function matchHasTeam(match, teamIds) {
  return teamIds.has(match.teamAId) || teamIds.has(match.teamBId) || teamIds.has(match.teamId)
}

export default function PlayerDashboard() {
  const { currentUser, userProfile } = useAuth()
  const system = useSportsSystem()

  const activeMemberships = useMemo(
    () => system.members.filter((member) => member.playerId === currentUser?.uid && member.status === 'ACTIVE'),
    [currentUser?.uid, system.members],
  )
  const teamIds = useMemo(() => new Set(activeMemberships.map((member) => member.teamId)), [activeMemberships])
  const sportIds = useMemo(() => new Set(activeMemberships.map((member) => member.sportId)), [activeMemberships])

  const incomingEvents = useMemo(
    () =>
      system.events
        .filter((event) => isIncoming(event.startDate) && sportIds.has(event.sportId))
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 6),
    [sportIds, system.events],
  )

  const playerSchedule = useMemo(
    () =>
      system.events.flatMap((event) =>
        (event.schedule || [])
          .filter((match) => matchHasTeam(match, teamIds))
          .map((match) => ({
            ...match,
            eventName: event.name,
            eventDate: event.startDate,
            venue: event.venue,
          })),
      ),
    [system.events, teamIds],
  )

  return (
    <section className="grid gap-5">
      {system.error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{system.error}</p> : null}
      {system.loading ? <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">Loading player dashboard...</p> : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-600">Player</p>
        <h2 className="mt-2 text-3xl font-black text-slate-950">Dashboard</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Welcome, {userProfile?.displayName || currentUser?.email}. View team status, incoming events, and schedules.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Current Teams', activeMemberships.length],
          ['Incoming Events', incomingEvents.length],
          ['Scheduled Matches', playerSchedule.length],
          ['Sports Joined', sportIds.size],
        ].map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5">
            <p className="text-sm font-bold text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
          <h3 className="text-xl font-black text-slate-950">Current Team</h3>
          <div className="mt-4 grid gap-3">
            {activeMemberships.map((membership) => {
              const team = system.teams.find(t => t.id === membership.teamId)
              const coachName = team?.coachName || membership.coachName || 'Not assigned'
              
              return (
                <article key={membership.id} className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="font-black text-slate-950">{membership.teamName}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">{membership.sportName}</p>
                  <p className="mt-1 text-sm text-slate-600">Coach: {coachName}</p>
                </article>
              )
            })}
            {!activeMemberships.length ? <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No approved team membership yet.</p> : null}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
          <h3 className="text-xl font-black text-slate-950">Incoming Events</h3>
          <div className="mt-4 grid gap-3">
            {incomingEvents.map((event) => (
              <article key={event.id} className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="font-bold text-slate-950">{event.name}</p>
                <p className="text-sm text-slate-600">{event.sportName} at {event.venue || 'No venue set'}</p>
                <p className="mt-1 text-sm font-bold text-blue-700">{formatDate(event.startDate) || 'No date set'}</p>
              </article>
            ))}
            {!incomingEvents.length ? <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No incoming events for your current team sports.</p> : null}
          </div>
        </div>
      </section>
    </section>
  )
}
