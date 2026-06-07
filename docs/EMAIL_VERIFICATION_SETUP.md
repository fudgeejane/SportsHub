# Email Verification Setup - Complete Guide

## Overview

This project implements **programmatic email verification** that bypasses Firebase Console configuration entirely. All email action URLs are set in code using Firebase Authentication's `ActionCodeSettings`.

## Architecture

### 1. Email Verification Flow

```
User signs up
    ↓
Firebase sends verification email with link
    ↓
User clicks link in email
    ↓
Redirects to: https://sports-hub-khaki.vercel.app/auth/action?mode=verifyEmail&oobCode=...
    ↓
AuthActionPage component handles verification
    ↓
After 2.2 seconds, redirects to: https://sports-hub-khaki.vercel.app/login
```

### 2. Implementation Details

#### A. Action Code Settings (useAuth.jsx)

```javascript
const AUTH_ACTION_URL = 'https://sports-hub-khaki.vercel.app/auth/action'

const authActionCodeSettings = {
  url: AUTH_ACTION_URL,
  handleCodeInApp: false,  // Critical: false means Firebase handles the redirect
}
```

**Key Configuration:**
- `url`: The landing page for all Firebase auth actions (email verification, password reset, etc.)
- `handleCodeInApp: false`: Firebase will redirect to this URL automatically after user clicks the email link

#### B. Sending Verification Email (useAuth.jsx)

```javascript
// During signup
await firebaseSendEmailVerification(credential.user, authActionCodeSettings)

// Manual resend
await firebaseSendEmailVerification(auth.currentUser, authActionCodeSettings)
```

The `authActionCodeSettings` is passed to every `sendEmailVerification` call, which programmatically sets the continue URL without needing Firebase Console configuration.

#### C. Handling Verification (AuthActionPage.jsx)

The `/auth/action` route handles all Firebase auth actions:

```javascript
// Parse URL parameters
const mode = searchParams.get('mode')           // "verifyEmail"
const oobCode = searchParams.get('oobCode')     // Firebase action code
const apiKey = searchParams.get('apiKey')       // Firebase API key
const continueUrl = searchParams.get('continueUrl') // Optional continue URL

// Verify email
if (mode === 'verifyEmail') {
  const actionInfo = await checkActionCode(auth, oobCode)  // Validate code
  await applyActionCode(auth, oobCode)                      // Apply verification
  
  // Auto-redirect after 2.2 seconds
  setTimeout(() => {
    navigate('/login', { state: { emailVerified: true } })
  }, 2200)
}
```

**Error Handling:**
- `auth/expired-action-code`: Link has expired
- `auth/invalid-action-code`: Link is invalid or already used
- All Firebase error messages are preserved and displayed

#### D. Route Configuration (PublicRoutes.jsx)

```javascript
<Route
  key={PUBLIC_ROUTES.authAction}
  path={PUBLIC_ROUTES.authAction}  // /auth/action
  element={<AuthActionPage />}
/>
```

The route is public (no authentication required) so users can verify their email before logging in.

## Firebase Console Setup

### Required Configuration

1. **Authorized Domains** (Firebase Console → Authentication → Settings → Authorized domains)
   - Add: `sports-hub-khaki.vercel.app`
   - This is **required** for Firebase to allow redirects to your domain

2. **Email Action URL** (Firebase Console → Authentication → Templates → Action URL)
   - **Leave this EMPTY or use default**
   - Our code overrides this with `authActionCodeSettings`

### Why This Approach Works

Firebase respects `ActionCodeSettings` passed programmatically **over** the Console configuration. This means:
- ✅ No need to configure action URLs in Firebase Console
- ✅ Works in all environments (local, staging, production) with different URLs
- ✅ Full control over redirect behavior in code
- ✅ Easy to test and debug

## Testing the Flow

### Local Development

```javascript
// In useAuth.jsx, temporarily change for local testing:
const AUTH_ACTION_URL = 'http://localhost:5173/auth/action'
```

### Production

```javascript
// Use production URL:
const AUTH_ACTION_URL = 'https://sports-hub-khaki.vercel.app/auth/action'
```

### Manual Testing Steps

1. Sign up with a new account
2. Check email inbox for verification link
3. Click the verification link
4. Should redirect to: `https://sports-hub-khaki.vercel.app/auth/action?mode=verifyEmail&oobCode=...`
5. Page shows loading → success message
6. After 2.2 seconds, redirects to login page
7. Login page shows "Email verified successfully" message

## UI States

### AuthActionPage displays:

1. **Loading State**
   - Blue panel with spinner
   - "Checking your secure SportsHub link..."

2. **Success State**
   - Green panel with checkmark
   - "Your email has been verified successfully! Redirecting you to login..."
   - Auto-redirects after 2.2 seconds

3. **Error State**
   - Red panel with alert icon
   - Shows specific error message:
     - "This action link has expired. Please request a new verification email from SportsHub."
     - "This action link is invalid or has already been used. Please request a new verification email."
     - Other Firebase error messages

4. **Account Display**
   - Shows the email being verified
   - Icon: Mail check for verification, Lock for password reset

## Security Considerations

1. **Email Verification Required**: Users cannot access protected routes until verified
2. **One-Time Use**: Action codes (`oobCode`) can only be used once
3. **Expiration**: Action codes expire after a set time (Firebase default: 1 hour)
4. **Domain Whitelist**: Only authorized domains can receive Firebase redirects

## Troubleshooting

### Issue: Verification link doesn't work
- Check Firebase Console → Authorized domains includes your domain
- Verify `AUTH_ACTION_URL` matches your deployed URL
- Check browser console for errors

### Issue: Email not sending
- Verify Firebase project has email/password auth enabled
- Check Firebase Console → Authentication → Templates
- Ensure email templates are not disabled

### Issue: Redirect doesn't happen
- Check `handleCodeInApp: false` (not `true`)
- Verify route `/auth/action` exists and is accessible
- Check browser console for navigation errors

### Issue: "Action link expired" immediately
- User may have clicked an old link
- User may have already verified with this link
- Ask user to request a new verification email

## Additional Features

### Password Reset (Already Implemented)

The same `/auth/action` page handles password reset:

```javascript
if (mode === 'resetPassword') {
  const email = await verifyPasswordResetCode(auth, oobCode)
  setAccountEmail(email)
  setStatus('ready')
  // Show password reset form
}
```

### Future Enhancements

- Add email recovery
- Add email change verification
- Add custom email templates
- Add retry logic for failed verifications

## Environment Variables

Required in `.env`:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Code References

- **Email Verification Settings**: `src/hooks/useAuth.jsx` (line with `authActionCodeSettings`)
- **Verification Handler**: `src/pages/auth/AuthActionPage.jsx`
- **Route Configuration**: `src/routes/PublicRoutes.jsx`
- **Auth Context**: `src/contexts/AuthContext.jsx`

## Summary

✅ **No Firebase Console configuration needed** for email action URLs
✅ **All configuration in code** via `ActionCodeSettings`
✅ **Complete error handling** with Firebase error preservation
✅ **Automatic redirect** to login after successful verification
✅ **Works for both** email verification and password reset
✅ **Production-ready** with proper loading, success, and error states
