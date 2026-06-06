export default function AuthPageShell({ eyebrow = 'SportsHub', title, description, children }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-600">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">{title}</h1>
        {description ? <p className="mt-3 leading-7 text-slate-600">{description}</p> : null}
        <div className="mt-6">{children}</div>
      </section>
    </main>
  )
}
