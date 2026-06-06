import { useState } from 'react'
import { useSportsSystem } from '../../hooks/useSportsSystem.jsx'

function inputClass() {
  return 'min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
}

export default function PlayerTeamsPage() {
  const system = useSportsSystem()
  const [messages, setMessages] = useState({})
  const activeTeams = system.teams.filter((team) => team.status === 'ACTIVE')

  return (
    <section className="grid gap-4">
      {system.error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{system.error}</p> : null}
      {system.loading ? <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">Loading latest records...</p> : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <div className="mb-5">
          <h2 className="text-xl font-black text-slate-950">Browse Teams</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Find teams and submit join requests for coach approval.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {activeTeams.map((team) => {
            const roster = system.members.filter((member) => member.teamId === team.id)

            return (
              <article key={team.id} className="rounded-2xl border border-slate-200 p-4">
                <h3 className="font-black text-slate-950">{team.name}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {team.sportName} | {team.eventName}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">Coach: {team.coachName}</p>
                <p className="mt-2 text-sm text-slate-500">
                  Roster: {roster.length}/{team.maxPlayers}
                </p>
                <textarea
                  className={`${inputClass()} mt-4 min-h-20 w-full py-3`}
                  placeholder="Optional message to coach"
                  value={messages[team.id] || ''}
                  onChange={(event) => setMessages({ ...messages, [team.id]: event.target.value })}
                />
                <button onClick={() => system.createJoinRequest(team, messages[team.id] || '')} className="mt-3 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-700">
                  Request to Join
                </button>
              </article>
            )
          })}
          {!activeTeams.length ? <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No teams are available yet.</p> : null}
        </div>
      </section>
    </section>
  )
}
