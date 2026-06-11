import navLogo from '../../assets/SportsHub.png'

export default function AuthPageShell({
  eyebrow = 'SportsHub',
  title,
  description,
  children,
}) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-6 sm:px-8">
      <section className="auth-page-card w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.18)] sm:p-8">
        <div className="mx-auto  flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-50 shadow-inner">
          <img src={navLogo} alt="SportsHub logo" className="h-10 w-10 object-contain" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-600">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950">{title}</h1>
          {description ? <p className="mx-auto mt-4 max-w-lg leading-7 text-slate-600">{description}</p> : null}
        </div>
        <div className="mt-10">{children}</div>
      </section>
    </main>
  )
}
