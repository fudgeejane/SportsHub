# SportsHub

SportsHub is a React + Vite web application for managing community sports programs and role-based access. It provides:

- User authentication and role assignment
- Admin/organizer dashboard for user approval and role management
- Coach, facilitator, and player dashboards
- Common workspace navigation for projects, tasks, analytics, scheduling, and workflows
- Firebase Auth + Firestore integration for secure user state and permissions

## System overview

The app uses a Firebase-backed auth flow with a Firestore `users` collection to store:

- `uid`, `email`, `displayName`
- `role` and access rights
- `status` for pending/approved/rejected access
- `emailVerified` state

The UI is built with React, Vite, Tailwind CSS, and React Router.

## Getting started

### Prerequisites

- Node.js 18+ installed
- npm installed
- Firebase project with Auth and Firestore enabled

### Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file from `.env.example` or add the required Firebase keys:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_ADMIN_SETUP_CODE=SPORTSHUB_ADMIN_SETUP
```

3. Run the development server:

```bash
npm run dev
```

4. Open the local URL shown in the terminal, typically `http://localhost:5173`.

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Email Verification

SportsHub uses **programmatic email verification** that requires minimal Firebase Console configuration.

### Quick Setup (15 minutes)

1. **Add domain to Firebase Authorized Domains**
   - Go to Firebase Console → Authentication → Settings → Authorized domains
   - Add: `sports-hub-khaki.vercel.app` (or your custom domain)

2. **Deploy the code**
   ```bash
   git push origin main
   ```

3. **Test the flow**
   - Sign up → Check email → Click verification link → Log in

**That's it!** See [`QUICK_START.md`](./QUICK_START.md) for details.

### Documentation

- **Quick Start**: [`QUICK_START.md`](./QUICK_START.md) - 15-minute setup guide
- **Firebase Setup**: [`FIREBASE_CONSOLE_SETUP.md`](./FIREBASE_CONSOLE_SETUP.md) - Detailed Firebase instructions
- **Technical Details**: [`docs/EMAIL_VERIFICATION_SETUP.md`](./docs/EMAIL_VERIFICATION_SETUP.md) - Complete implementation guide
- **Quick Reference**: [`docs/EMAIL_VERIFICATION_QUICK_REFERENCE.md`](./docs/EMAIL_VERIFICATION_QUICK_REFERENCE.md) - Developer cheat sheet

### How It Works

Users receive a verification email with a link to `/auth/action`. The page:
- ✅ Validates the verification code
- ✅ Verifies the email automatically
- ✅ Displays success message
- ✅ Redirects to login after 2.2 seconds

All configuration is in code - no Firebase Console email action URL setup needed!

## Notes

- The admin setup page creates a Community Organizer account with approved access.
- The app uses Firestore security rules to protect user documents and allow only approved organizers/admins to manage user roles.
- If the app reports `ERR_BLOCKED_BY_CLIENT` for Firestore connection, disable browser extensions or privacy blockers.

## Troubleshooting

### ERR_BLOCKED_BY_CLIENT Error

If you see `ERR_BLOCKED_BY_CLIENT` errors when signing up or signing in, this means your browser is blocking connections to Firebase/Firestore. Try these solutions:

1. **Disable browser extensions** that block ads or trackers:
   - uBlock Origin
   - AdBlock/AdBlock Plus
   - Privacy Badger
   - Ghostery
   - Any other ad/tracker blockers

2. **Disable browser privacy features**:
   - **Brave Browser**: Turn off "Shields" for localhost
   - **Firefox**: Disable Enhanced Tracking Protection for localhost
   - **Chrome**: Check if any security extensions are active

3. **Check firewall/antivirus**:
   - Some antivirus software blocks Firebase connections
   - Temporarily disable to test

4. **Try a different browser**:
   - Chrome (without extensions)
   - Edge
   - Firefox (with tracking protection disabled)

5. **Whitelist Firebase domains**:
   Add these to your ad blocker's whitelist:
   - `*.firebaseapp.com`
   - `*.googleapis.com`
   - `*.google.com`
   - `firestore.googleapis.com`
