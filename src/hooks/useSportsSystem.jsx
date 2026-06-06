import { useCallback, useMemo, useState } from 'react'
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { normalizeTeamStructure } from '../constants/teamStructure'
import { db } from '../firebase'
import { useEvents } from './useEvents'
import { useRegistration } from './useRegistration'
import { useTeams } from './useTeams'
import { useGlobalLoading } from './useGlobalLoading.jsx'
import { useAuth } from './useAuth.jsx'
import { useLiveCollection } from './useLiveCollection'

export const COLLECTIONS = {
  SPORTS: 'sports',
  EVENTS: 'events',
  TEAMS: 'teams',
  TEAM_MEMBERS: 'teamMembers',
  TEAM_JOIN_REQUESTS: 'teamJoinRequests',
}

export { JOIN_REQUEST_STATUS } from '../utils/joinRequests'

function normalizeNumber(value, fallback = 0) {
  if (value === '' || value === null || value === undefined) return fallback
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

export function useSportsSystem() {
  const { currentUser } = useAuth()
  const sportsState = useLiveCollection(COLLECTIONS.SPORTS)
  const eventsHook = useEvents()
  const teamsHook = useTeams()
  const registration = useRegistration()
  const [actionError, setActionError] = useState('')
  const { startLoading } = useGlobalLoading()

  const runAction = useCallback(
    async (label, action) => {
      setActionError('')
      const stopLoading = startLoading(label)

      try {
        return await action()
      } catch (error) {
        setActionError(error.message)
        throw error
      } finally {
        stopLoading()
      }
    },
    [startLoading],
  )

  const createSport = useCallback(
    (data) =>
      runAction('Saving sport...', () =>
        addDoc(collection(db, COLLECTIONS.SPORTS), {
          name: data.name?.trim(),
          description: data.description?.trim() || '',
          teamStructure: normalizeTeamStructure(data.teamStructure),
          status: 'ACTIVE',
          createdBy: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }),
      ),
    [currentUser, runAction],
  )

  const updateSport = useCallback(
    (sportId, data) =>
      runAction('Updating sport...', () =>
        updateDoc(doc(db, COLLECTIONS.SPORTS, sportId), {
          name: data.name?.trim(),
          description: data.description?.trim() || '',
          updatedAt: serverTimestamp(),
        }),
      ),
    [runAction],
  )

  const updateSportTeamStructure = useCallback(
    (sportId, teamStructure) =>
      runAction('Saving team structure...', () =>
        updateDoc(doc(db, COLLECTIONS.SPORTS, sportId), {
          teamStructure: normalizeTeamStructure(teamStructure),
          updatedAt: serverTimestamp(),
        }),
      ),
    [runAction],
  )

  const archiveSport = useCallback(
    (sportId) =>
      runAction('Archiving sport...', () =>
        updateDoc(doc(db, COLLECTIONS.SPORTS, sportId), {
          status: 'ARCHIVED',
          updatedAt: serverTimestamp(),
        }),
      ),
    [runAction],
  )

  const updateProfile = useCallback(
    (data) =>
      runAction('Updating profile...', () =>
        updateDoc(doc(db, 'users', currentUser.uid), {
          displayName: data.displayName?.trim(),
          age: normalizeNumber(data.age, null),
          gender: data.gender || '',
          contactNumber: data.contactNumber?.trim() || '',
          preferredSport: data.preferredSport || '',
          preferredSportId: data.preferredSportId || '',
          preferredSportTeamStructure: data.preferredSportTeamStructure || null,
          skillLevel: data.skillLevel || '',
          updatedAt: serverTimestamp(),
        }),
      ),
    [currentUser, runAction],
  )

  const data = useMemo(
    () => ({
      sports: sportsState.items,
      events: eventsHook.events,
      teams: teamsHook.teams,
      members: teamsHook.members,
      requests: registration.requests,
      loading: sportsState.loading || eventsHook.loading || teamsHook.loading || registration.loading,
      error: actionError || sportsState.error || eventsHook.error || teamsHook.error || registration.error,
    }),
    [actionError, eventsHook, registration, sportsState, teamsHook],
  )

  return {
    ...data,
    createSport,
    updateSport,
    archiveSport,
    createEvent: eventsHook.createEvent,
    updateEvent: eventsHook.updateEvent,
    updateSportTeamStructure,
    createTeam: teamsHook.createTeam,
    registerTeamForEvent: teamsHook.registerTeamForEvent,
    updateTeam: teamsHook.updateTeam,
    updateTeamRegistration: teamsHook.updateTeamRegistration,
    removeTeamRegistration: teamsHook.removeTeamRegistration,
    updateEventRegistration: teamsHook.updateEventRegistration,
    removeEventRegistration: teamsHook.removeEventRegistration,
    updateTeamMemberAssignment: teamsHook.updateTeamMemberAssignment,
    updateTeamFee: teamsHook.updateTeamFee,
    createJoinRequest: registration.createJoinRequest,
    acceptJoinRequest: registration.acceptJoinRequest,
    rejectJoinRequest: registration.rejectJoinRequest,
    updateProfile,
  }
}
