import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthPageShell from '../../components/auth/AuthPageShell'
import { useAuth } from '../../hooks/useAuth'

export default function VerifyEmailPage() {
  const { currentUser, refreshUser, sendEmailVerification } = useAuth()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const resend = async () => {
    setMessage('')
    setError('')
    try {
      await sendEmailVerification()
      setMessage('Verification email sent.')
    } catch (verifyError) {
      setError(verifyError.message)
    }
  }

  return (
    <AuthPageShell title="Verify your email" description="Check your inbox and verify your SportsHub account before accessing your dashboard.">
      <div className="grid gap-4">
        <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">{currentUser?.email || 'No email found.'}</p>
        {message ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p> : null}
        <button onClick={resend} className="rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700">
          Resend verification email
        </button>
        <button onClick={refreshUser} className="rounded-2xl border border-slate-200 px-4 py-3 font-bold text-slate-800 transition hover:bg-slate-50">
          I verified my email
        </button>
        <Link to="/dashboard" className="text-center font-bold text-blue-600 hover:text-blue-700">
          Continue to dashboard
        </Link>
      </div>
    </AuthPageShell>
  )
}
