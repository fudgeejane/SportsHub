import { useMemo } from 'react'
import { Users } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useSportsSystem } from '../../hooks/useSportsSystem.jsx'

export default function PlayerTeamsPage() {
  const { currentUser } = useAuth()
  const system = useSportsSystem()

  const activeMemberships = useMemo(
    () => system.members.filter((member) => member.playerId === currentUser?.uid && member.status === 'ACTIVE'),
    [currentUser?.uid, system.members],
  )

  // Get the first active membership (assuming player is in one team)
  const currentMembership = activeMemberships[0]
  const currentTeam = useMemo(
    () => currentMembership ? system.teams.find(t => t.id === currentMembership.teamId) : null,
    [currentMembership, system.teams]
  )

  const teamMembers = useMemo(
    () => currentTeam 
      ? system.members.filter(m => m.teamId === currentTeam.id && m.status === 'ACTIVE')
      : [],
    [currentTeam, system.members]
  )

  return (
    <section className="grid gap-5">
      {system.error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{system.error}</p> : null}
      {system.loading ? <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">Loading teams...</p> : null}

      {activeMemberships.length > 0 ? (
        activeMemberships.map((membership) => {
          const team = system.teams.find(t => t.id === membership.teamId)
          const teamMembers = system.members.filter(m => m.teamId === membership.teamId && m.status === 'ACTIVE')
          const coachName = team?.coachName || membership.coachName || 'Not assigned'
          
          return (
            <section key={membership.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
              <div className="mb-5">
                <h2 className="text-2xl font-black text-slate-950">{membership.teamName}</h2>
                <p className="mt-1 text-sm font-semibold text-slate-700">{membership.sportName}</p>
                <p className="mt-1 text-sm text-slate-600">
                  <span className="font-bold">Coach:</span> {coachName}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-600">Team Players</h3>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                    {teamMembers.length}/{team?.maxPlayers || 'Open'}
                  </span>
                </div>

                {teamMembers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-slate-300 bg-slate-100 text-xs uppercase tracking-[0.12em] text-slate-600">
                        <tr>
                          <th className="px-4 py-3">Player</th>
                          <th className="px-4 py-3">Skill Level</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {teamMembers.map((member) => (
                          <tr key={member.id} className="transition hover:bg-slate-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-sm font-black text-white">
                                  {member.playerName?.charAt(0).toUpperCase() || 'P'}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-950">{member.playerName}</p>
                                  <p className="text-xs text-slate-500">{member.playerEmail}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                                {member.skillLevel?.replace(/_/g, ' ') || 'N/A'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                                {member.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-xl bg-white px-4 py-8 text-center">
                    <Users className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-2 text-sm font-semibold text-slate-500">No team members yet.</p>
                  </div>
                )}
              </div>
            </section>
          )
        })
      ) : (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
          <div className="text-center">
            <Users className="mx-auto h-16 w-16 text-slate-300" />
            <h2 className="mt-4 text-xl font-black text-slate-950">No Team Assigned</h2>
            <p className="mt-2 text-sm text-slate-600">You haven't been assigned to a team yet.</p>
          </div>
        </section>
      )}
    </section>
  )
}
