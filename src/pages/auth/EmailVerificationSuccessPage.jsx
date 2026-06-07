import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, Mail } from 'lucide-react'

const REDIRECT_DELAY = 3000 // 3 seconds

export default function EmailVerificationSuccessPage() {
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
      window.location.href = 'https://sports-hub-khaki.vercel.app/login?emailVerified=true'
    }, REDIRECT_DELAY)

    return () => {
      clearInterval(countdownInterval)
      clearTimeout(redirectTimer)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Mail className="w-8 h-8 text-white" />
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
              Email Verified Successfully!
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Your email has been verified. You can now access all features of SportsHub.
            </p>
          </div>

          {/* Redirect Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900">
                  Redirecting to login...
                </p>
                <p className="text-xs text-blue-700 mt-1">
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
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
            >
              Go to Login
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Welcome to the SportsHub community! 🎉
        </p>
      </div>
    </div>
  )
}
