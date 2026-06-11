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
import { ROLES, STATUSES } from '../contexts/AuthContext'
import { db } from '../firebase'
import { teamSkillTotal } from '../utils/skillBalancing'
import { JOIN_REQUEST_STATUS, SIGNUP_STATUS } from '../utils/joinRequests'
import { toastError, toastSuccess } from '../utils/toast'
import { MEMBERSHIP_STATUS, useAuth } from './useAuth'
import { PAYMENT_STATUS } from './usePayment'
import { useSkillBalancing } from './useSkillBalancing'

const PLAYER_APPLICATIONS = 'playerApplications'
const TEAM_MEMBERS = 'teamMembers'
const TEAMS = 'teams'
const USERS = 'users'
const REGISTRATIONS = 'registrations'

function snapshotRows(snapshot) {
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }))
}

function normalizeRegistrationPayload(data, currentUser, userProfile) {
  return {
    eventId: data.eventId,
    teamId: data.teamId,
    coachId: data.coachId || currentUser?.uid || '',
    status: data.status || 'pending',
    teamName: data.teamName || data.name || '',
    eventName: data.eventName || '',
    sportId: data.sportId || '',
    sportName: data.sportName || '',
    coachName: data.coachName || userProfile?.displayName || currentUser?.email || '',
    facilitatorId: data.facilitatorId || data.eventFacilitatorId || '',
    amount: Number(data.amount ?? data.fee ?? 0),
    paymentMethod: data.paymentMethod || '',
    paymentProof: data.paymentProof || '',
    paymentStatus: data.paymentStatus || PAYMENT_STATUS.PENDING,
  }
}

export function useRegistrationManagement() {
  const { currentUser, role, userProfile, isOrganizer, isCoach } = useAuth()
  const { canAddPlayer } = useSkillBalancing()
  const [registrations, setRegistrations] = useState([])
  const [requests, setRequests] = useState([])
  const [teams, setTeams] = useState([])
  const [members, setMembers] = useState([])
  const [playerProfiles, setPlayerProfiles] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const registrationsQuery = useMemo(() => {
    if (!currentUser?.uid || !role) return null
    const base = collection(db, REGISTRATIONS)
    if (isOrganizer) return query(base, orderBy('createdAt', 'desc'))
    if (isCoach) return query(base, where('coachId', '==', currentUser.uid), orderBy('createdAt', 'desc'))
    if (role === ROLES.FACILITATOR) return query(base, where('facilitatorId', '==', currentUser.uid), orderBy('createdAt', 'desc'))
    return query(base, where('coachId', '==', currentUser.uid), orderBy('createdAt', 'desc'))
  }, [currentUser, isCoach, isOrganizer, role])

  const requestsQuery = useMemo(() => {
    if (!currentUser?.uid || !role) return null
    const base = collection(db, PLAYER_APPLICATIONS)
    if (isCoach) return query(base, where('coachId', '==', currentUser.uid), orderBy('createdAt', 'desc'))
    if (role === ROLES.PLAYER) return query(base, where('playerId', '==', currentUser.uid), orderBy('createdAt', 'desc'))
    if (isOrganizer) return query(base, orderBy('createdAt', 'desc'))
    return null
  }, [currentUser, isCoach, isOrganizer, role])

  useEffect(() => {
    if (!registrationsQuery) {
      setRegistrations([])
      setLoading(false)
      return undefined
    }

    const unsubscribe = onSnapshot(
      registrationsQuery,
      (snapshot) => {
        setRegistrations(snapshotRows(snapshot))
        setLoading(false)
        setError('')
      },
      (snapshotError) => {
        setError(snapshotError.message)
        setLoading(false)
      },
    )
    return unsubscribe
  }, [registrationsQuery])

  useEffect(() => {
    if (!requestsQuery) {
      setRequests([])
      return undefined
    }

    const unsubscribe = onSnapshot(
      requestsQuery,
      (snapshot) => {
        setRequests(snapshotRows(snapshot))
        setError('')
      },
      (snapshotError) => setError(snapshotError.message),
    )
    return unsubscribe
  }, [requestsQuery])

  useEffect(() => {
    const teamsUnsubscribe = onSnapshot(query(collection(db, TEAMS), orderBy('createdAt', 'desc')), (snapshot) => {
      setTeams(snapshotRows(snapshot))
    })
    const membersUnsubscribe = onSnapshot(query(collection(db, TEAM_MEMBERS), orderBy('joinedAt', 'desc')), (snapshot) => {
      setMembers(snapshotRows(snapshot))
    })

    return () => {
      teamsUnsubscribe()
      membersUnsubscribe()
    }
  }, [])

  useEffect(() => {
    const playerIds = [...new Set(requests.map((request) => request.playerId).filter(Boolean))]
    if (!playerIds.length) {
      setPlayerProfiles({})
      return undefined
    }

    const unsubscribes = playerIds.map((playerId) =>
      onSnapshot(doc(db, USERS, playerId), (snapshot) => {
        if (snapshot.exists()) setPlayerProfiles((prev) => ({ ...prev, [playerId]: snapshot.data() }))
      }),
    )

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe())
  }, [requests])

  const wrap = useCallback(async (action) => {
    try {
      return await action()
    } catch (actionError) {
      toastError(actionError.message)
      setError(actionError.message)
      throw actionError
    }
  }, [])

  const registerTeamForEvent = useCallback(
    (data) =>
      wrap(async () => {
        if (!data.eventId) throw new Error('Select an event.')
        if (!data.teamId) throw new Error('Select a team.')

        return addDoc(collection(db, REGISTRATIONS), {
          ...normalizeRegistrationPayload(data, currentUser, userProfile),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          reviewedAt: null,
          reviewedBy: null,
        })
      }),
    [currentUser, userProfile, wrap],
  )

  const updateRegistration = useCallback(
    (registrationOrId, data) =>
      wrap(async () => {
        const registrationId = typeof registrationOrId === 'string' ? registrationOrId : registrationOrId.id
        await updateDoc(doc(db, REGISTRATIONS, registrationId), {
          ...data,
          updatedAt: serverTimestamp(),
        })
      }),
    [wrap],
  )

  const approveRegistration = useCallback(
    (registrationId) =>
      updateRegistration(registrationId, {
        status: 'approved',
        reviewedAt: serverTimestamp(),
        reviewedBy: currentUser.uid,
      }),
    [currentUser, updateRegistration],
  )

  const rejectRegistration = useCallback(
    (registrationId) =>
      updateRegistration(registrationId, {
        status: 'rejected',
        reviewedAt: serverTimestamp(),
        reviewedBy: currentUser.uid,
      }),
    [currentUser, updateRegistration],
  )

  const cancelRegistration = useCallback(
    (registrationOrId) =>
      updateRegistration(registrationOrId, {
        status: 'cancelled',
      }),
    [updateRegistration],
  )

  const acceptJoinRequest = useCallback(
    async (request) => {
      const team = teams.find((item) => item.id === request.teamId)
      const teamMembers = members.filter((member) => member.teamId === request.teamId && String(member.status).toLowerCase() === 'active')

      if (team?.maxPlayers && teamMembers.length >= team.maxPlayers) throw new Error('Team roster is full.')
      if (teamMembers.some((member) => member.playerId === request.playerId)) throw new Error('Player is already on this roster.')

      const playerSkill = playerProfiles[request.playerId]?.skillLevel || request.skillLevel || 'Beginner'
      const eventTeams = teams.filter((entry) => entry.eventId === request.eventId && String(entry.status).toLowerCase() === 'active')

      if (eventTeams.length > 1) {
        const balanced = canAddPlayer(request.teamId, teamMembers, playerSkill, eventTeams, members, playerProfiles)
        if (!balanced) throw new Error('Accepting this player would unbalance team skill levels.')
      }

      await updateDoc(doc(db, PLAYER_APPLICATIONS, request.id), {
        status: JOIN_REQUEST_STATUS.ACCEPTED,
        signupStatus: SIGNUP_STATUS.APPROVED,
        reviewedAt: serverTimestamp(),
        reviewedBy: currentUser.uid,
        updatedAt: serverTimestamp(),
      })

      const previousMemberships = members.filter(
        (member) => member.playerId === request.playerId && String(member.status).toLowerCase() === 'active' && member.coachId === currentUser.uid,
      )

      await Promise.all(
        previousMemberships.map((member) =>
          updateDoc(doc(db, TEAM_MEMBERS, member.id), {
            status: 'transferred',
            transferredToTeamId: request.teamId,
            transferredAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }),
        ),
      )

      await addDoc(collection(db, TEAM_MEMBERS), {
        teamId: request.teamId,
        teamName: request.teamName,
        eventId: request.eventId,
        eventName: request.eventName,
        sportId: request.sportId,
        sportName: request.sportName,
        coachId: request.coachId,
        coachName: request.coachName || team?.coachName || '',
        playerId: request.playerId,
        playerName: request.playerName,
        playerEmail: request.playerEmail,
        skillLevel: playerSkill,
        status: 'active',
        joinedAt: serverTimestamp(),
      })

      await updateDoc(doc(db, USERS, request.playerId), {
        status: STATUSES.APPROVED,
        approvalStatus: STATUSES.APPROVED,
        signupStatus: SIGNUP_STATUS.APPROVED,
        membershipStatus: MEMBERSHIP_STATUS.ACTIVE,
        assignedTeamId: request.teamId,
        assignedTeamName: request.teamName,
        approvedBy: currentUser.uid,
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      const newRoster = [...teamMembers, { skillLevel: playerSkill }]
      await updateDoc(doc(db, TEAMS, request.teamId), {
        aggregatedTeamSkill: teamSkillTotal(newRoster),
        updatedAt: serverTimestamp(),
      })

      toastSuccess('Player approved. They can now access their dashboard.')
    },
    [canAddPlayer, currentUser, members, playerProfiles, teams],
  )

  const rejectJoinRequest = useCallback(
    async (request) => {
      await updateDoc(doc(db, PLAYER_APPLICATIONS, request.id), {
        status: JOIN_REQUEST_STATUS.REJECTED,
        signupStatus: SIGNUP_STATUS.REJECTED,
        reviewedAt: serverTimestamp(),
        reviewedBy: currentUser.uid,
        updatedAt: serverTimestamp(),
      })

      await updateDoc(doc(db, USERS, request.playerId), {
        status: STATUSES.REJECTED,
        approvalStatus: STATUSES.REJECTED,
        signupStatus: SIGNUP_STATUS.REJECTED,
        membershipStatus: MEMBERSHIP_STATUS.REJECTED,
        updatedAt: serverTimestamp(),
      })

      toastSuccess('Signup rejected.')
    },
    [currentUser],
  )

  const createJoinRequest = useCallback(
    async (team, message = '', options = {}) => {
      const existing = await getDocs(
        query(
          collection(db, PLAYER_APPLICATIONS),
          where('teamId', '==', team.id),
          where('playerId', '==', currentUser.uid),
          where('status', '==', JOIN_REQUEST_STATUS.PENDING),
        ),
      )

      if (!existing.empty) throw new Error('You already have a pending request for this team.')

      const isTransferRequest = Boolean(options.previousMembershipId || options.previousTeamId)

      await addDoc(collection(db, PLAYER_APPLICATIONS), {
        teamId: team.id,
        teamName: team.teamName || team.name || '',
        eventId: team.eventId || '',
        eventName: team.eventName || '',
        sportId: team.sportId || '',
        sportName: team.sportName || '',
        coachId: team.coachId || '',
        playerId: currentUser.uid,
        playerName: userProfile?.displayName || currentUser.email,
        playerEmail: currentUser.email || '',
        skillLevel: userProfile?.skillLevel || '',
        message: message.trim(),
        requestType: isTransferRequest ? 'transfer' : 'join',
        previousMembershipId: options.previousMembershipId || '',
        previousTeamId: options.previousTeamId || '',
        previousTeamName: options.previousTeamName || '',
        status: JOIN_REQUEST_STATUS.PENDING,
        signupStatus: SIGNUP_STATUS.PENDING,
        createdAt: serverTimestamp(),
        reviewedAt: null,
        reviewedBy: null,
      })

      if (!isTransferRequest) {
        await updateDoc(doc(db, USERS, currentUser.uid), {
          status: STATUSES.PENDING,
          approvalStatus: STATUSES.PENDING,
          requestedTeamId: team.id,
          requestedTeamName: team.teamName || team.name,
          preferredSport: team.sportName || '',
          preferredSportId: team.sportId || '',
          membershipStatus: MEMBERSHIP_STATUS.PENDING_COACH_APPROVAL,
          signupStatus: SIGNUP_STATUS.PENDING,
          updatedAt: serverTimestamp(),
        })
      }

      toastSuccess(isTransferRequest ? 'Transfer request sent.' : 'Join request sent.')
    },
    [currentUser, userProfile],
  )

  const canApproveSignup = isCoach || isOrganizer

  return useMemo(
    () => ({
      registrations,
      requests,
      loading,
      error,
      registerTeamForEvent,
      getRegistrationsByCoach: (coachId) => registrations.filter((registration) => registration.coachId === coachId),
      getRegistrationsByEvent: (eventId) => registrations.filter((registration) => registration.eventId === eventId),
      getRegistrationsByTeam: (teamId) => registrations.filter((registration) => registration.teamId === teamId),
      updateRegistration,
      approveRegistration,
      rejectRegistration,
      cancelRegistration,
      acceptJoinRequest: (request) => wrap(() => acceptJoinRequest(request)),
      rejectJoinRequest: (request) => wrap(() => rejectJoinRequest(request)),
      createJoinRequest: (team, message, options) => wrap(() => createJoinRequest(team, message, options)),
      canApproveSignup,
      playerProfiles,
    }),
    [
      acceptJoinRequest,
      approveRegistration,
      canApproveSignup,
      cancelRegistration,
      createJoinRequest,
      error,
      loading,
      playerProfiles,
      registrations,
      registerTeamForEvent,
      rejectJoinRequest,
      rejectRegistration,
      requests,
      updateRegistration,
      wrap,
    ],
  )
}

export const useRegistration = useRegistrationManagement
