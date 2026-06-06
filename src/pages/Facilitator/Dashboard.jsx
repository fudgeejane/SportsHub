import DashboardShell from '../../components/common/DashboardShell'

export default function FacilitatorDashboard() {
  return (
    <DashboardShell title="Facilitator Dashboard" description="Coordinate events and communicate with sports participants.">
      <div className="grid gap-4 md:grid-cols-3">
        {['Event coordination', 'Participant messages', 'Schedule updates'].map((item) => (
          <article key={item} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5">
            <h2 className="font-bold text-slate-950">{item}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Keep activities organized and participants informed.</p>
          </article>
        ))}
      </div>
    </DashboardShell>
  )
}
