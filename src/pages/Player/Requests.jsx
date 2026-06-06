import { useSportsSystem } from '../../hooks/useSportsSystem.jsx'

export default function PlayerRequestsPage() {
  const system = useSportsSystem()
  const requests = system.requests

  return (
    <section className="grid gap-4">
      {system.error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{system.error}</p> : null}
      {system.loading ? <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">Loading latest records...</p> : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <div className="mb-5">
          <h2 className="text-xl font-black text-slate-950">My Requests</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Track your team join requests and roster outcomes.</p>
        </div>

        <div className="grid gap-3">
          {requests.map((request) => (
            <article key={request.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-black text-slate-950">
                    {request.playerName} to {request.teamName}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {request.sportName} | {request.eventName}
                  </p>
                  {request.message ? <p className="mt-2 text-sm text-slate-500">{request.message}</p> : null}
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{request.status}</span>
              </div>
            </article>
          ))}
          {!requests.length ? <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No join requests found.</p> : null}
        </div>
      </section>
    </section>
  )
}
