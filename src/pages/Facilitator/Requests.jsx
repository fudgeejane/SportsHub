import PaymentCard from '../../components/registration/PaymentCard'
import { usePayment } from '../../hooks/usePayment'

export default function FacilitatorPaymentsPage() {
  const payment = usePayment()

  return (
    <section className="grid gap-4">
      {payment.error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{payment.error}</p> : null}
      {payment.loading ? <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">Loading...</p> : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <div className="mb-5">
          <h2 className="text-xl font-black text-slate-950">Payment Verification</h2>
          <p className="mt-1 text-sm text-slate-600">Approve payments before scheduling is unlocked.</p>
        </div>

        <div className="grid gap-3">
          {payment.payments.map((entry) => (
            <PaymentCard
              key={entry.id}
              payment={entry}
              canReview={payment.canVerifyPayment}
              onApprove={payment.approvePayment}
              onReject={payment.rejectPayment}
            />
          ))}
          {!payment.payments.length ? <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No payments yet.</p> : null}
        </div>
      </section>
    </section>
  )
}
