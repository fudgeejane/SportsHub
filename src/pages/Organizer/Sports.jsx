import { useState } from 'react'
import SportFormModal from '../../components/organizer/SportFormModal'
import { normalizeTeamStructure, isValidTeamStructure } from '../../constants/teamStructure'
import { useSportsSystem } from '../../hooks/useSportsSystem.jsx'
import { MoreVertical, PlusCircle, Volleyball, Users } from 'lucide-react'

export default function OrganizerSportsPage() {
  const system = useSportsSystem()
  const [sportModal, setSportModal] = useState(null)
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



  const runMenuAction = (action) => {
    setOpenMenuId(null)
    action()
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
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
          {system.loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <article key={`skeleton-${i}`} className="rounded-xl bg-white border border-slate-200 p-4">
                <div className="h-5 w-40 animate-pulse rounded bg-slate-100" />
                <div className="mt-3 h-3 w-32 animate-pulse rounded bg-slate-100" />
              </article>
            ))
          ) : system.sports.length ? (
            system.sports.map((sport) => {
              const structure = normalizeTeamStructure(sport.teamStructure || {})
              const isTeam = sport.teamStructure && isValidTeamStructure(sport.teamStructure)

              return (
                <article key={sport.id} className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold text-slate-950">{sport.name}</h3>
                      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Volleyball className="h-4 w-4" />
                          <span>{isTeam ? 'Team Sport' : 'Individual Sport'}</span>
                        </div>

                        {isTeam ? (
                          <>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>
                                {structure.minPlayersPerTeam}–{structure.maxPlayersPerTeam} Players / Team
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>Individual Competition</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setOpenMenuId((current) => (current === sport.id ? null : sport.id))}
                        className="inline-flex p-1 items-center justify-center rounded-lg cursor-pointer border border-slate-200 bg-white text-slate-600 transition hover:border-blue-300 hover:bg-slate-50"
                        aria-label={`Open actions for ${sport.name}`}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openMenuId === sport.id ? (
                        <div className="absolute right-0 top-8 z-20 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white  shadow-xl shadow-slate-900/10">
                          <button
                            type="button"
                            className="block w-full px-4 py-2 text-left text-sm cursor-pointer font-semibold text-slate-700 hover:bg-slate-50"
                            onClick={() => runMenuAction(() => setSportModal(sport))}
                          >
                            Edit sport
                          </button>
                          <button
                            type="button"
                            className="block w-full px-4 py-2 text-left text-sm cursor-pointer font-semibold text-slate-700 hover:bg-slate-50"
                            onClick={() => runMenuAction(() => system.deleteSport(sport.id))}
                          >
                            Delete sport
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
               
                </article>
              )
            })
          ) : (
            <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No sports yet. Create a sport.</p>
          )}
        </div>
      </section>

      {sportModal ? <SportFormModal sport={sportModal} saving={saving} onClose={() => setSportModal(null)} onSave={saveSport} /> : null}
  
    </section>
  )
}
