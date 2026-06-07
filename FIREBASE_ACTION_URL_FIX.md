# 🔧 Firebase Action URL Override Fix

## Problem

Email verification links are redirecting to `https://sportshub-ffba8.firebaseapp.com/__/auth/action` instead of your custom domain `https://sports-hub-khaki.vercel.app/auth/action`.

## Root Cause

Firebase Console has a custom action URL configured that's overriding your programmatic `authActionCodeSettings`. Even though the code sets the URL programmatically, Firebase Console settings can take precedence.

## Solution

You have **two options** to fix this:

---

## Option 1: Clear Firebase Console Action URL (Recommended)

This ensures your programmatic settings always take precedence.

### Steps:

1. **Go to Firebase Console**
   - Navigate to: https://console.firebase.google.com/
   - Select your project: `sportshub-ffba8`

2. **Open Email Templates**
   - Click **Authentication** in left sidebar
   - Click **Templates** tab
   - Click **Email address verification**

3. **Edit Action URL**
   - Click **"Customize action URL"** or the pencil icon
   - **Clear/Delete the custom action URL field**
   - Leave it **empty** or set it back to default
   - Click **Save**

4. **Test**
   - Sign up with a new test email
   - Check the verification link in the email
   - Should now point to: `https://sports-hub-khaki.vercel.app/auth/action`

---

## Option 2: Set Action URL to Your Domain in Console

Manually configure Firebase Console to use your custom domain.

### Steps:

1. **Go to Firebase Console**
   - Navigate to: https://console.firebase.google.com/
   - Select your project: `sportshub-ffba8`

2. **Open Email Templates**
   - Click **Authentication** in left sidebar
   - Click **Templates** tab
   - Click **Email address verification**

3. **Edit Action URL**
   - Click **"Customize action URL"** or the pencil icon
   - Change the URL to: `https://sports-hub-khaki.vercel.app/auth/action`
   - Click **Save**

4. **Repeat for Password Reset**
   - Click **Password reset** in Templates
   - Click **"Customize action URL"**
   - Set to: `https://sports-hub-khaki.vercel.app/auth/action`
   - Click **Save**

---

## Why Option 1 is Better

**Option 1 (Clear Console URL)** is recommended because:

✅ Your programmatic `authActionCodeSettings` in code takes full control  
✅ No need to update Console for different environments (dev, staging, prod)  
✅ Easier to manage - all configuration in code  
✅ Environment variables can control the URL  
✅ Less chance of misconfiguration  

**Option 2 (Set Console URL)** works but:

❌ Need to manually update Console for each environment  
❌ Code and Console settings must be kept in sync  
❌ More error-prone during deployment  

---

## Verification

After applying either fix, test the flow:

### 1. Request New Verification Email

```bash
# In your app:
# 1. Sign up with a new test email
# 2. Or click "Resend verification email"
```

### 2. Check Email Source

Open the verification email and inspect the link:

**Before Fix:**
```
https://sportshub-ffba8.firebaseapp.com/__/auth/action?mode=verifyEmail&oobCode=...
```

**After Fix:**
```
https://sports-hub-khaki.vercel.app/auth/action?mode=verifyEmail&oobCode=...
```

### 3. Click Link

- Should redirect to your custom domain
- Should load your AuthActionPage component
- Should verify email successfully
- Should redirect to login

---

## Technical Explanation

### How Firebase Action URLs Work

Firebase uses this priority for action URLs:

1. **Custom Action URL in Console** (if set) ← This was overriding your code
2. **Programmatic ActionCodeSettings** (in code) ← Your code
3. **Default Firebase URL** (fallback)

By clearing the Console URL, your programmatic settings become the source of truth.

### Your Current Code (Correct)

```javascript
// src/hooks/useAuth.jsx
const AUTH_ACTION_URL = 'https://sports-hub-khaki.vercel.app/auth/action'

const authActionCodeSettings = {
  url: AUTH_ACTION_URL,
  handleCodeInApp: false,
}

// Used in:
await sendEmailVerification(user, authActionCodeSettings)
```

This code is **correct** - it just needs the Console setting to be cleared.

---

## Troubleshooting

### Still redirecting to firebaseapp.com?

1. **Clear the Console action URL completely**
   - Make sure it's empty, not just set to default

2. **Wait for cache to clear**
   - Firebase may cache email templates for a few minutes
   - Wait 5-10 minutes and try again

3. **Send a NEW verification email**
   - Old emails have the old URL baked in
   - Sign up with a fresh email to test

4. **Check all email templates**
   - Email verification
   - Password reset
   - Email change verification
   - Make sure all are cleared/set correctly

### How to force a fresh email

```javascript
// In your browser console while logged in:
const user = auth.currentUser;
await sendEmailVerification(user, {
  url: 'https://sports-hub-khaki.vercel.app/auth/action',
  handleCodeInApp: false
});
```

---

## Environment-Based Configuration (Advanced)

If you want different URLs for different environments:

### 1. Add to .env files

```bash
# .env.development
VITE_APP_URL=http://localhost:5173

# .env.production
VITE_APP_URL=https://sports-hub-khaki.vercel.app
```

### 2. Update useAuth.jsx

```javascript
// Use environment variable
const AUTH_ACTION_URL = `${import.meta.env.VITE_APP_URL}/auth/action`

const authActionCodeSettings = {
  url: AUTH_ACTION_URL,
  handleCodeInApp: false,
}
```

### 3. Clear Console URLs for all environments

This way, your code controls the URL for every environment automatically.

---

## Quick Fix Checklist

- [ ] Open Firebase Console
- [ ] Go to Authentication → Templates → Email address verification
- [ ] Click "Customize action URL"
- [ ] **Clear/delete the custom action URL field**
- [ ] Click Save
- [ ] Repeat for "Password reset" template
- [ ] Wait 5 minutes for cache to clear
- [ ] Sign up with NEW test email
- [ ] Check verification link in email
- [ ] Should now point to sports-hub-khaki.vercel.app

---

## Expected Result

After the fix, email verification links should look like:

```
https://sports-hub-khaki.vercel.app/auth/action?mode=verifyEmail&oobCode=ABC123XYZ&apiKey=AIza...
```

NOT:

```
https://sportshub-ffba8.firebaseapp.com/__/auth/action?mode=verifyEmail&oobCode=ABC123XYZ&apiKey=AIza...
```

---

## Summary

**The Fix:** Clear the custom action URL from Firebase Console → Templates → Email address verification

**Why:** Lets your programmatic `authActionCodeSettings` take full control

**Time:** 2 minutes to clear + 5 minutes for cache to clear

**Test:** Sign up with new email and verify link points to sports-hub-khaki.vercel.app

---

Need more help? Check:
- Screenshot of your Firebase Templates settings
- Browser network tab when clicking verification link
- Email source code to see actual link URL
