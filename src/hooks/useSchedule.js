import { useBrackets } from './useBrackets'

export function useSchedule(eventId = '') {
  const brackets = useBrackets(eventId)

  return {
    events: brackets.event ? [brackets.event] : [],
    event: brackets.event,
    eventTeams: brackets.eventTeams,
    schedulableTeams: brackets.schedulableTeams,
    schedule: brackets.schedule,
    bracket: brackets.bracket,
    loading: brackets.loading,
    error: brackets.error,
    canSchedule: brackets.canSchedule,
    generateSchedule: brackets.generateBracket,
    updateMatch: brackets.updateMatch,
  }
}
