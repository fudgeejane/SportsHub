import { useState } from 'react'
import { Pencil, PlusCircle, Trash2, X } from 'lucide-react'
import { normalizeTeamStructure } from '../../constants/teamStructure'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useSportsSystem } from '../../hooks/useSportsSystem.jsx'

const emptyTeam = {
  name: '',
  sportId: '',
}

function inputClass() {
  return 'min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
}

export default function CoachTeamsPage() {
  const { currentUser, userProfile } = useAuth()
  const system = useSportsSystem()
  const [form, setForm] = useState(emptyTeam)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState(null)
  const visibleTeams = system.teams.filter((team) => team.coachId === currentUser.uid && team.status !== 'ARCHIVED')
  const coachMembers = system.members.filter((member) => member.coachId === currentUser.uid && member.status === 'ACTIVE')
  const selectedSport = system.sports.find((sport) => sport.id === form.sportId)
  const selectedStructure = normalizeTeamStructure(selectedSport?.teamStructure)

  const closeModal = () => {
    setModalOpen(false)
    setEditingTeam(null)
    setForm(emptyTeam)
  }

  const openCreateModal = () => {
    setEditingTeam(null)
    setForm(emptyTeam)
    setModalOpen(true)
  }

  const openEditModal = (team) => {
    setEditingTeam(team)
    setForm({
      name: team.name || '',
      sportId: team.sportId || '',
    })
    setModalOpen(true)
  }

  const submit = async (event) => {
    event.preventDefault()
    const payload = {
      ...form,
      sportName: selectedSport?.name || '',
      minPlayers: selectedStructure.minPlayersPerTeam,
      maxPlayers: selectedStructure.maxPlayersPerTeam,
      coachName: userProfile?.displayName,
    }

    if (editingTeam?.id) {
      await system.updateTeam(editingTeam.id, payload)
    } else {
      await system.createTeam(payload)
    }
    closeModal()
  }

  const archiveTeam = async (teamId) => {
    await system.updateTeam(teamId, { status: 'ARCHIVED' })
  }

  const reassignPlayer = async (member, teamId) => {
    const nextTeam = visibleTeams.find((team) => team.id === teamId)
    if (!nextTeam || nextTeam.id === member.teamId) return
    await system.updateTeamMemberAssignment(member, nextTeam)
  }

  return (
    <section className="grid gap-4">
      {system.error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{system.error}</p> : null}
      {system.loading ? <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">Loading latest records...</p> : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-950">My Teams</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Create your reusable teams here. Register them for events on the Event Registrations page.</p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white transition hover:bg-blue-700"
          >
            <PlusCircle className="h-4 w-4" />
            Create team
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {visibleTeams.map((team) => {
            const roster = system.members.filter((member) => member.teamId === team.id)

            return (
              <article key={team.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black text-slate-950">{team.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{team.sportName}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">Coach: {team.coachName}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">Status: {team.status || 'ACTIVE'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                      {roster.length}/{team.maxPlayers}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(team)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                        aria-label={`Edit ${team.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => archiveTeam(team.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                        aria-label={`Archive ${team.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid gap-2">
                  {roster.length ? (
                    roster.map((member) => (
                      <p key={member.id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold">
                        {member.playerName} <span className="text-slate-400">({member.playerEmail})</span>
                      </p>
                    ))
                  ) : (
                    <p className="text-sm font-semibold text-slate-500">No players yet.</p>
                  )}
                </div>
              </article>
            )
          })}
          {!visibleTeams.length ? <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No teams found.</p> : null}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <div className="mb-5">
          <h2 className="text-xl font-black text-slate-950">Players</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">View approved players and reassign them to another one of your teams.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3">Sport</th>
                <th className="px-4 py-3">Current Team</th>
                <th className="px-4 py-3">Reassign Team</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coachMembers.map((member) => {
                const compatibleTeams = visibleTeams.filter((team) => team.sportId === member.sportId)

                return (
                  <tr key={member.id}>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-950">{member.playerName}</p>
                      <p className="text-xs text-slate-500">{member.playerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{member.sportName}</td>
                    <td className="px-4 py-3 text-slate-700">{member.teamName}</td>
                    <td className="px-4 py-3">
                      <select
                        className={inputClass()}
                        value={member.teamId}
                        onChange={(event) => reassignPlayer(member, event.target.value)}
                      >
                        {compatibleTeams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                )
              })}
              {!coachMembers.length ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm font-semibold text-slate-500">
                    No approved players yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen ? (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/50 p-4">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-slate-950">{editingTeam ? 'Edit team' : 'Create team'}</h3>
                <p className="mt-1 text-sm text-slate-600">Player limits are taken from the selected sport structure.</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                aria-label="Close team modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={submit} className="mt-5 grid gap-3">
              <label className="grid gap-1 text-sm font-bold text-slate-700">
                Team name
                <input required className={inputClass()} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </label>

              <label className="grid gap-1 text-sm font-bold text-slate-700">
                Sport
                <select required className={inputClass()} value={form.sportId} onChange={(event) => setForm({ ...form, sportId: event.target.value })}>
                  <option value="">Select sport</option>
                  {system.sports.map((sport) => (
                    <option key={sport.id} value={sport.id}>
                      {sport.name}
                    </option>
                  ))}
                </select>
              </label>

              {form.sportId ? (
                <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
                  Team size: {selectedStructure.minPlayersPerTeam}-{selectedStructure.maxPlayersPerTeam} players
                </p>
              ) : null}

              <div className="flex gap-2 pt-3">
                <button type="button" onClick={closeModal} className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700">
                  {editingTeam ? 'Save changes' : 'Create team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  )
}
