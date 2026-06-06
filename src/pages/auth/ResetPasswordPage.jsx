import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AuthPageShell from '../../components/auth/AuthPageShell'
import { useAuth } from '../../hooks/useAuth.jsx'

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    try {
      await resetPassword(password, searchParams.get('oobCode'))
      setMessage('Your password has been updated.')
    } catch (resetError) {
      setError(resetError.message)
    }
  }

  return (
    <AuthPageShell title="Reset password" description="Set a new password for your SportsHub account.">
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <input
          required
          minLength={6}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
          placeholder="New password"
        />
        {message ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p> : null}
        <button className="rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700">Reset password</button>
      </form>
    </AuthPageShell>
  )
}
