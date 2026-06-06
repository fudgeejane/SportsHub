import { useState } from 'react'
import ScheduleBracket from '../../components/schedule/ScheduleBracket'
import { useBrackets } from '../../hooks/useBrackets'
import { useEvents } from '../../hooks/useEvents'

export default function OrganizerSchedulePage() {
  const [eventId, setEventId] = useState('')
  const { events } = useEvents()
  const brackets = useBrackets(eventId)

  return (
    <section className="grid gap-4">
      {brackets.loading ? <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">Loading...</p> : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <div className="mb-5">
          <h2 className="text-xl font-black text-slate-950">Event Brackets</h2>
          <p className="mt-1 text-sm text-slate-600">View skill-balanced brackets after payments are approved.</p>
        </div>

        <label className="mb-4 grid gap-1 text-sm font-bold text-slate-700">
          Event
          <select className="min-h-11 rounded-2xl border border-slate-200 px-4 text-sm font-semibold" value={eventId} onChange={(e) => setEventId(e.target.value)}>
            <option value="">Select event</option>
            {events.filter((e) => e.status !== 'ARCHIVED').map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </label>

        {eventId ? <ScheduleBracket bracket={brackets.bracket} eventDate={brackets.event?.startDate} /> : null}
      </section>
    </section>
  )
}
