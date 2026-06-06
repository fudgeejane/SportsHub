export default function FacilitatorDashboard() {
  return (
    <section>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-600">FACILITATOR</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-950">Facilitator Dashboard</h2>
        <p className="mt-2 text-slate-600">Coordinate events and communicate with sports participants.</p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {['Event coordination', 'Participant messages', 'Schedule updates'].map((item) => (
          <article key={item} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5">
            <h2 className="font-bold text-slate-950">{item}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Keep activities organized and participants informed.</p>
          </article>
        ))}
      </div>
    </section>
  )
}
