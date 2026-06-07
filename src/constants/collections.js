export const COLLECTIONS = {
  SPORTS: 'sports',
  EVENTS: 'events',
  TEAMS: 'teams',
  TEAM_MEMBERS: 'teamMembers',
  TEAM_JOIN_REQUESTS: 'teamJoinRequests',
}

export function normalizeNumber(value, fallback = 0) {
  if (value === '' || value === null || value === undefined) return fallback
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}
