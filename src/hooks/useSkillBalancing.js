import { useCallback } from 'react'
import { canAcceptPlayer, canTransferPlayer, evaluateEventBalance, suggestBalancedTeam } from '../utils/skillBalancing'

export function useSkillBalancing() {
  const checkEventBalance = useCallback((teams, members, playerProfiles) => evaluateEventBalance(teams, members, playerProfiles), [])

  const canAddPlayer = useCallback(
    (teamId, teamMembers, playerSkill, teams, members, playerProfiles) =>
      canAcceptPlayer(teamId, teamMembers, playerSkill, teams, members, playerProfiles),
    [],
  )

  const canMovePlayer = useCallback(
    (fromMembers, toMembers, playerSkill) => canTransferPlayer(fromMembers, toMembers, playerSkill),
    [],
  )

  const suggestTeam = useCallback(
    (teams, members, playerProfiles, playerSkill) => suggestBalancedTeam(teams, members, playerProfiles, playerSkill),
    [],
  )

  return { checkEventBalance, canAddPlayer, canMovePlayer, suggestTeam }
}
