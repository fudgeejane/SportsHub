import { useSportsSystem } from '../../hooks/useSportsSystem.jsx'

export default function OrganizerTeamsPage() {
  const system = useSportsSystem()

  return (
    <section className="grid gap-4">
      {system.error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{system.error}</p> : null}
      {system.loading ? <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">Loading latest records...</p> : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <div className="mb-5">
          <h2 className="text-xl font-black text-slate-950">Teams, Rosters, and Coaches</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Monitor teams, rosters, coaches, and player registrations.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {system.teams.map((team) => {
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
                <p className="mt-4 text-sm font-semibold text-slate-600">
                  {roster.length ? `${roster.length} player${roster.length === 1 ? '' : 's'} registered` : 'No players yet.'}
                </p>
              </article>
            )
          })}
          {!system.teams.length ? <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No teams found.</p> : null}
        </div>
      </section>
    </section>
  )
}
