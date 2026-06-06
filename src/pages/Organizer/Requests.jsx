import JoinRequestCard from '../../components/registration/JoinRequestCard'
import { useRegistration } from '../../hooks/useRegistration'

export default function OrganizerRequestsPage() {
  const reg = useRegistration()

  return (
    <section className="grid gap-4">
      {reg.loading ? <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">Loading...</p> : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <div className="mb-5">
          <h2 className="text-xl font-black text-slate-950">Signup Overview</h2>
          <p className="mt-1 text-sm text-slate-600">Coach-managed player signups (read-only).</p>
        </div>

        <div className="grid gap-3">
          {reg.requests.map((request) => (
            <JoinRequestCard
              key={request.id}
              request={request}
              skillLevel={reg.playerProfiles[request.playerId]?.skillLevel || request.skillLevel}
              readOnly
            />
          ))}
          {!reg.requests.length ? <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No signups found.</p> : null}
        </div>
      </section>
    </section>
  )
}
