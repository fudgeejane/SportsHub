import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthPageShell from '../../components/auth/AuthPageShell'
import { auth } from '../../firebase'
import { useAuth } from '../../hooks/useAuth'
import { PUBLIC_ROUTES } from '../../routes/public-routes'

export default function VerifyEmailPage() {
  const { currentUser, refreshUser, sendEmailVerification, signOut } = useAuth()
  const navigate = useNavigate()
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

  const handleVerified = async () => {
    setMessage('')
    setError('')

    try {
      await refreshUser()
      if (auth.currentUser?.emailVerified) {
        const email = auth.currentUser.email
        await signOut()
        navigate(PUBLIC_ROUTES.signIn, {
          replace: true,
          state: { emailVerified: true, email },
        })
        return
      }
      setError('Email is not verified yet. Check your inbox and try again.')
    } catch (verifyError) {
      setError(verifyError.message)
    }
  }

  return (
    <AuthPageShell title="Verify your email" description="Check your inbox and verify your SportsHub account before accessing your dashboard.">
      <div className="grid gap-4">
        <p className="rounded-lg border border-slate-200 px-4 py-2">{currentUser?.email || 'No email found.'}</p>
        {message ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p> : null}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button onClick={handleVerified} className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50">
            I verified my email
          </button>
          <button onClick={resend} className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700">
            Resend verification email
          </button>
        </div>
      </div>
    </AuthPageShell>
  )
}
