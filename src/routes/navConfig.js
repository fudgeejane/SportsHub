import {
  Activity,
  BarChart3,
  Bell,
  CalendarDays,
  ClipboardCheck,
  FolderKanban,
  Home,
  MessageSquare,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
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
    { label: 'Assigned Projects', path: '/projects', icon: FolderKanban },
    { label: 'Tasks', path: '/tasks', icon: ClipboardCheck },
    { label: 'Submit Updates', path: '/updates', icon: Activity },
    { label: 'Notifications', path: '/notifications', icon: Bell },
  ],
  coach: [
    { label: 'Dashboard', path: '/coach/dashboard', icon: Home },
    { label: 'Teams', path: '/teams', icon: Users },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'Assign Tasks', path: '/tasks', icon: ClipboardCheck },
    { label: 'Progress', path: '/progress', icon: BarChart3 },
    { label: 'Feedback', path: '/feedback', icon: MessageSquare },
  ],
  organizer: [
    { label: 'Dashboard', path: '/organizer/dashboard', icon: Home },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'Teams', path: '/teams', icon: Users },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Scheduling', path: '/schedule', icon: CalendarDays },
    { label: 'Workflows', path: '/workflows', icon: ClipboardCheck },
  ],
  facilitator: [
    { label: 'Dashboard', path: '/facilitator/dashboard', icon: Home },
    { label: 'Project Monitoring', path: '/projects', icon: FolderKanban },
    { label: 'Tasks', path: '/tasks', icon: ClipboardCheck },
    { label: 'Progress', path: '/progress', icon: BarChart3 },
    { label: 'Scheduling', path: '/schedule', icon: CalendarDays },
  ],
  admin: [
    { label: 'Dashboard', path: '/organizer/dashboard', icon: Home },
    { label: 'Users & Roles', path: '/users', icon: UserCog },
    { label: 'Facilitator Accounts', path: '/facilitators', icon: ShieldCheck },
    { label: 'All Projects', path: '/projects', icon: FolderKanban },
    { label: 'All Tasks', path: '/tasks', icon: ClipboardCheck },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Scheduling', path: '/schedule', icon: CalendarDays },
    { label: 'Workflows', path: '/workflows', icon: ClipboardCheck },
    { label: 'Settings', path: '/settings', icon: Settings },
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
