import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS } from '../../hooks/usePayment'

export default function PaymentCard({ payment, onApprove, onReject, canReview }) {
  const pending = payment.paymentStatus === PAYMENT_STATUS.PENDING

  return (
    <article className="rounded-2xl border border-slate-200 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-black text-slate-950">{payment.teamName}</h3>
          <p className="mt-1 text-sm text-slate-600">
            {payment.eventName} | PHP {payment.amount || 0} | {PAYMENT_METHOD_LABELS[payment.paymentMethod] || '-'}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-500">Coach: {payment.coachName || payment.coachId || '-'}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">Proof: {payment.paymentProof || '-'}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">Status: {payment.paymentStatus}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {pending && canReview ? (
            <>
              <button onClick={() => onApprove(payment)} className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-black text-white">
                Approve
              </button>
              <button onClick={() => onReject(payment)} className="rounded-xl border border-red-200 px-3 py-2 text-sm font-black text-red-600">
                Reject
              </button>
            </>
          ) : null}
        </div>
      </div>
    </article>
  )
}
