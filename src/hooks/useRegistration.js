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
import { MEMBERSHIP_STATUS } from '../constants/membership'
import { SIGNUP_STATUS } from '../constants/registration'
import { ROLES, STATUSES } from '../contexts/AuthContext'
import { db } from '../firebase'
import { JOIN_REQUEST_STATUS } from '../utils/joinRequests'
import { toastError, toastSuccess } from '../utils/toast'
import { teamSkillTotal } from '../utils/skillBalancing'
import { useSkillBalancing } from './useSkillBalancing'
import { useAuth } from './useAuth.jsx'

const PLAYER_APPLICATIONS = 'playerApplications'
const TEAM_MEMBERS = 'teamMembers'
const TEAMS = 'teams'
const USERS = 'users'

const organizerRoles = [ROLES.COMMUNITY_ORGANIZER, ROLES.ADMIN]

function snapshotRows(snapshot) {
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }))
}

export function useRegistration() {
  const { currentUser, role, userProfile } = useAuth()
  const { canAddPlayer } = useSkillBalancing()
  const [requests, setRequests] = useState([])
  const [teams, setTeams] = useState([])
  const [members, setMembers] = useState([])
  const [playerProfiles, setPlayerProfiles] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const requestsQuery = useMemo(() => {
    if (!currentUser?.uid || !role) return null
    const base = collection(db, PLAYER_APPLICATIONS)
    if (role === ROLES.COACH) return query(base, where('coachId', '==', currentUser.uid), orderBy('createdAt', 'desc'))
    if (role === ROLES.PLAYER) return query(base, where('playerId', '==', currentUser.uid), orderBy('createdAt', 'desc'))
    if (organizerRoles.includes(role)) return query(base, orderBy('createdAt', 'desc'))
    return null
  }, [currentUser, role])

  useEffect(() => {
    if (!requestsQuery) {
      queueMicrotask(() => {
        setRequests([])
        setLoading(false)
      })
      return undefined
    }

    const unsubscribe = onSnapshot(
      requestsQuery,
      (snapshot) => {
        setRequests(snapshotRows(snapshot))
        setLoading(false)
        setError('')
      },
      (snapshotError) => {
        setError(snapshotError.message)
        setLoading(false)
      },
    )
    return unsubscribe
  }, [requestsQuery])

  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(db, TEAMS), orderBy('createdAt', 'desc')), (snapshot) => {
      setTeams(snapshotRows(snapshot))
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(db, TEAM_MEMBERS), orderBy('joinedAt', 'desc')), (snapshot) => {
      setMembers(snapshotRows(snapshot))
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const playerIds = [...new Set(requests.map((r) => r.playerId).filter(Boolean))]
    if (!playerIds.length) {
      queueMicrotask(() => setPlayerProfiles({}))
      return undefined
    }

    const unsubscribes = playerIds.map((playerId) =>
      onSnapshot(doc(db, USERS, playerId), (snapshot) => {
        if (snapshot.exists()) {
          setPlayerProfiles((prev) => ({ ...prev, [playerId]: snapshot.data() }))
        }
      }),
    )

    return () => unsubscribes.forEach((unsub) => unsub())
  }, [requests])

  const acceptJoinRequest = useCallback(
    async (request) => {
      const team = teams.find((item) => item.id === request.teamId)
      const teamMembers = members.filter((member) => member.teamId === request.teamId && member.status === 'ACTIVE')

      if (team?.maxPlayers && teamMembers.length >= team.maxPlayers) {
        throw new Error('Team roster is full.')
      }

      if (teamMembers.some((member) => member.playerId === request.playerId)) {
        throw new Error('Player is already on this roster.')
      }

      const playerSkill = playerProfiles[request.playerId]?.skillLevel || request.skillLevel || 'Beginner'
      const eventTeams = teams.filter((t) => t.eventId === request.eventId && t.status === 'ACTIVE')

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
        (member) => member.playerId === request.playerId && member.status === 'ACTIVE' && member.coachId === currentUser.uid,
      )

      await Promise.all(
        previousMemberships.map((member) =>
          updateDoc(doc(db, TEAM_MEMBERS, member.id), {
            status: 'TRANSFERRED',
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
        status: 'ACTIVE',
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
    [currentUser, members, playerProfiles, teams, canAddPlayer],
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
      const playerProfile = userProfile || {}
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
        teamName: team.name || '',
        eventId: team.eventId || '',
        eventName: team.eventName || '',
        sportId: team.sportId || '',
        sportName: team.sportName || '',
        coachId: team.coachId || '',
        playerId: currentUser.uid,
        playerName: playerProfile.displayName || currentUser.email,
        playerEmail: currentUser.email || '',
        skillLevel: playerProfile.skillLevel || '',
        message: message.trim(),
        requestType: isTransferRequest ? 'TRANSFER' : 'JOIN',
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
          requestedTeamName: team.name,
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

  const wrap = useCallback(
    async (action) => {
      try {
        await action()
      } catch (actionError) {
        toastError(actionError.message)
        setError(actionError.message)
        throw actionError
      }
    },
    [],
  )

  const canApproveSignup = role === ROLES.COACH || organizerRoles.includes(role)

  return useMemo(
    () => ({
      requests,
      loading,
      error,
      acceptJoinRequest: (r) => wrap(() => acceptJoinRequest(r)),
      rejectJoinRequest: (r) => wrap(() => rejectJoinRequest(r)),
      createJoinRequest: (team, msg) => wrap(() => createJoinRequest(team, msg)),
      canApproveSignup,
      playerProfiles,
    }),
    [acceptJoinRequest, canApproveSignup, createJoinRequest, error, loading, playerProfiles, rejectJoinRequest, requests, wrap],
  )
}
