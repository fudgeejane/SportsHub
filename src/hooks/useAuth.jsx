/* eslint-disable react-refresh/only-export-components */
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  applyActionCode,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  reload,
  sendEmailVerification as firebaseSendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  deleteUser as firebaseDeleteUser,
  updatePassword,
  updateProfile,
} from 'firebase/auth'
import { collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from '../firebase'
import { MEMBERSHIP_STATUS } from '../constants/membership'
import { toastError, toastSuccess } from '../utils/toast'
import { AuthContext, ROLES, STATUSES } from '../contexts/AuthContext.jsx'
import { auth, db, googleProvider } from '../firebase'
import { createPendingJoinRequest } from '../utils/joinRequests'
import { useGlobalLoading } from './useGlobalLoading.jsx'

export { AuthContext, ROLES, STATUSES }

export const APP_RETURN_URL = 'https://sports-hub-khaki.vercel.app'
export const FIREBASE_AUTH_ACTION_URL = 'https://sportshub-ffba8.firebaseapp.com/__/auth/action'

// ActionCodeSettings for email verification and password reset
export const authActionCodeSettings = {
  url: APP_RETURN_URL,
  handleCodeInApp: false,
}

export function buildUserRecord(firebaseUser, role = ROLES.PLAYER, displayName = '') {
  const needsOrganizerApproval = role === ROLES.COACH || role === ROLES.FACILITATOR
  const isPlayer = role === ROLES.PLAYER

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: displayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'SportsHub User',
    role,
    status: isPlayer || needsOrganizerApproval ? STATUSES.PENDING : STATUSES.APPROVED,
    approvalStatus: isPlayer || needsOrganizerApproval ? STATUSES.PENDING : STATUSES.APPROVED,
    emailVerified: firebaseUser.emailVerified,
    createdAt: serverTimestamp(),
    approvedBy: null,
    approvedAt: null,
    age: '',
    gender: '',
    contactNumber: '',
    preferredSport: '',
    preferredSportId: '',
    preferredSportTeamStructure: null,
    membershipStatus: isPlayer ? MEMBERSHIP_STATUS.PENDING_COACH_APPROVAL : 'ACTIVE',
    skillLevel: '',
    aggregatedTeamSkill: 0,
    assignedTeamId: '',
    assignedTeamName: '',
    paymentStatus: 'PENDING',
    paymentMethod: '',
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
    approvalStatus: STATUSES.APPROVED,
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
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        setUsers(
          snapshot.docs.map((userDoc) => ({
            id: userDoc.id,
            uid: userDoc.data()?.uid || userDoc.id,
            ...userDoc.data(),
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
  }, [])

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

    const deleteUser = useCallback(
      async (uid) => {
        setError('')
        const stopGlobalLoading = startLoading('Deleting user...')
        try {
          await deleteDoc(doc(db, 'users', uid))
          toastSuccess('User removed from Firestore.')
          // Try callable Cloud Function to remove user from Firebase Auth (requires admin privileges)
          try {
            const functions = getFunctions(app)
            const del = httpsCallable(functions, 'deleteUser')
            await del({ uid })
            toastSuccess('User removed from Firebase Authentication (via Cloud Function).')
          } catch (fnError) {
            // If callable not available or failed, attempt to delete auth record only if it's the current user
            if (auth.currentUser && auth.currentUser.uid === uid) {
              try {
                await firebaseDeleteUser(auth.currentUser)
                toastSuccess('User removed from Firebase Authentication.')
                await firebaseSignOut(auth)
              } catch (authDeleteError) {
                toastError(`Deleted Firestore record but failed to remove from Auth: ${authDeleteError.message}`)
              }
            } else {
              // Non-current-user Auth deletion requires backend admin privileges; inform the admin
              console.warn('Callable deleteUser failed or not available:', fnError?.message || fnError)
            }
          }
        } catch (deleteError) {
          setError(deleteError.message)
          toastError(`Failed to delete user: ${deleteError.message}`)
          throw deleteError
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
        approvalStatus: STATUSES.APPROVED,
        approvedBy: reviewerId,
        approvedAt: serverTimestamp(),
      }),
    [reviewerId, runUserUpdate],
  )

  const rejectUser = useCallback(
    (uid) =>
      runUserUpdate(uid, {
        status: STATUSES.REJECTED,
        approvalStatus: STATUSES.REJECTED,
        approvedBy: reviewerId,
        approvedAt: serverTimestamp(),
      }),
    [reviewerId, runUserUpdate],
  )

  const changeRole = useCallback((uid, role) => runUserUpdate(uid, { role }), [runUserUpdate])

  return { users, loading, error, approveUser, rejectUser, changeRole, updateUser: runUserUpdate, deleteUser }
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
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password)
        void refreshUser().catch(() => {})
        return credential.user
      } catch (signInError) {
        // Handle browser blocking Firestore connections
        if (signInError.code === 'unavailable' || signInError.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
          toastError('⚠️ Connection blocked by browser. Please disable ad blockers or privacy extensions.')
          const blockError = new Error('Connection blocked by browser')
          blockError.code = 'client-blocked'
          throw blockError
        }
        
        // Handle common Firebase auth errors
        if (signInError.code === 'auth/user-not-found') {
          toastError('Invalid credentials')
        } else if (signInError.code === 'auth/wrong-password') {
          toastError('Invalid credentials')
        } else if (signInError.code === 'auth/invalid-email') {
          toastError('Invalid credentials')
        } else if (signInError.code === 'auth/user-disabled') {
          toastError('Invalid credentials')
        } else {
          toastError(`Sign in failed: ${signInError.message}`)
        }
        throw signInError
      }
    },
    [refreshUser],
  )

  const signUp = useCallback(
    async ({
      email,
      password,
      displayName,
      role,
      age,
      gender,
      contactNumber,
      preferredSport,
      preferredSportId,
      preferredSportTeamStructure,
      skillLevel,
      selectedTeamId,
      selectedTeamName,
      selectedTeamCoachId,
    }) => {
      try {
        const credential = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(credential.user, { displayName })
        
        try {
          await firebaseSendEmailVerification(credential.user, authActionCodeSettings)
        } catch (emailError) {
          console.warn('Email verification failed:', emailError)
          // Continue with signup even if email verification fails
        }

        const isPlayer = role === ROLES.PLAYER

        await createUserRecord(credential.user, role, displayName, {
          age: age || '',
          gender: gender || '',
          contactNumber: contactNumber || '',
          preferredSport: preferredSport || '',
          preferredSportId: preferredSportId || '',
          preferredSportTeamStructure: preferredSportTeamStructure || null,
          skillLevel: isPlayer ? skillLevel || '' : '',
          requestedTeamId: isPlayer ? selectedTeamId || '' : '',
          requestedTeamName: isPlayer ? selectedTeamName || '' : '',
        })

        if (isPlayer && selectedTeamId) {
          await createPendingJoinRequest({
            player: {
              uid: credential.user.uid,
              email,
              displayName,
            },
            team: {
              id: selectedTeamId,
              name: selectedTeamName,
              sportId: preferredSportId,
              sportName: preferredSport,
              coachId: selectedTeamCoachId,
            },
            skillLevel,
          })
        }

        await firebaseSignOut(auth)
        toastSuccess(isPlayer ? 'Application submitted. Verify your email first, then wait for coach approval.' : 'Please verify your email, then wait for organizer approval.')
        return credential.user
      } catch (error) {
        // Handle browser blocking Firestore connections
        if (error.code === 'unavailable' || error.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
          toastError('⚠️ Connection blocked by browser. Please disable ad blockers, privacy extensions, or try incognito mode.')
          const blockError = new Error('Connection blocked by browser')
          blockError.code = 'client-blocked'
          throw blockError
        }
        
        // Handle common Firebase auth errors
        if (error.code === 'auth/email-already-in-use') {
          toastError('Invalid credentials')
        } else if (error.code === 'auth/invalid-email') {
          toastError('Invalid credentials')
        } else if (error.code === 'auth/weak-password') {
          toastError('✗ Password is too weak. Use at least 6 characters.')
        } else if (error.code === 'permission-denied') {
          toastError('It seems there is an issue with our server connection. Please try again later or contact support.')
        } else {
          toastError(`Please try again later`)
        }
        throw error
      }
    },
    [],
  )

  const verifyEmailWithCode = useCallback(async (oobCode) => {
    try {
      await applyActionCode(auth, oobCode)
      if (auth.currentUser) await firebaseSignOut(auth)
      toastSuccess('Email verified successfully!')
    } catch (error) {
      toastError(`Email verification failed`)
      throw error
    }
  }, [])

  const signInWithGoogle = useCallback(
    async (role = ROLES.PLAYER) => {
      try {
        const credential = await signInWithPopup(auth, googleProvider)
        const profile = await getUserProfile(credential.user.uid)

        if (!profile) {
          await createUserRecord(credential.user, role, credential.user.displayName)
        } else if (credential.user.emailVerified) {
          await updateUserEmailVerified(credential.user.uid, credential.user.emailVerified)
        }

        await refreshUser()
        toastSuccess('Signed in with Google successfully')
        return credential.user
      } catch (error) {
        if (error.code === 'auth/popup-closed-by-user') {
          toastError('Sign in cancelled')
        } else if (error.code === 'auth/popup-blocked') {
          toastError('Popup blocked. Please allow popups for this site.')
        } else {
          toastError(`Google sign in failed: ${error.message}`)
        }
        throw error
      }
    },
    [refreshUser],
  )

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      toastError(`Sign out failed, please try again later.`)
      throw error
    }
  }, [])

  const sendEmailVerification = useCallback(async () => {
    try {
      if (!auth.currentUser) throw new Error('No authenticated user found.')
      await firebaseSendEmailVerification(auth.currentUser, authActionCodeSettings)
      toastSuccess('Verification email sent. Check your inbox.')
    } catch (error) {
      if (error.code === 'auth/too-many-requests') {
        toastError('Too many requests. Please wait before trying again.')
      } else {
        toastError(`Failed to send verification email.`)
      }
      throw error
    }
  }, [])

  const forgotPassword = useCallback(async (email) => {
    try {
      await sendPasswordResetEmail(auth, email, authActionCodeSettings)
      toastSuccess('Password reset email sent! Check your inbox.')
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        toastError('Invalid credentials')
      } else if (error.code === 'auth/invalid-email') {
        toastError('Invalid credentials')
      } else {
        toastError(`Failed to send reset email.`)
      }
      throw error
    }
  }, [])

  const resetPassword = useCallback(async (newPassword, actionCode) => {
    try {
      if (actionCode) {
        await confirmPasswordReset(auth, actionCode, newPassword)
        toastSuccess('Password reset successfully! You can now sign in.')
        return
      }

      if (!auth.currentUser) throw new Error('Use the reset link from your email or sign in before changing your password.')
      await updatePassword(auth.currentUser, newPassword)
      toastSuccess('Password updated successfully!')
    } catch (error) {
      if (error.code === 'auth/weak-password') {
        toastError('Password is too weak. Use at least 6 characters.')
      } else if (error.code === 'auth/expired-action-code') {
        toastError('Reset link expired. Please request a new one.')
      } else if (error.code === 'auth/invalid-action-code') {
        toastError('Invalid reset link. Please request a new one.')
      } else {
        toastError(`Password reset failed: ${error.message}`)
      }
      throw error
    }
  }, [])

  const updateUser = useCallback(async (uid, updates) => {
    try {
      await updateUserRecord(uid, updates)
      toastSuccess('Profile updated successfully')
    } catch (error) {
      toastError(`Update failed: ${error.message}`)
      throw error
    }
  }, [])

  return useMemo(
    () => ({
      ...context,
      signIn,
      signUp,
      verifyEmailWithCode,
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
      verifyEmailWithCode,
    ],
  )
}
