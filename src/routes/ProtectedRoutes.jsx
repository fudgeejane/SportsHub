/* eslint-disable react-refresh/only-export-components */
import { Navigate, Route, useLocation } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { ROLES, STATUSES } from '../contexts/AuthContext'
import { useAuth } from '../hooks/useAuth.jsx'
import CoachDashboard from '../pages/Coach/Dashboard'
import CoachRequestsPage from '../pages/Coach/Requests'
import CoachTeamsPage from '../pages/Coach/Teams'
import FacilitatorDashboard from '../pages/Facilitator/Dashboard'
import FacilitatorEventsPage from '../pages/Facilitator/Events'
import FacilitatorSchedulePage from '../pages/Facilitator/Schedule'
import FacilitatorSportsPage from '../pages/Facilitator/Sports'
import FacilitatorTeamsPage from '../pages/Facilitator/Teams'
import OrganizerAnalyticsPage from '../pages/Organizer/Analytics'
import OrganizerDashboard from '../pages/Organizer/Dashboard'
import OrganizerEventsPage from '../pages/Organizer/Events'
import OrganizerFacilitatorsPage from '../pages/Organizer/Facilitators'
import OrganizerRequestsPage from '../pages/Organizer/Requests'
import OrganizerSchedulePage from '../pages/Organizer/Schedule'
import OrganizerSettingsPage from '../pages/Organizer/Settings'
import OrganizerSportsPage from '../pages/Organizer/Sports'
import OrganizerTeamStructuresPage from '../pages/Organizer/TeamStructures'
import OrganizerTeamsPage from '../pages/Organizer/Teams'
import OrganizerUsersPage from '../pages/Organizer/Users'
import PlayerDashboard from '../pages/Player/Dashboard'
import PlayerProfilePage from '../pages/Player/Profile'
import PlayerRequestsPage from '../pages/Player/Requests'
import PlayerTeamsPage from '../pages/Player/Teams'
import { getDashboardPath } from './navConfig'
import { PUBLIC_ROUTES } from './public-routes'

const organizerRoles = [ROLES.COMMUNITY_ORGANIZER, ROLES.ADMIN]

function RoleRedirect() {
  const { userProfile } = useAuth()
  return <Navigate to={getDashboardPath(userProfile?.role)} replace />
}

function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, loading, userProfile } = useAuth()
  const location = useLocation()

  if (loading) {
    return null
  }

  if (!currentUser) {
    return <Navigate to={PUBLIC_ROUTES.home} replace state={{ from: location }} />
  }

  const adminVerifiedInApp =
    userProfile?.role === ROLES.COMMUNITY_ORGANIZER &&
    userProfile?.status === STATUSES.APPROVED &&
    userProfile?.emailVerified === true

  if (!currentUser.emailVerified && !adminVerifiedInApp) {
    return <Navigate to={PUBLIC_ROUTES.verifyEmail} replace />
  }

  if (userProfile?.status === STATUSES.PENDING) {
    return <Navigate to={PUBLIC_ROUTES.approvalPending} replace />
  }

  if (userProfile?.status === STATUSES.REJECTED) {
    return <Navigate to={PUBLIC_ROUTES.accessDenied} replace />
  }

  if (userProfile?.status !== STATUSES.APPROVED) {
    return <Navigate to={PUBLIC_ROUTES.approvalPending} replace />
  }

  if (allowedRoles?.length && !allowedRoles.includes(userProfile.role)) {
    return <Navigate to={PUBLIC_ROUTES.accessDenied} replace />
  }

  return children
}

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  )
}

export const protectedRoutes = [
  <Route
    key="/dashboard"
    element={<ProtectedLayout />}
  >
    <Route path="/dashboard" element={<RoleRedirect />} />
    <Route
      path="/organizer/dashboard"
      element={
        <ProtectedRoute allowedRoles={organizerRoles}>
          <OrganizerDashboard />
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
  </Route>,
]
