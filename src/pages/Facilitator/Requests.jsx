import { Check, X, Eye, DollarSign } from 'lucide-react'
import { useState } from 'react'
import { usePayment } from '../../hooks/usePayment'
import { formatTimestamp } from '../../utils/dateFormat'

export default function FacilitatorPaymentsPage() {
  const payment = usePayment()
  const [viewingProof, setViewingProof] = useState(null)

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  return (
    <section className="grid gap-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <div className="mb-5">
          <h2 className="text-xl font-black text-slate-950">Payment Verification</h2>
          <p className="mt-1 text-sm text-slate-600">Approve or reject team payments before scheduling.</p>
        </div>

        {payment.payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payment.payments.map((entry) => (
                  <tr key={entry.id} className="transition hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-bold text-slate-950">{entry.teamName}</p>
                        <p className="text-xs text-slate-500">Coach: {entry.coachName || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-semibold text-slate-700">{entry.eventName}</p>
                        <p className="text-xs text-slate-500">{entry.sportName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        <DollarSign className="h-3 w-3" />
                        PHP {entry.amount || 0}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-slate-700">{entry.paymentMethod || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-slate-600">
                        {entry.createdAt ? formatTimestamp(entry.createdAt) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusColor(entry.paymentStatus || entry.status)}`}>
                        {entry.paymentStatus || entry.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setViewingProof(entry)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                          title="View payment proof"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                        {payment.canVerifyPayment && (entry.paymentStatus === 'PENDING' || entry.status === 'PENDING') && (
                          <>
                            <button
                              type="button"
                              onClick={() => payment.rejectPayment(entry)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
                            >
                              <X className="h-3.5 w-3.5" />
                              Reject
                            </button>
                            <button
                              type="button"
                              onClick={() => payment.approvePayment(entry)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-green-700"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Approve
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center">
            <DollarSign className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-500">No payment submissions yet.</p>
          </div>
        )}
      </section>

      {/* View Payment Proof Modal */}
      {viewingProof && (
        <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-slate-950">Payment Details</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {viewingProof.teamName} - {viewingProof.eventName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingProof(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-bold text-slate-500">AMOUNT</p>
                  <p className="mt-1 text-lg font-bold text-slate-950">PHP {viewingProof.amount || 0}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">METHOD</p>
                  <p className="mt-1 text-lg font-bold text-slate-950">{viewingProof.paymentMethod || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">SUBMITTED</p>
                  <p className="mt-1 text-sm text-slate-700">
                    {viewingProof.createdAt ? formatTimestamp(viewingProof.createdAt) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">STATUS</p>
                  <span className={`mt-1 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusColor(viewingProof.paymentStatus || viewingProof.status)}`}>
                    {viewingProof.paymentStatus || viewingProof.status || 'PENDING'}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500">PAYMENT PROOF / REFERENCE</p>
                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-700">{viewingProof.paymentProof || 'No proof provided'}</p>
                </div>
              </div>
            </div>

            {payment.canVerifyPayment && (viewingProof.paymentStatus === 'PENDING' || viewingProof.status === 'PENDING') && (
              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    payment.rejectPayment(viewingProof)
                    setViewingProof(null)
                  }}
                  className="flex-1 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100"
                >
                  Reject Payment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    payment.approvePayment(viewingProof)
                    setViewingProof(null)
                  }}
                  className="flex-1 rounded-2xl bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700"
                >
                  Approve Payment
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
