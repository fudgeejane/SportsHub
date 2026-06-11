import { useCallback, useMemo, useState } from 'react'
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { generateBalancedBracket, groupMatchesByRound } from '../utils/scheduling'
import { toastError, toastSuccess } from '../utils/toast'
import { ROLES } from '../contexts/AuthContext'
import { useEvents } from './useEventManagement'
import { usePayment } from './usePayment'
import { useTeams } from './useTeamManagement'
import { useAuth } from './useAuth'

export function useBrackets(eventId = '') {
  const { currentUser, role, userProfile } = useAuth()
  const { events, loading: eventsLoading } = useEvents()
  const { teams, members, loading: teamsLoading } = useTeams()
  const { payments, eventTeamsReady, loading: paymentsLoading } = usePayment()
  const [error, setError] = useState('')

  const event = useMemo(() => events.find((entry) => entry.id === eventId) || null, [eventId, events])

  const eventTeams = useMemo(() => {
    if (!eventId) return []
    const registeredTeamIds = new Set(
      payments
        .filter((payment) => payment.eventId === eventId && payment.status !== 'CANCELLED')
        .map((payment) => payment.teamId),
    )
    return teams.filter((team) => registeredTeamIds.has(team.id) && team.status === 'ACTIVE')
  }, [eventId, payments, teams])

  const schedulableTeams = useMemo(
    () => eventTeams.filter((team) => eventTeamsReady([team.id])),
    [eventTeams, eventTeamsReady],
  )

  const assignedFacilitator = event?.facilitatorId === currentUser?.uid
  const canManageSchedule = role === ROLES.COMMUNITY_ORGANIZER || role === ROLES.ADMIN || (role === ROLES.FACILITATOR && assignedFacilitator)
  const canSchedule = canManageSchedule && schedulableTeams.length >= 2

  const playerProfiles = useMemo(() => {
    const profiles = { [userProfile?.uid]: userProfile }
    members.forEach((m) => {
      profiles[m.playerId] = { skillLevel: m.skillLevel }
    })
    return profiles
  }, [members, userProfile])

  const schedule = useMemo(() => event?.schedule || [], [event?.schedule])
  const bracket = useMemo(() => groupMatchesByRound(schedule), [schedule])

  const generateBracket = useCallback(async () => {
    try {
      if (!eventId || !event) throw new Error('Select an event.')
      if (!canManageSchedule) throw new Error('Only the assigned facilitator can generate schedules and brackets for this event.')
      if (!canSchedule) throw new Error('All teams need approved payments before scheduling.')

      const matches = generateBalancedBracket(schedulableTeams, members, playerProfiles, '09:00')

      await updateDoc(doc(db, 'events', eventId), {
        schedule: matches,
        bracketGeneratedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      toastSuccess('Bracket generated with balanced matchups.')
      return matches
    } catch (bracketError) {
      toastError(bracketError.message)
      setError(bracketError.message)
      throw bracketError
    }
  }, [canManageSchedule, canSchedule, event, eventId, members, playerProfiles, schedulableTeams])

  const updateMatch = useCallback(
    async (gameNumber, updates) => {
      if (!event) return
      const next = (event.schedule || []).map((match) => (match.gameNumber === gameNumber ? { ...match, ...updates } : match))
      await updateDoc(doc(db, 'events', eventId), { schedule: next, updatedAt: serverTimestamp() })
      toastSuccess('Match updated.')
    },
    [event, eventId],
  )

  return {
    event,
    eventTeams,
    schedulableTeams,
    canSchedule,
    canManageSchedule,
    schedule,
    bracket,
    loading: eventsLoading || teamsLoading || paymentsLoading,
    error,
    generateBracket,
    updateMatch,
  }
}
