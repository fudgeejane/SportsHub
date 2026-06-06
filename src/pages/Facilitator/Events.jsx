export default function FacilitatorEventsPage() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
      <div className="mb-5">
        <h2 className="text-xl font-black text-slate-950">Event Management</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">Facilitator pages are static monitoring screens for this version.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {['Schedule visibility', 'Participant coordination', 'Activity monitoring'].map((item) => (
          <article key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="font-black text-slate-950">{item}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">Read-only operational view for facilitator workflows.</p>
          </article>
        ))}
      </div>
    </section>
  )
}
