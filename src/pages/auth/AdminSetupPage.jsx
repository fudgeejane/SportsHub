import { useState } from 'react'
import AuthPageShell from '../../components/auth/AuthPageShell'
import { ROLES } from '../../contexts/AuthContext'
import { isFirebaseConfigComplete } from '../../firebase'
import { createAdminUser } from '../../hooks/useAuth'

const setupCode = import.meta.env.VITE_ADMIN_SETUP_CODE || 'SPORTSHUB_ADMIN_SETUP'

function getFriendlySetupError(error) {
  const code = error?.code || ''

  if (code.includes('api-key-not-valid')) {
    return 'Firebase API key is invalid. Check VITE_FIREBASE_API_KEY in .env and restart the dev server.'
  }

  if (code === 'auth/email-already-in-use') return 'This admin email already exists. Try signing in.'
  if (code === 'auth/weak-password') return 'Password should be at least 6 characters.'
  if (code === 'auth/invalid-email') return 'Enter a valid email address.'

  return error?.message || 'Unable to create admin account.'
}

export default function AdminSetupPage() {
  const [form, setForm] = useState({
    setupCode: '',
    displayName: '',
    email: '',
    password: '',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    if (form.setupCode !== setupCode) {
      setError('Invalid setup code.')
      return
    }

    if (!isFirebaseConfigComplete) {
      setError('Firebase config is incomplete. Check your VITE_FIREBASE_* values in .env.')
      return
    }

    setLoading(true)

    try {
      await createAdminUser({
        email: form.email,
        password: form.password,
        displayName: form.displayName,
        role: ROLES.COMMUNITY_ORGANIZER,
      })

      setMessage('Community Organizer admin account created and approved. Sign in to access the organizer dashboard.')
      setForm({ setupCode: '', displayName: '', email: '', password: '' })
    } catch (setupError) {
      setError(getFriendlySetupError(setupError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPageShell
      title="Create admin account"
      description="Private setup page for creating the Community Organizer account in Firebase Auth and Firestore."
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <input
          required
          name="setupCode"
          value={form.setupCode}
          onChange={updateField}
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
          placeholder="Setup code"
        />
        <input
          required
          name="displayName"
          value={form.displayName}
          onChange={updateField}
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
          placeholder="Admin full name"
        />
        <input
          required
          type="email"
          name="email"
          value={form.email}
          onChange={updateField}
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
          placeholder="admin@sportshub.com"
        />
        <input
          required
          minLength={6}
          type="password"
          name="password"
          value={form.password}
          onChange={updateField}
          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
          placeholder="Password"
        />

        {message ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p> : null}

        <button
          disabled={loading}
          className="rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creating admin...' : 'Create Community Organizer'}
        </button>
      </form>
    </AuthPageShell>
  )
}
