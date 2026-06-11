import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'
import { evaluateEventBalance, suggestBalancedTeam } from '../utils/skillBalancing'
import { useAuth } from './useAuth'
import { PAYMENT_STATUS } from './usePayment'
import { useGlobalLoading } from '../components/loading/Loading'

const TEAMS = 'teams'
const TEAM_MEMBERS = 'teamMembers'
const PAYMENTS = 'payments'
const REGISTRATIONS = 'registrations'

function snapshotRows(snapshot) {
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }))
}

function normalizeNumber(value, fallback = 0) {
  if (value === '' || value === null || value === undefined) return fallback
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function normalizeTeamPayload(data, currentUser, userProfile) {
  const teamName = data.teamName ?? data.name

  return {
    teamName: teamName?.trim(),
    name: teamName?.trim(),
    sportId: data.sportId,
    sportName: data.sportName || '',
    coachId: data.coachId || currentUser?.uid || '',
    coachName: data.coachName || userProfile?.displayName || currentUser?.email || '',
    members: data.members || [],
    minPlayers: normalizeNumber(data.minPlayers, 5),
    maxPlayers: normalizeNumber(data.maxPlayers, 12),
    status: data.status || 'active',
  }
}

export function validateTeamAgainstSport(team, sport) {
  if (!sport) return { valid: true, reason: '' }
  const memberCount = team.members?.length || 0
  const minPlayers = sport.minPlayers ?? sport.teamStructure?.minPlayers ?? sport.teamStructure?.minPlayersPerTeam
  const maxPlayers = sport.maxPlayers ?? sport.teamStructure?.maxPlayers ?? sport.teamStructure?.maxPlayersPerTeam

  if (minPlayers && memberCount < minPlayers) return { valid: false, reason: `Team needs at least ${minPlayers} players.` }
  if (maxPlayers && memberCount > maxPlayers) return { valid: false, reason: `Team can only have ${maxPlayers} players.` }
  return { valid: true, reason: '' }
}

export function useAvailableTeams(sportId) {
  const { teams, loading, error } = useTeamManagement(sportId)

  return useMemo(
    () => ({
      teams: teams.filter(
        (team) =>
          team?.coachId &&
          String(team?.status || '').toLowerCase() === 'active' &&
          team?.sportId &&
          (!sportId || team.sportId === sportId),
      ),
      loading: sportId ? loading : false,
      error,
    }),
    [error, loading, sportId, teams],
  )
}

export function useTeamManagement(sportId = '') {
  const { currentUser, userProfile } = useAuth()
  const { startLoading } = useGlobalLoading()
  const [teams, setTeams] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const teamsQuery = sportId
      ? query(collection(db, TEAMS), where('sportId', '==', sportId), orderBy('createdAt', 'desc'))
      : query(collection(db, TEAMS), orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(
      teamsQuery,
      (snapshot) => {
        setTeams(snapshotRows(snapshot))
        setLoading(false)
        setError('')
      },
      (snapshotError) => {
        setError(snapshotError.message)
        setLoading(false)
      },
    )
    return unsubscribe
  }, [sportId])

  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(db, TEAM_MEMBERS), orderBy('joinedAt', 'desc')), (snapshot) => {
      setMembers(snapshotRows(snapshot))
    })
    return unsubscribe
  }, [])

  const runAction = useCallback(
    async (label, action) => {
      const stop = startLoading(label)
      try {
        return await action()
      } catch (actionError) {
        setError(actionError.message)
        throw actionError
      } finally {
        stop()
      }
    },
    [startLoading],
  )

  const createTeam = useCallback(
    (data) =>
      runAction('Creating team...', async () => {
        if (!data.sportId) throw new Error('Select a sport.')

        return addDoc(collection(db, TEAMS), {
          ...normalizeTeamPayload(data, currentUser, userProfile),
          eventId: data.eventId || '',
          eventName: data.eventName || '',
          eventFacilitatorId: data.eventFacilitatorId || '',
          fee: normalizeNumber(data.fee, 0),
          paymentMethod: data.paymentMethod || '',
          paymentProof: data.paymentProof || '',
          paymentStatus: data.paymentStatus || '',
          eventParticipationStatus: data.eventParticipationStatus || '',
          aggregatedTeamSkill: normalizeNumber(data.aggregatedTeamSkill, 0),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }),
    [currentUser, runAction, userProfile],
  )

  const updateTeam = useCallback(
    (teamId, data) =>
      runAction('Updating team...', () =>
        updateDoc(doc(db, TEAMS, teamId), {
          ...data,
          teamName: data.teamName ?? data.name ?? data.teamName,
          name: data.name ?? data.teamName ?? data.name,
          updatedAt: serverTimestamp(),
        }),
      ),
    [runAction],
  )

  const deleteTeam = useCallback(
    (teamId) => runAction('Deleting team...', () => deleteDoc(doc(db, TEAMS, teamId))),
    [runAction],
  )

  const addMember = useCallback(
    (teamId, member) =>
      runAction('Adding member...', async () => {
        await updateDoc(doc(db, TEAMS, teamId), {
          members: arrayUnion(member),
          updatedAt: serverTimestamp(),
        })
      }),
    [runAction],
  )

  const removeMember = useCallback(
    (teamId, member) =>
      runAction('Removing member...', async () => {
        await updateDoc(doc(db, TEAMS, teamId), {
          members: arrayRemove(member),
          updatedAt: serverTimestamp(),
        })
      }),
    [runAction],
  )

  const updateTeamFee = useCallback(
    (teamId, fee) =>
      runAction('Updating fee...', () =>
        updateDoc(doc(db, TEAMS, teamId), {
          fee: normalizeNumber(fee, 0),
          updatedAt: serverTimestamp(),
        }),
      ),
    [runAction],
  )

  const updateTeamRegistration = useCallback(
    (teamId, data) =>
      runAction('Updating registration...', async () => {
        const fee = normalizeNumber(data.fee, 0)
        const teamUpdates = {
          teamName: data.teamName ?? data.name?.trim(),
          name: data.name?.trim() ?? data.teamName,
          sportId: data.sportId,
          sportName: data.sportName || '',
          eventId: data.eventId,
          eventName: data.eventName || '',
          eventFacilitatorId: data.eventFacilitatorId || '',
          minPlayers: normalizeNumber(data.minPlayers, 5),
          maxPlayers: normalizeNumber(data.maxPlayers, 12),
          fee,
          paymentMethod: data.paymentMethod,
          paymentProof: data.paymentProof?.trim() || '',
          status: data.status || 'active',
          updatedAt: serverTimestamp(),
        }

        await updateDoc(doc(db, TEAMS, teamId), teamUpdates)

        const relatedUpdates = {
          eventId: data.eventId,
          eventName: data.eventName || '',
          sportId: data.sportId,
          sportName: data.sportName || '',
          teamName: data.name?.trim() ?? data.teamName,
          facilitatorId: data.eventFacilitatorId || '',
          amount: fee,
          paymentMethod: data.paymentMethod,
          paymentProof: data.paymentProof?.trim() || '',
          status: data.status === 'archived' ? 'cancelled' : 'pending',
          updatedAt: serverTimestamp(),
        }

        const paymentSnapshot = await getDocs(query(collection(db, PAYMENTS), where('teamId', '==', teamId)))
        await Promise.all(paymentSnapshot.docs.map((entry) => updateDoc(doc(db, PAYMENTS, entry.id), relatedUpdates)))

        const registrationSnapshot = await getDocs(query(collection(db, REGISTRATIONS), where('teamId', '==', teamId)))
        await Promise.all(registrationSnapshot.docs.map((entry) => updateDoc(doc(db, REGISTRATIONS, entry.id), relatedUpdates)))
      }),
    [runAction],
  )

  const removeTeamRegistration = useCallback(
    (teamId) =>
      runAction('Removing registration...', async () => {
        await updateDoc(doc(db, TEAMS, teamId), {
          status: 'archived',
          eventParticipationStatus: 'cancelled',
          updatedAt: serverTimestamp(),
        })

        const relatedUpdates = {
          status: 'cancelled',
          updatedAt: serverTimestamp(),
        }

        const paymentSnapshot = await getDocs(query(collection(db, PAYMENTS), where('teamId', '==', teamId)))
        await Promise.all(paymentSnapshot.docs.map((entry) => updateDoc(doc(db, PAYMENTS, entry.id), relatedUpdates)))

        const registrationSnapshot = await getDocs(query(collection(db, REGISTRATIONS), where('teamId', '==', teamId)))
        await Promise.all(registrationSnapshot.docs.map((entry) => updateDoc(doc(db, REGISTRATIONS, entry.id), relatedUpdates)))
      }),
    [runAction],
  )

  const updateTeamMemberAssignment = useCallback(
    (member, nextTeam) =>
      runAction('Reassigning player...', async () => {
        if (!member?.id) throw new Error('Player membership record is required.')
        if (!nextTeam?.id) throw new Error('Select a team.')
        if (nextTeam.coachId !== currentUser.uid) throw new Error('You can only assign players to your own teams.')

        await updateDoc(doc(db, TEAM_MEMBERS, member.id), {
          teamId: nextTeam.id,
          teamName: nextTeam.teamName || nextTeam.name || '',
          sportId: nextTeam.sportId || '',
          sportName: nextTeam.sportName || '',
          coachId: nextTeam.coachId,
          status: 'active',
          reassignedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }),
    [currentUser, runAction],
  )

  const registerTeamForEvent = useCallback(
    (data) =>
      runAction('Registering team for event...', async () => {
        if (!data.teamId) throw new Error('Select a team.')
        if (!data.eventId) throw new Error('Select an event.')
        if (!data.sportId) throw new Error('Select a sport.')
        if (!data.paymentMethod) throw new Error('Select a payment method.')
        if (!data.paymentProof?.trim()) throw new Error('Enter payment proof or reference details.')

        const payload = {
          eventId: data.eventId,
          eventName: data.eventName || '',
          sportId: data.sportId,
          sportName: data.sportName || '',
          teamId: data.teamId,
          teamName: data.teamName ?? data.name?.trim(),
          coachId: data.coachId || currentUser.uid,
          coachName: data.coachName || userProfile?.displayName || currentUser.email,
          facilitatorId: data.eventFacilitatorId || data.facilitatorId || '',
          amount: normalizeNumber(data.fee, 0),
          paymentMethod: data.paymentMethod,
          paymentProof: data.paymentProof.trim(),
          paymentStatus: PAYMENT_STATUS.PENDING,
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          reviewedAt: null,
          reviewedBy: null,
        }

        return addDoc(collection(db, REGISTRATIONS), payload)
      }),
    [currentUser, runAction, userProfile],
  )

  const updateEventRegistration = useCallback(
    (registration, data) =>
      runAction('Updating event registration...', () =>
        updateDoc(doc(db, REGISTRATIONS, registration.id), {
          ...data,
          updatedAt: serverTimestamp(),
        }),
      ),
    [runAction],
  )

  const removeEventRegistration = useCallback(
    (registration) =>
      runAction('Removing event registration...', () =>
        updateDoc(doc(db, REGISTRATIONS, registration.id), {
          status: 'cancelled',
          updatedAt: serverTimestamp(),
        }),
      ),
    [runAction],
  )

  const teamsByEvent = useCallback((eventId) => teams.filter((team) => team.eventId === eventId), [teams])

  const rosterForTeam = useCallback(
    (teamId) => members.filter((member) => member.teamId === teamId && String(member.status).toLowerCase() === 'active'),
    [members],
  )

  const getEventBalance = useCallback(
    (eventId, playerProfiles) => {
      const eventTeams = teams.filter((team) => team.eventId === eventId)
      return evaluateEventBalance(eventTeams, members, playerProfiles)
    },
    [members, teams],
  )

  const suggestTeamForPlayer = useCallback(
    (eventId, playerSkill, playerProfiles) => {
      const eventTeams = teams.filter((team) => team.eventId === eventId && String(team.status).toLowerCase() === 'active')
      return suggestBalancedTeam(eventTeams, members, playerProfiles, playerSkill)
    },
    [members, teams],
  )

  return useMemo(
    () => ({
      teams,
      members,
      loading,
      error,
      createTeam,
      updateTeam,
      deleteTeam,
      addMember,
      removeMember,
      validateTeamAgainstSport,
      registerTeamForEvent,
      updateTeamRegistration,
      removeTeamRegistration,
      updateEventRegistration,
      removeEventRegistration,
      updateTeamMemberAssignment,
      updateTeamFee,
      teamsByEvent,
      rosterForTeam,
      getEventBalance,
      suggestTeamForPlayer,
    }),
    [
      addMember,
      createTeam,
      deleteTeam,
      error,
      getEventBalance,
      loading,
      members,
      registerTeamForEvent,
      removeEventRegistration,
      removeMember,
      removeTeamRegistration,
      rosterForTeam,
      suggestTeamForPlayer,
      teams,
      teamsByEvent,
      updateEventRegistration,
      updateTeam,
      updateTeamFee,
      updateTeamMemberAssignment,
      updateTeamRegistration,
    ],
  )
}

export const useTeams = useTeamManagement
