import { createContext } from 'react'

export const ROLES = {
  ADMIN: 'ADMIN',
  COMMUNITY_ORGANIZER: 'COMMUNITY_ORGANIZER',
  COACH: 'COACH',
  FACILITATOR: 'FACILITATOR',
  PLAYER: 'PLAYER',
}

export const STATUSES = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
}

export const AuthContext = createContext(null)
