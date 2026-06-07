import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, LockKeyhole } from 'lucide-react'

const REDIRECT_DELAY = 3000 // 3 seconds

export default function PasswordResetSuccessPage() {
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Redirect after delay
    const redirectTimer = setTimeout(() => {
      window.location.href = 'https://sports-hub-khaki.vercel.app/login'
    }, REDIRECT_DELAY)

    return () => {
      clearInterval(countdownInterval)
      clearTimeout(redirectTimer)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-2xl mb-4">
            <LockKeyhole className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">SportsHub</h1>
        </div>

        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-900/10 border border-slate-200 p-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
              {/* Animated ring */}
              <div className="absolute inset-0 w-20 h-20 border-4 border-emerald-200 rounded-full animate-ping opacity-75"></div>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Password Reset Successfully!
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Your password has been changed. You can now sign in with your new password.
            </p>
          </div>

          {/* Redirect Notice */}
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-purple-600 animate-spin flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-purple-900">
                  Redirecting to login...
                </p>
                <p className="text-xs text-purple-700 mt-1">
                  You'll be redirected in {countdown} second{countdown !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Manual Link */}
          <div className="text-center">
            <p className="text-sm text-slate-500 mb-3">
              If you're not redirected automatically:
            </p>
            <a
              href="https://sports-hub-khaki.vercel.app/login"
              className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
            >
              Go to Login
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Your account is now secure 🔒
        </p>
      </div>
    </div>
  )
}
