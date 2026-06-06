import { getAnalytics, isSupported } from 'firebase/analytics'
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const googleProvider = new GoogleAuthProvider()

export const firebaseConfigStatus = {
  hasApiKey: Boolean(firebaseConfig.apiKey),
  hasAuthDomain: Boolean(firebaseConfig.authDomain),
  hasProjectId: Boolean(firebaseConfig.projectId),
  hasAppId: Boolean(firebaseConfig.appId),
  hasStorageBucket: Boolean(firebaseConfig.storageBucket),
}

export const isFirebaseConfigComplete = Object.values(firebaseConfigStatus).every(Boolean)

const analyticsEnabled = import.meta.env.VITE_ENABLE_FIREBASE_ANALYTICS === 'true'

export const analytics =
  typeof window !== 'undefined' && analyticsEnabled && firebaseConfig.measurementId
    ? isSupported()
        .then((supported) => (supported ? getAnalytics(app) : undefined))
        .catch(() => undefined)
    : undefined
