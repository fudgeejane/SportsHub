import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import AuthDialog from './AuthDialog'

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
    <AuthDialog title="Forgot password" description="Enter your email address and SportsHub will send reset instructions." onClose={onClose}>
      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-lg border border-slate-200 px-4 py-2 outline-none transition focus:border-cyan-500"
            placeholder="you@sportshub.com"
          />
        </label>
        {message ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p> : null}
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send reset email'}
        </button>
      </form>

    
    </AuthDialog>
  )
}
