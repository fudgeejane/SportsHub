export const REGISTRATION_TYPES = {
  PLAYER_REQUEST: 'PLAYER_REQUEST',
  ORGANIZER_ASSIGN: 'ORGANIZER_ASSIGN',
  OPEN: 'OPEN',
}

export function emptyTeamStructure() {
  return {
    minTeams: 2,
    maxTeams: 4,
    minPlayersPerTeam: 5,
    maxPlayersPerTeam: 12,
    registrationType: REGISTRATION_TYPES.PLAYER_REQUEST,
    roles: ['PLAYER', 'COACH'],
    rules: '',
  }
}

export function normalizeTeamStructure(value) {
  const base = emptyTeamStructure()
  if (!value || typeof value !== 'object') return base

  return {
    minTeams: Number(value.minTeams) || base.minTeams,
    maxTeams: Number(value.maxTeams) || base.maxTeams,
    minPlayersPerTeam: Number(value.minPlayersPerTeam) || base.minPlayersPerTeam,
    maxPlayersPerTeam: Number(value.maxPlayersPerTeam) || base.maxPlayersPerTeam,
    registrationType: value.registrationType || base.registrationType,
    roles: Array.isArray(value.roles) && value.roles.length ? value.roles : base.roles,
    rules: typeof value.rules === 'string' ? value.rules : base.rules,
  }
}

export function isValidTeamStructure(value) {
  const structure = normalizeTeamStructure(value)
  return (
    structure.minTeams >= 1 &&
    structure.maxTeams >= structure.minTeams &&
    structure.minPlayersPerTeam >= 1 &&
    structure.maxPlayersPerTeam >= structure.minPlayersPerTeam
  )
}
