import {
  BarChart3,
  CalendarDays,
  Home,
  ListChecks,
  Medal,
  UserCog,
  Users,
  UserRound,
} from 'lucide-react'
import { ROLES } from '../contexts/AuthContext'

export const roleKeys = {
  player: 'player',
  coach: 'coach',
  organizer: 'organizer',
  facilitator: 'facilitator',
  admin: 'admin',
}

export const roleLabelMap = {
  [ROLES.PLAYER]: roleKeys.player,
  [ROLES.COACH]: roleKeys.coach,
  [ROLES.FACILITATOR]: roleKeys.facilitator,
  [ROLES.COMMUNITY_ORGANIZER]: roleKeys.admin,
  [ROLES.ADMIN]: roleKeys.admin,
  ORGANIZER: roleKeys.organizer,
}

export const roleDashboardPaths = {
  [roleKeys.player]: '/player/dashboard',
  [roleKeys.coach]: '/coach/dashboard',
  [roleKeys.organizer]: '/organizer/dashboard',
  [roleKeys.facilitator]: '/facilitator/dashboard',
  [roleKeys.admin]: '/organizer/dashboard',
}

export const navConfig = {
  player: [
    { label: 'Dashboard', path: '/player/dashboard', icon: Home },
    { label: 'Browse Teams', path: '/player/teams', icon: Users },
    { label: 'Payment', path: '/player/payment', icon: ListChecks },
    { label: 'My Requests', path: '/player/requests', icon: ListChecks },
    { label: 'Profile', path: '/player/profile', icon: UserRound },
  ],
  coach: [
    { label: 'Dashboard', path: '/coach/dashboard', icon: Home },
    { label: 'My Teams', path: '/coach/teams', icon: Users },
    { label: 'Event Registrations', path: '/coach/event-registrations', icon: CalendarDays },
    { label: 'Join Requests', path: '/coach/requests', icon: ListChecks },
  ],
  organizer: [
    { label: 'Dashboard', path: '/organizer/dashboard', icon: Home },
    { label: 'Sports', path: '/organizer/sports', icon: Medal },
    { label: 'Events', path: '/organizer/events', icon: CalendarDays },
    { label: 'Teams & Rosters', path: '/organizer/teams', icon: Users },
    { label: 'Registrations', path: '/organizer/requests', icon: ListChecks },
    { label: 'Analytics', path: '/organizer/analytics', icon: BarChart3 },
  ],
  facilitator: [
    { label: 'Dashboard', path: '/facilitator/dashboard', icon: Home },
    { label: 'Payments', path: '/facilitator/payments', icon: ListChecks },
    { label: 'Events', path: '/facilitator/events', icon: CalendarDays },
    { label: 'Teams', path: '/facilitator/teams', icon: Users },
    { label: 'Scheduling', path: '/facilitator/schedule', icon: CalendarDays },
  ],
  admin: [
    { label: 'Dashboard', path: '/organizer/dashboard', icon: Home },
    { label: 'Users Management', path: '/organizer/users', icon: UserCog },
    { label: 'Sport Management', path: '/organizer/sports', icon: Medal },
    { label: 'Event Management', path: '/organizer/events', icon: CalendarDays },
    { label: 'Teams & Rosters', path: '/organizer/teams', icon: Users },
   ],
}

export function getRoleKey(role) {
  return roleLabelMap[role] || roleKeys.player
}

export function getDashboardPath(role) {
  return roleDashboardPaths[getRoleKey(role)] || roleDashboardPaths.player
}

export function getAllowedNav(role) {
  return navConfig[getRoleKey(role)] || []
}

export function getAllowedRolesForPath(path) {
  const allowedRoleKeys = Object.entries(navConfig)
    .filter(([, items]) => items.some((item) => item.path === path))
    .map(([roleKey]) => roleKey)

  const allowedRoles = []

  if (allowedRoleKeys.includes(roleKeys.player)) allowedRoles.push(ROLES.PLAYER)
  if (allowedRoleKeys.includes(roleKeys.coach)) allowedRoles.push(ROLES.COACH)
  if (allowedRoleKeys.includes(roleKeys.facilitator)) allowedRoles.push(ROLES.FACILITATOR)
  if (allowedRoleKeys.includes(roleKeys.organizer)) allowedRoles.push(ROLES.COMMUNITY_ORGANIZER)
  if (allowedRoleKeys.includes(roleKeys.admin)) allowedRoles.push(ROLES.ADMIN, ROLES.COMMUNITY_ORGANIZER)

  return [...new Set(allowedRoles)]
}
