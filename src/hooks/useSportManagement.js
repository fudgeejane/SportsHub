import { useCallback, useMemo, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './useAuth'
import { useEventManagement } from './useEventManagement'
import { useGlobalLoading } from '../components/loading/Loading'
import { useLiveCollection } from './useLiveCollection'
import { useRegistrationManagement } from './useRegistrationManagement'
import { useTeamManagement } from './useTeamManagement'

const ACTIVE_SPORT_CONSTRAINTS = [where('status', '==', 'active')]
const SPORTS = 'sports'

function normalizeNumber(value, fallback = 0) {
  if (value === '' || value === null || value === undefined) return fallback
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

export const SPORT_TYPES = {
  TEAM: 'team',
  INDIVIDUAL: 'individual',
}

export function emptyTeamStructure() {
  return {
    minTeams: 2,
    maxTeams: 4,
    minPlayers: 5,
    maxPlayers: 12,
    allowedSubstitutes: 0,
    rules: '',
  }
}

export function normalizeTeamStructure(value) {
  const base = emptyTeamStructure()
  if (!value || typeof value !== 'object') return base

  const minPlayers = normalizeNumber(value.minPlayers ?? value.minPlayersPerTeam, base.minPlayers)
  const maxPlayers = normalizeNumber(value.maxPlayers ?? value.maxPlayersPerTeam, base.maxPlayers)

  return {
    minTeams: normalizeNumber(value.minTeams, base.minTeams),
    maxTeams: normalizeNumber(value.maxTeams, base.maxTeams),
    minPlayers,
    maxPlayers,
    minPlayersPerTeam: minPlayers,
    maxPlayersPerTeam: maxPlayers,
    allowedSubstitutes: normalizeNumber(value.allowedSubstitutes, base.allowedSubstitutes),
    rules: typeof value.rules === 'string' ? value.rules : base.rules,
  }
}

export function isValidTeamStructure(value) {
  const structure = normalizeTeamStructure(value)
  return (
    structure.minTeams >= 1 &&
    structure.maxTeams >= structure.minTeams &&
    structure.minPlayers >= 1 &&
    structure.maxPlayers >= structure.minPlayers &&
    structure.allowedSubstitutes >= 0
  )
}

function normalizeSportPayload(data, currentUserId) {
  const sportName = data.sportName ?? data.name
  const sportType = data.sportType ?? (data.teamStructure ? SPORT_TYPES.TEAM : SPORT_TYPES.INDIVIDUAL)
  const teamStructure = sportType === SPORT_TYPES.TEAM ? normalizeTeamStructure(data.teamStructure ?? data) : null

  return {
    sportName: sportName?.trim(),
    name: sportName?.trim(),
    sportType,
    minPlayers: teamStructure?.minPlayers ?? normalizeNumber(data.minPlayers, 1),
    maxPlayers: teamStructure?.maxPlayers ?? normalizeNumber(data.maxPlayers, 1),
    allowedSubstitutes: teamStructure?.allowedSubstitutes ?? normalizeNumber(data.allowedSubstitutes, 0),
    description: data.description?.trim() || '',
    rules: data.rules ?? teamStructure?.rules ?? '',
    teamStructure,
    status: data.status || 'active',
    createdBy: data.createdBy || currentUserId || '',
  }
}

function isAvailableSport(sport) {
  const status = String(sport?.status || '').toLowerCase()
  return Boolean(status === 'active' && (sport.sportType === SPORT_TYPES.INDIVIDUAL || isValidTeamStructure(sport.teamStructure)))
}

export function useAvailableSports() {
  const sportsState = useLiveCollection(SPORTS, ACTIVE_SPORT_CONSTRAINTS)

  return useMemo(
    () => ({
      sports: sportsState.items.filter(isAvailableSport),
      loading: sportsState.loading,
      error: sportsState.error,
    }),
    [sportsState.error, sportsState.items, sportsState.loading],
  )
}

export function useSportManagement() {
  const { currentUser } = useAuth()
  const sportsState = useLiveCollection(SPORTS)
  const eventsHook = useEventManagement()
  const teamsHook = useTeamManagement()
  const registration = useRegistrationManagement()
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
        addDoc(collection(db, SPORTS), {
          ...normalizeSportPayload(data, currentUser?.uid),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }),
      ),
    [currentUser, runAction],
  )

  const updateSport = useCallback(
    (sportId, data) =>
      runAction('Updating sport...', () =>
        updateDoc(doc(db, SPORTS, sportId), {
          ...normalizeSportPayload(data, currentUser?.uid),
          updatedAt: serverTimestamp(),
        }),
      ),
    [currentUser, runAction],
  )

  const updateSportTeamStructure = useCallback(
    (sportId, teamStructure) =>
      runAction('Saving team structure...', () =>
        updateDoc(doc(db, SPORTS, sportId), {
          sportType: SPORT_TYPES.TEAM,
          teamStructure: normalizeTeamStructure(teamStructure),
          updatedAt: serverTimestamp(),
        }),
      ),
    [runAction],
  )

  const archiveSport = useCallback(
    (sportId) =>
      runAction('Archiving sport...', () =>
        updateDoc(doc(db, SPORTS, sportId), {
          status: 'archived',
          updatedAt: serverTimestamp(),
        }),
      ),
    [runAction],
  )

  const deleteSport = useCallback(
    (sportId) => runAction('Deleting sport...', () => deleteDoc(doc(db, SPORTS, sportId))),
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

  return useMemo(
    () => ({
      sports: sportsState.items,
      events: eventsHook.events,
      schedules: eventsHook.schedules,
      teams: teamsHook.teams,
      members: teamsHook.members,
      requests: registration.requests,
      registrations: registration.registrations,
      loading: sportsState.loading || eventsHook.loading || teamsHook.loading || registration.loading,
      error: actionError || sportsState.error || eventsHook.error || teamsHook.error || registration.error,
      createSport,
      updateSport,
      archiveSport,
      deleteSport,
      updateSportTeamStructure,
      createEvent: eventsHook.createEvent,
      updateEvent: eventsHook.updateEvent,
      deleteEvent: eventsHook.deleteEvent,
      createSchedule: eventsHook.createSchedule,
      updateSchedule: eventsHook.updateSchedule,
      deleteSchedule: eventsHook.deleteSchedule,
      assignFacilitators: eventsHook.assignFacilitators,
      createTeam: teamsHook.createTeam,
      updateTeam: teamsHook.updateTeam,
      deleteTeam: teamsHook.deleteTeam,
      addMember: teamsHook.addMember,
      removeMember: teamsHook.removeMember,
      registerTeamForEvent: registration.registerTeamForEvent,
      updateTeamRegistration: teamsHook.updateTeamRegistration,
      removeTeamRegistration: teamsHook.removeTeamRegistration,
      updateEventRegistration: registration.updateRegistration,
      removeEventRegistration: registration.cancelRegistration,
      updateTeamMemberAssignment: teamsHook.updateTeamMemberAssignment,
      updateTeamFee: teamsHook.updateTeamFee,
      createJoinRequest: registration.createJoinRequest,
      acceptJoinRequest: registration.acceptJoinRequest,
      rejectJoinRequest: registration.rejectJoinRequest,
      updateProfile,
    }),
    [
      actionError,
      archiveSport,
      createSport,
      deleteSport,
      eventsHook,
      registration,
      sportsState,
      teamsHook,
      updateProfile,
      updateSport,
      updateSportTeamStructure,
    ],
  )
}

export const useSportsSystem = useSportManagement
