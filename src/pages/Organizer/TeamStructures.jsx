import { useState } from 'react'
import { useSportsSystem } from '../../hooks/useSportsSystem.jsx'

const emptyStructure = {
  sportId: '',
  eventId: '',
  minTeams: 2,
  maxTeams: 4,
  minPlayersPerTeam: 5,
  maxPlayersPerTeam: 12,
  registrationType: 'PLAYER_REQUEST',
}

function inputClass() {
  return 'min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
}

function pickName(items, id) {
  return items.find((item) => item.id === id)?.name || ''
}

export default function OrganizerTeamStructuresPage() {
  const system = useSportsSystem()
  const [form, setForm] = useState(emptyStructure)

  const submit = async (event) => {
    event.preventDefault()
    await system.saveTeamStructure({
      ...form,
      sportName: pickName(system.sports, form.sportId),
      eventName: pickName(system.events, form.eventId),
    })
    setForm(emptyStructure)
  }

  return (
    <section className="grid gap-4">
      {system.error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{system.error}</p> : null}
      {system.loading ? <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">Loading latest records...</p> : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <div className="mb-5">
          <h2 className="text-xl font-black text-slate-950">Team Structure Setup</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Define max/min teams, roster size, and registration type for events.</p>
        </div>

        <form onSubmit={submit} className="grid gap-3 md:grid-cols-4 xl:grid-cols-8">
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
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            Event
            <select required className={inputClass()} value={form.eventId} onChange={(event) => setForm({ ...form, eventId: event.target.value })}>
              <option value="">Select event</option>
              {system.events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </label>
          {['minTeams', 'maxTeams', 'minPlayersPerTeam', 'maxPlayersPerTeam'].map((field) => (
            <label key={field} className="grid gap-1 text-sm font-bold text-slate-700">
              {field.replace(/([A-Z])/g, ' $1')}
              <input type="number" min="1" className={inputClass()} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} />
            </label>
          ))}
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            Registration
            <select className={inputClass()} value={form.registrationType} onChange={(event) => setForm({ ...form, registrationType: event.target.value })}>
              <option value="PLAYER_REQUEST">Player requests coach approval</option>
              <option value="ORGANIZER_ASSIGN">Organizer assigns teams</option>
              <option value="OPEN">Open registration</option>
            </select>
          </label>
          <button className="self-end rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700">Save</button>
        </form>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {system.structures.map((structure) => (
            <article key={structure.id} className="rounded-2xl border border-slate-200 p-4 text-sm">
              <h3 className="font-black text-slate-950">{structure.eventName}</h3>
              <p className="mt-1 text-slate-600">{structure.sportName}</p>
              <p className="mt-3 font-semibold text-slate-700">
                Teams: {structure.minTeams}-{structure.maxTeams} | Players: {structure.minPlayersPerTeam}-{structure.maxPlayersPerTeam}
              </p>
              <p className="mt-1 text-slate-500">{structure.registrationType}</p>
            </article>
          ))}
          {!system.structures.length ? (
            <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No team structures configured yet.</p>
          ) : null}
        </div>
      </section>
    </section>
  )
}
