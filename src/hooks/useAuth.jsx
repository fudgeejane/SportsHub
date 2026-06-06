/* eslint-disable react-refresh/only-export-components */
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  reload,
  sendEmailVerification as firebaseSendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updatePassword,
  updateProfile,
} from 'firebase/auth'
import { collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { AuthContext, ROLES, STATUSES } from '../contexts/AuthContext.jsx'
import { auth, db, googleProvider } from '../firebase'
import { useGlobalLoading } from './useGlobalLoading.jsx'

export { AuthContext, ROLES, STATUSES }

export function buildUserRecord(firebaseUser, role = ROLES.PLAYER, displayName = '') {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: displayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'SportsHub User',
    role,
    status: STATUSES.PENDING,
    emailVerified: firebaseUser.emailVerified,
    createdAt: serverTimestamp(),
    approvedBy: null,
    approvedAt: null,
    age: '',
    gender: '',
    contactNumber: '',
    preferredSport: '',
    skillLevel: '',
  }
}

export async function getUserProfile(uid) {
  if (!uid) return null
  const snapshot = await getDoc(doc(db, 'users', uid))
  return snapshot.exists() ? snapshot.data() : null
}

export async function createUserRecord(firebaseUser, role, displayName, overrides = {}) {
  await setDoc(doc(db, 'users', firebaseUser.uid), {
    ...buildUserRecord(firebaseUser, role, displayName),
    ...overrides,
  })
}

export async function updateUserEmailVerified(uid, emailVerified) {
  if (!uid) return
  await setDoc(doc(db, 'users', uid), { emailVerified }, { merge: true })
}

export async function updateUserRecord(uid, updates) {
  if (!uid) return
  await updateDoc(doc(db, 'users', uid), updates)
}

export async function createAdminUser({ email, password, displayName, role = ROLES.COMMUNITY_ORGANIZER }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName })
  await createUserRecord(credential.user, role, displayName, {
    status: STATUSES.APPROVED,
    emailVerified: true,
    approvedBy: credential.user.uid,
    approvedAt: serverTimestamp(),
  })
  return credential.user
}

export function useUserManagement(reviewerId) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { startLoading } = useGlobalLoading()

  useEffect(() => {
    const stopGlobalLoading = startLoading('Loading users...')
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        setUsers(snapshot.docs.map((userDoc) => ({ id: userDoc.id, ...userDoc.data() })))
        setLoading(false)
        stopGlobalLoading()
      },
      (snapshotError) => {
        setError(snapshotError.message)
        setLoading(false)
        stopGlobalLoading()
      },
    )

    return () => {
      stopGlobalLoading()
      unsubscribe()
    }
  }, [startLoading])

  const runUserUpdate = useCallback(
    async (uid, updates) => {
      setError('')
      const stopGlobalLoading = startLoading('Updating user...')

      try {
        await updateUserRecord(uid, updates)
      } catch (updateError) {
        setError(updateError.message)
        throw updateError
      } finally {
        stopGlobalLoading()
      }
    },
    [startLoading],
  )

  const approveUser = useCallback(
    (uid) =>
      runUserUpdate(uid, {
        status: STATUSES.APPROVED,
        approvedBy: reviewerId,
        approvedAt: serverTimestamp(),
      }),
    [reviewerId, runUserUpdate],
  )

  const rejectUser = useCallback(
    (uid) =>
      runUserUpdate(uid, {
        status: STATUSES.REJECTED,
        approvedBy: reviewerId,
        approvedAt: serverTimestamp(),
      }),
    [reviewerId, runUserUpdate],
  )

  const changeRole = useCallback((uid, role) => runUserUpdate(uid, { role }), [runUserUpdate])

  return { users, loading, error, approveUser, rejectUser, changeRole, updateUser: runUserUpdate }
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.')
  }

  const checkUserStatus = useCallback(async (uid = auth.currentUser?.uid) => {
    if (!uid) return null
    return await getUserProfile(uid)
  }, [])

  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) return null

    await reload(auth.currentUser)

    if (auth.currentUser.emailVerified) {
      await updateUserEmailVerified(auth.currentUser.uid, true)
    }

    return await checkUserStatus(auth.currentUser.uid)
  }, [checkUserStatus])

  const signIn = useCallback(
    async (email, password) => {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      await refreshUser()
      return credential.user
    },
    [refreshUser],
  )

  const signUp = useCallback(
    async ({ email, password, displayName, role, age, gender, contactNumber, preferredSport, skillLevel }) => {
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(credential.user, { displayName })
      await firebaseSendEmailVerification(credential.user)
      await createUserRecord(credential.user, role, displayName, {
        age: age || '',
        gender: gender || '',
        contactNumber: contactNumber || '',
        preferredSport: preferredSport || '',
        skillLevel: skillLevel || '',
      })
      await refreshUser()
      return credential.user
    },
    [refreshUser],
  )

  const signInWithGoogle = useCallback(
    async (role = ROLES.PLAYER) => {
      const credential = await signInWithPopup(auth, googleProvider)
      const profile = await getUserProfile(credential.user.uid)

      if (!profile) {
        await createUserRecord(credential.user, role, credential.user.displayName)
      } else if (credential.user.emailVerified) {
        await updateUserEmailVerified(credential.user.uid, credential.user.emailVerified)
      }

      await refreshUser()
      return credential.user
    },
    [refreshUser],
  )

  const signOut = useCallback(() => firebaseSignOut(auth), [])

  const sendEmailVerification = useCallback(async () => {
    if (!auth.currentUser) throw new Error('No authenticated user found.')
    await firebaseSendEmailVerification(auth.currentUser)
  }, [])

  const forgotPassword = useCallback((email) => sendPasswordResetEmail(auth, email), [])

  const resetPassword = useCallback(async (newPassword, actionCode) => {
    if (actionCode) {
      await confirmPasswordReset(auth, actionCode, newPassword)
      return
    }

    if (!auth.currentUser) throw new Error('Use the reset link from your email or sign in before changing your password.')
    await updatePassword(auth.currentUser, newPassword)
  }, [])

  const updateUser = useCallback((uid, updates) => updateUserRecord(uid, updates), [])

  return useMemo(
    () => ({
      ...context,
      signIn,
      signUp,
      signOut,
      signInWithGoogle,
      sendEmailVerification,
      forgotPassword,
      resetPassword,
      checkUserStatus,
      refreshUser,
      updateUser,
    }),
    [
      checkUserStatus,
      context,
      forgotPassword,
      refreshUser,
      resetPassword,
      sendEmailVerification,
      signIn,
      signInWithGoogle,
      signOut,
      signUp,
      updateUser,
    ],
  )
}
