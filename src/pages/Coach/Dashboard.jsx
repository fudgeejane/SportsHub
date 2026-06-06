import { useMemo } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { usePayment } from '../../hooks/usePayment'
import { useRegistration } from '../../hooks/useRegistration'
import { useSportsSystem } from '../../hooks/useSportsSystem.jsx'

function formatDate(value) {
  if (!value) return 'No date set'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function eventIsIncoming(value) {
  if (!value) return false
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date >= today
}

function teamAppearsInMatch(match, teamIds) {
  return teamIds.has(match.teamAId) || teamIds.has(match.teamBId) || teamIds.has(match.teamId)
}

export default function CoachDashboard() {
  const { currentUser } = useAuth()
  const system = useSportsSystem()
  const registration = useRegistration()
  const payments = usePayment()

  const coachTeams = useMemo(
    () => system.teams.filter((team) => team.coachId === currentUser?.uid && team.status !== 'ARCHIVED'),
    [currentUser?.uid, system.teams],
  )
  const coachTeamIds = useMemo(() => new Set(coachTeams.map((team) => team.id)), [coachTeams])

  const approvedPlayers = useMemo(
    () => system.members.filter((member) => member.coachId === currentUser?.uid && member.status === 'ACTIVE'),
    [currentUser?.uid, system.members],
  )

  const pendingPlayers = useMemo(
    () => registration.requests.filter((request) => request.status === 'PENDING'),
    [registration.requests],
  )

  const registeredEventIds = useMemo(
    () => new Set(payments.payments.filter((payment) => coachTeamIds.has(payment.teamId) && payment.status !== 'CANCELLED').map((payment) => payment.eventId)),
    [coachTeamIds, payments.payments],
  )

  const incomingEvents = useMemo(
    () =>
      system.events
        .filter((event) => eventIsIncoming(event.startDate) && (registeredEventIds.has(event.id) || coachTeams.some((team) => team.sportId === event.sportId)))
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 6),
    [coachTeams, registeredEventIds, system.events],
  )

  const scheduledMatches = useMemo(
    () =>
      system.events
        .flatMap((event) =>
          (event.schedule || [])
            .filter((match) => teamAppearsInMatch(match, coachTeamIds))
            .map((match) => ({
              ...match,
              eventId: event.id,
              eventName: event.name,
              eventDate: event.startDate,
              venue: event.venue,
            })),
        )
        .slice(0, 8),
    [coachTeamIds, system.events],
  )

  return (
    <section className="grid gap-5">
      {system.error || registration.error || payments.error ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{system.error || registration.error || payments.error}</p>
      ) : null}
      {system.loading || registration.loading || payments.loading ? (
        <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">Loading coach dashboard...</p>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-600">Coach</p>
        <h2 className="mt-2 text-3xl font-black text-slate-950">Dashboard</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Track team activity, approvals, incoming events, and schedules.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Teams', coachTeams.length],
          ['Approved Players', approvedPlayers.length],
          ['Pending Players', pendingPlayers.length],
          ['Incoming Events', incomingEvents.length],
        ].map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5">
            <p className="text-sm font-bold text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
          <h3 className="text-xl font-black text-slate-950">Incoming Events</h3>
          <div className="mt-4 grid gap-3">
            {incomingEvents.map((event) => (
              <article key={event.id} className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="font-bold text-slate-950">{event.name}</p>
                <p className="text-sm text-slate-600">{event.sportName} at {event.venue || 'No venue set'}</p>
                <p className="mt-1 text-sm font-bold text-blue-700">{formatDate(event.startDate)}</p>
              </article>
            ))}
            {!incomingEvents.length ? <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No incoming events found.</p> : null}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
          <h3 className="text-xl font-black text-slate-950">Pending Players</h3>
          <div className="mt-4 grid gap-3">
            {pendingPlayers.map((request) => (
              <article key={request.id} className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="font-bold text-slate-950">{request.playerName}</p>
                <p className="text-sm text-slate-600">{request.teamName} | {request.sportName}</p>
                <p className="mt-1 text-xs font-black uppercase text-slate-500">{request.requestType || 'JOIN'}</p>
              </article>
            ))}
            {!pendingPlayers.length ? <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No pending player approvals.</p> : null}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <h3 className="text-xl font-black text-slate-950">Schedule</h3>
        <p className="mt-1 text-sm text-slate-600">Matches and event slots connected to your teams.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {scheduledMatches.map((match) => (
            <article key={`${match.eventId}-${match.gameNumber || match.id || match.teamAName}`} className="rounded-2xl border border-slate-200 p-4">
              <p className="font-black text-slate-950">{match.eventName}</p>
              <p className="mt-1 text-sm text-slate-600">{match.teamAName || match.teamName || 'Team'} vs {match.teamBName || 'TBD'}</p>
              <p className="mt-2 text-sm font-bold text-blue-700">{formatDate(match.eventDate)} {match.time ? `| ${match.time}` : ''}</p>
              <p className="mt-1 text-sm text-slate-600">{match.venue || 'No venue set'}</p>
            </article>
          ))}
          {!scheduledMatches.length ? <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No scheduled matches yet.</p> : null}
        </div>
      </section>
    </section>
  )
}
