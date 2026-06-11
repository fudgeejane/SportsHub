import { useCallback, useMemo } from 'react'
import { ROLES } from '../contexts/AuthContext'
import { SKILL_LEVELS } from '../utils/skillBalancing'
import { useSportManagement } from './useSportManagement'
import { useAvailableTeams } from './useTeamManagement'

export function useSignup(form) {
  const isPlayer = form.role === ROLES.PLAYER
  const { sports, loading: sportsLoading, error: sportsError } = useSportManagement()
  const { teams, loading: teamsLoading, error: teamsError } = useAvailableTeams(form.preferredSportId)

  const selectedSport = useMemo(
    () => sports.find((sport) => sport.id === form.preferredSportId) || null,
    [form.preferredSportId, sports],
  )

  const validate = useCallback(() => {
    if (isPlayer) {
      if (!form.preferredSportId) return 'Select a sport from the organizer list.'
      if (!selectedSport) return 'Selected sport is not available. Choose an organizer-created sport.'
      if (!form.selectedTeamId) return 'Select a team under your chosen sport.'
      if (!teams.some((team) => team.id === form.selectedTeamId)) return 'Selected team is not available for this sport.'
      if (!form.skillLevel) return 'Select your skill level.'
      if (!SKILL_LEVELS.includes(form.skillLevel)) return 'Invalid skill level.'
    }

    return ''
  }, [form.preferredSportId, form.selectedTeamId, form.skillLevel, isPlayer, selectedSport, teams])

  const signupPayload = useMemo(
    () => ({
      ...form,
      preferredSport: selectedSport?.name || form.preferredSport,
      preferredSportTeamStructure: selectedSport?.teamStructure || null,
      selectedTeamName: teams.find((team) => team.id === form.selectedTeamId)?.name || form.selectedTeamName || '',
      selectedTeamCoachId: teams.find((team) => team.id === form.selectedTeamId)?.coachId || '',
    }),
    [form, selectedSport, teams],
  )

  return {
    sports,
    sportsLoading,
    sportsError,
    teams,
    teamsLoading,
    teamsError,
    selectedSport,
    validate,
    signupPayload,
    isPlayer,
  }
}
