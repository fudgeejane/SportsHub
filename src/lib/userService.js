import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { ROLES, STATUSES } from '../contexts/AuthContext'

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
