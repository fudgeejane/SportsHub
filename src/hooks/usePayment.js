import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { PAYMENT_METHODS, PAYMENT_STATUS } from '../constants/registration'
import { ROLES } from '../contexts/AuthContext'
import { db } from '../firebase'
import { isTeamPaymentReady } from '../utils/scheduling'
import { toastError, toastSuccess } from '../utils/toast'
import { useAuth } from './useAuth.jsx'

const PAYMENTS = 'payments'
const TEAM_MEMBERS = 'teamMembers'

const organizerRoles = [ROLES.COMMUNITY_ORGANIZER, ROLES.ADMIN]

function snapshotRows(snapshot) {
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }))
}

export function usePayment() {
  const { currentUser, role, userProfile } = useAuth()
  const [payments, setPayments] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const paymentsQuery = useMemo(() => {
    if (!currentUser?.uid || !role) return null
    const base = collection(db, PAYMENTS)
    if (role === ROLES.PLAYER) return query(base, where('playerId', '==', currentUser.uid), orderBy('createdAt', 'desc'))
    if (role === ROLES.FACILITATOR) {
      return query(base, where('facilitatorId', '==', currentUser.uid), orderBy('createdAt', 'desc'))
    }
    if (organizerRoles.includes(role)) {
      return query(base, orderBy('createdAt', 'desc'))
    }
    if (role === ROLES.COACH) return query(base, where('coachId', '==', currentUser.uid), orderBy('createdAt', 'desc'))
    return null
  }, [currentUser, role])

  useEffect(() => {
    if (!paymentsQuery) {
      queueMicrotask(() => {
        setPayments([])
        setLoading(false)
      })
      return undefined
    }

    const unsubscribe = onSnapshot(
      paymentsQuery,
      (snapshot) => {
        setPayments(snapshotRows(snapshot))
        setLoading(false)
        setError('')
      },
      (snapshotError) => {
        setError(snapshotError.message)
        setLoading(false)
      },
    )
    return unsubscribe
  }, [paymentsQuery])

  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(db, TEAM_MEMBERS), orderBy('joinedAt', 'desc')), (snapshot) => {
      setMembers(snapshotRows(snapshot))
    })
    return unsubscribe
  }, [])

  const submitPayment = useCallback(
    async ({ team, paymentMethod }) => {
      try {
        if (!currentUser?.uid) throw new Error('Sign in required.')
        if (!team?.id) throw new Error('Team is required.')
        if (!Object.values(PAYMENT_METHODS).includes(paymentMethod)) throw new Error('Invalid payment method.')

        const existing = payments.find(
          (p) => p.teamId === team.id && p.playerId === currentUser.uid && p.paymentStatus === PAYMENT_STATUS.PENDING,
        )

        if (existing) {
          await updateDoc(doc(db, PAYMENTS, existing.id), {
            paymentMethod,
            updatedAt: serverTimestamp(),
          })
        } else {
          await addDoc(collection(db, PAYMENTS), {
            playerId: currentUser.uid,
            playerName: userProfile?.displayName || currentUser.email,
            teamId: team.id,
            teamName: team.name || '',
            eventId: team.eventId || '',
            eventName: team.eventName || '',
            sportId: team.sportId || '',
            coachId: team.coachId || '',
            amount: Number(team.fee) || 0,
            paymentMethod,
            paymentStatus: PAYMENT_STATUS.PENDING,
            createdAt: serverTimestamp(),
            reviewedAt: null,
            reviewedBy: null,
          })
        }

        await updateDoc(doc(db, 'users', currentUser.uid), {
          paymentStatus: PAYMENT_STATUS.PENDING,
          paymentMethod,
          updatedAt: serverTimestamp(),
        })

        toastSuccess('Payment submitted.')
      } catch (submitError) {
        toastError(submitError.message)
        throw submitError
      }
    },
    [currentUser, payments, userProfile],
  )

  const approvePayment = useCallback(
    async (payment) => {
      await updateDoc(doc(db, PAYMENTS, payment.id), {
        paymentStatus: PAYMENT_STATUS.APPROVED,
        reviewedAt: serverTimestamp(),
        reviewedBy: currentUser.uid,
        updatedAt: serverTimestamp(),
      })

      if (payment.eventRegistrationId) {
        await updateDoc(doc(db, 'eventRegistrations', payment.eventRegistrationId), {
          paymentStatus: PAYMENT_STATUS.APPROVED,
          status: 'APPROVED',
          reviewedAt: serverTimestamp(),
          reviewedBy: currentUser.uid,
          updatedAt: serverTimestamp(),
        })
      }

      toastSuccess('Payment approved. Team can now participate.')
    },
    [currentUser],
  )

  const rejectPayment = useCallback(
    async (payment) => {
      await updateDoc(doc(db, PAYMENTS, payment.id), {
        paymentStatus: PAYMENT_STATUS.REJECTED,
        reviewedAt: serverTimestamp(),
        reviewedBy: currentUser.uid,
        updatedAt: serverTimestamp(),
      })

      if (payment.eventRegistrationId) {
        await updateDoc(doc(db, 'eventRegistrations', payment.eventRegistrationId), {
          paymentStatus: PAYMENT_STATUS.REJECTED,
          status: 'REJECTED',
          reviewedAt: serverTimestamp(),
          reviewedBy: currentUser.uid,
          updatedAt: serverTimestamp(),
        })
      }

      toastSuccess('Payment rejected.')
    },
    [currentUser],
  )

  const canVerifyPayment = role === ROLES.FACILITATOR || organizerRoles.includes(role)

  const teamReadyForSchedule = useCallback(
    (teamId) => isTeamPaymentReady(teamId, members, payments),
    [members, payments],
  )

  const eventTeamsReady = useCallback(
    (teamIds) => teamIds.length > 0 && teamIds.every((id) => teamReadyForSchedule(id)),
    [teamReadyForSchedule],
  )

  const runWithToast = useCallback(async (action) => {
    try {
      await action()
    } catch (actionError) {
      toastError(actionError.message)
      setError(actionError.message)
      throw actionError
    }
  }, [])

  return useMemo(
    () => ({
      payments,
      loading,
      error,
      submitPayment,
      approvePayment: (p) => runWithToast(() => approvePayment(p), {}),
      rejectPayment: (p) => runWithToast(() => rejectPayment(p), {}),
      canVerifyPayment,
      teamReadyForSchedule,
      eventTeamsReady,
    }),
    [
      approvePayment,
      canVerifyPayment,
      error,
      eventTeamsReady,
      loading,
      payments,
      rejectPayment,
      runWithToast,
      submitPayment,
      teamReadyForSchedule,
    ],
  )
}
