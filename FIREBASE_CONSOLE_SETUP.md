# 🔥 Firebase Console Setup - Required Steps

## ⚠️ CRITICAL: Must Complete Before Deployment

This implementation requires **ONE critical setup step** in Firebase Console. Without it, email verification will fail.

## Required Setup (5 minutes)

### Step 1: Add Authorized Domain

1. **Navigate to Firebase Console**
   - Go to: https://console.firebase.google.com/
   - Select your project

2. **Open Authentication Settings**
   - Click **Authentication** in left sidebar
   - Click **Settings** tab at the top
   - Click **Authorized domains** in the settings page

3. **Add Your Domain**
   - Click **Add domain** button
   - Enter: `sports-hub-khaki.vercel.app`
   - Click **Add**

4. **Verify**
   - Confirm `sports-hub-khaki.vercel.app` appears in the list
   - Should see status: "Active"

### Screenshots Guide

```
Firebase Console
├── Authentication (sidebar)
│   ├── Users
│   ├── Sign-in method
│   └── Settings ← Click here
│       ├── Authorized domains ← Then click here
│       │   ├── localhost (default)
│       │   ├── your-project.firebaseapp.com (default)
│       │   └── [Add domain] button ← Click this
│       │       └── Enter: sports-hub-khaki.vercel.app
│       └── Save
```

## Why This Is Required

Firebase blocks email action link redirects to unauthorized domains as a security feature. Without adding your domain:

- ❌ Verification emails will be sent
- ❌ Users will click the verification link
- ❌ Firebase will reject the redirect
- ❌ Users will see "unauthorized domain" error

With your domain added:

- ✅ Verification emails are sent
- ✅ Users click the verification link
- ✅ Firebase redirects to your auth action page
- ✅ Email verification completes successfully

## Optional Setup (Recommended)

### Check Email/Password Authentication

1. Navigate to: **Authentication** → **Sign-in method**
2. Ensure **Email/Password** is **Enabled**
3. If not enabled:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"

### Review Email Templates (Optional)

1. Navigate to: **Authentication** → **Templates**
2. Click on **Email address verification**
3. You can customize:
   - From name
   - Reply-to email
   - Subject line
   - Email body text
4. **DO NOT change "Action URL"** - our code handles this programmatically

### Default Template Example

```
From: noreply@your-project.firebaseapp.com
To: user@example.com
Subject: Verify your email for %APP_NAME%

Hi,

Follow this link to verify your email address.

%LINK%

If you didn't ask to verify this address, you can ignore this email.

Thanks,

Your %APP_NAME% team
```

## Local Development Setup (Optional)

If you want to test email verification locally:

### Step 1: Add localhost to Authorized Domains

1. Navigate to: **Authentication** → **Settings** → **Authorized domains**
2. Click **Add domain**
3. Enter: `localhost`
4. Click **Add**

Note: `localhost` may already be added by default.

### Step 2: Update Code Temporarily

In `src/hooks/useAuth.jsx`:

```javascript
// Change temporarily for local testing:
const AUTH_ACTION_URL = 'http://localhost:5173/auth/action'

// Remember to change back before committing:
const AUTH_ACTION_URL = 'https://sports-hub-khaki.vercel.app/auth/action'
```

## Verification Checklist

After completing setup, verify:

- [ ] `sports-hub-khaki.vercel.app` is in Authorized domains list
- [ ] Domain shows "Active" status
- [ ] Email/Password authentication is enabled
- [ ] No other special configuration needed

## What You DON'T Need to Configure

### ❌ Email Action URL

**Location:** Authentication → Templates → Email address verification → Customize → Action URL

**Action:** Leave this empty or with default value

**Reason:** Our code sets this programmatically using `ActionCodeSettings`. The code configuration takes precedence over Console settings.

### ❌ Custom Email Template Changes

**Location:** Authentication → Templates

**Action:** No changes required (but customization is optional)

**Reason:** Default templates work fine. You can customize later if desired.

### ❌ Dynamic Links

**Location:** Build → Engage → Dynamic Links

**Action:** Not needed

**Reason:** We use direct links, not Firebase Dynamic Links.

## Common Questions

### Q: Do I need to configure the "Action URL" in email templates?

**A:** No! Our code sets this via `authActionCodeSettings`. Leave the Console setting empty.

### Q: What if I have multiple environments (dev, staging, prod)?

**A:** Add all domains to Authorized domains:
- `localhost` (for local dev)
- `dev.your-domain.com` (if you have staging)
- `sports-hub-khaki.vercel.app` (production)

### Q: Can I use a custom domain instead of Vercel subdomain?

**A:** Yes! Just:
1. Configure custom domain in Vercel
2. Add custom domain to Firebase Authorized domains
3. Update `AUTH_ACTION_URL` in code to use custom domain

### Q: How long does it take for changes to take effect?

**A:** Usually immediate, but allow 5-10 minutes for DNS propagation if you just added the domain.

### Q: What if I forget to add the domain?

**A:** Users will see an error when clicking verification links. Just add the domain and ask users to request a new verification email.

## Testing After Setup

### Quick Test

1. Visit your deployed site: `https://sports-hub-khaki.vercel.app`
2. Click "Sign Up"
3. Complete registration form
4. Submit
5. Check email inbox (including spam folder)
6. Click verification link in email
7. Should redirect to your `/auth/action` page
8. Should show success message
9. Should redirect to login page

### If Test Fails

#### Error: "Unauthorized domain"
- **Fix:** Add `sports-hub-khaki.vercel.app` to Authorized domains
- **Wait:** 5-10 minutes for changes to propagate
- **Retry:** Request new verification email

#### Error: Email not received
- **Check:** Spam/junk folder
- **Check:** Email/Password auth is enabled
- **Check:** Firebase quota limits (Console → Usage)
- **Try:** Different email provider (Gmail, Outlook)

#### Error: Link doesn't work
- **Check:** Domain is in Authorized domains list
- **Check:** `/auth/action` route is accessible (visit directly)
- **Check:** Browser console for errors
- **Check:** Network tab for failed requests

## Firebase Project Settings Reference

### Project Overview
```
Firebase Console
├── Project Overview
│   └── Project settings (gear icon)
│       ├── General
│       │   ├── Project name
│       │   ├── Project ID
│       │   └── Web API Key (used in .env)
│       └── Your apps
│           └── Web app config
```

### Authentication Settings
```
Firebase Console
├── Authentication
│   ├── Users (view registered users)
│   ├── Sign-in method (enable/disable auth providers)
│   ├── Templates (email templates)
│   └── Settings
│       ├── Authorized domains ← REQUIRED SETUP
│       ├── User actions
│       └── Sign-in restrictions
```

## Summary

### Must Do ✅
1. Add `sports-hub-khaki.vercel.app` to Firebase Authorized Domains
2. Ensure Email/Password authentication is enabled

### Nice to Have 📝
1. Customize email templates (optional)
2. Add localhost for local testing (optional)
3. Review Firebase usage quotas (optional)

### Don't Change ❌
1. Email Action URL in templates (code handles this)
2. Dynamic Links settings (not used)
3. Any other advanced authentication settings

## Completion

Once you've added the authorized domain, you're done! The code handles everything else programmatically.

### Quick Verification Command

After adding the domain, test with:

```bash
# Deploy to production
git push origin main

# Or deploy directly with Vercel CLI
vercel --prod

# Then test signup flow in browser
```

---

**Setup Time:** ~5 minutes  
**Difficulty:** Easy  
**Required:** Yes (critical for production)

**Next Step:** Deploy your code and test the email verification flow!

## Support

If you encounter issues:
1. Check this guide first
2. Review `docs/EMAIL_VERIFICATION_SETUP.md` for technical details
3. Check Firebase Console logs for errors
4. Check browser console for client-side errors
5. Review Vercel deployment logs

---

✅ **That's it! Just add the domain and you're ready to deploy.**
