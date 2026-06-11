import { useState } from 'react'
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '../../hooks/usePayment'
import { useAuth } from '../../hooks/useAuth'
import { usePayment } from '../../hooks/usePayment'
import { useTeams } from '../../hooks/useTeamManagement'
import { toastError } from '../../utils/toast'

function inputClass() {
  return 'min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800'
}

const formatLabel = (value) =>
  value
    ? value
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : ''

export default function PlayerPaymentPage() {
  const { userProfile } = useAuth()
  const payment = usePayment()
  const { teams } = useTeams()
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.GCASH)

  const assignedTeam = teams.find((t) => t.id === userProfile?.assignedTeamId)

  const submit = async (event) => {
    event.preventDefault()
    if (!assignedTeam) {
      toastError('No team assigned.')
      return
    }
    try {
      await payment.submitPayment({ team: assignedTeam, paymentMethod })
    } catch {
      // toast handled in hook
    }
  }

  const currentPayment = payment.payments.find(
    (p) => p.playerId === userProfile?.uid && p.teamId === userProfile?.assignedTeamId,
  )

  const canSubmit = userProfile?.membershipStatus === 'TEAM_ASSIGNED' || userProfile?.membershipStatus === 'PENDING_PAYMENT'

  return (
    <section className="grid gap-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <div className="mb-5">
          <h2 className="text-xl font-black text-slate-950">Payment Submission</h2>
          <p className="mt-1 text-sm text-slate-600">Submit payment proof for your assigned team.</p>
        </div>

        {!assignedTeam ? (
          <div className="rounded-2xl bg-yellow-50 px-4 py-3">
            <p className="text-sm font-semibold text-yellow-800">Awaiting team assignment from your coach.</p>
          </div>
        ) : (
          <>
            <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-600">Assigned Team</p>
              <p className="mt-1 text-lg font-bold text-slate-950">{assignedTeam.name}</p>
              <p className="mt-1 text-sm text-slate-600">Fee: ₱{assignedTeam.fee || 0}</p>
            </div>

            {currentPayment && (
              <div className={`mb-5 rounded-2xl px-4 py-3 ${currentPayment.paymentStatus === 'APPROVED' ? 'bg-green-50' : currentPayment.paymentStatus === 'REJECTED' ? 'bg-red-50' : 'bg-blue-50'}`}>
                <p className={`text-sm font-bold ${currentPayment.paymentStatus === 'APPROVED' ? 'text-green-800' : currentPayment.paymentStatus === 'REJECTED' ? 'text-red-800' : 'text-blue-800'}`}>
                  Payment Status: {formatLabel(currentPayment.paymentStatus)}
                </p>
              </div>
            )}

            {canSubmit && (!currentPayment || currentPayment.paymentStatus === 'REJECTED') ? (
              <form onSubmit={submit} className="grid max-w-lg gap-3">
                <label className="grid gap-1 text-sm font-bold text-slate-700">
                  Payment method
                  <select required className={inputClass()} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <button type="submit" className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-700">
                  Submit Payment
                </button>
              </form>
            ) : null}
          </>
        )}
      </section>
    </section>
  )
}
