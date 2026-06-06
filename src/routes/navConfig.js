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
  [roleKeys.player]: '/dashboard',
  [roleKeys.coach]: '/dashboard',
  [roleKeys.organizer]: '/dashboard',
  [roleKeys.facilitator]: '/dashboard',
  [roleKeys.admin]: '/dashboard',
}

export const navConfig = {
  player: [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Teams', path: '/teams', icon: Users },
    { label: 'Schedules', path: '/schedules', icon: CalendarDays },
    { label: 'Settings', path: '/settings', icon: UserRound },
  ],
  coach: [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'My Teams', path: '/teams', icon: Users },
    { label: 'Event Registrations', path: '/event-registrations', icon: CalendarDays },
    { label: 'Join Requests', path: '/requests', icon: ListChecks },
  ],
  organizer: [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Sports', path: '/sports', icon: Medal },
    { label: 'Events', path: '/events', icon: CalendarDays },
    { label: 'Teams & Rosters', path: '/teams', icon: Users },
    { label: 'Registrations', path: '/requests', icon: ListChecks },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  ],
  facilitator: [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Payments', path: '/payments', icon: ListChecks },
    { label: 'Events', path: '/events', icon: CalendarDays },
    { label: 'Teams', path: '/teams', icon: Users },
    { label: 'Scheduling', path: '/schedule', icon: CalendarDays },
  ],
  admin: [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Users Management', path: '/users', icon: UserCog },
    { label: 'Sport Management', path: '/sports', icon: Medal },
    { label: 'Event Management', path: '/events', icon: CalendarDays },
    { label: 'Teams & Rosters', path: '/teams', icon: Users },
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
