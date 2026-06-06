import { useCallback, useEffect, useMemo, useState } from 'react'
import { addDoc, collection, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { PAYMENT_STATUS } from '../constants/registration'
import { db } from '../firebase'
import { evaluateEventBalance, suggestBalancedTeam } from '../utils/skillBalancing'
import { useGlobalLoading } from './useGlobalLoading.jsx'
import { useAuth } from './useAuth.jsx'

const TEAMS = 'teams'
const TEAM_MEMBERS = 'teamMembers'
const EVENT_REGISTRATIONS = 'eventRegistrations'
const PAYMENTS = 'payments'

function snapshotRows(snapshot) {
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }))
}

function normalizeNumber(value, fallback = 0) {
  if (value === '' || value === null || value === undefined) return fallback
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

export function useTeams(sportId = '') {
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
    const membersQuery = query(collection(db, TEAM_MEMBERS), orderBy('joinedAt', 'desc'))
    const unsubscribe = onSnapshot(
      membersQuery,
      (snapshot) => {
        setMembers(snapshotRows(snapshot))
      },
      () => {},
    )
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
          name: data.name?.trim(),
          sportId: data.sportId,
          sportName: data.sportName || '',
          eventId: '',
          eventName: '',
          eventFacilitatorId: '',
          coachId: data.coachId || currentUser.uid,
          coachName: data.coachName || userProfile?.displayName || currentUser.email,
          minPlayers: normalizeNumber(data.minPlayers, 5),
          maxPlayers: normalizeNumber(data.maxPlayers, 12),
          fee: 0,
          paymentMethod: '',
          paymentProof: '',
          paymentStatus: '',
          eventParticipationStatus: '',
          aggregatedTeamSkill: 0,
          status: 'ACTIVE',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }),
    [currentUser, runAction, userProfile],
  )

  const registerTeamForEvent = useCallback(
    (data) =>
      runAction('Registering team for event...', async () => {
        if (!data.teamId) throw new Error('Select a team.')
        if (!data.eventId) throw new Error('Select an event.')
        if (!data.sportId) throw new Error('Select a sport.')
        if (!data.paymentMethod) throw new Error('Select a payment method.')
        if (!data.paymentProof?.trim()) throw new Error('Enter payment proof or reference details.')

        const fee = normalizeNumber(data.fee, 0)
        const registrationPayload = {
          eventId: data.eventId,
          eventName: data.eventName || '',
          sportId: data.sportId,
          sportName: data.sportName || '',
          teamId: data.teamId,
          teamName: data.name?.trim(),
          coachId: data.coachId || currentUser.uid,
          coachName: data.coachName || userProfile?.displayName || currentUser.email,
          facilitatorId: data.eventFacilitatorId || '',
          amount: fee,
          paymentMethod: data.paymentMethod,
          paymentProof: data.paymentProof.trim(),
          paymentStatus: PAYMENT_STATUS.PENDING,
          status: 'PENDING',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          reviewedAt: null,
          reviewedBy: null,
        }

        const registrationRef = await addDoc(collection(db, EVENT_REGISTRATIONS), registrationPayload)
        await addDoc(collection(db, PAYMENTS), {
          ...registrationPayload,
          eventRegistrationId: registrationRef.id,
        })
        return registrationRef
      }),
    [currentUser, runAction, userProfile],
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

  const updateTeam = useCallback(
    (teamId, data) =>
      runAction('Updating team...', () =>
        updateDoc(doc(db, TEAMS, teamId), {
          ...data,
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
          name: data.name?.trim(),
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
          status: data.status || 'ACTIVE',
          updatedAt: serverTimestamp(),
        }

        await updateDoc(doc(db, TEAMS, teamId), teamUpdates)

        const relatedUpdates = {
          eventId: data.eventId,
          eventName: data.eventName || '',
          sportId: data.sportId,
          sportName: data.sportName || '',
          teamName: data.name?.trim(),
          facilitatorId: data.eventFacilitatorId || '',
          amount: fee,
          paymentMethod: data.paymentMethod,
          paymentProof: data.paymentProof?.trim() || '',
          status: data.status === 'ARCHIVED' ? 'CANCELLED' : 'PENDING',
          updatedAt: serverTimestamp(),
        }

        const paymentSnapshot = await getDocs(query(collection(db, PAYMENTS), where('teamId', '==', teamId)))
        await Promise.all(paymentSnapshot.docs.map((entry) => updateDoc(doc(db, PAYMENTS, entry.id), relatedUpdates)))

        const registrationSnapshot = await getDocs(query(collection(db, EVENT_REGISTRATIONS), where('teamId', '==', teamId)))
        await Promise.all(registrationSnapshot.docs.map((entry) => updateDoc(doc(db, EVENT_REGISTRATIONS, entry.id), relatedUpdates)))
      }),
    [runAction],
  )

  const removeTeamRegistration = useCallback(
    (teamId) =>
      runAction('Removing registration...', async () => {
        await updateDoc(doc(db, TEAMS, teamId), {
          status: 'ARCHIVED',
          eventParticipationStatus: 'CANCELLED',
          updatedAt: serverTimestamp(),
        })

        const relatedUpdates = {
          status: 'CANCELLED',
          updatedAt: serverTimestamp(),
        }

        const paymentSnapshot = await getDocs(query(collection(db, PAYMENTS), where('teamId', '==', teamId)))
        await Promise.all(paymentSnapshot.docs.map((entry) => updateDoc(doc(db, PAYMENTS, entry.id), relatedUpdates)))

        const registrationSnapshot = await getDocs(query(collection(db, EVENT_REGISTRATIONS), where('teamId', '==', teamId)))
        await Promise.all(registrationSnapshot.docs.map((entry) => updateDoc(doc(db, EVENT_REGISTRATIONS, entry.id), relatedUpdates)))
      }),
    [runAction],
  )

  const updateEventRegistration = useCallback(
    (registration, data) =>
      runAction('Updating event registration...', async () => {
        const fee = normalizeNumber(data.fee, 0)
        const relatedUpdates = {
          eventId: data.eventId,
          eventName: data.eventName || '',
          sportId: data.sportId,
          sportName: data.sportName || '',
          teamId: data.teamId,
          teamName: data.teamName || '',
          facilitatorId: data.eventFacilitatorId || '',
          amount: fee,
          paymentMethod: data.paymentMethod,
          paymentProof: data.paymentProof?.trim() || '',
          status: data.status || 'PENDING',
          updatedAt: serverTimestamp(),
        }

        await updateDoc(doc(db, PAYMENTS, registration.id), relatedUpdates)
        if (registration.eventRegistrationId) {
          await updateDoc(doc(db, EVENT_REGISTRATIONS, registration.eventRegistrationId), relatedUpdates)
        }
      }),
    [runAction],
  )

  const removeEventRegistration = useCallback(
    (registration) =>
      runAction('Removing event registration...', async () => {
        const relatedUpdates = {
          status: 'CANCELLED',
          updatedAt: serverTimestamp(),
        }

        await updateDoc(doc(db, PAYMENTS, registration.id), relatedUpdates)
        if (registration.eventRegistrationId) {
          await updateDoc(doc(db, EVENT_REGISTRATIONS, registration.eventRegistrationId), relatedUpdates)
        }
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
          teamName: nextTeam.name || '',
          sportId: nextTeam.sportId || '',
          sportName: nextTeam.sportName || '',
          coachId: nextTeam.coachId,
          status: 'ACTIVE',
          reassignedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }),
    [currentUser, runAction],
  )

  const teamsByEvent = useCallback((eventId) => teams.filter((team) => team.eventId === eventId), [teams])

  const rosterForTeam = useCallback(
    (teamId) => members.filter((member) => member.teamId === teamId && member.status === 'ACTIVE'),
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
      const eventTeams = teams.filter((team) => team.eventId === eventId && team.status === 'ACTIVE')
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
      registerTeamForEvent,
      updateTeam,
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
      createTeam,
      error,
      getEventBalance,
      loading,
      members,
      removeTeamRegistration,
      removeEventRegistration,
      registerTeamForEvent,
      rosterForTeam,
      suggestTeamForPlayer,
      teams,
      teamsByEvent,
      updateTeam,
      updateTeamFee,
      updateTeamRegistration,
      updateEventRegistration,
      updateTeamMemberAssignment,
    ],
  )
}
