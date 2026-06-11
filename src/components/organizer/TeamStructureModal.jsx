import { useEffect, useState } from 'react'
import { isValidTeamStructure, normalizeTeamStructure } from '../../hooks/useSportManagement'

function inputClass() {
  return 'min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
}

export default function TeamStructureModal({ sport, onClose, onSave, saving = false }) {
  const [form, setForm] = useState(() => normalizeTeamStructure(sport?.teamStructure))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!sport) return
    queueMicrotask(() => {
      setForm(normalizeTeamStructure(sport.teamStructure))
      setError('')
    })
  }, [sport])

  const submit = async (event) => {
    event.preventDefault()
    if (!isValidTeamStructure(form)) {
      setError('Check team limits: min/max teams and players per team must be valid.')
      return
    }
    setError('')
    await onSave(normalizeTeamStructure(form))
  }

  if (!sport) return null

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Team structure</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">{sport.name}</h2>
          <p className="mt-1 text-sm text-slate-600">Saved on this sport document in Firestore.</p>
        </div>

        <form className="grid gap-3" onSubmit={submit}>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['minTeams', 'Min teams'],
              ['maxTeams', 'Max teams'],
              ['minPlayersPerTeam', 'Min players / team'],
              ['maxPlayersPerTeam', 'Max players / team'],
            ].map(([field, label]) => (
              <label key={field} className="grid gap-1 text-sm font-bold text-slate-700">
                {label}
                <input
                  type="number"
                  min="1"
                  required
                  className={inputClass()}
                  value={form[field]}
                  onChange={(event) => setForm({ ...form, [field]: event.target.value })}
                />
              </label>
            ))}
          </div>

          <label className="grid gap-1 text-sm font-bold text-slate-700">
            Rules / notes
            <textarea
              className={`${inputClass()} min-h-24 py-3`}
              value={form.rules}
              onChange={(event) => setForm({ ...form, rules: event.target.value })}
              placeholder="Roster rules, substitution policy, etc."
            />
          </label>

          {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p> : null}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save team structure'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
