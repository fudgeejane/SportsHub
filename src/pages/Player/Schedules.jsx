import { useMemo } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useSportsSystem } from '../../hooks/useSportsSystem.jsx'

function formatDate(value) {
  if (!value) return 'No date set'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function matchHasTeam(match, teamIds) {
  return teamIds.has(match.teamAId) || teamIds.has(match.teamBId) || teamIds.has(match.teamId)
}

export default function PlayerSchedulesPage() {
  const { currentUser } = useAuth()
  const system = useSportsSystem()

  const activeMemberships = useMemo(
    () => system.members.filter((member) => member.playerId === currentUser?.uid && member.status === 'ACTIVE'),
    [currentUser?.uid, system.members],
  )
  const teamIds = useMemo(() => new Set(activeMemberships.map((member) => member.teamId)), [activeMemberships])

  const schedules = useMemo(
    () =>
      system.events
        .flatMap((event) =>
          (event.schedule || [])
            .filter((match) => matchHasTeam(match, teamIds))
            .map((match) => ({
              ...match,
              eventId: event.id,
              eventName: event.name,
              eventDate: event.startDate,
              sportName: event.sportName,
              venue: event.venue,
            })),
        )
        .sort((a, b) => {
          const dateSort = new Date(a.eventDate) - new Date(b.eventDate)
          if (dateSort !== 0) return dateSort
          return String(a.time || '').localeCompare(String(b.time || ''))
        }),
    [system.events, teamIds],
  )

  return (
    <section className="grid gap-5">
      {system.error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{system.error}</p> : null}
      {system.loading ? <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">Loading schedules...</p> : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <h2 className="text-xl font-black text-slate-950">Schedules</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">Matches, events, and time slots synced with your approved team assignments.</p>

        <div className="mt-5 grid gap-3">
          {schedules.map((slot) => (
            <article key={`${slot.eventId}-${slot.gameNumber || slot.id || slot.time}`} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-black text-slate-950">{slot.eventName}</p>
                  <p className="mt-1 text-sm text-slate-600">{slot.sportName} at {slot.venue || 'No venue set'}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">{slot.teamAName || slot.teamName || 'Team'} vs {slot.teamBName || 'TBD'}</p>
                </div>
                <div className="md:text-right">
                  <p className="text-sm font-black text-blue-700">{formatDate(slot.eventDate)}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">{slot.time || 'Time TBD'}</p>
                  {slot.round ? <p className="mt-1 text-xs font-black uppercase text-slate-500">Round {slot.round}</p> : null}
                </div>
              </div>
            </article>
          ))}
          {!schedules.length ? <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No schedules found for your current team yet.</p> : null}
        </div>
      </section>
    </section>
  )
}
