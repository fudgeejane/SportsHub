import { useAuth } from '../../hooks/useAuth.jsx'
import AppLayout from '../layout/AppLayout'

export default function DashboardShell({ title, description, children }) {
  const { userProfile } = useAuth()

  return (
    <AppLayout title={title}>
      <section>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-600">{userProfile?.role}</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">{title}</h2>
          <p className="mt-2 text-slate-600">{description}</p>
        </div>
        <div className="mt-6">{children}</div>
      </section>
    </AppLayout>
  )
}
