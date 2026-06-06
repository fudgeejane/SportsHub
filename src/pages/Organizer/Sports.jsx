import { useState } from 'react'
import SportFormModal from '../../components/organizer/SportFormModal'
import TeamStructureModal from '../../components/organizer/TeamStructureModal'
import { isValidTeamStructure } from '../../constants/teamStructure'
import { useSportsSystem } from '../../hooks/useSportsSystem.jsx'

export default function OrganizerSportsPage() {
  const system = useSportsSystem()
  const [sportModal, setSportModal] = useState(null)
  const [structureSport, setStructureSport] = useState(null)
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

  return (
    <section className="grid gap-4">
      {system.error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{system.error}</p> : null}
      {system.loading ? <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">Loading sports...</p> : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-950">Sports Management</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Create sports and configure team structure on each sport document.</p>
          </div>
          <button
            type="button"
            onClick={() => setSportModal({})}
            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700"
          >
            Add sport
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{sport.status}</span>
                  </div>

                  <p className="mt-3 text-xs font-semibold text-slate-500">
                    {configured
                      ? `Structure: ${structure.minTeams}-${structure.maxTeams} teams, ${structure.minPlayersPerTeam}-${structure.maxPlayersPerTeam} players`
                      : 'Team structure not configured'}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold" onClick={() => setSportModal(sport)}>
                      Edit sport
                    </button>
                    <button type="button" className="rounded-xl border border-blue-200 px-3 py-2 text-sm font-bold text-blue-700" onClick={() => setStructureSport(sport)}>
                      Team structure
                    </button>
                    <button type="button" className="rounded-xl border border-red-200 px-3 py-2 text-sm font-bold text-red-600" onClick={() => system.archiveSport(sport.id)}>
                      Archive
                    </button>
                  </div>
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
