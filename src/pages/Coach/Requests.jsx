import { useRegistration } from '../../hooks/useRegistration'

const formatLabel = (value) =>
  value
    ? value
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : ''

export default function CoachRequestsPage() {
  const registration = useRegistration()
  const pendingApplications = registration.requests.filter((request) => request.status === 'PENDING')

  return (
    <section className="grid gap-4">
      {registration.error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{registration.error}</p> : null}
      {registration.loading ? <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">Loading applications...</p> : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <div className="mb-5">
          <h2 className="text-xl font-black text-slate-950">Player Applications</h2>
          <p className="mt-1 text-sm text-slate-600">Approve or reject players who applied to your teams.</p>
        </div>

        <div className="grid gap-3">
          {pendingApplications.map((application) => (
            <div key={application.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-slate-950">{application.playerName}</p>
                <p className="text-xs text-slate-600">{application.playerEmail}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-lg bg-blue-100 px-2 py-1 font-semibold text-blue-700">{application.sportName}</span>
                  <span className="rounded-lg bg-slate-100 px-2 py-1 font-semibold text-slate-700">{application.teamName}</span>
                  <span className="rounded-lg bg-purple-100 px-2 py-1 font-semibold text-purple-700">{formatLabel(application.skillLevel)}</span>
                </div>
                {application.message ? <p className="mt-2 text-sm text-slate-600">{application.message}</p> : null}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => registration.rejectJoinRequest(application)}
                  className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => registration.acceptJoinRequest(application)}
                  className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
          {!pendingApplications.length && !registration.loading ? (
            <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No pending player applications.</p>
          ) : null}
        </div>
      </section>
    </section>
  )
}
