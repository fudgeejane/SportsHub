# 📸 Firebase Console - Visual Step-by-Step Guide

## Fix: Email Links Going to Wrong Domain

Your email verification links are going to `sportshub-ffba8.firebaseapp.com` instead of `sports-hub-khaki.vercel.app`. Here's how to fix it:

---

## Step-by-Step Instructions

### Step 1: Open Firebase Console

1. Go to: **https://console.firebase.google.com/**
2. Click on your project: **sportshub-ffba8**

```
┌─────────────────────────────────────────┐
│  Firebase Console                       │
├─────────────────────────────────────────┤
│  Your Projects:                         │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  sportshub-ffba8                  │ │ ← Click here
│  │  Project ID: sportshub-ffba8      │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

### Step 2: Navigate to Authentication

Look at the **left sidebar** and click **"Authentication"**

```
Left Sidebar:
┌─────────────────────────┐
│ ⚡ Getting started       │
│ 📊 Project Overview      │
│ 🔥 Spark hub            │
│                          │
│ Build                    │
│ ├── 🔐 Authentication   │ ← Click here
│ ├── 📁 Firestore        │
│ ├── 💾 Storage          │
│ └── 🔧 Functions        │
└─────────────────────────┘
```

---

### Step 3: Open Templates Tab

At the top of the Authentication page, click the **"Templates"** tab

```
Authentication Page Tabs:
┌───────────────────────────────────────────────┐
│ Users | Sign-in method | Templates | Settings │ ← Click "Templates"
└───────────────────────────────────────────────┘
```

---

### Step 4: Find Email Address Verification

In the Templates page, you'll see a list of email templates. Find and click **"Email address verification"**

```
Templates:
┌──────────────────────────────────────────────┐
│ SMS                                           │
├──────────────────────────────────────────────┤
│ ✉️  Email address verification               │ ← Click here
│     Verify your email for %APP_NAME%         │
│                                              │
├──────────────────────────────────────────────┤
│ ✉️  Password reset                           │
│     Reset your password for %APP_NAME%       │
└──────────────────────────────────────────────┘
```

---

### Step 5: Find the Action URL Section

Scroll down in the email template editor. You'll see:

```
Email Template Editor:
┌──────────────────────────────────────────────┐
│ Sender name:                                 │
│ ┌──────────────────────────────────────────┐│
│ │ SportsHub                                ││
│ └──────────────────────────────────────────┘│
│                                              │
│ Subject:                                     │
│ ┌──────────────────────────────────────────┐│
│ │ Verify your email for %APP_NAME%         ││
│ └──────────────────────────────────────────┘│
│                                              │
│ Message:                                     │
│ ┌──────────────────────────────────────────┐│
│ │ Follow this link to verify...            ││
│ └──────────────────────────────────────────┘│
│                                              │
│ Action URL: ℹ️                               │ ← Find this section
│ ┌──────────────────────────────────────────┐│
│ │ https://sportshub-ffba8.firebaseapp...  ││ ← This is the problem!
│ └──────────────────────────────────────────┘│
│ [Customize action URL]                       │ ← Click this button
└──────────────────────────────────────────────┘
```

---

### Step 6: Clear the Custom Action URL

Click **"Customize action URL"** button, then you'll see:

```
Customize Action URL Dialog:
┌──────────────────────────────────────────────┐
│ Action URL                                   │
│                                              │
│ ⚠️  An error occurred updating action URL    │ ← You may see this
│                                              │
│ ┌──────────────────────────────────────────┐│
│ │ https://sportshub-ffba8.firebaseapp.com/ ││ ← Current value
│ │ __/auth/action                           ││
│ └──────────────────────────────────────────┘│
│                                              │
│ [Cancel]                        [Save]       │
└──────────────────────────────────────────────┘
```

**CRITICAL:** You have TWO options:

#### Option A: Clear It Completely (RECOMMENDED)

1. **Delete all text** from the Action URL field
2. Leave it **completely empty**
3. Click **Save**

```
After clearing:
┌──────────────────────────────────────────────┐
│ Action URL                                   │
│                                              │
│ ┌──────────────────────────────────────────┐│
│ │                                          ││ ← Empty!
│ └──────────────────────────────────────────┘│
│                                              │
│ [Cancel]                        [Save]       │
└──────────────────────────────────────────────┘
```

#### Option B: Change to Your Custom Domain

1. **Replace** the URL with: `https://sports-hub-khaki.vercel.app/auth/action`
2. Click **Save**

```
After changing:
┌──────────────────────────────────────────────┐
│ Action URL                                   │
│                                              │
│ ┌──────────────────────────────────────────┐│
│ │ https://sports-hub-khaki.vercel.app/     ││
│ │ auth/action                              ││
│ └──────────────────────────────────────────┘│
│                                              │
│ [Cancel]                        [Save]       │
└──────────────────────────────────────────────┘
```

---

### Step 7: Save Changes

Click the blue **"Save"** button

```
┌──────────────────────────────────────────────┐
│                                              │
│ [Cancel]                        [Save] ←Click│
└──────────────────────────────────────────────┘
```

You should see a success message: ✅ "Template saved"

---

### Step 8: Repeat for Password Reset (Optional but Recommended)

Go back to Templates list and repeat Steps 4-7 for **"Password reset"**:

1. Click **"Password reset"** template
2. Scroll to **"Action URL"**
3. Click **"Customize action URL"**
4. **Clear it** or change to `https://sports-hub-khaki.vercel.app/auth/action`
5. Click **Save**

---

## Verification

### Test the Fix

1. **Wait 5-10 minutes** for Firebase cache to clear
2. **Sign up with a NEW test email** (or request new verification email)
3. **Check your inbox** for the verification email
4. **Inspect the link** in the email (right-click → Copy link address)

**Before Fix:**
```
https://sportshub-ffba8.firebaseapp.com/__/auth/action?mode=verifyEmail&oobCode=...
```

**After Fix:**
```
https://sports-hub-khaki.vercel.app/auth/action?mode=verifyEmail&oobCode=...
```

5. **Click the link** - should now go to your custom domain!

---

## Troubleshooting

### Problem: "An error occurred updating action URL"

This error message in Firebase Console is **misleading** - it doesn't mean you did anything wrong. It's a known Firebase Console bug when trying to clear the action URL.

**Solutions:**

1. **Ignore the error and click Save anyway** - it usually works despite the error message
2. **Try in a different browser** (Chrome, Firefox, Edge)
3. **Clear your browser cache** and try again
4. **Use Option B instead** - explicitly set your domain instead of clearing

### Problem: Link still goes to firebaseapp.com

1. **Make sure you saved the changes** (look for "Template saved" confirmation)
2. **Wait 5-10 minutes** for Firebase to clear cached email templates
3. **Request a NEW verification email** (old emails have old URL baked in)
4. **Check you edited the right template** (Email address verification, not Password reset)
5. **Try clearing browser cache and cookies**

### Problem: Can't find "Customize action URL" button

The button might be labeled differently:
- "Customize action URL"
- "Edit action URL"  
- A pencil ✏️ icon next to the Action URL field

Or, the Action URL field might be directly editable without a button.

---

## Visual Summary

```
Firebase Console Flow:
────────────────────────────────────────────────
1. console.firebase.google.com
   ↓
2. Click project: sportshub-ffba8
   ↓
3. Left sidebar → Authentication
   ↓
4. Top tabs → Templates
   ↓
5. Click: Email address verification
   ↓
6. Scroll to: Action URL section
   ↓
7. Click: Customize action URL
   ↓
8. DELETE/CLEAR the URL field
   ↓
9. Click: Save
   ↓
10. Done! Wait 5-10 mins, then test
────────────────────────────────────────────────
```

---

## Important Notes

### Why Clear is Better Than Change

**Clearing the Action URL:**
- ✅ Your code's `authActionCodeSettings` takes full control
- ✅ Works for all environments (dev, staging, prod) automatically
- ✅ No need to update Console when changing domains
- ✅ Easier to manage

**Setting a Custom URL:**
- ❌ Must update Console for each environment
- ❌ Code and Console must stay in sync
- ❌ More error-prone

### Your Code is Already Correct

The issue is **not in your code** - it's in Firebase Console overriding your code. Your code in `src/hooks/useAuth.jsx` is already correct:

```javascript
const authActionCodeSettings = {
  url: 'https://sports-hub-khaki.vercel.app/auth/action',
  handleCodeInApp: false,
}
```

Once you clear the Console setting, this code will work perfectly.

---

## Quick Checklist

- [ ] Opened Firebase Console
- [ ] Selected sportshub-ffba8 project
- [ ] Went to Authentication → Templates
- [ ] Clicked "Email address verification"
- [ ] Found "Action URL" section
- [ ] Clicked "Customize action URL"
- [ ] Cleared/deleted the URL field (or set to your domain)
- [ ] Clicked Save
- [ ] Saw "Template saved" confirmation
- [ ] Waited 5-10 minutes
- [ ] Tested with NEW signup email
- [ ] Link now goes to sports-hub-khaki.vercel.app ✅

---

## Need Help?

If you're still stuck:
1. Take a screenshot of your Templates page
2. Take a screenshot of the Action URL field
3. Check the email source to see the actual link
4. Try in incognito/private browsing mode

The fix should work immediately after saving and waiting a few minutes for cache to clear.

---

**Expected Time:** 2 minutes to make change + 5-10 minutes for cache  
**Difficulty:** Easy  
**Impact:** Critical (fixes verification redirect)
