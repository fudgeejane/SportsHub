import { useEffect, useMemo, useState } from 'react'
import { applyActionCode, checkActionCode, confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth'
import { CheckCircle2, CircleAlert, Loader2, LockKeyhole, MailCheck } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AuthPageShell from '../../components/auth/AuthPageShell'
import { auth } from '../../firebase'
import { PUBLIC_ROUTES } from '../../routes/public-routes'
import { toastError } from '../../utils/toast'

function StatusPanel({ status, title, message }) {
  const Icon = status === 'success' ? CheckCircle2 : status === 'error' ? CircleAlert : Loader2

  return (
    <div
      className={`rounded-2xl border p-4 ${
        status === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : status === 'error'
            ? 'border-red-200 bg-red-50 text-red-700'
            : 'border-blue-200 bg-blue-50 text-blue-800'
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${status === 'loading' ? 'animate-spin' : ''}`} />
        <div>
          <p className="font-bold">{title}</p>
          <p className="mt-1 text-sm leading-6">{message}</p>
        </div>
      </div>
    </div>
  )
}

export default function AuthActionPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const mode = searchParams.get('mode')
  const oobCode = searchParams.get('oobCode')
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('Checking your secure SportsHub link...')
  const [accountEmail, setAccountEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const actionTitle = useMemo(() => {
    if (mode === 'resetPassword') return 'Reset password'
    if (mode === 'verifyEmail') return 'Email verification'
    return 'Account action'
  }, [mode])

  useEffect(() => {
    if (!mode || !oobCode) {
      window.queueMicrotask(() => {
        setStatus('error')
        setMessage('This action link is incomplete. Please request a new email from SportsHub.')
        toastError('Invalid action link.')
      })
      return
    }

    let active = true

    async function handleAction() {
      try {
        if (mode === 'verifyEmail') {
          const actionInfo = await checkActionCode(auth, oobCode)
          if (!active) return
          setAccountEmail(actionInfo?.data?.email || '')
          await applyActionCode(auth, oobCode)
          if (!active) return
          // Redirect to success page instead of directly to login
          window.location.replace('/email-verified')
          return
        }

        if (mode === 'resetPassword') {
          const email = await verifyPasswordResetCode(auth, oobCode)
          if (!active) return
          setAccountEmail(email)
          setStatus('ready')
          setMessage('Enter and confirm your new password.')
          return
        }

        setStatus('error')
        setMessage('This Firebase action type is not supported by SportsHub yet.')
        toastError('Unsupported action link.')
      } catch (error) {
        if (!active) return
        setStatus('error')
        
        // Preserve Firebase error messages for better debugging
        let errorMessage = error.message
        if (error.code === 'auth/expired-action-code') {
          errorMessage = 'This action link has expired. Please request a new verification email from SportsHub.'
        } else if (error.code === 'auth/invalid-action-code') {
          errorMessage = 'This action link is invalid or has already been used. Please request a new verification email.'
        }
        
        setMessage(errorMessage)
        toastError(error.code === 'auth/expired-action-code' ? 'Action link expired.' : 'Action verification failed.')
      }
    }

    handleAction()

    return () => {
      active = false
    }
  }, [mode, navigate, oobCode])

  const handleReset = async (event) => {
    event.preventDefault()

    if (password.length < 6) {
      toastError('Password must be at least 6 characters.')
      setStatus('ready')
      return
    }

    if (password !== confirmPassword) {
      toastError('Passwords do not match.')
      setStatus('ready')
      return
    }

    setSubmitting(true)
    try {
      await confirmPasswordReset(auth, oobCode, password)
      // Redirect to success page instead of directly to login
      window.location.replace('/password-reset-success')
    } catch (error) {
      setStatus('ready')
      setMessage(error.message)
      toastError(error.code === 'auth/weak-password' ? 'Password is too weak.' : 'Password reset failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthPageShell title={actionTitle} description="Securely complete the account action from your SportsHub email.">
      <div className="grid gap-4">
        {accountEmail ? (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            {mode === 'verifyEmail' ? <MailCheck className="h-5 w-5 text-blue-600" /> : <LockKeyhole className="h-5 w-5 text-blue-600" />}
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase text-slate-500">Account</p>
              <p className="truncate text-sm font-semibold text-slate-900">{accountEmail}</p>
            </div>
          </div>
        ) : null}

        {mode === 'resetPassword' && status === 'ready' ? (
          <form className="grid gap-4" onSubmit={handleReset}>
            <input
              required
              minLength={6}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
              placeholder="New password"
            />
            <input
              required
              minLength={6}
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
              placeholder="Confirm password"
            />
            <button
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Reset password
            </button>
          </form>
        ) : (
          <StatusPanel
            status={status === 'ready' ? 'loading' : status}
            title={status === 'success' ? 'Complete' : status === 'error' ? 'Action failed' : 'Processing'}
            message={message}
          />
        )}

        <Link to={PUBLIC_ROUTES.signIn} className="text-center text-sm font-bold text-blue-600 hover:text-blue-700">
          Back to sign in
        </Link>
      </div>
    </AuthPageShell>
  )
}
