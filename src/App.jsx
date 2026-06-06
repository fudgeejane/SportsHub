import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import AuthStatusRoute from './components/auth/AuthStatusRoute'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicOnlyRoute from './components/auth/PublicOnlyRoute'
import RoleRedirect from './components/auth/RoleRedirect'
import { ROLES } from './contexts/AuthContext'
import AccessDeniedPage from './pages/auth/AccessDeniedPage'
import AdminSetupPage from './pages/auth/AdminSetupPage'
import ApprovalPendingPage from './pages/auth/ApprovalPendingPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'
import CoachDashboard from './pages/dashboards/CoachDashboard'
import FacilitatorDashboard from './pages/dashboards/FacilitatorDashboard'
import OrganizerDashboard from './pages/dashboards/OrganizerDashboard'
import PlayerDashboard from './pages/dashboards/PlayerDashboard'
import AppContentPage from './pages/app/AppContentPage'
import LandingPage from './public/LandingPage'
import { getAllowedRolesForPath } from './routes/navConfig'
import { PUBLIC_ROUTES } from './routes/public-routes'

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

const protectedAppPaths = [
  '/projects',
  '/tasks',
  '/updates',
  '/notifications',
  '/teams',
  '/progress',
  '/feedback',
  '/analytics',
  '/schedule',
  '/workflows',
  '/users',
  '/facilitators',
  '/settings',
]

export default function App() {
  return (
    <Router>
      <Routes>
        <Route
          path={PUBLIC_ROUTES.home}
          element={
            <PublicOnlyRoute>
              <LandingPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path={PUBLIC_ROUTES.signIn}
          element={
            <PublicOnlyRoute>
              <LandingPage authModal="sign-in" />
            </PublicOnlyRoute>
          }
        />
        <Route
          path={PUBLIC_ROUTES.signUp}
          element={
            <PublicOnlyRoute>
              <LandingPage authModal="sign-up" />
            </PublicOnlyRoute>
          }
        />
        <Route
          path={PUBLIC_ROUTES.forgotPassword}
          element={
            <PublicOnlyRoute>
              <ForgotPasswordPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path={PUBLIC_ROUTES.resetPassword}
          element={
            <PublicOnlyRoute>
              <ResetPasswordPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path={PUBLIC_ROUTES.verifyEmail}
          element={
            <AuthStatusRoute>
              <VerifyEmailPage />
            </AuthStatusRoute>
          }
        />
        <Route
          path={PUBLIC_ROUTES.approvalPending}
          element={
            <AuthStatusRoute>
              <ApprovalPendingPage />
            </AuthStatusRoute>
          }
        />
        <Route
          path={PUBLIC_ROUTES.accessDenied}
          element={
            <AuthStatusRoute>
              <AccessDeniedPage />
            </AuthStatusRoute>
          }
        />
        <Route path={PUBLIC_ROUTES.adminSetup} element={<AdminSetupPage />} />
        <Route
          path={PUBLIC_ROUTES.about}
          element={
            <PublicOnlyRoute>
              <PlaceholderPage title="About SportsHub" />
            </PublicOnlyRoute>
          }
        />
        <Route
          path={PUBLIC_ROUTES.pricing}
          element={
            <PublicOnlyRoute>
              <PlaceholderPage title="SportsHub Study Scope" />
            </PublicOnlyRoute>
          }
        />
        <Route
          path={PUBLIC_ROUTES.contact}
          element={
            <PublicOnlyRoute>
              <PlaceholderPage title="Contact" />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoleRedirect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/dashboard"
          element={
            <ProtectedRoute allowedRoles={[ROLES.COMMUNITY_ORGANIZER, ROLES.ADMIN]}>
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coach/dashboard"
          element={
            <ProtectedRoute allowedRoles={[ROLES.COACH]}>
              <CoachDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/facilitator/dashboard"
          element={
            <ProtectedRoute allowedRoles={[ROLES.FACILITATOR]}>
              <FacilitatorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/player/dashboard"
          element={
            <ProtectedRoute allowedRoles={[ROLES.PLAYER]}>
              <PlayerDashboard />
            </ProtectedRoute>
          }
        />

        {protectedAppPaths.map((path) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute allowedRoles={getAllowedRolesForPath(path)}>
                <AppContentPage path={path} />
              </ProtectedRoute>
            }
          />
        ))}

        <Route path="*" element={<Navigate to={PUBLIC_ROUTES.home} replace />} />
      </Routes>
    </Router>
  )
}
