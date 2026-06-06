export default function PlaceholderRoutePage({ title }) {
  return (
    <main className="min-h-screen bg-[#f7f9fc] px-6 py-24 text-slate-700">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-900/10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">SportsHub</p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-950">{title}</h1>
        <p className="mt-4 text-slate-600">This route is reserved for the public or protected application screen.</p>
      </div>
    </main>
  )
}
