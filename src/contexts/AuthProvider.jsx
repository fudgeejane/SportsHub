import { useCallback, useEffect, useState } from 'react'
import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reload,
  sendEmailVerification as firebaseSendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updatePassword,
  updateProfile,
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { AuthContext, ROLES } from './AuthContext'
import {
  createUserRecord,
  getUserProfile,
  updateUserEmailVerified,
} from '../lib/userService'

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const checkUserStatus = useCallback(async (uid = auth.currentUser?.uid) => {
    if (!uid) return null
    return await getUserProfile(uid)
  }, [])

  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) {
      setCurrentUser(null)
      setUserProfile(null)
      return null
    }

    await reload(auth.currentUser)
    setCurrentUser({ ...auth.currentUser })
    if (auth.currentUser.emailVerified) {
      await updateUserEmailVerified(auth.currentUser.uid, true)
    }
    const profile = await checkUserStatus(auth.currentUser.uid)
    setUserProfile(profile)
    return profile
  }, [checkUserStatus])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true)
      setCurrentUser(firebaseUser)

      if (firebaseUser) {
        const profile = await checkUserStatus(firebaseUser.uid)
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [checkUserStatus])

  const signIn = async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    await refreshUser()
    return credential.user
  }

  const signUp = async ({ email, password, displayName, role }) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(credential.user, { displayName })
    await firebaseSendEmailVerification(credential.user)
    await createUserRecord(credential.user, role, displayName)
    await refreshUser()
    return credential.user
  }

  const signInWithGoogle = async (role = ROLES.PLAYER) => {
    const credential = await signInWithPopup(auth, googleProvider)
    const profile = await getUserProfile(credential.user.uid)

    if (!profile) {
      await createUserRecord(credential.user, role, credential.user.displayName)
    } else if (credential.user.emailVerified) {
      await updateUserEmailVerified(credential.user.uid, credential.user.emailVerified)
    }

    await refreshUser()
    return credential.user
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setCurrentUser(null)
    setUserProfile(null)
  }

  const sendEmailVerification = async () => {
    if (!auth.currentUser) throw new Error('No authenticated user found.')
    await firebaseSendEmailVerification(auth.currentUser)
  }

  const forgotPassword = (email) => sendPasswordResetEmail(auth, email)

  const resetPassword = async (newPassword, actionCode) => {
    if (actionCode) {
      await confirmPasswordReset(auth, actionCode, newPassword)
      return
    }

    if (!auth.currentUser) throw new Error('Use the reset link from your email or sign in before changing your password.')
    await updatePassword(auth.currentUser, newPassword)
  }

  const value = {
    currentUser,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    sendEmailVerification,
    forgotPassword,
    resetPassword,
    checkUserStatus,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
