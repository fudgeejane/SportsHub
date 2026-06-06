import DashboardShell from '../../components/common/DashboardShell'

export default function CoachDashboard() {
  return (
    <DashboardShell title="Coach Dashboard" description="Monitor player performance and guide training effectively.">
      <div className="grid gap-4 md:grid-cols-3">
        {['Player progress', 'Training notes', 'Activity analytics'].map((item) => (
          <article key={item} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5">
            <h2 className="font-bold text-slate-950">{item}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">SportsHub tools for coaching decisions and performance review.</p>
          </article>
        ))}
      </div>
    </DashboardShell>
  )
}
