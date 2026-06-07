 import { useMemo } from 'react'
import { ROLES } from '../../contexts/AuthContext'
import { useAuth, useUserManagement } from '../../hooks/useAuth.jsx'
import { usePayment } from '../../hooks/usePayment'
import { useSportsSystem } from '../../hooks/useSportsSystem.jsx'
import { formatDate } from '../../utils/dateFormat'
import { Volleyball, MapPin, Calendar, CircleUser, Clock, User } from 'lucide-react'

function isWithinNextSevenDays(value) {
  if (!value) return false
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const limit = new Date(today)
  limit.setDate(today.getDate() + 7)
  return date >= today && date <= limit
}

export default function OrganizerDashboard() {
  const { currentUser } = useAuth()
  const system = useSportsSystem()
  const payments = usePayment()
  const { users, loading: usersLoading, error: usersError } = useUserManagement(currentUser?.uid)

  const recentPlayers = useMemo(
    () => users.filter((user) => user.role === ROLES.PLAYER).slice(0, 6),
    [users],
  )

  const facilitators = useMemo(
    () => users.filter((user) => user.role === ROLES.FACILITATOR && user.status === 'APPROVED'),
    [users],
  )

  const incomingEvents = useMemo(
    () =>
      system.events
        .filter((event) => isWithinNextSevenDays(event.startDate))
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 6),
    [system.events],
  )

  const formatDateTime = (value) => {
  if (!value) return 'No date set'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'No date set'

  const datePart = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const timePart = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return `${datePart} | ${timePart}`
}

  const pendingUsers = users.filter((user) => user.status === 'PENDING' && [ROLES.COACH, ROLES.FACILITATOR].includes(user.role)).length
  const approvedPayments = payments.payments.filter((payment) => payment.paymentStatus === 'approved').length

  return (
    <section>
    
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-4">
        {[
          ['Players', recentPlayers.length],
          ['Incoming Events', incomingEvents.length],
          ['Pending Approvals', pendingUsers],
          ['Approved Payments', approvedPayments],
        ].map(([label, value]) => (
          <article key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5">
            <p className="text-sm font-bold text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">

         <div className="col-span-2 ">
        <h3 className="text-lg font-semibold text-slate-950">Incoming Events</h3>
        <p className="text-sm text-slate-600">
          Incoming events in the next 7 days. Make sure facilitators are assigned and venues are set!
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {incomingEvents.map((event) => (
            <article key={event.id} className="rounded-xl bg-white border border-slate-200">

              <div className='p-4 border-b border-slate-200 bg-blue-100 rounded-t-xl'>
                <p className="font-semibold text-base text-slate-950 h-10">{event.name}</p>
              </div>

              <div className='flex flex-col gap-2 text-xs text-slate-600 p-4'>
                <div className='flex items-center gap-1'>
                  <MapPin size={16} />
                  <span>{event.venue || 'No venue set'}</span>
                </div>
                <div className='flex items-center gap-1'>
                  <User size={16} />
                  <span> {event.facilitatorName || 'Unassigned'}</span>
                </div>
                <div className='flex items-center gap-1'>
                  <Calendar size={16} />
                  <span>{formatDateTime(event.startDate)}</span>
                </div>
              </div>

            </article>
          ))}
          {!incomingEvents.length ? <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No events in the next 7 days.</p> : null}
        </div>
      </div>


        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
          <h3 className="text-xl font-black text-slate-950">Facilitators List</h3>
          <div className="mt-4 grid gap-3">
            {facilitators.map((facilitator) => (
              <article key={facilitator.uid} className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="font-bold text-slate-950">{facilitator.displayName}</p>
                <p className="text-sm text-slate-600">{facilitator.email}</p>
              </article>
            ))}
            {!facilitators.length ? <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No approved facilitators yet.</p> : null}
          </div>
        </div>
      </section>

     
    </section>
  )
}
