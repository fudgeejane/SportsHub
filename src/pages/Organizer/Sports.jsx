import { useState } from 'react'
import SportFormModal from '../../components/organizer/SportFormModal'
import TeamStructureModal from '../../components/organizer/TeamStructureModal'
import { isValidTeamStructure } from '../../constants/teamStructure'
import { useSportsSystem } from '../../hooks/useSportsSystem.jsx'
import { MoreVertical, PlusCircle } from 'lucide-react'

export default function OrganizerSportsPage() {
  const system = useSportsSystem()
  const [sportModal, setSportModal] = useState(null)
  const [structureSport, setStructureSport] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [saving, setSaving] = useState(false)

  const saveSport = async (payload) => {
    setSaving(true)
    try {
      if (sportModal?.id) {
        await system.updateSport(sportModal.id, payload)
      } else {
        await system.createSport(payload)
      }
      setSportModal(null)
    } finally {
      setSaving(false)
    }
  }

  const saveTeamStructure = async (teamStructure) => {
    if (!structureSport?.id) return
    setSaving(true)
    try {
      await system.updateSportTeamStructure(structureSport.id, teamStructure)
      setStructureSport(null)
    } finally {
      setSaving(false)
    }
  }

  const runMenuAction = (action) => {
    setOpenMenuId(null)
    action()
  }

  return (
    <section className="grid gap-4">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Sports Management</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Create sports and configure team structure on each sport document.</p>
          </div>
          <button
            type="button"
            onClick={() => setSportModal({})}
            className="rounded-lg inline-flex items-center gap-2 bg-green-500 cursor-pointer hover:bg-green-600 px-4 py-2 !text-sm font-black text-white hover:bg-blue-700"
          >
            <PlusCircle className='h-4 w-4' />
            Add sport
          </button>
        </div>

      <section className="">
        
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {system.sports.length ? (
            system.sports.map((sport) => {
              const structure = sport.teamStructure
              const configured = isValidTeamStructure(structure)

              return (
                <article key={sport.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black text-slate-950">{sport.name}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{sport.description || 'No description added.'}</p>
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setOpenMenuId((current) => (current === sport.id ? null : sport.id))}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                        aria-label={`Open actions for ${sport.name}`}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openMenuId === sport.id ? (
                        <div className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl shadow-slate-900/10">
                          <button
                            type="button"
                            className="block w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            onClick={() => runMenuAction(() => setSportModal(sport))}
                          >
                            Edit sport
                          </button>
                          <button
                            type="button"
                            className="block w-full px-4 py-2 text-left text-sm font-semibold text-blue-700 hover:bg-blue-50"
                            onClick={() => runMenuAction(() => setStructureSport(sport))}
                          >
                            Team structure
                          </button>
                          <button
                            type="button"
                            className="block w-full px-4 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                            onClick={() => runMenuAction(() => system.archiveSport(sport.id))}
                          >
                            Archive
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <p className="mt-3 text-xs font-semibold text-slate-500">
                    {configured
                      ? `Structure: ${structure.minTeams}-${structure.maxTeams} teams, ${structure.minPlayersPerTeam}-${structure.maxPlayersPerTeam} players`
                      : 'Team structure not configured'}
                  </p>

                </article>
              )
            })
          ) : (
            <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No sports yet. Create a sport with a required team structure.</p>
          )}
        </div>
      </section>

      {sportModal ? <SportFormModal sport={sportModal} saving={saving} onClose={() => setSportModal(null)} onSave={saveSport} /> : null}
      {structureSport ? (
        <TeamStructureModal sport={structureSport} saving={saving} onClose={() => setStructureSport(null)} onSave={saveTeamStructure} />
      ) : null}
    </section>
  )
}
