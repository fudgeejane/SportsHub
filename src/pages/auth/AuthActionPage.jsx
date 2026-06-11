import { useEffect, useMemo, useState } from 'react'
import { applyActionCode, confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth'
import { CheckCircle2, CircleAlert, Loader2, LockKeyhole, MailCheck } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import AuthPageShell from '../../components/auth/AuthPageShell'
import { auth } from '../../firebase'
import { PUBLIC_ROUTES } from '../../routes/public-routes'
import { toastError, toastSuccess } from '../../utils/toast'

const APP_RETURN_URL = 'https://sports-hub-khaki.vercel.app'
const REDIRECT_DELAY_MS = 2500

function getActionErrorMessage(error, mode) {
  if (error?.code === 'auth/expired-action-code') {
    return 'This link has expired. Please request a new email from SportsHub.'
  }

  if (error?.code === 'auth/invalid-action-code') {
    return 'This link is invalid or has already been used. Please request a new email from SportsHub.'
  }

  if (error?.code === 'auth/weak-password') {
    return 'Password should be at least 6 characters.'
  }

  if (mode === 'resetPassword') {
    return 'We could not reset your password. Please request a new password reset email.'
  }

  return 'We could not verify your email. Please request a new verification email.'
}

function getSafeRedirectUrl(continueUrl) {
  if (!continueUrl) return APP_RETURN_URL

  try {
    const parsedUrl = new URL(continueUrl)
    return parsedUrl.origin === APP_RETURN_URL ? parsedUrl.href : APP_RETURN_URL
  } catch {
    return APP_RETURN_URL
  }
}

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
  const mode = searchParams.get('mode')
  const oobCode = searchParams.get('oobCode')
  const apiKey = searchParams.get('apiKey')
  const continueUrl = searchParams.get('continueUrl')
  const redirectUrl = useMemo(() => getSafeRedirectUrl(continueUrl), [continueUrl])

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
    if (!mode || !oobCode || !apiKey) {
      window.queueMicrotask(() => {
        setStatus('error')
        setMessage('This action link is incomplete. Please request a new email from SportsHub.')
        toastError('Invalid action link.')
      })
      return
    }

    let active = true
    let redirectTimer

    async function handleAction() {
      try {
        if (mode === 'verifyEmail') {
          await applyActionCode(auth, oobCode)
          if (!active) return

          setStatus('success')
          setMessage('Your email has been verified. Redirecting you to SportsHub...')
          toastSuccess('Email verified successfully.')

          redirectTimer = window.setTimeout(() => {
            window.location.assign(redirectUrl)
          }, REDIRECT_DELAY_MS)
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
        setMessage('This Firebase action type is not supported by SportsHub.')
        toastError('Unsupported action link.')
      } catch (error) {
        if (!active) return

        setStatus('error')
        setMessage(getActionErrorMessage(error, mode))
        toastError('Action link failed.')
      }
    }

    handleAction()

    return () => {
      active = false
      window.clearTimeout(redirectTimer)
    }
  }, [apiKey, mode, oobCode, redirectUrl])

  const handleReset = async (event) => {
    event.preventDefault()

    if (password.length < 6) {
      toastError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      toastError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      await confirmPasswordReset(auth, oobCode, password)
      setStatus('success')
      setMessage('Your password has been reset. Redirecting you to SportsHub...')
      toastSuccess('Password reset successfully.')

      window.setTimeout(() => {
        window.location.assign(redirectUrl)
      }, REDIRECT_DELAY_MS)
    } catch (error) {
      setStatus('ready')
      setMessage(getActionErrorMessage(error, mode))
      toastError('Password reset failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthPageShell title={actionTitle} description="Securely complete the account action from your SportsHub email.">
      <div className="grid gap-4">
        {accountEmail ? (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            {mode === 'verifyEmail' ? (
              <MailCheck className="h-5 w-5 text-blue-600" />
            ) : (
              <LockKeyhole className="h-5 w-5 text-blue-600" />
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase text-slate-500">Account</p>
              <p className="truncate text-sm font-semibold text-slate-900">{accountEmail}</p>
            </div>
          </div>
        ) : null}

        {mode === 'resetPassword' && status === 'ready' ? (
          <>
            <StatusPanel status="loading" title="Password reset link verified" message={message} />
            <form className="grid gap-4" onSubmit={handleReset}>
              <input
                required
                minLength={6}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                placeholder="New password"
                autoComplete="new-password"
              />
              <input
                required
                minLength={6}
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                placeholder="Confirm password"
                autoComplete="new-password"
              />
              <button
                disabled={submitting}
                className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Reset password
              </button>
            </form>
          </>
        ) : (
          <StatusPanel
            status={status}
            title={status === 'success' ? 'Complete' : status === 'error' ? 'Action failed' : 'Processing'}
            message={message}
          />
        )}

        {status === 'success' ? (
          <a className="text-center text-sm font-bold text-blue-600 hover:text-blue-700" href={redirectUrl}>
            Continue to SportsHub
          </a>
        ) : (
          <Link to={PUBLIC_ROUTES.signIn} className="text-center text-sm font-bold text-blue-600 hover:text-blue-700">
            Back to sign in
          </Link>
        )}
      </div>
    </AuthPageShell>
  )
}
