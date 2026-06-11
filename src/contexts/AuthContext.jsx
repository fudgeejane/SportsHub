/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useMemo, useRef, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebase'

export const ROLES = {
  ORGANIZER: 'organizer',
  COMMUNITY_ORGANIZER: 'organizer',
  ADMIN: 'organizer',
  COACH: 'coach',
  FACILITATOR: 'facilitator',
  PLAYER: 'player',
}

export const STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
}

export function normalizeRole(role) {
  const value = String(role || '').toLowerCase()
  if (value === 'community_organizer' || value === 'admin') return ROLES.ORGANIZER
  if (value === 'coach') return ROLES.COACH
  if (value === 'facilitator') return ROLES.FACILITATOR
  if (value === 'player') return ROLES.PLAYER
  return value || null
}

export function normalizeStatus(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'active') return STATUSES.APPROVED
  return value || null
}

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const hasInitialized = useRef(false)

  useEffect(() => {
    let unsubscribeProfile = () => {}

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      unsubscribeProfile()
      if (!hasInitialized.current) setLoading(true)
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
          const profile = snapshot.exists() ? snapshot.data() : null
          setUserProfile(
            profile
              ? {
                  ...profile,
                  role: normalizeRole(profile.role),
                  status: normalizeStatus(profile.status),
                  approvalStatus: normalizeStatus(profile.approvalStatus),
                }
              : null,
          )
          setLoading(false)
          hasInitialized.current = true
        },
        () => {
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

  const role = userProfile?.role || null

  const value = useMemo(
    () => ({
      currentUser,
      userProfile,
      role,
      loading,
      isOrganizer: role === ROLES.ORGANIZER,
      isCoach: role === ROLES.COACH,
      isFacilitator: role === ROLES.FACILITATOR,
      isPlayer: role === ROLES.PLAYER,
    }),
    [currentUser, loading, role, userProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
