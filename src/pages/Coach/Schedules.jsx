import { useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useSportManagement } from '../../hooks/useSportManagement'
import { formatDate, formatTime } from '../../utils/dateFormat'
import ScheduleBracket from '../../components/schedule/ScheduleBracket'

function teamAppearsInMatch(match, teamIds) {
  return teamIds.has(match.teamAId) || teamIds.has(match.teamBId) || teamIds.has(match.teamId)
}

export default function CoachSchedulesPage() {
  const { currentUser } = useAuth()
  const system = useSportManagement()
  const [selectedEventId, setSelectedEventId] = useState('')

  const coachTeams = useMemo(
    () => system.teams.filter((team) => team.coachId === currentUser?.uid && team.status !== 'ARCHIVED'),
    [currentUser?.uid, system.teams],
  )
  const coachTeamIds = useMemo(() => new Set(coachTeams.map((team) => team.id)), [coachTeams])

  const myEvents = useMemo(
    () => system.events.filter(event => 
      event.bracket && Object.keys(event.bracket).length > 0
    ),
    [system.events]
  )

  const selectedEvent = useMemo(
    () => myEvents.find(e => e.id === selectedEventId),
    [myEvents, selectedEventId]
  )

  const scheduledMatches = useMemo(
    () =>
      system.events
        .flatMap((event) =>
          (event.schedule || [])
            .filter((match) =>
              teamAppearsInMatch(match, coachTeamIds) &&
              match.matchDate &&
              match.startTime &&
              match.endTime &&
              match.venue,
            )
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
    [coachTeamIds, system.events],
  )

  return (
    <section className="grid gap-5">
      {system.error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{system.error}</p> : null}
      {system.loading ? <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">Loading schedules...</p> : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <h2 className="text-xl font-black text-slate-950">Schedules & Brackets</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">View matches, brackets, and tournament schedules for your teams.</p>

        {myEvents.length > 0 && (
          <div className="mt-5">
            <label className="grid gap-1 text-sm font-bold text-slate-700">
              Select Event
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="max-w-md rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">-- Select an event to view bracket --</option>
                {myEvents.map(event => (
                  <option key={event.id} value={event.id}>{event.name} - {event.sportName}</option>
                ))}
              </select>
            </label>
          </div>
        )}

        {selectedEvent && selectedEvent.bracket && (
          <div className="mt-5">
            <div className="mb-4 rounded-xl bg-blue-50 p-4">
              <h3 className="font-black text-blue-900">{selectedEvent.name}</h3>
              <p className="mt-1 text-sm text-blue-700">
                {formatDate(selectedEvent.startDate)} 
                {selectedEvent.endDate && selectedEvent.endDate !== selectedEvent.startDate ? ` to ${formatDate(selectedEvent.endDate)}` : ''}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {coachTeams
                  .filter(team => {
                    return team.sportId === selectedEvent.sportId
                  })
                  .map(team => (
                    <div key={team.id} className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                      <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                      Your Team: {team.name}
                    </div>
                  ))
                }
              </div>
            </div>
            <ScheduleBracket 
              bracket={selectedEvent.bracket} 
              event={selectedEvent}
              highlightTeamIds={coachTeamIds}
            />
          </div>
        )}

        <div className="mt-5 grid gap-3">
          <h3 className="text-lg font-black text-slate-950">All Matches</h3>
          {scheduledMatches.map((match) => (
            <article key={`${match.eventId}-${match.gameNumber || match.id || match.time}`} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-black text-slate-950">{match.eventName}</p>
                  <p className="mt-1 text-sm text-slate-600">{match.sportName} at {match.venue || 'No venue set'}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">{match.teamAName || match.teamName || 'Team'} vs {match.teamBName || 'TBD'}</p>
                </div>
                <div className="md:text-right">
                  <p className="text-sm font-black text-blue-700">{formatDate(match.eventDate) || 'No date set'}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">{formatTime(match.startTime) || 'Time TBD'}</p>
                  {match.round ? <p className="mt-1 text-xs font-black uppercase text-slate-500">Round {match.round}</p> : null}
                </div>
              </div>
            </article>
          ))}
          {!scheduledMatches.length ? <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No scheduled matches for your teams yet.</p> : null}
        </div>
      </section>
    </section>
  )
}
