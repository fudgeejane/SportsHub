import { ROLES } from '../../contexts/AuthContext'

export const roleOptions = [
  { value: ROLES.PLAYER, label: 'Player' },
  { value: ROLES.COACH, label: 'Coach' },
  { value: ROLES.FACILITATOR, label: 'Facilitator' },
]

export function getFriendlyAuthError(error) {
  const code = error?.code || ''

  if (code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.' || code.includes('api-key-not-valid')) {
    return 'Firebase API key is invalid. Replace VITE_FIREBASE_API_KEY with the Web API key from your Firebase project settings, then restart the dev server.'
  }

  if (code === 'auth/invalid-email') return 'Enter a valid email address.'
  if (code === 'auth/email-already-in-use') return 'This email is already registered. Try signing in instead.'
  if (code === 'auth/weak-password') return 'Password should be at least 6 characters.'
  if (code === 'auth/invalid-credential') return 'Email or password is incorrect.'
  if (code === 'auth/popup-closed-by-user') return 'Google sign-in was closed before it finished.'

  return error?.message || 'Something went wrong. Please try again.'
}
