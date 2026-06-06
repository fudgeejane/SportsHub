import { useMemo, useState } from 'react'
import { useSportsSystem } from '../../hooks/useSportsSystem.jsx'
import { formatDate } from '../../utils/dateFormat'
import ScheduleBracket from '../../components/schedule/ScheduleBracket'

export default function OrganizerSchedulesPage() {
  const system = useSportsSystem()
  const [selectedEventId, setSelectedEventId] = useState('')

  const eventsWithBrackets = useMemo(
    () => system.events.filter(event => event.bracket && Object.keys(event.bracket).length > 0),
    [system.events]
  )

  const selectedEvent = useMemo(
    () => eventsWithBrackets.find(e => e.id === selectedEventId),
    [eventsWithBrackets, selectedEventId]
  )

  return (
    <section className="grid gap-5">
      {system.error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{system.error}</p> : null}
      {system.loading ? <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">Loading schedules...</p> : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <h2 className="text-xl font-black text-slate-950">Tournament Brackets</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">View tournament brackets and match schedules for all events.</p>

        {eventsWithBrackets.length > 0 ? (
          <>
            <div className="mt-5">
              <label className="grid gap-1 text-sm font-bold text-slate-700">
                Select Event
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="max-w-md rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">-- Select an event to view bracket --</option>
                  {eventsWithBrackets.map(event => (
                    <option key={event.id} value={event.id}>{event.name} - {event.sportName}</option>
                  ))}
                </select>
              </label>
            </div>

            {selectedEvent && (
              <div className="mt-5">
                <div className="mb-4 rounded-xl bg-blue-50 p-4">
                  <h3 className="font-black text-blue-900">{selectedEvent.name}</h3>
                  <p className="mt-1 text-sm text-blue-700">
                    {formatDate(selectedEvent.startDate)} 
                    {selectedEvent.endDate && selectedEvent.endDate !== selectedEvent.startDate ? ` to ${formatDate(selectedEvent.endDate)}` : ''}
                  </p>
                  <p className="mt-1 text-xs text-blue-600">
                    Facilitator: {selectedEvent.facilitatorName || 'Not assigned'}
                  </p>
                </div>
                <ScheduleBracket bracket={selectedEvent.bracket} event={selectedEvent} />
              </div>
            )}
          </>
        ) : (
          <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-8 text-center">
            <p className="text-sm font-semibold text-slate-500">No tournament brackets available yet.</p>
            <p className="mt-1 text-xs text-slate-400">Brackets will appear once events have been scheduled.</p>
          </div>
        )}
      </section>
    </section>
  )
}
