# Email Verification - Quick Reference Card

## TL;DR

Email verification is **fully programmatic** - no Firebase Console configuration needed for action URLs. Just add your domain to Authorized Domains and deploy.

## Key Files

| File | Purpose |
|------|---------|
| `src/hooks/useAuth.jsx` | Defines `authActionCodeSettings` with action URL |
| `src/pages/auth/AuthActionPage.jsx` | Handles email verification after user clicks link |
| `src/routes/PublicRoutes.jsx` | Defines `/auth/action` route |

## Configuration

```javascript
// src/hooks/useAuth.jsx
const AUTH_ACTION_URL = 'https://sports-hub-khaki.vercel.app/auth/action'

const authActionCodeSettings = {
  url: AUTH_ACTION_URL,
  handleCodeInApp: false,  // ⚠️ Must be false for redirects
}
```

## Flow Diagram

```
User signs up
    ↓
sendEmailVerification(user, authActionCodeSettings)
    ↓
Firebase sends email with link to:
    https://sports-hub-khaki.vercel.app/auth/action?mode=verifyEmail&oobCode=ABC123
    ↓
User clicks link → AuthActionPage loads
    ↓
applyActionCode(auth, oobCode) → Verifies email
    ↓
Auto-redirect to login after 2.2s
    ↓
User logs in with verified account
```

## URL Parameters

| Parameter | Example | Description |
|-----------|---------|-------------|
| `mode` | `verifyEmail` | Type of action (verifyEmail, resetPassword, etc.) |
| `oobCode` | `ABC123...` | One-time Firebase action code |
| `apiKey` | `AIza...` | Firebase API key |
| `continueUrl` | `https://...` | Optional redirect URL |

## Common Commands

### Send Verification Email
```javascript
import { sendEmailVerification } from 'firebase/auth'

await sendEmailVerification(auth.currentUser, authActionCodeSettings)
```

### Verify Email with Code
```javascript
import { applyActionCode } from 'firebase/auth'

await applyActionCode(auth, oobCode)
```

### Check Action Code (before applying)
```javascript
import { checkActionCode } from 'firebase/auth'

const info = await checkActionCode(auth, oobCode)
console.log(info.data.email) // Email being verified
```

## Error Codes

| Firebase Error | Meaning | User Message |
|----------------|---------|--------------|
| `auth/expired-action-code` | Link expired (>1 hour old) | "This action link has expired. Please request a new verification email." |
| `auth/invalid-action-code` | Link invalid or already used | "This action link is invalid or has already been used. Please request a new verification email." |
| `auth/user-disabled` | Account disabled | "This account has been disabled." |
| `auth/user-not-found` | Account deleted | "Account not found." |

## Testing Locally

### 1. Update URL for localhost
```javascript
// Temporarily in src/hooks/useAuth.jsx
const AUTH_ACTION_URL = 'http://localhost:5173/auth/action'
```

### 2. Add localhost to Firebase Authorized Domains
- Firebase Console → Authentication → Settings → Authorized domains
- Add: `localhost`

### 3. Test
```bash
npm run dev
# Sign up → Check email → Click link → Should work
```

### 4. Revert changes before committing
```javascript
// Change back to production URL
const AUTH_ACTION_URL = 'https://sports-hub-khaki.vercel.app/auth/action'
```

## Deployment Checklist

- [ ] `handleCodeInApp: false` (not `true`)
- [ ] Production URL set in `AUTH_ACTION_URL`
- [ ] Add `sports-hub-khaki.vercel.app` to Firebase Authorized Domains
- [ ] Deploy to Vercel
- [ ] Test with real email
- [ ] Verify redirect works
- [ ] Test error handling (click link twice)

## Firebase Console Required Setup

### ✅ Required
1. **Authorized Domains**
   - Path: Authentication → Settings → Authorized domains
   - Action: Add `sports-hub-khaki.vercel.app`
   - Why: Firebase blocks redirects to unauthorized domains

2. **Email/Password Authentication**
   - Path: Authentication → Sign-in method
   - Action: Enable "Email/Password"
   - Why: Required for email verification to work

### ❌ NOT Required
1. **Email Action URL**
   - Path: Authentication → Templates → Email address verification
   - Action: Leave empty or use default
   - Why: Our code overrides this with `authActionCodeSettings`

## Troubleshooting

### Emails not sending?
1. Check spam folder
2. Verify Email/Password auth is enabled in Firebase
3. Check Firebase Console → Usage for quota limits
4. Try different email provider (Gmail, Outlook)

### Redirect not working?
1. Verify `handleCodeInApp: false` (not `true`)
2. Check authorized domain is added
3. Visit `/auth/action` directly to test route
4. Check browser console for errors

### "Unauthorized domain" error?
1. Add domain to Firebase Console → Authorized domains
2. Wait 5-10 minutes for changes to propagate
3. Clear browser cache

### Link shows "expired" immediately?
1. User clicked old link from previous email
2. User already used this link to verify
3. Request new verification email

## Environment-Based Configuration

For multiple environments (dev, staging, prod):

```javascript
// src/hooks/useAuth.jsx
const AUTH_ACTION_URL = import.meta.env.VITE_APP_URL + '/auth/action'

// .env.development
VITE_APP_URL=http://localhost:5173

// .env.production
VITE_APP_URL=https://sports-hub-khaki.vercel.app
```

## Related Features

The same `/auth/action` route also handles:
- **Password Reset** (`mode=resetPassword`)
- **Email Recovery** (`mode=recoverEmail`) - if implemented
- **Email Change Verification** (`mode=verifyAndChangeEmail`) - if implemented

## Code Examples

### Example 1: Send Verification on Signup
```javascript
// In signUp function
const credential = await createUserWithEmailAndPassword(auth, email, password)
await sendEmailVerification(credential.user, authActionCodeSettings)
```

### Example 2: Resend Verification Email
```javascript
// In component
const handleResend = async () => {
  try {
    await sendEmailVerification(auth.currentUser, authActionCodeSettings)
    toast.success('Verification email sent!')
  } catch (error) {
    toast.error('Failed to send email')
  }
}
```

### Example 3: Handle Verification
```javascript
// In AuthActionPage component
const oobCode = searchParams.get('oobCode')
await applyActionCode(auth, oobCode)
navigate('/login', { state: { emailVerified: true } })
```

## Important Notes

1. **One-time use:** Each `oobCode` can only be used once
2. **Expiration:** Codes expire after ~1 hour (Firebase default)
3. **Case sensitive:** `oobCode` is case sensitive
4. **Auto logout:** After verification, user is logged out (must login again)
5. **Domain whitelist:** Only authorized domains can receive redirects

## Performance

- **Email delivery:** Usually <1 minute
- **Verification:** Instant (async to Firebase)
- **Redirect delay:** 2.2 seconds (for user to read success message)
- **Page load:** <500ms for auth action page

## Security

- ✅ HTTPS required for production URLs
- ✅ Action codes are one-time use
- ✅ Action codes expire automatically
- ✅ Domain whitelist prevents phishing
- ✅ Firebase validates all action codes server-side

## Documentation

| Document | Purpose |
|----------|---------|
| `EMAIL_VERIFICATION_SETUP.md` | Complete technical guide |
| `EMAIL_VERIFICATION_CHECKLIST.md` | Step-by-step setup |
| `DEPLOYMENT_NOTES.md` | Deployment instructions |
| `EMAIL_VERIFICATION_QUICK_REFERENCE.md` | This document |

## Support Resources

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth/web/email-link-auth)
- [Firebase Action Code Settings](https://firebase.google.com/docs/reference/js/auth.actioncodesettings)
- [Firebase Error Codes](https://firebase.google.com/docs/reference/js/auth#autherrorcodes)

---

**Last Updated:** June 7, 2026  
**Maintained By:** Development Team  
**Version:** 1.0.0
