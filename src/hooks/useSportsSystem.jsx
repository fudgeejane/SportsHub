import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { normalizeTeamStructure } from '../constants/teamStructure'
import { ROLES } from '../contexts/AuthContext'
import { db } from '../firebase'
import { useGlobalLoading } from './useGlobalLoading.jsx'
import { useAuth } from './useAuth.jsx'

export const COLLECTIONS = {
  SPORTS: 'sports',
  EVENTS: 'events',
  TEAMS: 'teams',
  TEAM_MEMBERS: 'teamMembers',
  TEAM_JOIN_REQUESTS: 'teamJoinRequests',
}

export const JOIN_REQUEST_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
}

function snapshotRows(snapshot) {
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }))
}

function useLiveCollection(collectionName) {
  const itemsQuery = useMemo(
    () => query(collection(db, collectionName), orderBy('createdAt', 'desc')),
    [collectionName],
  )
  return useLiveQuery(itemsQuery)
}

function useLiveQuery(itemsQuery) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!itemsQuery) {
      setItems([])
      setLoading(false)
      setError('')
      return undefined
    }

    setLoading(true)
    const unsubscribe = onSnapshot(
      itemsQuery,
      (snapshot) => {
        setItems(snapshotRows(snapshot))
        setLoading(false)
      },
      (snapshotError) => {
        setError(snapshotError.message)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [itemsQuery])

  return { items, loading, error }
}

function normalizeNumber(value, fallback = 0) {
  if (value === '' || value === null || value === undefined) return fallback
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

const organizerRoles = [ROLES.COMMUNITY_ORGANIZER, ROLES.ADMIN]

export function useSportsSystem() {
  const { currentUser, userProfile, role } = useAuth()
  const sportsState = useLiveCollection(COLLECTIONS.SPORTS)
  const eventsState = useLiveCollection(COLLECTIONS.EVENTS)
  const teamsState = useLiveCollection(COLLECTIONS.TEAMS)
  const membersState = useLiveCollection(COLLECTIONS.TEAM_MEMBERS)
  const joinRequestsQuery = useMemo(() => {
    if (!currentUser?.uid || !role) return null

    const base = collection(db, COLLECTIONS.TEAM_JOIN_REQUESTS)

    if (role === ROLES.COACH) {
      return query(base, where('coachId', '==', currentUser.uid), orderBy('createdAt', 'desc'))
    }

    if (role === ROLES.PLAYER) {
      return query(base, where('playerId', '==', currentUser.uid), orderBy('createdAt', 'desc'))
    }

    if (organizerRoles.includes(role) || role === ROLES.FACILITATOR) {
      return query(base, orderBy('createdAt', 'desc'))
    }

    return null
  }, [currentUser?.uid, role])
  const requestsState = useLiveQuery(joinRequestsQuery)
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

  const createEvent = useCallback(
    (data) =>
      runAction('Saving event...', () =>
        addDoc(collection(db, COLLECTIONS.EVENTS), {
          name: data.name?.trim(),
          sportId: data.sportId,
          sportName: data.sportName || '',
          venue: data.venue?.trim() || '',
          eventDate: data.eventDate || '',
          startTime: data.startTime || '',
          endTime: data.endTime || '',
          status: data.status || 'OPEN',
          createdBy: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }),
      ),
    [currentUser, runAction],
  )

  const updateEvent = useCallback(
    (eventId, data) =>
      runAction('Updating event...', () =>
        updateDoc(doc(db, COLLECTIONS.EVENTS, eventId), {
          ...data,
          updatedAt: serverTimestamp(),
        }),
      ),
    [runAction],
  )

  const createTeam = useCallback(
    (data) =>
      runAction('Saving team...', () =>
        addDoc(collection(db, COLLECTIONS.TEAMS), {
          name: data.name?.trim(),
          sportId: data.sportId,
          sportName: data.sportName || '',
          eventId: data.eventId,
          eventName: data.eventName || '',
          coachId: data.coachId || currentUser.uid,
          coachName: data.coachName || userProfile?.displayName || currentUser.email,
          minPlayers: normalizeNumber(data.minPlayers, 5),
          maxPlayers: normalizeNumber(data.maxPlayers, 12),
          registrationType: data.registrationType || 'PLAYER_REQUEST',
          status: 'ACTIVE',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }),
      ),
    [currentUser, runAction, userProfile],
  )

  const updateTeam = useCallback(
    (teamId, data) =>
      runAction('Updating team...', () =>
        updateDoc(doc(db, COLLECTIONS.TEAMS, teamId), {
          ...data,
          updatedAt: serverTimestamp(),
        }),
      ),
    [runAction],
  )

  const createJoinRequest = useCallback(
    (team, message = '') =>
      runAction('Sending join request...', async () => {
        const existing = await getDocs(
          query(
            collection(db, COLLECTIONS.TEAM_JOIN_REQUESTS),
            where('teamId', '==', team.id),
            where('playerId', '==', currentUser.uid),
            where('status', '==', JOIN_REQUEST_STATUS.PENDING),
          ),
        )

        if (!existing.empty) {
          throw new Error('You already have a pending request for this team.')
        }

        await addDoc(collection(db, COLLECTIONS.TEAM_JOIN_REQUESTS), {
          teamId: team.id,
          teamName: team.name,
          eventId: team.eventId,
          eventName: team.eventName,
          sportId: team.sportId,
          sportName: team.sportName,
          coachId: team.coachId,
          playerId: currentUser.uid,
          playerName: userProfile?.displayName || currentUser.email,
          playerEmail: currentUser.email,
          message: message.trim(),
          status: JOIN_REQUEST_STATUS.PENDING,
          createdAt: serverTimestamp(),
          reviewedAt: null,
          reviewedBy: null,
        })
      }),
    [currentUser, runAction, userProfile],
  )

  const acceptJoinRequest = useCallback(
    (request) =>
      runAction('Accepting player...', async () => {
        const teamMembers = membersState.items.filter((member) => member.teamId === request.teamId && member.status === 'ACTIVE')
        const team = teamsState.items.find((item) => item.id === request.teamId)

        if (team?.maxPlayers && teamMembers.length >= team.maxPlayers) {
          throw new Error('Team roster is full.')
        }

        if (teamMembers.some((member) => member.playerId === request.playerId)) {
          throw new Error('Player is already on this roster.')
        }

        await updateDoc(doc(db, COLLECTIONS.TEAM_JOIN_REQUESTS, request.id), {
          status: JOIN_REQUEST_STATUS.ACCEPTED,
          reviewedAt: serverTimestamp(),
          reviewedBy: currentUser.uid,
        })
        await addDoc(collection(db, COLLECTIONS.TEAM_MEMBERS), {
          teamId: request.teamId,
          teamName: request.teamName,
          eventId: request.eventId,
          eventName: request.eventName,
          sportId: request.sportId,
          sportName: request.sportName,
          coachId: request.coachId,
          playerId: request.playerId,
          playerName: request.playerName,
          playerEmail: request.playerEmail,
          status: 'ACTIVE',
          joinedAt: serverTimestamp(),
        })
      }),
    [currentUser, membersState.items, runAction, teamsState.items],
  )

  const rejectJoinRequest = useCallback(
    (requestId) =>
      runAction('Rejecting player...', () =>
        updateDoc(doc(db, COLLECTIONS.TEAM_JOIN_REQUESTS, requestId), {
          status: JOIN_REQUEST_STATUS.REJECTED,
          reviewedAt: serverTimestamp(),
          reviewedBy: currentUser.uid,
        }),
      ),
    [currentUser, runAction],
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
      events: eventsState.items,
      teams: teamsState.items,
      members: membersState.items,
      requests: requestsState.items,
      loading:
        sportsState.loading ||
        eventsState.loading ||
        teamsState.loading ||
        membersState.loading ||
        requestsState.loading,
      error:
        actionError ||
        sportsState.error ||
        eventsState.error ||
        teamsState.error ||
        membersState.error ||
        requestsState.error,
    }),
    [actionError, eventsState, membersState, requestsState, sportsState, teamsState],
  )

  return {
    ...data,
    createSport,
    updateSport,
    archiveSport,
    createEvent,
    updateEvent,
    updateSportTeamStructure,
    createTeam,
    updateTeam,
    createJoinRequest,
    acceptJoinRequest,
    rejectJoinRequest,
    updateProfile,
  }
}
