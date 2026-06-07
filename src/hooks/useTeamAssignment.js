import { useCallback, useEffect, useState } from 'react'
import { collection, doc, onSnapshot, query, serverTimestamp, updateDoc, where, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import { useGlobalLoading } from './useGlobalLoading'
import { toastError, toastSuccess } from '../utils/toast'

export function useTeamAssignment(coachId) {
  const [pendingPlayers, setPendingPlayers] = useState([])
  const [loading, setLoading] = useState(Boolean(coachId))
  const [error, setError] = useState('')
  const { startLoading } = useGlobalLoading()

  // Load players awaiting coach approval (PENDING_COACH_APPROVAL)
  useEffect(() => {
    if (!coachId) {
      // No need to update state - handled by initial state
      return
    }

    const q = query(
      collection(db, 'users'),
      where('membershipStatus', '==', 'PENDING_COACH_APPROVAL'),
      where('role', '==', 'PLAYER'),
      orderBy('createdAt', 'desc'),
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setPendingPlayers(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            uid: doc.data()?.uid || doc.id,
            ...doc.data(),
          })),
        )
        setLoading(false)
      },
      (snapshotError) => {
        setError(snapshotError.message)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [coachId])

  const approvePlayer = useCallback(
    async (playerUid) => {
      setError('')
      const stopLoading = startLoading('Approving player...')

      try {
        await updateDoc(doc(db, 'users', playerUid), {
          membershipStatus: 'PENDING_TEAM_ASSIGNMENT',
          approvedBy: coachId,
          approvedAt: serverTimestamp(),
        })
        toastSuccess('Player approved. Ready for team assignment.')
      } catch (err) {
        setError(err.message)
        toastError(err.message)
        throw err
      } finally {
        stopLoading()
      }
    },
    [coachId, startLoading],
  )

  const rejectPlayer = useCallback(
    async (playerUid) => {
      setError('')
      const stopLoading = startLoading('Rejecting player...')

      try {
        await updateDoc(doc(db, 'users', playerUid), {
          membershipStatus: 'REJECTED',
          approvedBy: coachId,
          approvedAt: serverTimestamp(),
        })
        toastSuccess('Player rejected.')
      } catch (err) {
        setError(err.message)
        toastError(err.message)
        throw err
      } finally {
        stopLoading()
      }
    },
    [coachId, startLoading],
  )

  const assignTeam = useCallback(
    async (playerUid, teamId, teamName) => {
      setError('')
      const stopLoading = startLoading('Assigning team...')

      try {
        await updateDoc(doc(db, 'users', playerUid), {
          membershipStatus: 'TEAM_ASSIGNED',
          assignedTeamId: teamId,
          assignedTeamName: teamName,
          assignedAt: serverTimestamp(),
        })
        toastSuccess('Team assigned successfully.')
      } catch (err) {
        setError(err.message)
        toastError(err.message)
        throw err
      } finally {
        stopLoading()
      }
    },
    [startLoading],
  )

  return {
    pendingPlayers,
    loading,
    error,
    approvePlayer,
    rejectPlayer,
    assignTeam,
  }
}
