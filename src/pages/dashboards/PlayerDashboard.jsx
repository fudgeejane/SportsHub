import DashboardShell from './DashboardShell'

export default function PlayerDashboard() {
  return (
    <DashboardShell title="Player Dashboard" description="View schedules, matched teams, and participation records.">
      <div className="grid gap-4 md:grid-cols-3">
        {['Upcoming games', 'Matched teams', 'Performance record'].map((item) => (
          <article key={item} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5">
            <h2 className="font-bold text-slate-950">{item}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Access fair matching, schedules, and personal sports activity history.</p>
          </article>
        ))}
      </div>
    </DashboardShell>
  )
}
