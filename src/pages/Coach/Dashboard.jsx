export default function CoachDashboard() {
  return (
    <section>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-600">COACH</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-950">Coach Dashboard</h2>
        <p className="mt-2 text-slate-600">Monitor player performance and guide training effectively.</p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {['Player progress', 'Training notes', 'Activity analytics'].map((item) => (
          <article key={item} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5">
            <h2 className="font-bold text-slate-950">{item}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">SportsHub tools for coaching decisions and performance review.</p>
          </article>
        ))}
      </div>
    </section>
  )
}
