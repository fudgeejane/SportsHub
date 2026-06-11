import { averageSkill, teamSkillTotal } from './skillBalancing'

export function teamAggregateSkill(team, members, playerProfiles) {
  const roster = members.filter((m) => m.teamId === team.id && m.status === 'ACTIVE')
  const enriched = roster.map((m) => ({
    skillLevel: playerProfiles[m.playerId]?.skillLevel || m.skillLevel || 'Beginner',
  }))
  return {
    total: teamSkillTotal(enriched),
    avg: averageSkill(enriched),
    count: roster.length,
  }
}

export function generateBalancedBracket(teams, members, playerProfiles, eventStartTime) {
  const active = teams.filter((t) => t.status === 'ACTIVE')
  if (active.length < 2) return []

  const ranked = active
    .map((team) => {
      const skill = teamAggregateSkill(team, members, playerProfiles)
      return { ...team, ...skill }
    })
    .sort((a, b) => a.total - b.total)

  const matches = []
  let gameNumber = 1
  const slotMinutes = 90
  const paired = pairBalanced(ranked)

  paired.forEach(([teamA, teamB]) => {
    matches.push({
      gameNumber,
      round: 1,
      teamAId: teamA.id,
      teamAName: teamA.name,
      teamBId: teamB.id,
      teamBName: teamB.name,
      teamASkill: teamA.avg,
      teamBSkill: teamB.avg,
      startTime: offsetTime(eventStartTime, (gameNumber - 1) * slotMinutes),
      status: 'SCHEDULED',
    })
    gameNumber += 1
  })

  return matches
}

function pairBalanced(ranked) {
  const pairs = []
  let left = 0
  let right = ranked.length - 1

  while (left < right) {
    pairs.push([ranked[left], ranked[right]])
    left += 1
    right -= 1
  }

  if (left === right) {
    pairs.push([ranked[left], { id: `bye-${left}`, name: 'BYE', avg: 0, total: 0 }])
  }

  return pairs.filter(([a, b]) => a.id !== b.id)
}

function offsetTime(baseTime, minutes) {
  if (!baseTime) return ''
  const [h, m] = baseTime.split(':').map(Number)
  const total = h * 60 + m + minutes
  const nh = Math.floor(total / 60) % 24
  const nm = total % 60
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`
}

export function groupMatchesByRound(matches) {
  return matches.reduce((groups, match) => {
    const round = match.round || 1
    if (!groups[round]) groups[round] = []
    groups[round].push(match)
    return groups
  }, {})
}

export function isTeamPaymentReady(teamId, members, payments) {
  return payments.some((p) => p.teamId === teamId && p.paymentStatus === 'approved')
}
