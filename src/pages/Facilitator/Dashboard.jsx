import { useMemo } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePayment } from '../../hooks/usePayment'
import { useSportManagement } from '../../hooks/useSportManagement'
import { formatDate } from '../../utils/dateFormat'

function isIncoming(value) {
  if (!value) return false
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date >= today
}

export default function FacilitatorDashboard() {
  const { currentUser } = useAuth()
  const system = useSportManagement()
  const paymentState = usePayment()

  const assignedEvents = useMemo(
    () => system.events.filter((event) => event.facilitatorId === currentUser?.uid),
    [currentUser?.uid, system.events],
  )

  const incomingEvents = useMemo(
    () =>
      assignedEvents
        .filter((event) => isIncoming(event.startDate))
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 6),
    [assignedEvents],
  )

  const pendingPayments = paymentState.payments.filter((payment) => payment.paymentStatus === 'pending').length
  const scheduledEvents = assignedEvents.filter((event) => (event.schedule || []).length).length

  return (
    <section className="grid gap-5">
    

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Assigned Events', assignedEvents.length],
          ['Incoming Events', incomingEvents.length],
          ['Pending Payments', pendingPayments],
          ['Scheduled Events', scheduledEvents],
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
                <p className="mt-1 text-sm font-bold text-blue-700">{formatDate(event.startDate) || 'No date set'}</p>
              </article>
            ))}
            {!incomingEvents.length ? <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No incoming assigned events.</p> : null}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
          <h3 className="text-xl font-black text-slate-950">Assigned Events</h3>
          <div className="mt-4 grid gap-3">
            {assignedEvents.slice(0, 8).map((event) => (
              <article key={event.id} className="rounded-2xl bg-slate-50 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-slate-950">{event.name}</p>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{event.status || 'OPEN'}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{event.sportName}</p>
                <p className="mt-1 text-sm font-bold text-slate-700">{(event.schedule || []).length} scheduled matches</p>
              </article>
            ))}
            {!assignedEvents.length ? <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No assigned events yet.</p> : null}
          </div>
        </div>
      </section>
    </section>
  )
}
