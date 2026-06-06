import { useState } from 'react'
import { useSportsSystem } from '../../hooks/useSportsSystem.jsx'

const emptySport = { name: '', description: '' }

function inputClass() {
  return 'min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
}

export default function OrganizerSportsPage() {
  const system = useSportsSystem()
  const [form, setForm] = useState(emptySport)
  const [editingId, setEditingId] = useState('')

  const submit = async (event) => {
    event.preventDefault()

    if (editingId) {
      await system.updateSport(editingId, form)
    } else {
      await system.createSport(form)
    }

    setForm(emptySport)
    setEditingId('')
  }

  const editSport = (sport) => {
    setEditingId(sport.id)
    setForm({ name: sport.name, description: sport.description || '' })
  }

  return (
    <section className="grid gap-4">
      {system.error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{system.error}</p> : null}
      {system.loading ? <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">Loading latest records...</p> : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <div className="mb-5">
          <h2 className="text-xl font-black text-slate-950">Sports Management</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Create, edit, and archive sports used by SportsHub events and teams.</p>
        </div>

        <form onSubmit={submit} className="grid gap-3 md:grid-cols-[1fr_1.4fr_auto]">
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            Sport name
            <input required className={inputClass()} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            Description
            <input className={inputClass()} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </label>
          <button className="self-end rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700">
            {editingId ? 'Update' : 'Create'}
          </button>
        </form>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {system.sports.length ? (
            system.sports.map((sport) => (
              <article key={sport.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black text-slate-950">{sport.name}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{sport.description || 'No description added.'}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{sport.status}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold" onClick={() => editSport(sport)}>
                    Edit
                  </button>
                  <button className="rounded-xl border border-red-200 px-3 py-2 text-sm font-bold text-red-600" onClick={() => system.archiveSport(sport.id)}>
                    Archive
                  </button>
                </div>
              </article>
            ))
          ) : (
            <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No sports yet. Create the first sport to start building events.</p>
          )}
        </div>
      </section>
    </section>
  )
}
