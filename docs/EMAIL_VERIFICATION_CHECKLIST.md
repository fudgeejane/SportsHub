# Email Verification Setup Checklist ✅

## Firebase Console Configuration

### Step 1: Add Authorized Domain
- [ ] Go to [Firebase Console](https://console.firebase.google.com/)
- [ ] Select your project
- [ ] Navigate to **Authentication** → **Settings** → **Authorized domains**
- [ ] Click **Add domain**
- [ ] Add: `sports-hub-khaki.vercel.app`
- [ ] Save changes

### Step 2: Verify Email Templates (Optional)
- [ ] Navigate to **Authentication** → **Templates**
- [ ] Click **Email address verification**
- [ ] Ensure template is enabled
- [ ] **DO NOT** change the Action URL - our code handles this programmatically
- [ ] Customize email content if desired (optional)

### Step 3: Verify Authentication Method
- [ ] Navigate to **Authentication** → **Sign-in method**
- [ ] Ensure **Email/Password** is enabled
- [ ] Ensure **Google** is enabled (if using Google sign-in)

## Code Verification

### Step 4: Verify Action Code Settings
- [ ] Open `src/hooks/useAuth.jsx`
- [ ] Locate `authActionCodeSettings` constant
- [ ] Verify `url` is set to: `https://sports-hub-khaki.vercel.app/auth/action`
- [ ] Verify `handleCodeInApp` is set to: `false`

```javascript
const authActionCodeSettings = {
  url: 'https://sports-hub-khaki.vercel.app/auth/action',
  handleCodeInApp: false,
}
```

### Step 5: Verify Auth Action Page
- [ ] Open `src/pages/auth/AuthActionPage.jsx`
- [ ] Verify `mode === 'verifyEmail'` block exists
- [ ] Verify redirect to `PUBLIC_ROUTES.signIn` after success
- [ ] Verify error handling for expired/invalid codes

### Step 6: Verify Routes
- [ ] Open `src/routes/PublicRoutes.jsx`
- [ ] Verify `/auth/action` route exists
- [ ] Verify it points to `<AuthActionPage />`

## Environment Variables

### Step 7: Verify .env Configuration
- [ ] Open `.env` file
- [ ] Verify all Firebase variables are set:

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Testing

### Step 8: Local Testing
- [ ] Run development server: `npm run dev`
- [ ] Temporarily change `AUTH_ACTION_URL` to `http://localhost:5173/auth/action`
- [ ] Sign up with a test email
- [ ] Check email inbox
- [ ] Click verification link
- [ ] Verify redirect to `/auth/action` works
- [ ] Verify success message appears
- [ ] Verify auto-redirect to `/login` after 2.2 seconds
- [ ] Change `AUTH_ACTION_URL` back to production URL
- [ ] Commit changes

### Step 9: Production Testing
- [ ] Deploy to Vercel: `vercel --prod` or push to main branch
- [ ] Sign up with a new test email
- [ ] Check email inbox
- [ ] Click verification link
- [ ] Verify redirect to `https://sports-hub-khaki.vercel.app/auth/action` works
- [ ] Verify email verification succeeds
- [ ] Verify auto-redirect to login page
- [ ] Try logging in with verified account

### Step 10: Error Handling Testing
- [ ] Request verification email
- [ ] Click verification link (should succeed)
- [ ] Click the same link again (should show "already used" error)
- [ ] Request new verification email
- [ ] Wait 1+ hour for link to expire (or manipulate code for testing)
- [ ] Try expired link (should show "expired" error)

## Common Issues

### Issue: Domain Not Authorized
**Symptoms:** Error message about unauthorized domain
**Fix:**
- [ ] Add `sports-hub-khaki.vercel.app` to Firebase Authorized Domains
- [ ] Wait 5-10 minutes for changes to propagate
- [ ] Clear browser cache

### Issue: Email Not Sending
**Symptoms:** No verification email received
**Checklist:**
- [ ] Check spam/junk folder
- [ ] Verify email/password auth is enabled in Firebase
- [ ] Check Firebase Console → Authentication → Templates (enabled?)
- [ ] Check Firebase Console → Usage for quota limits
- [ ] Try with a different email provider (Gmail, Outlook, etc.)

### Issue: Redirect Not Working
**Symptoms:** Clicking link does nothing or shows error
**Checklist:**
- [ ] Verify `handleCodeInApp: false` (not `true`)
- [ ] Verify authorized domain is added
- [ ] Check browser console for errors
- [ ] Verify `/auth/action` route is accessible (visit manually)
- [ ] Check network tab for failed requests

### Issue: "Action Link Expired" Immediately
**Symptoms:** Link shows expired even though just received
**Causes:**
- [ ] User clicked an old verification link from a previous email
- [ ] User already verified this email with the current link
- [ ] System clock is incorrect (check device time)
**Fix:**
- [ ] Request a new verification email
- [ ] Delete old emails to avoid confusion

## Success Criteria

Your email verification is properly set up when:

- ✅ Signup triggers automatic verification email
- ✅ Email contains link to `https://sports-hub-khaki.vercel.app/auth/action?mode=verifyEmail&oobCode=...`
- ✅ Clicking link shows loading state
- ✅ Success message appears after verification
- ✅ Auto-redirect to login page after 2.2 seconds
- ✅ Login page shows "Email verified" success message
- ✅ User can login after verification
- ✅ Expired links show appropriate error message
- ✅ Already-used links show appropriate error message
- ✅ Manual verification resend works from verify-email page

## Additional Notes

### For Development Environment
If testing locally, temporarily update `AUTH_ACTION_URL`:

```javascript
// For local testing only
const AUTH_ACTION_URL = 'http://localhost:5173/auth/action'

// For production (default)
const AUTH_ACTION_URL = 'https://sports-hub-khaki.vercel.app/auth/action'
```

**Remember:** Add `localhost:5173` to Firebase Authorized Domains for local testing!

### For Multiple Environments
Consider using environment-based configuration:

```javascript
const AUTH_ACTION_URL = import.meta.env.VITE_APP_URL + '/auth/action'
```

Then set in `.env`:
```
VITE_APP_URL=https://sports-hub-khaki.vercel.app
```

## Next Steps

After completing this checklist:
1. Document any custom changes in team wiki
2. Add monitoring for verification success/failure rates
3. Set up email deliverability monitoring
4. Consider implementing email verification reminders
5. Add analytics tracking for verification flow

## Support

For issues or questions:
- Check `docs/EMAIL_VERIFICATION_SETUP.md` for detailed implementation
- Review Firebase Authentication documentation
- Check Firebase Console logs for errors
- Review browser console for client-side errors
