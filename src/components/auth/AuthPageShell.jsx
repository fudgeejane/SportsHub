export default function AuthPageShell({
  eyebrow = 'SportsHub',
  title,
  description,
  children,
}) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-4 sm:p-6">
      <section className="auth-page-card w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-600">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950">{title}</h1>
          {description ? <p className="mt-3 leading-7 text-slate-600">{description}</p> : null}
        </div>
        <div className="mt-8">{children}</div>
      </section>
    </main>
  )
}
