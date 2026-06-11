import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { applyActionCode, signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { PUBLIC_ROUTES } from '../routes/public-routes'

export function useEmailVerificationHandler() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const mode = searchParams.get('mode')
    const oobCode = searchParams.get('oobCode')

    if (mode !== 'verifyEmail' || !oobCode) return

    let active = true

    applyActionCode(auth, oobCode)
      .then(async () => {
        if (!active) return
        if (auth.currentUser) await signOut(auth)
        navigate(PUBLIC_ROUTES.signIn, {
          replace: true,
          state: { emailVerified: true, restoreScrollY: 0 },
        })
      })
      .catch(() => {
        if (!active) return
        navigate(PUBLIC_ROUTES.signIn, {
          replace: true,
          state: { verifyError: true, restoreScrollY: 0 },
        })
      })

    return () => {
      active = false
    }
  }, [navigate, searchParams])
}
