# 🚀 Deploy Commands - Run These Now

## What Changed

- Email links now go to: `sportshub-ffba8.firebaseapp.com/__/auth/action`
- Verification page shows on Firebase domain
- After success, redirects to: `sports-hub-khaki.vercel.app/login`

## Run These Commands

### 1. Build the App

```bash
npm run build
```

### 2. Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

### 3. Deploy to Vercel

```bash
git add .
git commit -m "feat: email verification via Firebase hosting with redirect to Vercel"
git push origin main
```

## That's It!

Wait 5 minutes, then test:

1. Sign up with a test email
2. Click verification link in email (will be Firebase domain)
3. Should show verification page
4. After 2 seconds, redirects to Vercel login
5. Log in successfully ✅

---

**See `FINAL_DEPLOYMENT_GUIDE.md` for complete details and troubleshooting**
