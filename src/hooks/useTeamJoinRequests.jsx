import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useGlobalLoading } from './useGlobalLoading.jsx'

export const TEAM_JOIN_REQUEST_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
}

const COLLECTIONS = {
  TEAM_JOIN_REQUESTS: 'teamJoinRequests',
  TEAMS: 'teams',
  TEAM_MEMBERS: 'teamMembers',
}

function mapSnapshot(snapshot) {
  return snapshot.docs.map((requestDoc) => ({ id: requestDoc.id, ...requestDoc.data() }))
}

function buildJoinRequestQuery({ teamId, playerId, coachId, status } = {}) {
  const constraints = [orderBy('createdAt', 'desc')]
  if (teamId) constraints.unshift(where('teamId', '==', teamId))
  if (playerId) constraints.unshift(where('playerId', '==', playerId))
  if (coachId) constraints.unshift(where('coachId', '==', coachId))
  if (status) constraints.unshift(where('status', '==', status))
  return query(collection(db, COLLECTIONS.TEAM_JOIN_REQUESTS), ...constraints)
}

async function assertCanAcceptRequest(request) {
  const teamSnap = await getDoc(doc(db, COLLECTIONS.TEAMS, request.teamId))
  if (!teamSnap.exists()) throw new Error('Team not found.')

  const team = teamSnap.data()
  const membersQuery = query(
    collection(db, COLLECTIONS.TEAM_MEMBERS),
    where('teamId', '==', request.teamId),
    where('status', '==', 'ACTIVE'),
  )
  const membersSnap = await getDocs(membersQuery)

  if (membersSnap.docs.some((memberDoc) => memberDoc.data().playerId === request.playerId)) {
    throw new Error('Player is already on this team roster.')
  }

  if (team.maxPlayers && membersSnap.size >= team.maxPlayers) {
    throw new Error('Team roster is full.')
  }
}

async function addTeamMemberFromRequest(request) {
  await addDoc(collection(db, COLLECTIONS.TEAM_MEMBERS), {
    teamId: request.teamId,
    teamName: request.teamName || '',
    eventId: request.eventId || '',
    eventName: request.eventName || '',
    playerId: request.playerId,
    playerName: request.playerName || '',
    playerEmail: request.playerEmail || '',
    status: 'ACTIVE',
    joinedAt: serverTimestamp(),
  })
}

export function useTeamJoinRequests(filters = {}) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const filterKey = JSON.stringify(filters)

  useEffect(() => {
    const unsubscribe = onSnapshot(
      buildJoinRequestQuery(filters),
      (snapshot) => {
        setRequests(mapSnapshot(snapshot))
        setLoading(false)
      },
      (snapshotError) => {
        setError(snapshotError.message)
        setLoading(false)
      },
    )

    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey])

  const state = useMemo(() => ({ requests, loading, error }), [error, loading, requests])

  return state
}

export function useTeamJoinRequestActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { startLoading } = useGlobalLoading()

  const runAction = useCallback(
    async (label, action) => {
      setLoading(true)
      setError('')
      const stopGlobalLoading = startLoading(label)

      try {
        return await action()
      } catch (actionError) {
        setError(actionError.message)
        throw actionError
      } finally {
        stopGlobalLoading()
        setLoading(false)
      }
    },
    [startLoading],
  )

  const getJoinRequests = useCallback(
    (filters = {}) =>
      runAction('Loading team join requests...', async () => {
        const snapshot = await getDocs(buildJoinRequestQuery(filters))
        return mapSnapshot(snapshot)
      }),
    [runAction],
  )

  const createJoinRequest = useCallback(
    (data, playerId) =>
      runAction('Sending team join request...', async () => {
        const existingQuery = query(
          collection(db, COLLECTIONS.TEAM_JOIN_REQUESTS),
          where('teamId', '==', data.teamId),
          where('playerId', '==', playerId),
          where('status', '==', TEAM_JOIN_REQUEST_STATUS.PENDING),
        )
        const existing = await getDocs(existingQuery)

        if (!existing.empty) {
          throw new Error('You already have a pending request for this team.')
        }

        const docRef = await addDoc(collection(db, COLLECTIONS.TEAM_JOIN_REQUESTS), {
          teamId: data.teamId,
          teamName: data.teamName || '',
          eventId: data.eventId || '',
          eventName: data.eventName || '',
          coachId: data.coachId || '',
          playerId,
          playerName: data.playerName || '',
          playerEmail: data.playerEmail || '',
          message: data.message?.trim() || '',
          status: TEAM_JOIN_REQUEST_STATUS.PENDING,
          createdAt: serverTimestamp(),
          reviewedAt: null,
          reviewedBy: null,
        })

        return docRef.id
      }),
    [runAction],
  )

  const updateJoinRequest = useCallback(
    (requestId, updates) =>
      runAction('Updating team join request...', async () => {
        await updateDoc(doc(db, COLLECTIONS.TEAM_JOIN_REQUESTS, requestId), updates)
      }),
    [runAction],
  )

  const acceptJoinRequest = useCallback(
    (request, reviewerId) =>
      runAction('Accepting team join request...', async () => {
        await assertCanAcceptRequest(request)
        await updateDoc(doc(db, COLLECTIONS.TEAM_JOIN_REQUESTS, request.id), {
          status: TEAM_JOIN_REQUEST_STATUS.ACCEPTED,
          reviewedAt: serverTimestamp(),
          reviewedBy: reviewerId,
        })
        await addTeamMemberFromRequest(request)
      }),
    [runAction],
  )

  const rejectJoinRequest = useCallback(
    (requestId, reviewerId) =>
      runAction('Rejecting team join request...', async () => {
        await updateDoc(doc(db, COLLECTIONS.TEAM_JOIN_REQUESTS, requestId), {
          status: TEAM_JOIN_REQUEST_STATUS.REJECTED,
          reviewedAt: serverTimestamp(),
          reviewedBy: reviewerId,
        })
      }),
    [runAction],
  )

  const deleteJoinRequest = useCallback(
    (requestId) =>
      runAction('Deleting team join request...', async () => {
        await deleteDoc(doc(db, COLLECTIONS.TEAM_JOIN_REQUESTS, requestId))
      }),
    [runAction],
  )

  return {
    loading,
    error,
    getJoinRequests,
    createJoinRequest,
    updateJoinRequest,
    acceptJoinRequest,
    rejectJoinRequest,
    deleteJoinRequest,
  }
}
