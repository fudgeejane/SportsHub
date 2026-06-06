import { useMemo } from 'react'
import { ROLES } from '../../contexts/AuthContext'
import { useAuth, useUserManagement } from '../../hooks/useAuth.jsx'
import { usePayment } from '../../hooks/usePayment'
import { useSportsSystem } from '../../hooks/useSportsSystem.jsx'

function formatDate(value) {
  if (!value) return 'No date set'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

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

  const pendingUsers = users.filter((user) => user.status === 'PENDING' && [ROLES.COACH, ROLES.FACILITATOR].includes(user.role)).length
  const approvedPayments = payments.payments.filter((payment) => payment.paymentStatus === 'approved').length

  return (
    <section className="grid gap-5">
      {usersError || system.error || payments.error ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{usersError || system.error || payments.error}</p>
      ) : null}
      {usersLoading || system.loading || payments.loading ? (
        <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">Loading organizer dashboard...</p>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-600">Organizer</p>
        <h2 className="mt-2 text-3xl font-black text-slate-950">Dashboard</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Overview of players, facilitators, events, and registrations.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Players', recentPlayers.length],
          ['Active Sports', system.sports.filter((sport) => sport.status !== 'ARCHIVED').length],
          ['Incoming Events', incomingEvents.length],
          ['Pending Approvals', pendingUsers],
          ['Approved Payments', approvedPayments],
        ].map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5">
            <p className="text-sm font-bold text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
          <h3 className="text-xl font-black text-slate-950">Recent Players</h3>
          <div className="mt-4 grid gap-3">
            {recentPlayers.map((player) => (
              <article key={player.uid} className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="font-bold text-slate-950">{player.displayName}</p>
                <p className="text-sm text-slate-600">{player.email}</p>
                <p className="mt-1 text-xs font-black uppercase text-slate-500">{player.status}</p>
              </article>
            ))}
            {!recentPlayers.length ? <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No players yet.</p> : null}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
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

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <h3 className="text-xl font-black text-slate-950">Incoming Events</h3>
        <p className="mt-1 text-sm text-slate-600">Events starting in the next 7 days.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {incomingEvents.map((event) => (
            <article key={event.id} className="rounded-2xl border border-slate-200 p-4">
              <p className="font-black text-slate-950">{event.name}</p>
              <p className="mt-1 text-sm text-slate-600">{event.sportName} at {event.venue || 'No venue set'}</p>
              <p className="mt-2 text-sm font-bold text-blue-700">{formatDate(event.startDate)}</p>
              <p className="mt-1 text-sm text-slate-600">Facilitator: {event.facilitatorName || 'Unassigned'}</p>
            </article>
          ))}
          {!incomingEvents.length ? <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No events in the next 7 days.</p> : null}
        </div>
      </section>
    </section>
  )
}
