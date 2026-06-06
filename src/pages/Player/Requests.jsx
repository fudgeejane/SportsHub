import { useMemo, useState } from 'react'
import { ArrowRightLeft, Users, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useSportsSystem } from '../../hooks/useSportsSystem.jsx'
import { formatTimestamp } from '../../utils/dateFormat'

export default function PlayerRequestsPage() {
  const { currentUser } = useAuth()
  const system = useSportsSystem()
  const [transferModalOpen, setTransferModalOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null)

  const activeMemberships = useMemo(
    () => system.members.filter((member) => member.playerId === currentUser?.uid && member.status === 'ACTIVE'),
    [currentUser?.uid, system.members],
  )

  const myRequests = useMemo(
    () => system.requests.filter((request) => request.playerId === currentUser?.uid),
    [currentUser?.uid, system.requests],
  )

  const openTransferModal = (membership) => {
    setSelectedTeam(membership)
    setTransferModalOpen(true)
  }

  const closeTransferModal = () => {
    setSelectedTeam(null)
    setTransferModalOpen(false)
  }

  const currentTeamPlayers = useMemo(() => {
    if (!selectedTeam) return []
    return system.members.filter((member) => member.teamId === selectedTeam.teamId && member.status === 'ACTIVE')
  }, [selectedTeam, system.members])

  return (
    <section className="grid gap-4">
      {system.error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{system.error}</p> : null}
      {system.loading ? <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">Loading latest records...</p> : null}

      {/* Current Team Section */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <div className="mb-5">
          <h2 className="text-xl font-black text-slate-950">My Current Team</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">View your team assignment and request transfers if needed.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {activeMemberships.map((membership) => (
            <article key={membership.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-black text-slate-950">{membership.teamName}</h3>
                  <p className="mt-1 text-sm text-slate-600">{membership.sportName}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">Coach: {membership.coachName || 'Assigned Coach'}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-600">
                      {system.members.filter((m) => m.teamId === membership.teamId && m.status === 'ACTIVE').length} players
                    </span>
                  </div>
                </div>
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700">
                  {membership.status}
                </span>
              </div>
              <button
                type="button"
                onClick={() => openTransferModal(membership)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-black text-blue-700 transition hover:bg-blue-100"
              >
                <Users className="h-4 w-4" />
                View Team Players
              </button>
            </article>
          ))}
          {!activeMemberships.length ? (
            <div className="col-span-full rounded-2xl bg-slate-50 px-4 py-8 text-center">
              <p className="text-sm font-semibold text-slate-500">No active team membership yet.</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* My Requests Section */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <div className="mb-5">
          <h2 className="text-xl font-black text-slate-950">My Transfer Requests</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Track your team join and transfer requests.</p>
        </div>

        <div className="grid gap-3">
          {myRequests.map((request) => {
            const statusColors = {
              PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
              APPROVED: 'bg-green-50 text-green-700 border-green-200',
              REJECTED: 'bg-red-50 text-red-700 border-red-200',
            }

            return (
              <article key={request.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-slate-950">{request.teamName}</h3>
                      {request.previousTeamName ? (
                        <>
                          <ArrowRightLeft className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-500">from {request.previousTeamName}</span>
                        </>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {request.sportName} {request.eventName ? `• ${request.eventName}` : ''}
                    </p>
                    {request.message ? (
                      <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        <span className="font-semibold">Message:</span> {request.message}
                      </p>
                    ) : null}
                    {request.createdAt ? (
                      <p className="mt-1 text-xs text-slate-500">
                        Requested {formatTimestamp(request.createdAt)}
                      </p>
                    ) : null}
                  </div>
                  <span className={`rounded-full border px-3 py-1.5 text-xs font-black ${statusColors[request.status] || statusColors.PENDING}`}>
                    {request.status}
                  </span>
                </div>
              </article>
            )
          })}
          {!myRequests.length ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center">
              <p className="text-sm font-semibold text-slate-500">No transfer requests found.</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* Transfer Modal - View Team Players */}
      {transferModalOpen && selectedTeam ? (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-slate-950">{selectedTeam.teamName} - Team Players</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {selectedTeam.sportName} • Coach: {selectedTeam.coachName || 'Assigned Coach'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeTransferModal}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5">
              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-900">
                  <Users className="mb-1 inline h-4 w-4" /> Total Players: {currentTeamPlayers.length}
                </p>
              </div>

              <div className="mt-4 max-h-96 overflow-y-auto">
                <div className="grid gap-3">
                  {currentTeamPlayers.map((player) => (
                    <article key={player.id} className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-black text-slate-950">{player.playerName}</p>
                          <p className="mt-0.5 text-sm text-slate-600">{player.playerEmail}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {player.skillLevel ? (
                            <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">
                              Skill: {player.skillLevel}
                            </span>
                          ) : null}
                          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                            {player.status}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                  {!currentTeamPlayers.length ? (
                    <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center">
                      <p className="text-sm font-semibold text-slate-500">No players in this team yet.</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={closeTransferModal}
                className="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
