import { averageSkill, skillWeight } from '../constants/skillLevel'

const BALANCE_TOLERANCE = 0.75

export function teamSkillTotal(members) {
  return members.reduce((sum, m) => sum + skillWeight(m.skillLevel), 0)
}

export function isBalanced(teamTotals) {
  if (teamTotals.length < 2) return true
  const avg = teamTotals.reduce((a, b) => a + b, 0) / teamTotals.length
  return teamTotals.every((t) => Math.abs(t - avg) <= BALANCE_TOLERANCE * avg + 1)
}

export function canAcceptPlayer(teamId, teamMembers, playerSkill, teams, members, playerProfiles) {
  const projected = teams.map((team) => {
    const roster = members.filter((m) => m.teamId === team.id && m.status === 'ACTIVE')
    const enriched = roster.map((m) => ({
      skillLevel: playerProfiles[m.playerId]?.skillLevel || m.skillLevel || 'Beginner',
    }))
    let total = teamSkillTotal(enriched)
    if (team.id === teamId) total += skillWeight(playerSkill)
    return total
  })
  if (projected.length < 2) return true
  return isBalanced(projected)
}

export function evaluateEventBalance(teams, members, playerProfiles) {
  const totals = teams.map((team) => {
    const roster = members.filter((m) => m.teamId === team.id && m.status === 'ACTIVE')
    const enriched = roster.map((m) => ({
      ...m,
      skillLevel: playerProfiles[m.playerId]?.skillLevel || m.skillLevel || 'Beginner',
    }))
    return { teamId: team.id, teamName: team.name, total: teamSkillTotal(enriched), avg: averageSkill(enriched), count: enriched.length }
  })
  return { totals, balanced: isBalanced(totals.map((t) => t.total)) }
}

export function canTransferPlayer(fromMembers, toMembers, playerSkill) {
  const fromTotal = teamSkillTotal(fromMembers) - skillWeight(playerSkill)
  const toTotal = teamSkillTotal(toMembers) + skillWeight(playerSkill)
  return isBalanced([fromTotal, toTotal])
}

export function suggestBalancedTeam(teams, members, playerProfiles, playerSkill) {
  const totals = teams.map((team) => {
    const roster = members.filter((m) => m.teamId === team.id && m.status === 'ACTIVE')
    const enriched = roster.map((m) => ({
      skillLevel: playerProfiles[m.playerId]?.skillLevel || 'Beginner',
    }))
    return { team, total: teamSkillTotal(enriched), count: roster.length }
  })

  const eligible = totals
    .filter((t) => !t.team.maxPlayers || t.count < t.team.maxPlayers)
    .map((t) => ({
      team: t.team,
      projectedTotal: t.total + skillWeight(playerSkill),
    }))
    .sort((a, b) => a.projectedTotal - b.projectedTotal)

  if (!eligible.length) return null

  const allTotals = totals.map((t) => t.total)
  for (const entry of eligible) {
    const projected = allTotals.map((total, i) => {
      const team = totals[i].team
      if (team.id === entry.team.id) return entry.projectedTotal
      return total
    })
    if (isBalanced(projected)) return entry.team
  }

  return eligible[0]?.team || null
}
