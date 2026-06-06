import { useState } from 'react'
import { ArrowLeft, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.jsx'

export default function ForgotPasswordModal({ onBack, onClose }) {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    setLoading(true)

    try {
      await forgotPassword(email)
      setMessage('Password reset instructions were sent to your email.')
    } catch (resetError) {
      setError(resetError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-h-[92svh] w-full max-w-md overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-600">SportsHub</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">Forgot password</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Enter your email address and SportsHub will send reset instructions.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
          aria-label="Close forgot password modal"
        >
          <X size={18} />
        </button>
      </div>

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-500"
            placeholder="you@sportshub.com"
          />
        </label>
        {message ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p> : null}
        <button
          type="submit"
          className="rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send reset email'}
        </button>
      </form>

      <button
        type="button"
        onClick={onBack}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-950"
      >
        <ArrowLeft size={16} />
        Back to sign in
      </button>
    </div>
  )
}
