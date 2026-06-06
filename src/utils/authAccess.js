import { ROLES, STATUSES } from '../contexts/AuthContext'

export function canAccessDashboard(currentUser, userProfile) {
  if (!currentUser || !userProfile) return false

  const adminVerifiedInApp =
    userProfile.role === ROLES.COMMUNITY_ORGANIZER &&
    userProfile.status === STATUSES.APPROVED &&
    userProfile.emailVerified === true

  if (!currentUser.emailVerified && !adminVerifiedInApp) return false
  if (userProfile.status !== STATUSES.APPROVED) return false
  if (userProfile.role === ROLES.PLAYER && !['TEAM_ASSIGNED', 'ACTIVE'].includes(userProfile.membershipStatus)) return false

  return true
}
