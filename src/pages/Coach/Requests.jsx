import { Check, X } from 'lucide-react'
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

        {pendingApplications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Player</th>
                  <th className="px-4 py-3">Sport</th>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3">Skill Level</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingApplications.map((application) => (
                  <tr key={application.id} className="transition hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-sm font-black text-white">
                          {application.playerName?.charAt(0).toUpperCase() || 'P'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-950">{application.playerName}</p>
                          <p className="text-xs text-slate-500">{application.playerEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                        {application.sportName}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-slate-700">{application.teamName}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                        {formatLabel(application.skillLevel)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {application.message ? (
                        <p className="max-w-xs truncate text-slate-600" title={application.message}>
                          {application.message}
                        </p>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => registration.rejectJoinRequest(application)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
                        >
                          <X className="h-3.5 w-3.5" />
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => registration.acceptJoinRequest(application)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-green-700"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !registration.loading ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center">
            <p className="text-sm font-semibold text-slate-500">No pending player applications.</p>
          </div>
        ) : null}
      </section>
    </section>
  )
}
