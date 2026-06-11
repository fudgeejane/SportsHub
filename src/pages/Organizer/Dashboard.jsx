import { useMemo } from 'react'
import { ROLES } from '../../contexts/AuthContext'
import { useAuth, useUserManagement } from '../../hooks/useAuth'
import { usePayment } from '../../hooks/usePayment'
import { useSportManagement } from '../../hooks/useSportManagement'
import { MapPin, Calendar, CircleUser, Clock, Users } from 'lucide-react'

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
  const system = useSportManagement()
  const payments = usePayment()
  const { users, loading: usersLoading } = useUserManagement(currentUser?.uid)

  const recentPlayers = useMemo(
    () => users.filter((user) => user.role === ROLES.PLAYER).slice(0, 6),
    [users],
  )

  const facilitators = useMemo(
    () => users.filter((user) => user.role === ROLES.FACILITATOR && user.status === 'APPROVED'),
    [users],
  )

  

  // Aggregate scheduled matches from upcoming events
  const scheduledGames = useMemo(() => {
    // Consider an event upcoming if its endDate (or startDate) is >= today
    const upcomingEvents = system.events.filter((ev) => {
      const end = ev.endDate || ev.startDate
      if (!end) return false
      const endDate = new Date(end)
      endDate.setHours(0, 0, 0, 0)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return endDate >= today
    })

    const matches = []

    upcomingEvents.forEach((ev) => {
      const schedule = Array.isArray(ev.schedule) ? ev.schedule : []
      schedule.forEach((m) => {
        const matchDate = m.matchDate || ev.startDate || ''
        const matchTime = m.startTime || m.time || ''
        const iso = matchDate ? `${matchDate}T${matchTime || '00:00'}` : ev.startDate || ''

        matches.push({
          id: `${ev.id}-${m.gameNumber || Math.random().toString(36).slice(2, 8)}`,
          eventId: ev.id,
          eventName: ev.name,
          facilitatorName: ev.facilitatorName || ev.facilitator || 'Unassigned',
          venue: m.venue || ev.venue || '',
          gameNumber: m.gameNumber || m.id || '',
          title: m.title || `Game ${m.gameNumber || ''}`,
          teamA: m.teamAName || m.playerAName || m.participantA || m.teamAId || 'TBD',
          teamB: m.teamBName || m.playerBName || m.participantB || m.teamBId || 'TBD',
          datetime: iso,
          raw: m,
        })
      })
    })

    // Only matches within the next 7 days
    const within7 = matches.filter((mg) => {
      if (!mg.datetime) return false
      try {
        return isWithinNextSevenDays(mg.datetime)
      } catch {
        return false
      }
    })

    return within7.sort((a, b) => new Date(a.datetime || a.raw.matchDate || a.raw.startTime || 0) - new Date(b.datetime || b.raw.matchDate || b.raw.startTime || 0)).slice(0, 10)
  }, [system.events])

  // Local date/time formatting is handled inline where needed

  const pendingUsers = users.filter((user) => user.status === 'PENDING' && [ROLES.COACH, ROLES.FACILITATOR].includes(user.role)).length
  const approvedPayments = payments.payments.filter((payment) => payment.paymentStatus === 'approved').length

  return (
    <section>
    
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-4">
        {[
          ['Players', recentPlayers.length],
          ['Scheduled Games', scheduledGames.length],
          ['Pending Approvals', pendingUsers],
          ['Approved Payments', approvedPayments],
        ].map(([label, value]) => (
          <article key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5">
            <p className="text-sm font-bold text-slate-500">{label}</p>
            {!system.loading && !usersLoading ? (
              <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
            ) : (
              <div className="mt-2 h-8 w-24 animate-pulse rounded bg-slate-100" />
            )}
          </article>
        ))}
      </section>

      <section className="grid gap-4 items-start xl:grid-cols-3">

      {/* Incoming Scheduled Games */}
      <div className="col-span-2">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-bold text-slate-950">
              Incoming Scheduled Games
            </h3>

            <p className="mt-0.5 text-sm text-slate-500">
              Upcoming matches scheduled by facilitators across all active events.
            </p>
          </div>

     
        </div>

        <div className="mt-4">
          {system.loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <div className="h-6 w-48 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : scheduledGames.length ? (
            <div className="space-y-4">
              {scheduledGames.map((g) => (
                <article
                  key={g.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3">
                    <div className="flex items-center gap-3">
                    

                      <div>
                        <h4 className="font-bold text-slate-900">
                          {g.eventName}
                        </h4>
                       
                      </div>
                    </div>

                      <div className="rounded-lg bg-blue-100 px-3 py-1">
                        <span className="text-xs font-black uppercase tracking-wider text-blue-700">
                          Game {g.gameNumber || '-'}
                        </span>
                      </div>
                  </div>

                  <div className="flex flex-col gap-6 p-5 lg:flex-row lg:items-center lg:justify-between">
                    {/* Teams */}
                    <div className="flex flex-1 items-center justify-center gap-4">
                      <div className="flex flex-col items-center text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-50">
                          <Users className="h-6 w-6 text-cyan-600" />
                        </div>

                        <p className="mt-2 max-w-[140px] font-bold text-slate-900">
                          {g.teamA}
                        </p>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="rounded-full bg-slate-100 px-4 py-2">
                          <span className="text-sm font-black text-slate-600">
                            VS
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-50">
                          <Users className="h-6 w-6 text-cyan-600" />
                        </div>

                        <p className="mt-2 max-w-[140px] font-bold text-slate-900">
                          {g.teamB}
                        </p>
                      </div>
                    </div>

                    {/* Match Details */}
                    <div className="min-w-[280px] rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <CircleUser className="h-4 w-4 text-slate-500" />
                          <span className="font-semibold text-slate-900">
                            {g.facilitatorName}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-slate-500" />
                          <span className="font-semibold text-slate-900">
                            {g.venue || 'TBA'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-slate-500" />
                          <span className="font-semibold text-slate-900">
                            {new Date(g.datetime).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-slate-500" />
                          <span className="font-semibold text-slate-900">
                            {new Date(g.datetime).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No Incoming Scheduled Games</p>
          )}
        </div>
      </div>


        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
          <h3 className="text-xl font-bold text-slate-950">Facilitators List</h3>
          <div className="mt-4 grid gap-2">
            {facilitators.map((facilitator) => (
              <article key={facilitator.uid} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="font-semibold text-sm text-slate-950">{facilitator.displayName}</p>
                <p className="text-xs text-slate-600">{facilitator.email}</p>
              </article>
            ))}
            {!facilitators.length ? <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No approved facilitators yet.</p> : null}
          </div>
        </div>
      </section>

     
    </section>
  )
}
