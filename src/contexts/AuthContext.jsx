/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useMemo, useRef, useState } from 'react'
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
  const hasInitialized = useRef(false)

  useEffect(() => {
    let unsubscribeProfile = () => {}

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      unsubscribeProfile()
      if (!hasInitialized.current) {
        setLoading(true)
      }
      setAuthError('')
      setCurrentUser(firebaseUser)

      if (!firebaseUser) {
        setUserProfile(null)
        setLoading(false)
        hasInitialized.current = true
        return
      }

      unsubscribeProfile = onSnapshot(
        doc(db, 'users', firebaseUser.uid),
        (snapshot) => {
          setUserProfile(snapshot.exists() ? snapshot.data() : null)
          setLoading(false)
          hasInitialized.current = true
        },
        (error) => {
          // Handle browser blocking Firestore connections
          const errorMessage = error.code === 'unavailable' || error.message?.includes('ERR_BLOCKED_BY_CLIENT')
            ? 'Connection blocked by browser. Please disable ad blockers, privacy extensions, or firewall restrictions to access Firestore.'
            : error.message
          
          setAuthError(errorMessage)
          setUserProfile(null)
          setLoading(false)
          hasInitialized.current = true
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
