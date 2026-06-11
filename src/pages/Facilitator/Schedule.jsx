import { useMemo, useState } from 'react'
import { Calendar, Trophy, Users } from 'lucide-react'
import ScheduleBracket from '../../components/schedule/ScheduleBracket'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useBrackets } from '../../hooks/useBrackets'
import { useEvents } from '../../hooks/useEvents'
import { formatDate } from '../../utils/dateFormat'

export default function FacilitatorSchedulePage() {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const { currentUser } = useAuth()
  const { events } = useEvents()
  const brackets = useBrackets(selectedEvent?.id || '')
  const { eventTeams, schedulableTeams, canSchedule, schedule, bracket, loading } = brackets

  const myEvents = useMemo(
    () => events.filter((e) => e.status !== 'ARCHIVED' && e.facilitatorId === currentUser?.uid),
    [events, currentUser?.uid]
  )

  const handleEventClick = (event) => {
    setSelectedEvent(event)
  }

  return (
    <section>
      <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-950">Events</h2>
          <p className="mt-1 text-sm text-slate-600">Select an event to view and manage its bracket.</p>
        </div>
      {/* Events Section */}
      <section className="">
       

        {loading ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 mb-4">
            {[1, 2, 3].map((placeholder) => (
              <div key={placeholder} className="animate-pulse rounded-2xl border border-slate-200 bg-slate-100 p-6" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 mb-4">
            {myEvents.map((event) => {
              const isSelected = selectedEvent?.id === event.id

              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => handleEventClick(event)}
                  className={`rounded-2xl border cursor-pointer p-4 text-left transition ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-black text-slate-950">{event.name}</h3>
                      <p className="mt-1 text-sm text-slate-600">{event.sportName}</p>
                    </div>
                    <Trophy className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(event.startDate) || 'TBA'}</span>
                    </div>
                    {event.endDate && event.endDate !== event.startDate ? (
                      <>
                        <span>-</span>
                        <span>{formatDate(event.endDate)}</span>
                      </>
                    ) : null}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                      {event.status || 'ACTIVE'}
                    </span>
                  </div>
                </button>
              )
            })}
            {!myEvents.length ? (
              <div className="col-span-full rounded-2xl bg-slate-50 px-4 py-8 text-center">
                <p className="text-sm font-semibold text-slate-500">No events assigned to you.</p>
              </div>
            ) : null}
          </div>
        )}
      </section>

      {/* Bracket Section */}
      {selectedEvent ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-950">{selectedEvent.name} - Bracket</h2>
              <p className="mt-1 text-sm text-slate-600">
                {formatDate(selectedEvent.startDate)} {selectedEvent.endDate && selectedEvent.endDate !== selectedEvent.startDate ? `to ${formatDate(selectedEvent.endDate)}` : ''} • {selectedEvent.location || 'Location TBA'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                <Users className="mb-0.5 inline h-3.5 w-3.5" /> {eventTeams.length} teams
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                ✓ {schedulableTeams.length} payment-ready
              </span>
            </div>
          </div>

          {canSchedule && !schedule.length ? (
            <button
              type="button"
              onClick={() => brackets.generateBracket()}
              className="mb-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-blue-700"
            >
              <Trophy className="h-4 w-4" />
              Generate Balanced Bracket
            </button>
          ) : null}

          {!brackets.canSchedule && !brackets.schedule.length ? (
            <div className="rounded-2xl bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-900">
              ⚠️ All teams need approved payments before generating brackets. ({brackets.schedulableTeams.length}/{brackets.eventTeams.length} ready)
            </div>
          ) : null}

          <ScheduleBracket 
            bracket={bracket} 
            event={selectedEvent}
            onEditMatch={brackets.updateMatch}
            loading={loading}
          />
        </section>
      ) : null}
    </section>
  )
}
