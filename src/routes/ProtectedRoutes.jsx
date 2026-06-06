/* eslint-disable react-refresh/only-export-components */
import { Navigate, Route, useLocation } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { ROLES, STATUSES } from '../contexts/AuthContext'
import { useAuth } from '../hooks/useAuth.jsx'
import CoachDashboard from '../pages/Coach/Dashboard'
import CoachEventRegistrationsPage from '../pages/Coach/EventRegistrations'
import CoachRequestsPage from '../pages/Coach/Requests'
import CoachTeamsPage from '../pages/Coach/Teams'
import FacilitatorDashboard from '../pages/Facilitator/Dashboard'
import FacilitatorEventsPage from '../pages/Facilitator/Events'
import FacilitatorSchedulePage from '../pages/Facilitator/Schedule'
import FacilitatorSportsPage from '../pages/Facilitator/Sports'
import FacilitatorRequestsPage from '../pages/Facilitator/Requests'
import FacilitatorTeamsPage from '../pages/Facilitator/Teams'
import OrganizerAnalyticsPage from '../pages/Organizer/Analytics'
import OrganizerDashboard from '../pages/Organizer/Dashboard'
import OrganizerEventsPage from '../pages/Organizer/Events'
import OrganizerFacilitatorsPage from '../pages/Organizer/Facilitators'
import OrganizerRequestsPage from '../pages/Organizer/Requests'
import OrganizerSchedulePage from '../pages/Organizer/Schedule'
import OrganizerSettingsPage from '../pages/Organizer/Settings'
import OrganizerSportsPage from '../pages/Organizer/Sports'
import OrganizerTeamsPage from '../pages/Organizer/Teams'
import OrganizerUsersPage from '../pages/Organizer/Users'
import PlayerDashboard from '../pages/Player/Dashboard'
import PlayerPaymentPage from '../pages/Player/Payment'
import PlayerProfilePage from '../pages/Player/Profile'
import PlayerRequestsPage from '../pages/Player/Requests'
import PlayerSchedulesPage from '../pages/Player/Schedules'
import PlayerTeamsPage from '../pages/Player/Teams'
import { getDashboardPath } from './navConfig'
import { PUBLIC_ROUTES } from './public-routes'

function roleView(views) {
  return Object.fromEntries(Object.entries(views).filter(([, Component]) => Boolean(Component)))
}

function RolePage({ views }) {
  const { userProfile } = useAuth()
  const Component = views[userProfile?.role]

  if (!Component) {
    return <Navigate to={getDashboardPath(userProfile?.role)} replace />
  }

  return <Component />
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

  if (userProfile?.status !== STATUSES.APPROVED) {
    return <Navigate to={PUBLIC_ROUTES.approvalPending} replace />
  }

  if (userProfile?.role === ROLES.PLAYER && !['TEAM_ASSIGNED', 'ACTIVE'].includes(userProfile?.membershipStatus)) {
    return <Navigate to={PUBLIC_ROUTES.approvalPending} replace />
  }

  if (allowedRoles?.length && !allowedRoles.includes(userProfile.role)) {
    return <Navigate to={getDashboardPath(userProfile.role)} replace />
  }

  return children
}

function RoleRoute({ views }) {
  const allowedRoles = Object.keys(views)

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <RolePage views={views} />
    </ProtectedRoute>
  )
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
    <Route
      path="/dashboard"
      element={
        <RoleRoute
          views={roleView({
            [ROLES.ADMIN]: OrganizerDashboard,
            [ROLES.COMMUNITY_ORGANIZER]: OrganizerDashboard,
            [ROLES.COACH]: CoachDashboard,
            [ROLES.FACILITATOR]: FacilitatorDashboard,
            [ROLES.PLAYER]: PlayerDashboard,
          })}
        />
      }
    />
    <Route path="/users" element={<RoleRoute views={roleView({ [ROLES.ADMIN]: OrganizerUsersPage, [ROLES.COMMUNITY_ORGANIZER]: OrganizerUsersPage })} />} />
    <Route
      path="/sports"
      element={
        <RoleRoute
          views={roleView({
            [ROLES.ADMIN]: OrganizerSportsPage,
            [ROLES.COMMUNITY_ORGANIZER]: OrganizerSportsPage,
            [ROLES.FACILITATOR]: FacilitatorSportsPage,
          })}
        />
      }
    />
    <Route
      path="/events"
      element={
        <RoleRoute
          views={roleView({
            [ROLES.ADMIN]: OrganizerEventsPage,
            [ROLES.COMMUNITY_ORGANIZER]: OrganizerEventsPage,
            [ROLES.FACILITATOR]: FacilitatorEventsPage,
          })}
        />
      }
    />
    <Route
      path="/teams"
      element={
        <RoleRoute
          views={roleView({
            [ROLES.ADMIN]: OrganizerTeamsPage,
            [ROLES.COMMUNITY_ORGANIZER]: OrganizerTeamsPage,
            [ROLES.COACH]: CoachTeamsPage,
            [ROLES.FACILITATOR]: FacilitatorTeamsPage,
            [ROLES.PLAYER]: PlayerTeamsPage,
          })}
        />
      }
    />
    <Route
      path="/requests"
      element={
        <RoleRoute
          views={roleView({
            [ROLES.ADMIN]: OrganizerRequestsPage,
            [ROLES.COMMUNITY_ORGANIZER]: OrganizerRequestsPage,
            [ROLES.COACH]: CoachRequestsPage,
            [ROLES.FACILITATOR]: FacilitatorRequestsPage,
            [ROLES.PLAYER]: PlayerRequestsPage,
          })}
        />
      }
    />
    <Route path="/analytics" element={<RoleRoute views={roleView({ [ROLES.ADMIN]: OrganizerAnalyticsPage, [ROLES.COMMUNITY_ORGANIZER]: OrganizerAnalyticsPage })} />} />
    <Route path="/facilitators" element={<RoleRoute views={roleView({ [ROLES.ADMIN]: OrganizerFacilitatorsPage, [ROLES.COMMUNITY_ORGANIZER]: OrganizerFacilitatorsPage })} />} />
    <Route
      path="/settings"
      element={
        <RoleRoute
          views={roleView({
            [ROLES.ADMIN]: OrganizerSettingsPage,
            [ROLES.COMMUNITY_ORGANIZER]: OrganizerSettingsPage,
            [ROLES.PLAYER]: PlayerProfilePage,
          })}
        />
      }
    />
    <Route
      path="/schedule"
      element={
        <RoleRoute
          views={roleView({
            [ROLES.ADMIN]: OrganizerSchedulePage,
            [ROLES.COMMUNITY_ORGANIZER]: OrganizerSchedulePage,
            [ROLES.FACILITATOR]: FacilitatorSchedulePage,
          })}
        />
      }
    />
    <Route
      path="/payments"
      element={
        <RoleRoute
          views={roleView({
            [ROLES.FACILITATOR]: FacilitatorRequestsPage,
            [ROLES.PLAYER]: PlayerPaymentPage,
          })}
        />
      }
    />
    <Route path="/event-registrations" element={<RoleRoute views={roleView({ [ROLES.COACH]: CoachEventRegistrationsPage })} />} />
    <Route path="/schedules" element={<RoleRoute views={roleView({ [ROLES.PLAYER]: PlayerSchedulesPage })} />} />
    <Route path="/profile" element={<RoleRoute views={roleView({ [ROLES.PLAYER]: PlayerProfilePage })} />} />
  </Route>,
]
