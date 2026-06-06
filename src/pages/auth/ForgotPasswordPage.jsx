import { useState } from 'react'
import AuthPageShell from '../../components/auth/AuthPageShell'
import { useAuth } from '../../hooks/useAuth'

export default function ForgotPasswordPage() {
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
    <AuthPageShell title="Forgot password" description="Enter your email address and SportsHub will send reset instructions.">
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
          placeholder="you@sportshub.com"
        />
        {message ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p> : null}
        <button className="rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700" disabled={loading}>
          {loading ? 'Sending...' : 'Send reset email'}
        </button>
      </form>
    </AuthPageShell>
  )
}
