import { useEffect, useState } from 'react'
import { emptyTeamStructure, normalizeTeamStructure } from '../../constants/teamStructure'

function inputClass() {
  return 'px-4 py-2 border rounded-lg border-slate-200 bg-gray-50 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
}

export default function SportFormModal({ sport, onClose, onSave, saving = false }) {
  const isEdit = Boolean(sport?.id)
  const [name, setName] = useState(sport?.name || '')
  const [sportType, setSportType] = useState(sport?.teamStructure ? 'TEAM' : 'SOLO')
  const [teamStructure, setTeamStructure] = useState(() => normalizeTeamStructure(sport?.teamStructure || emptyTeamStructure))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!sport) return
    queueMicrotask(() => {
      setName(sport.name || '')
      setSportType(sport?.teamStructure ? 'TEAM' : 'SOLO')
      setTeamStructure(normalizeTeamStructure(sport.teamStructure || emptyTeamStructure))
      setError('')
    })
  }, [sport])

  const submit = async (event) => {
    event.preventDefault()
    if (!name.trim()) {
      setError('Sport name is required.')
      return
    }
    if (sportType === 'TEAM') {
      const min = Number(teamStructure.minPlayersPerTeam || 0)
      const max = Number(teamStructure.maxPlayersPerTeam || 0)
      if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max < min) {
        setError('Enter a valid minimum and maximum players per team.')
        return
      }
    }
    setError('')
    await onSave({
      name: name.trim(),
      teamStructure: sportType === 'TEAM' ? normalizeTeamStructure(teamStructure) : null,
    })
  }

  return (
    <>
      <div className="modal-overlay">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-slate-950">{isEdit ? 'Edit sport' : 'Create sport'}</h2>
          <p className="mt-1 text-sm text-slate-600">{isEdit ? 'Update sport details.' : 'Create a sport and choose Solo or Team type.'}</p>

          <form className="mt-5 grid gap-3" onSubmit={submit}>
            <label className="grid gap-1 text-sm font-semibold text-slate-700">
              Sport Name
              <input 
                required 
                className={inputClass()} 
                value={name}
                onChange={(event) => setName(event.target.value)} 
                placeholder="e.g. Basketball, Chess, etc."  
              />
            </label>
            <div className="grid gap-2 text-sm font-semibold text-slate-700">
              <span>Sport type</span>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="inline-flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-blue-500">
                  <input
                    type="radio"
                    name="sportType"
                    value="SOLO"
                    checked={sportType === 'SOLO'}
                    onChange={() => setSportType('SOLO')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>Solo Sport</span>
                </label>
                <label className="inline-flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-blue-500">
                  <input
                    type="radio"
                    name="sportType"
                    value="TEAM"
                    checked={sportType === 'TEAM'}
                    onChange={() => setSportType('TEAM')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>Team Sport</span>
                </label>
              </div>
            </div>

            {sportType === 'TEAM' ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 grid gap-3">
                <p className="text-sm font-bold text-slate-800">Team structure</p>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-sm font-semibold text-slate-700">
                    Minimum players per team
                    <input
                      type="number"
                      min="1"
                      value={teamStructure.minPlayersPerTeam}
                      onChange={(e) => setTeamStructure({ ...teamStructure, minPlayersPerTeam: Number(e.target.value) })}
                      className={inputClass()}
                    />
                  </label>
                  <label className="text-sm font-semibold text-slate-700">
                    Maximum players per team
                    <input
                      type="number"
                      min="1"
                      value={teamStructure.maxPlayersPerTeam}
                      onChange={(e) => setTeamStructure({ ...teamStructure, maxPlayersPerTeam: Number(e.target.value) })}
                      className={inputClass()}
                    />
                  </label>
                </div>
              </div>
            ) : null}

            {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p> : null}

            <div className="flex gap-2 pt-6">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 rounded-lg border cursor-pointer border-slate-200 px-4 py-2 !text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={saving} 
                className="flex-1 rounded-lg  cursor-pointer bg-blue-600 px-4 py-2 !text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? 'Saving...' : isEdit ? 'Update sport' : 'Create sport'}
              </button>
            </div>
          </form>
        </div>
      </div>

    
    </>
  )
}
