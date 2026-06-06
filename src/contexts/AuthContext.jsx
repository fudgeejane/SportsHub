/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebase'

export const ROLES = {
  ADMIN: 'ADMIN',
  COMMUNITY_ORGANIZER: 'COMMUNITY_ORGANIZER',
  COACH: 'COACH',
  FACILITATOR: 'FACILITATOR',
  PLAYER: 'PLAYER',
}

export const STATUSES = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
}

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    let unsubscribeProfile = () => {}

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      unsubscribeProfile()
      setLoading(true)
      setAuthError('')
      setCurrentUser(firebaseUser)

      if (!firebaseUser) {
        setUserProfile(null)
        setLoading(false)
        return
      }

      unsubscribeProfile = onSnapshot(
        doc(db, 'users', firebaseUser.uid),
        (snapshot) => {
          setUserProfile(snapshot.exists() ? snapshot.data() : null)
          setLoading(false)
        },
        (error) => {
          setAuthError(error.message)
          setUserProfile(null)
          setLoading(false)
        },
      )
    })

    return () => {
      unsubscribeProfile()
      unsubscribeAuth()
    }
  }, [])

  const value = useMemo(
    () => ({
      currentUser,
      user: currentUser,
      userProfile,
      profile: userProfile,
      role: userProfile?.role || null,
      currentUserName: userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || '',
      currentUserRole: userProfile?.role || '',
      currentUserStatus: userProfile?.status || '',
      isEmailVerified: Boolean(currentUser?.emailVerified || userProfile?.emailVerified),
      loading,
      authError,
    }),
    [authError, currentUser, loading, userProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
