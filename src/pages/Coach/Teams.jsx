import { useState } from 'react'
import { ArrowLeft, Pencil, PlusCircle, Trash2, UserX, X } from 'lucide-react'
import { doc, deleteDoc } from 'firebase/firestore'
import { normalizeTeamStructure } from '../../constants/teamStructure'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useSportsSystem } from '../../hooks/useSportsSystem.jsx'
import { db } from '../../firebase'
import { useGlobalLoading } from '../../hooks/useGlobalLoading.jsx'

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
  const { startLoading } = useGlobalLoading()
  const [form, setForm] = useState(emptyTeam)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [reassignModalOpen, setReassignModalOpen] = useState(false)
  const [reassigningMember, setReassigningMember] = useState(null)
  const [deleteConfirmMember, setDeleteConfirmMember] = useState(null)
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

  const openReassignModal = (member) => {
    setReassigningMember(member)
    setReassignModalOpen(true)
  }

  const closeReassignModal = () => {
    setReassigningMember(null)
    setReassignModalOpen(false)
  }

  const reassignPlayer = async (teamId) => {
    if (!reassigningMember) return
    const nextTeam = visibleTeams.find((team) => team.id === teamId)
    if (!nextTeam || nextTeam.id === reassigningMember.teamId) return
    await system.updateTeamMemberAssignment(reassigningMember, nextTeam)
    closeReassignModal()
  }

  const openDeleteConfirm = (member) => {
    setDeleteConfirmMember(member)
  }

  const closeDeleteConfirm = () => {
    setDeleteConfirmMember(null)
  }

  const deletePlayer = async () => {
    if (!deleteConfirmMember) return
    const stop = startLoading('Removing player from team...')
    try {
      await deleteDoc(doc(db, 'teamMembers', deleteConfirmMember.id))
      closeDeleteConfirm()
      if (selectedTeam) {
        // Refresh roster view if on team detail page
        const updatedRoster = system.members.filter(
          (member) => member.teamId === selectedTeam.id && member.id !== deleteConfirmMember.id
        )
        if (updatedRoster.length === 0) {
          setSelectedTeam(null) // Go back to list if no players left
        }
      }
    } catch (error) {
      console.error('Error removing player:', error)
    } finally {
      stop()
    }
  }

  const viewTeamDetails = (team) => {
    setSelectedTeam(team)
  }

  const backToTeamsList = () => {
    setSelectedTeam(null)
  }

  // If a team is selected, show team detail view
  if (selectedTeam) {
    const roster = system.members.filter((member) => member.teamId === selectedTeam.id && member.status === 'ACTIVE')

    return (
      <section className="grid gap-4">

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={backToTeamsList}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                aria-label="Back to teams"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h2 className="text-xl font-black text-slate-950">{selectedTeam.name}</h2>
                <p className="mt-1 text-sm text-slate-600">{selectedTeam.sportName} • Coach: {selectedTeam.coachName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">
                {roster.length}/{selectedTeam.maxPlayers} Players
              </span>
             
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Player Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Skill Level</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roster.map((member) => (
                  <tr key={member.id}>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-950">{member.playerName}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{member.playerEmail}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">
                        {member.skillLevel || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                        {member.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openReassignModal(member)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Reassign
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteConfirm(member)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
                        >
                          <UserX className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!roster.length ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm font-semibold text-slate-500">
                      No players in this team yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        {/* Reassign Modal */}
        {reassignModalOpen && reassigningMember ? (
          <div className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/50 p-4">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black text-slate-950">Reassign Player</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Move {reassigningMember.playerName} to a different team
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeReassignModal}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5">
                <label className="grid gap-2 text-sm font-bold text-slate-700">
                  Select Team
                  <select
                    className={inputClass()}
                    defaultValue={reassigningMember.teamId}
                    onChange={(event) => {
                      if (event.target.value !== reassigningMember.teamId) {
                        reassignPlayer(event.target.value)
                      }
                    }}
                  >
                    {visibleTeams
                      .filter((team) => team.sportId === reassigningMember.sportId)
                      .map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name} {team.id === reassigningMember.teamId ? '(Current)' : ''}
                        </option>
                      ))}
                  </select>
                </label>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={closeReassignModal}
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Delete Confirmation Modal */}
        {deleteConfirmMember ? (
          <div className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/50 p-4">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black text-slate-950">Remove Player</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Are you sure you want to remove {deleteConfirmMember.playerName} from {selectedTeam.name}?
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeDeleteConfirm}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 rounded-2xl bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-900">
                  This action will permanently remove this player from the team. They will need to be re-approved and reassigned to join again.
                </p>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={closeDeleteConfirm}
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={deletePlayer}
                  className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700"
                >
                  Remove Player
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    )
  }

  // Default view: Show team cards
  return (
    <section className="grid gap-4">
 
      <section className="">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-950">My Teams</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Create and manage your teams. Click on a team to view and manage players.</p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg cursor-pointer bg-green-500 hover:bg-green-600 px-4 py-2 !text-sm font-black text-white transition hover:bg-blue-700"
          >
            <PlusCircle className="h-4 w-4" />
            Create team
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTeams.map((team) => {
            const roster = system.members.filter((member) => member.teamId === team.id && member.status === 'ACTIVE')

            return (
              <article
                key={team.id}
                className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-lg"
                onClick={() => viewTeamDetails(team)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-black text-slate-950 group-hover:text-blue-600">{team.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{team.sportName}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                    {roster.length}/{team.maxPlayers}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold">
                    {team.status || 'ACTIVE'}
                  </span>
                  <span>•</span>
                  <span>{roster.length} {roster.length === 1 ? 'player' : 'players'}</span>
                </div>

                <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditModal(team)
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                    aria-label={`Edit ${team.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      archiveTeam(team.id)
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                    aria-label={`Archive ${team.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            )
          })}
          {!visibleTeams.length ? (
            <div className="col-span-full rounded-2xl bg-slate-50 px-4 py-8 text-center">
              <p className="text-sm font-semibold text-slate-500">No teams found. Create your first team to get started.</p>
            </div>
          ) : null}
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
