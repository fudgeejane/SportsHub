# 🔧 Quick Fix: Verification Links Going to Wrong Domain

## The Problem

Your email verification links are redirecting to:
```
❌ https://sportshub-ffba8.firebaseapp.com/__/auth/action
```

Instead of:
```
✅ https://sports-hub-khaki.vercel.app/auth/action
```

## The Cause

Firebase Console has a custom action URL configured that's overriding your code's `authActionCodeSettings`.

## The Fix (2 minutes)

### Option 1: Clear Firebase Console Action URL (Recommended)

1. Open Firebase Console: https://console.firebase.google.com/
2. Select project: **sportshub-ffba8**
3. Go to: **Authentication** → **Templates** → **Email address verification**
4. Find: **Action URL** section
5. Click: **"Customize action URL"**
6. **Delete all text** from the field (leave it empty)
7. Click: **Save**
8. Wait 5-10 minutes for cache to clear
9. Test with a NEW signup

### Option 2: Set to Your Domain

Same steps as Option 1, but in step 6:
- **Enter:** `https://sports-hub-khaki.vercel.app/auth/action`
- Click Save

**Why Option 1 is better:** Your code controls the URL, making it easier to manage multiple environments.

## Detailed Instructions

See these files for more details:
- **`FIREBASE_CONSOLE_STEPS.md`** - Step-by-step visual guide with screenshots
- **`FIREBASE_ACTION_URL_FIX.md`** - Complete explanation and troubleshooting

## After the Fix

1. Sign up with a **new test email** (old emails have old URL)
2. Check verification email
3. Link should now be: `https://sports-hub-khaki.vercel.app/auth/action?mode=verifyEmail&...`
4. Click link - should load your custom domain
5. Email verification should complete successfully

## Still Not Working?

1. **Wait longer** - Firebase caches email templates for 5-10 minutes
2. **Clear browser cache** - Old emails might be cached
3. **Use NEW email** - Old verification emails have old URL baked in
4. **Check you saved** - Look for "Template saved" confirmation in Console
5. **Try different browser** - Test in incognito/private mode

## Your Code is Already Correct

The code in `src/hooks/useAuth.jsx` is already configured correctly:

```javascript
const authActionCodeSettings = {
  url: 'https://sports-hub-khaki.vercel.app/auth/action',
  handleCodeInApp: false,
}
```

This will work perfectly once the Console setting is cleared.

## Quick Checklist

- [ ] Opened Firebase Console
- [ ] Cleared/set Action URL in Email address verification template
- [ ] Clicked Save and saw confirmation
- [ ] Waited 5-10 minutes
- [ ] Tested with NEW signup email
- [ ] Link now goes to sports-hub-khaki.vercel.app ✅

---

**Time Required:** 2 minutes + 5-10 minute cache wait  
**Difficulty:** Easy  
**Files to Read:** `FIREBASE_CONSOLE_STEPS.md` for detailed walkthrough
