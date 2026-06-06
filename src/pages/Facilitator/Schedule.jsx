import { useState } from 'react'
import ScheduleBracket from '../../components/schedule/ScheduleBracket'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useBrackets } from '../../hooks/useBrackets'
import { useEvents } from '../../hooks/useEvents'

export default function FacilitatorSchedulePage() {
  const [eventId, setEventId] = useState('')
  const { currentUser } = useAuth()
  const { events } = useEvents()
  const brackets = useBrackets(eventId)

  return (
    <section className="grid gap-4">
      {brackets.error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{brackets.error}</p> : null}
      {brackets.loading ? <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">Loading...</p> : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <div className="mb-5">
          <h2 className="text-xl font-black text-slate-950">Scheduling & Brackets</h2>
          <p className="mt-1 text-sm text-slate-600">Available only after all team payments are approved.</p>
        </div>

        <label className="mb-4 grid gap-1 text-sm font-bold text-slate-700">
          Event
          <select className="min-h-11 rounded-2xl border border-slate-200 px-4 text-sm font-semibold" value={eventId} onChange={(e) => setEventId(e.target.value)}>
            <option value="">Select event</option>
            {events.filter((e) => e.status !== 'ARCHIVED' && e.facilitatorId === currentUser?.uid).map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </label>

        {eventId ? (
          <>
            <div className="mb-4 flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full bg-slate-100 px-3 py-1">{brackets.eventTeams.length} teams</span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{brackets.schedulableTeams.length} payment-ready</span>
            </div>
            <button
              type="button"
              disabled={!brackets.canSchedule}
              onClick={() => brackets.generateBracket()}
              className="mb-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white disabled:opacity-50"
            >
              Generate Balanced Bracket
            </button>
            <ScheduleBracket bracket={brackets.bracket} eventDate={brackets.event?.startDate} onEditMatch={brackets.updateMatch} />
          </>
        ) : null}
      </section>
    </section>
  )
}
