import { useEffect, useMemo } from 'react'
import { CircleAlert, Loader2 } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import AuthPageShell from '../../components/auth/AuthPageShell'
import { APP_RETURN_URL, FIREBASE_AUTH_ACTION_URL } from '../../hooks/useAuth'
import { PUBLIC_ROUTES } from '../../routes/public-routes'

const REQUIRED_PARAMS = ['mode', 'oobCode', 'apiKey']

function buildFirebaseActionUrl(searchParams) {
  const actionUrl = new URL(FIREBASE_AUTH_ACTION_URL)

  searchParams.forEach((value, key) => {
    if (key !== 'continueUrl') actionUrl.searchParams.set(key, value)
  })

  actionUrl.searchParams.set('continueUrl', APP_RETURN_URL)
  return actionUrl.href
}

export default function AuthActionPage() {
  const [searchParams] = useSearchParams()
  const missingParams = useMemo(
    () => REQUIRED_PARAMS.filter((param) => !searchParams.get(param)),
    [searchParams],
  )
  const firebaseActionUrl = useMemo(() => buildFirebaseActionUrl(searchParams), [searchParams])

  useEffect(() => {
    if (missingParams.length > 0) return
    window.location.replace(firebaseActionUrl)
  }, [firebaseActionUrl, missingParams.length])

  if (missingParams.length > 0) {
    return (
      <AuthPageShell title="Account action" description="This SportsHub account action link is incomplete.">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex gap-3">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">Invalid or incomplete link</p>
              <p className="mt-1 text-sm leading-6">
                Please request a new verification or password reset email from SportsHub.
              </p>
            </div>
          </div>
        </div>
        <Link to={PUBLIC_ROUTES.signIn} className="mt-4 block text-center text-sm font-bold text-blue-600 hover:text-blue-700">
          Back to sign in
        </Link>
      </AuthPageShell>
    )
  }

  return (
    <AuthPageShell title="Account action" description="Opening Firebase's secure account action page.">
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-800">
        <div className="flex gap-3">
          <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin" />
          <div>
            <p className="font-bold">Redirecting securely</p>
            <p className="mt-1 text-sm leading-6">
              You will finish this action on Firebase, then return to SportsHub.
            </p>
          </div>
        </div>
      </div>
    </AuthPageShell>
  )
}
