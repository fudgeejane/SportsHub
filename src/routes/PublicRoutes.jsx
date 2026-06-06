/* eslint-disable react-refresh/only-export-components */
import { Navigate, Route } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import AccessDeniedPage from '../pages/auth/AccessDeniedPage'
import AdminSetupPage from '../pages/auth/AdminSetupPage'
import ApprovalPendingPage from '../pages/auth/ApprovalPendingPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'
import VerifyEmailPage from '../pages/auth/VerifyEmailPage'
import LandingPage from '../public/LandingPage'
import { getDashboardPath } from './navConfig'
import { PUBLIC_ROUTES } from './public-routes'

function PlaceholderPage({ title }) {
  return (
    <main className="min-h-screen bg-[#f7f9fc] px-6 py-24 text-slate-700">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-900/10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">SportsHub</p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-950">{title}</h1>
        <p className="mt-4 text-slate-600">
          This route is reserved in the app structure and ready for the full screen implementation.
        </p>
      </div>
    </main>
  )
}

function PublicOnlyRoute({ children }) {
  const { currentUser, loading, userProfile } = useAuth()

  if (loading) {
    return null
  }

  if (currentUser) {
    return <Navigate to={getDashboardPath(userProfile?.role)} replace />
  }

  return children
}

function AuthenticatedStatusRoute({ children }) {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!currentUser) {
    return <Navigate to={PUBLIC_ROUTES.home} replace />
  }

  return children
}

export const publicRoutes = [
  <Route
    key={PUBLIC_ROUTES.home}
    path={PUBLIC_ROUTES.home}
    element={
      <PublicOnlyRoute>
        <LandingPage />
      </PublicOnlyRoute>
    }
  />,
  <Route
    key={PUBLIC_ROUTES.signIn}
    path={PUBLIC_ROUTES.signIn}
    element={
      <PublicOnlyRoute>
        <LandingPage authModal="sign-in" />
      </PublicOnlyRoute>
    }
  />,
  <Route
    key={PUBLIC_ROUTES.signUp}
    path={PUBLIC_ROUTES.signUp}
    element={
      <PublicOnlyRoute>
        <LandingPage authModal="sign-up" />
      </PublicOnlyRoute>
    }
  />,
  <Route
    key={PUBLIC_ROUTES.forgotPassword}
    path={PUBLIC_ROUTES.forgotPassword}
    element={
      <PublicOnlyRoute>
        <LandingPage authModal="forgot-password" />
      </PublicOnlyRoute>
    }
  />,
  <Route
    key={PUBLIC_ROUTES.resetPassword}
    path={PUBLIC_ROUTES.resetPassword}
    element={
      <PublicOnlyRoute>
        <ResetPasswordPage />
      </PublicOnlyRoute>
    }
  />,
  <Route
    key={PUBLIC_ROUTES.verifyEmail}
    path={PUBLIC_ROUTES.verifyEmail}
    element={
      <AuthenticatedStatusRoute>
        <VerifyEmailPage />
      </AuthenticatedStatusRoute>
    }
  />,
  <Route
    key={PUBLIC_ROUTES.approvalPending}
    path={PUBLIC_ROUTES.approvalPending}
    element={
      <AuthenticatedStatusRoute>
        <ApprovalPendingPage />
      </AuthenticatedStatusRoute>
    }
  />,
  <Route
    key={PUBLIC_ROUTES.accessDenied}
    path={PUBLIC_ROUTES.accessDenied}
    element={
      <AuthenticatedStatusRoute>
        <AccessDeniedPage />
      </AuthenticatedStatusRoute>
    }
  />,
  <Route key={PUBLIC_ROUTES.adminSetup} path={PUBLIC_ROUTES.adminSetup} element={<AdminSetupPage />} />,
  <Route
    key={PUBLIC_ROUTES.about}
    path={PUBLIC_ROUTES.about}
    element={
      <PublicOnlyRoute>
        <PlaceholderPage title="About SportsHub" />
      </PublicOnlyRoute>
    }
  />,
  <Route
    key={PUBLIC_ROUTES.pricing}
    path={PUBLIC_ROUTES.pricing}
    element={
      <PublicOnlyRoute>
        <PlaceholderPage title="SportsHub Study Scope" />
      </PublicOnlyRoute>
    }
  />,
  <Route
    key={PUBLIC_ROUTES.contact}
    path={PUBLIC_ROUTES.contact}
    element={
      <PublicOnlyRoute>
        <PlaceholderPage title="Contact" />
      </PublicOnlyRoute>
    }
  />,
]
