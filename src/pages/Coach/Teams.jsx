import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useSportsSystem } from '../../hooks/useSportsSystem.jsx'

const emptyTeam = { name: '', sportId: '', eventId: '', minPlayers: 5, maxPlayers: 12, registrationType: 'PLAYER_REQUEST' }

function inputClass() {
  return 'min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
}

function pickName(items, id) {
  return items.find((item) => item.id === id)?.name || ''
}

export default function CoachTeamsPage() {
  const { currentUser, userProfile } = useAuth()
  const system = useSportsSystem()
  const [form, setForm] = useState(emptyTeam)
  const visibleTeams = system.teams.filter((team) => team.coachId === currentUser.uid)

  const submit = async (event) => {
    event.preventDefault()
    await system.createTeam({
      ...form,
      sportName: pickName(system.sports, form.sportId),
      eventName: pickName(system.events, form.eventId),
      coachName: userProfile?.displayName,
    })
    setForm(emptyTeam)
  }

  return (
    <section className="grid gap-4">
      {system.error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{system.error}</p> : null}
      {system.loading ? <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">Loading latest records...</p> : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <div className="mb-5">
          <h2 className="text-xl font-black text-slate-950">My Teams</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Create and manage your own teams.</p>
        </div>

        <form onSubmit={submit} className="mb-5 grid gap-3 md:grid-cols-6">
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            Team name
            <input required className={inputClass()} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            Sport
            <select required className={inputClass()} value={form.sportId} onChange={(event) => setForm({ ...form, sportId: event.target.value })}>
              <option value="">Select</option>
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
              <option value="">Select</option>
              {system.events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            Min players
            <input type="number" className={inputClass()} value={form.minPlayers} onChange={(event) => setForm({ ...form, minPlayers: event.target.value })} />
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            Max players
            <input type="number" className={inputClass()} value={form.maxPlayers} onChange={(event) => setForm({ ...form, maxPlayers: event.target.value })} />
          </label>
          <button className="self-end rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700">Create</button>
        </form>

        <div className="grid gap-4 lg:grid-cols-2">
          {visibleTeams.map((team) => {
            const roster = system.members.filter((member) => member.teamId === team.id)

            return (
              <article key={team.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black text-slate-950">{team.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {team.sportName} | {team.eventName}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">Coach: {team.coachName}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                    {roster.length}/{team.maxPlayers}
                  </span>
                </div>
                <div className="mt-4 grid gap-2">
                  {roster.length ? (
                    roster.map((member) => (
                      <p key={member.id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold">
                        {member.playerName} <span className="text-slate-400">({member.playerEmail})</span>
                      </p>
                    ))
                  ) : (
                    <p className="text-sm font-semibold text-slate-500">No players yet.</p>
                  )}
                </div>
              </article>
            )
          })}
          {!visibleTeams.length ? <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No teams found.</p> : null}
        </div>
      </section>
    </section>
  )
}
