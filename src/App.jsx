import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import AuthStatusRoute from './components/auth/AuthStatusRoute'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicOnlyRoute from './components/auth/PublicOnlyRoute'
import RoleRedirect from './components/auth/RoleRedirect'
import GlobalLoadingScreen from './components/loading/GlobalLoadingScreen'
import { ROLES } from './contexts/AuthContext'
import { useAuth } from './hooks/useAuth.jsx'
import { useGlobalLoading } from './hooks/useGlobalLoading.jsx'
import AccessDeniedPage from './pages/auth/AccessDeniedPage'
import AdminSetupPage from './pages/auth/AdminSetupPage'
import ApprovalPendingPage from './pages/auth/ApprovalPendingPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'
import CoachDashboard from './pages/Coach/Dashboard'
import CoachRequestsPage from './pages/Coach/Requests'
import CoachTeamsPage from './pages/Coach/Teams'
import FacilitatorDashboard from './pages/Facilitator/Dashboard'
import FacilitatorEventsPage from './pages/Facilitator/Events'
import FacilitatorSchedulePage from './pages/Facilitator/Schedule'
import FacilitatorSportsPage from './pages/Facilitator/Sports'
import FacilitatorTeamsPage from './pages/Facilitator/Teams'
import OrganizerAnalyticsPage from './pages/Organizer/Analytics'
import OrganizerDashboard from './pages/Organizer/Dashboard'
import OrganizerEventsPage from './pages/Organizer/Events'
import OrganizerFacilitatorsPage from './pages/Organizer/Facilitators'
import OrganizerRequestsPage from './pages/Organizer/Requests'
import OrganizerSchedulePage from './pages/Organizer/Schedule'
import OrganizerSettingsPage from './pages/Organizer/Settings'
import OrganizerSportsPage from './pages/Organizer/Sports'
import OrganizerTeamStructuresPage from './pages/Organizer/TeamStructures'
import OrganizerTeamsPage from './pages/Organizer/Teams'
import OrganizerUsersPage from './pages/Organizer/Users'
import PlayerDashboard from './pages/Player/Dashboard'
import PlayerProfilePage from './pages/Player/Profile'
import PlayerRequestsPage from './pages/Player/Requests'
import PlayerTeamsPage from './pages/Player/Teams'
import LandingPage from './public/LandingPage'
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

const organizerRoles = [ROLES.COMMUNITY_ORGANIZER, ROLES.ADMIN]

function AppRoutes() {
  const { loading: authLoading } = useAuth()
  const { isGlobalLoading, loadingLabel } = useGlobalLoading()

  return (
    <>
      {(authLoading || isGlobalLoading) && (
        <GlobalLoadingScreen label={authLoading ? 'Checking your SportsHub session...' : loadingLabel} />
      )}
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
              <LandingPage authModal="forgot-password" />
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
            <ProtectedRoute allowedRoles={organizerRoles}>
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/sports"
          element={
            <ProtectedRoute allowedRoles={organizerRoles}>
              <OrganizerSportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/events"
          element={
            <ProtectedRoute allowedRoles={organizerRoles}>
              <OrganizerEventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/team-structures"
          element={
            <ProtectedRoute allowedRoles={organizerRoles}>
              <OrganizerTeamStructuresPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/teams"
          element={
            <ProtectedRoute allowedRoles={organizerRoles}>
              <OrganizerTeamsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/requests"
          element={
            <ProtectedRoute allowedRoles={organizerRoles}>
              <OrganizerRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/analytics"
          element={
            <ProtectedRoute allowedRoles={organizerRoles}>
              <OrganizerAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/users"
          element={
            <ProtectedRoute allowedRoles={organizerRoles}>
              <OrganizerUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/facilitators"
          element={
            <ProtectedRoute allowedRoles={organizerRoles}>
              <OrganizerFacilitatorsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/schedule"
          element={
            <ProtectedRoute allowedRoles={organizerRoles}>
              <OrganizerSchedulePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/settings"
          element={
            <ProtectedRoute allowedRoles={organizerRoles}>
              <OrganizerSettingsPage />
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
          path="/coach/teams"
          element={
            <ProtectedRoute allowedRoles={[ROLES.COACH]}>
              <CoachTeamsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coach/requests"
          element={
            <ProtectedRoute allowedRoles={[ROLES.COACH]}>
              <CoachRequestsPage />
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
          path="/facilitator/sports"
          element={
            <ProtectedRoute allowedRoles={[ROLES.FACILITATOR]}>
              <FacilitatorSportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/facilitator/events"
          element={
            <ProtectedRoute allowedRoles={[ROLES.FACILITATOR]}>
              <FacilitatorEventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/facilitator/teams"
          element={
            <ProtectedRoute allowedRoles={[ROLES.FACILITATOR]}>
              <FacilitatorTeamsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/facilitator/schedule"
          element={
            <ProtectedRoute allowedRoles={[ROLES.FACILITATOR]}>
              <FacilitatorSchedulePage />
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
        <Route
          path="/player/teams"
          element={
            <ProtectedRoute allowedRoles={[ROLES.PLAYER]}>
              <PlayerTeamsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/player/requests"
          element={
            <ProtectedRoute allowedRoles={[ROLES.PLAYER]}>
              <PlayerRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/player/profile"
          element={
            <ProtectedRoute allowedRoles={[ROLES.PLAYER]}>
              <PlayerProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to={PUBLIC_ROUTES.home} replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  )
}
