import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

export const SIGNUP_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
}

export const JOIN_REQUEST_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
}

export async function createPendingJoinRequest({ player, team, message = '', skillLevel = '' }) {
  await addDoc(collection(db, 'playerApplications'), {
    teamId: team.id,
    teamName: team.name || '',
    eventId: team.eventId || '',
    eventName: team.eventName || '',
    sportId: team.sportId || '',
    sportName: team.sportName || '',
    coachId: team.coachId || '',
    playerId: player.uid,
    playerName: player.displayName || player.email,
    playerEmail: player.email || '',
    skillLevel: skillLevel || '',
    message: message.trim(),
    status: JOIN_REQUEST_STATUS.PENDING,
    signupStatus: SIGNUP_STATUS.PENDING,
    createdAt: serverTimestamp(),
    reviewedAt: null,
    reviewedBy: null,
  })
}
