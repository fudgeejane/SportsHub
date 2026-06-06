import { X } from 'lucide-react'

export default function AuthDialog({ title, children, onClose, description }) {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/40 px-4 backdrop-blur-sm">
      <div className="max-h-[92svh] w-full max-w-md overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-600">SportsHub</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">{title}</h2>
            {description ? <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            aria-label="Close authentication modal"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
