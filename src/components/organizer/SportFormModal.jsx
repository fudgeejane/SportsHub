import { useEffect, useState } from 'react'
import { emptyTeamStructure, isValidTeamStructure, normalizeTeamStructure } from '../../constants/teamStructure'
import TeamStructureModal from './TeamStructureModal'

function inputClass() {
  return 'min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
}

export default function SportFormModal({ sport, onClose, onSave, saving = false }) {
  const isEdit = Boolean(sport?.id)
  const [name, setName] = useState(sport?.name || '')
  const [description, setDescription] = useState(sport?.description || '')
  const [teamStructure, setTeamStructure] = useState(() => normalizeTeamStructure(sport?.teamStructure))
  const [structureOpen, setStructureOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Update state when sport prop changes
    if (sport) {
      setName(sport.name || '')
      setDescription(sport.description || '')
      setTeamStructure(normalizeTeamStructure(sport.teamStructure))
      setError('')
    }
  }, [sport])

  const submit = async (event) => {
    event.preventDefault()
    if (!name.trim()) {
      setError('Sport name is required.')
      return
    }
    if (!isEdit && !isValidTeamStructure(teamStructure)) {
      setError('Configure a valid team structure before creating this sport.')
      return
    }
    setError('')
    await onSave({
      name: name.trim(),
      description: description.trim(),
      teamStructure: normalizeTeamStructure(teamStructure),
    })
  }

  return (
    <>
      <div className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/50 p-4">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
          <h2 className="text-xl font-black text-slate-950">{isEdit ? 'Edit sport' : 'Create sport'}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {isEdit ? 'Update sport details. Team structure is edited separately.' : 'Team structure is required and stored on the sport document.'}
          </p>

          <form className="mt-5 grid gap-3" onSubmit={submit}>
            <label className="grid gap-1 text-sm font-bold text-slate-700">
              Sport name
              <input required className={inputClass()} value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="grid gap-1 text-sm font-bold text-slate-700">
              Description
              <input className={inputClass()} value={description} onChange={(event) => setDescription(event.target.value)} />
            </label>

            {!isEdit ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-800">Team structure (required)</p>
                <p className="mt-1 text-xs text-slate-500">
                  Teams {teamStructure.minTeams}-{teamStructure.maxTeams} | Players {teamStructure.minPlayersPerTeam}-{teamStructure.maxPlayersPerTeam}
                </p>
                <button
                  type="button"
                  onClick={() => setStructureOpen(true)}
                  className="mt-3 rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50"
                >
                  Configure team structure
                </button>
              </div>
            ) : null}

            {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p> : null}

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">
                {saving ? 'Saving...' : isEdit ? 'Update sport' : 'Create sport'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {structureOpen ? (
        <TeamStructureModal
          sport={{ name: name || 'New sport', teamStructure }}
          onClose={() => setStructureOpen(false)}
          onSave={async (nextStructure) => {
            setTeamStructure(nextStructure)
            setStructureOpen(false)
          }}
        />
      ) : null}
    </>
  )
}
