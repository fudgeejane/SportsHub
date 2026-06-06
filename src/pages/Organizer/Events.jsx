import { useState } from 'react'
import { useSportsSystem } from '../../hooks/useSportsSystem.jsx'

const emptyEvent = { name: '', sportId: '', venue: '', eventDate: '', status: 'OPEN' }

function inputClass() {
  return 'min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
}

function pickName(items, id) {
  return items.find((item) => item.id === id)?.name || ''
}

export default function OrganizerEventsPage() {
  const system = useSportsSystem()
  const [form, setForm] = useState(emptyEvent)

  const submit = async (event) => {
    event.preventDefault()
    await system.createEvent({ ...form, sportName: pickName(system.sports, form.sportId) })
    setForm(emptyEvent)
  }

  return (
    <section className="grid gap-4">
      {system.error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{system.error}</p> : null}
      {system.loading ? <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">Loading latest records...</p> : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <div className="mb-5">
          <h2 className="text-xl font-black text-slate-950">Event Management</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Create and manage sports events linked to active sports.</p>
        </div>

        <form onSubmit={submit} className="grid gap-3 md:grid-cols-5">
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            Event name
            <input required className={inputClass()} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            Sport
            <select required className={inputClass()} value={form.sportId} onChange={(event) => setForm({ ...form, sportId: event.target.value })}>
              <option value="">Select sport</option>
              {system.sports
                .filter((sport) => sport.status !== 'ARCHIVED')
                .map((sport) => (
                  <option key={sport.id} value={sport.id}>
                    {sport.name}
                  </option>
                ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            Venue
            <input className={inputClass()} value={form.venue} onChange={(event) => setForm({ ...form, venue: event.target.value })} />
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            Date
            <input type="date" className={inputClass()} value={form.eventDate} onChange={(event) => setForm({ ...form, eventDate: event.target.value })} />
          </label>
          <button className="self-end rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700">Create</button>
        </form>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Sport</th>
                <th className="px-4 py-3">Venue</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {system.events.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-bold text-slate-950">{item.name}</td>
                  <td className="px-4 py-3">{item.sportName}</td>
                  <td className="px-4 py-3">{item.venue || 'TBA'}</td>
                  <td className="px-4 py-3">{item.eventDate || 'TBA'}</td>
                  <td className="px-4 py-3">{item.status}</td>
                  <td className="px-4 py-3">
                    <select className={inputClass()} value={item.status} onChange={(event) => system.updateEvent(item.id, { status: event.target.value })}>
                      <option>OPEN</option>
                      <option>CLOSED</option>
                      <option>COMPLETED</option>
                      <option>ARCHIVED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!system.events.length ? <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No events yet.</p> : null}
        </div>
      </section>
    </section>
  )
}
