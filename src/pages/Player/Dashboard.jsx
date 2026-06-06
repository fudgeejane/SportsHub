import { useMemo } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useSportsSystem } from '../../hooks/useSportsSystem.jsx'

export default function PlayerDashboard() {
  const { currentUser } = useAuth()
  const system = useSportsSystem()
  const activeMemberships = useMemo(
    () => system.members.filter((member) => member.playerId === currentUser?.uid && member.status === 'ACTIVE'),
    [currentUser?.uid, system.members],
  )

  return (
    <section>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-600">PLAYER</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-950">Player Dashboard</h2>
        <p className="mt-2 text-slate-600">View schedules, matched teams, and participation records.</p>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5">
        <h2 className="font-bold text-slate-950">Joined Team</h2>
        {activeMemberships.length ? (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {activeMemberships.map((membership) => (
              <article key={membership.id} className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="font-black text-slate-950">{membership.teamName}</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{membership.sportName}</p>
                <p className="mt-1 text-sm text-slate-600">Coach: {membership.coachName || membership.coachId || 'Coach'}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm leading-6 text-slate-600">No approved team membership yet.</p>
        )}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {['Upcoming games', 'Matched teams', 'Performance record'].map((item) => (
          <article key={item} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5">
            <h2 className="font-bold text-slate-950">{item}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Access fair matching, schedules, and personal sports activity history.</p>
          </article>
        ))}
      </div>
    </section>
  )
}
