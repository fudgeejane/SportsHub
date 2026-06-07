# Email Verification Flow Diagram

## Complete User Journey

```
╔════════════════════════════════════════════════════════════════╗
║                    USER SIGNUP & VERIFICATION                  ║
╚════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────┐
│ STEP 1: User fills out signup form                          │
│ • Name, email, password, role, etc.                          │
│ • Clicks "Sign Up" button                                    │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 2: SignUpModal.jsx handles form submission             │
│ • Validates form data                                        │
│ • Calls signUp() from useAuth hook                          │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 3: useAuth.jsx → signUp() function                     │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ const credential = await createUserWithEmailAndPassword()│
│ │ await updateProfile(credential.user, { displayName })│   │
│ │                                                       │   │
│ │ // 🔑 KEY: Send verification email with action URL  │   │
│ │ await sendEmailVerification(                         │   │
│ │   credential.user,                                   │   │
│ │   authActionCodeSettings // ← Contains redirect URL │   │
│ │ )                                                     │   │
│ │                                                       │   │
│ │ // Create user record in Firestore                   │   │
│ │ await createUserRecord(...)                          │   │
│ │                                                       │   │
│ │ // Sign out user (must verify before login)         │   │
│ │ await signOut()                                       │   │
│ └──────────────────────────────────────────────────────┘   │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 4: Firebase sends verification email                   │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ To: user@example.com                                 │   │
│ │ From: noreply@your-project.firebaseapp.com          │   │
│ │ Subject: Verify your email for SportsHub            │   │
│ │                                                       │   │
│ │ Body:                                                │   │
│ │   "Please verify your email address"                │   │
│ │                                                       │   │
│ │   [Verify Email Button]                             │   │
│ │    ↓                                                 │   │
│ │   Link: https://sports-hub-khaki.vercel.app/        │   │
│ │         auth/action?                                 │   │
│ │         mode=verifyEmail&                            │   │
│ │         oobCode=ABC123XYZ&                          │   │
│ │         apiKey=AIza...                               │   │
│ └──────────────────────────────────────────────────────┘   │
└───────────────────────┬──────────────────────────────────────┘
                        │
                    ⏰ User checks email
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 5: User clicks verification link in email              │
│ • Opens in browser                                           │
│ • Navigates to: /auth/action?mode=verifyEmail&oobCode=...  │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 6: AuthActionPage.jsx component loads                  │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ const mode = searchParams.get('mode')                │   │
│ │ const oobCode = searchParams.get('oobCode')          │   │
│ │                                                       │   │
│ │ // Show loading state                                │   │
│ │ setStatus('loading')                                 │   │
│ │ setMessage('Checking your secure SportsHub link...') │   │
│ └──────────────────────────────────────────────────────┘   │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 7: Validate and apply action code                      │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ if (mode === 'verifyEmail') {                        │   │
│ │   // Check if code is valid                          │   │
│ │   const info = await checkActionCode(auth, oobCode)  │   │
│ │   setAccountEmail(info.data.email)                  │   │
│ │                                                       │   │
│ │   // 🔑 KEY: Apply verification                     │   │
│ │   await applyActionCode(auth, oobCode)              │   │
│ │                                                       │   │
│ │   // Show success state                              │   │
│ │   setStatus('success')                               │   │
│ │   setMessage('Your email has been verified...')     │   │
│ │   toastSuccess('Email verified successfully.')      │   │
│ │ }                                                     │   │
│ └──────────────────────────────────────────────────────┘   │
└───────────────────────┬──────────────────────────────────────┘
                        │
                ⏰ Wait 2.2 seconds
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 8: Auto-redirect to login page                         │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ setTimeout(() => {                                   │   │
│ │   navigate('/login', {                               │   │
│ │     replace: true,                                   │   │
│ │     state: { emailVerified: true }                  │   │
│ │   })                                                  │   │
│ │ }, 2200)                                              │   │
│ └──────────────────────────────────────────────────────┘   │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 9: Login page shows success message                    │
│ • "Email verified successfully!"                             │
│ • User can now log in with credentials                       │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 10: User logs in and accesses dashboard                │
│ ✅ Email verified                                            │
│ ✅ Full account access                                       │
└──────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
╔════════════════════════════════════════════════════════════════╗
║                    ERROR SCENARIOS                             ║
╚════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────┐
│ SCENARIO A: Expired Link (>1 hour old)                      │
├──────────────────────────────────────────────────────────────┤
│ User clicks verification link                                │
│         ↓                                                     │
│ AuthActionPage loads                                         │
│         ↓                                                     │
│ await applyActionCode(auth, oobCode)                        │
│         ↓                                                     │
│ ❌ Throws: auth/expired-action-code                          │
│         ↓                                                     │
│ catch (error) {                                              │
│   setStatus('error')                                         │
│   setMessage('This action link has expired...')             │
│   toastError('Action link expired.')                        │
│ }                                                             │
│         ↓                                                     │
│ 🔴 Shows red error panel                                     │
│ 💬 User must request new verification email                 │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ SCENARIO B: Already Used Link                               │
├──────────────────────────────────────────────────────────────┤
│ User clicks verification link (2nd time)                     │
│         ↓                                                     │
│ AuthActionPage loads                                         │
│         ↓                                                     │
│ await applyActionCode(auth, oobCode)                        │
│         ↓                                                     │
│ ❌ Throws: auth/invalid-action-code                          │
│         ↓                                                     │
│ catch (error) {                                              │
│   setStatus('error')                                         │
│   setMessage('This action link is invalid or already used')│
│   toastError('Action verification failed.')                 │
│ }                                                             │
│         ↓                                                     │
│ 🔴 Shows red error panel                                     │
│ 💬 User already verified or must request new email          │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ SCENARIO C: Invalid/Malformed Link                          │
├──────────────────────────────────────────────────────────────┤
│ User visits: /auth/action (no parameters)                   │
│         ↓                                                     │
│ AuthActionPage loads                                         │
│         ↓                                                     │
│ if (!mode || !oobCode) {                                     │
│   setStatus('error')                                         │
│   setMessage('This action link is incomplete...')           │
│   toastError('Invalid action link.')                        │
│ }                                                             │
│         ↓                                                     │
│ 🔴 Shows red error panel                                     │
│ 💬 User must request new verification email                 │
└──────────────────────────────────────────────────────────────┘
```

## Key Configuration Flow

```
╔════════════════════════════════════════════════════════════════╗
║           HOW ACTION URL IS SET PROGRAMMATICALLY               ║
╚════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────┐
│ src/hooks/useAuth.jsx                                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  const AUTH_ACTION_URL =                                    │
│    'https://sports-hub-khaki.vercel.app/auth/action'       │
│                                                              │
│  const authActionCodeSettings = {                           │
│    url: AUTH_ACTION_URL,        ← Redirect URL              │
│    handleCodeInApp: false,      ← Enable redirect           │
│  }                                                           │
│                                                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Used in signUp()
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ await sendEmailVerification(                                │
│   credential.user,                                          │
│   authActionCodeSettings  ← Passed here                    │
│ )                                                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Firebase uses this config
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Firebase Email Service                                      │
│ • Generates oobCode                                         │
│ • Constructs email with link:                               │
│   → url from authActionCodeSettings                        │
│   → + mode=verifyEmail                                      │
│   → + oobCode=ABC123                                        │
│   → + apiKey=AIza...                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Result:                                                     │
│ https://sports-hub-khaki.vercel.app/auth/action?           │
│   mode=verifyEmail&                                         │
│   oobCode=ABC123XYZ&                                        │
│   apiKey=AIza...                                            │
└─────────────────────────────────────────────────────────────┘
```

## UI States

```
╔════════════════════════════════════════════════════════════════╗
║                    AUTHACTIONPAGE UI STATES                    ║
╚════════════════════════════════════════════════════════════════╝

┌────────────────────────────────────────────────────────────┐
│ 🔵 LOADING STATE                                           │
├────────────────────────────────────────────────────────────┤
│  ╔══════════════════════════════════════════════════════╗ │
│  ║  ⭯ Processing                                        ║ │
│  ║                                                       ║ │
│  ║  Checking your secure SportsHub link...             ║ │
│  ╚══════════════════════════════════════════════════════╝ │
│                                                            │
│  [Blue background with spinner]                           │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ 🟢 SUCCESS STATE                                           │
├────────────────────────────────────────────────────────────┤
│  ╔══════════════════════════════════════════════════════╗ │
│  ║  ✓ Complete                                          ║ │
│  ║                                                       ║ │
│  ║  Your email has been verified successfully!         ║ │
│  ║  Redirecting you to login...                        ║ │
│  ╚══════════════════════════════════════════════════════╝ │
│                                                            │
│  [Green background with checkmark]                        │
│  [Auto-redirects after 2.2 seconds]                       │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ 🔴 ERROR STATE                                             │
├────────────────────────────────────────────────────────────┤
│  ╔══════════════════════════════════════════════════════╗ │
│  ║  ⚠ Action failed                                     ║ │
│  ║                                                       ║ │
│  ║  This action link has expired. Please request a     ║ │
│  ║  new verification email from SportsHub.             ║ │
│  ╚══════════════════════════════════════════════════════╝ │
│                                                            │
│  [Red background with alert icon]                         │
│  [Back to sign in] button                                 │
└────────────────────────────────────────────────────────────┘
```

## Security Flow

```
╔════════════════════════════════════════════════════════════════╗
║                    SECURITY MECHANISMS                         ║
╚════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────┐
│ 🔒 Action Code Security                                      │
├──────────────────────────────────────────────────────────────┤
│ • One-time use only (cannot be reused)                       │
│ • Expires after ~1 hour                                      │
│ • Cryptographically signed by Firebase                       │
│ • Validated server-side before applying                      │
│ • Cannot be forged or tampered with                          │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ 🔒 Domain Whitelist                                          │
├──────────────────────────────────────────────────────────────┤
│ Firebase Console → Authentication → Authorized Domains      │
│ • Only whitelisted domains can receive redirects             │
│ • Prevents phishing attacks                                  │
│ • Must include: sports-hub-khaki.vercel.app                 │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ 🔒 HTTPS Enforcement                                         │
├──────────────────────────────────────────────────────────────┤
│ • Production URLs must use HTTPS                             │
│ • Prevents man-in-the-middle attacks                         │
│ • Protects oobCode in transit                                │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ 🔒 User Logout After Verification                            │
├──────────────────────────────────────────────────────────────┤
│ • User is signed out after signup                            │
│ • Must verify email before logging in                        │
│ • Prevents unverified account access                         │
└──────────────────────────────────────────────────────────────┘
```

## Timeline

```
Event                                    Time
─────────────────────────────────────────────────────────────
User signs up                            T+0s
↓
Verification email sent                  T+0s (async)
↓
Email arrives in inbox                   T+30s - T+60s
↓
User clicks verification link            T+varies
↓
AuthActionPage loads                     T+0.5s
↓
applyActionCode() called                 T+1s
↓
Success message displayed                T+1.5s
↓
Auto-redirect starts                     T+3.7s (1.5s + 2.2s delay)
↓
Login page loads                         T+4s
```

## Multi-Action Support

```
╔════════════════════════════════════════════════════════════════╗
║      /auth/action HANDLES MULTIPLE ACTION TYPES                ║
╚════════════════════════════════════════════════════════════════╝

┌────────────────────────────────────────────────────────────┐
│ mode=verifyEmail                                           │
│ • Verifies user email address                              │
│ • Shows success message                                    │
│ • Redirects to login                                       │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ mode=resetPassword                                         │
│ • Shows password reset form                                │
│ • User enters new password                                 │
│ • Confirms password reset                                  │
│ • Redirects to login                                       │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ mode=recoverEmail (not implemented yet)                    │
│ • Would recover compromised email                          │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ mode=verifyAndChangeEmail (not implemented yet)            │
│ • Would verify email change                                │
└────────────────────────────────────────────────────────────┘
```

---

**Note:** This flow diagram represents the complete email verification journey from signup to successful login. All diagrams reflect the current implementation as of June 7, 2026.
