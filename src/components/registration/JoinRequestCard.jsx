import { JOIN_REQUEST_STATUS } from '../../utils/joinRequests'
import { SIGNUP_STATUS } from '../../constants/registration'

export default function JoinRequestCard({ request, skillLevel, onAccept, onReject, readOnly = false }) {
  const pending = request.status === JOIN_REQUEST_STATUS.PENDING

  return (
    <article className="rounded-2xl border border-slate-200 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-black text-slate-950">
            {request.playerName} → {request.teamName}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {request.sportName} | Skill: {skillLevel || '—'}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Signup: {request.signupStatus || SIGNUP_STATUS.PENDING}
          </p>
          {request.message ? <p className="mt-2 text-sm text-slate-500">{request.message}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{request.status}</span>
          {pending && !readOnly ? (
            <>
              <button onClick={() => onAccept(request)} className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-black text-white">
                Approve
              </button>
              <button onClick={() => onReject(request)} className="rounded-xl border border-red-200 px-3 py-2 text-sm font-black text-red-600">
                Reject
              </button>
            </>
          ) : null}
        </div>
      </div>
    </article>
  )
}
