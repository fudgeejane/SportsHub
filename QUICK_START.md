# ⚡ Quick Start - Email Verification

## TL;DR

Email verification is ready. Just do these 3 things:

1. **Add domain to Firebase** (5 min)
2. **Deploy code** (5 min)
3. **Test it works** (5 min)

Total time: **15 minutes**

---

## Step 1: Firebase Setup (5 min)

### Add Authorized Domain

1. Go to: https://console.firebase.google.com/
2. Select your project
3. Click: **Authentication** → **Settings** → **Authorized domains**
4. Click: **Add domain**
5. Enter: `sports-hub-khaki.vercel.app`
6. Click: **Add**

✅ Done! That's the only Firebase setup needed.

---

## Step 2: Deploy (5 min)

### Commit and Push

```bash
# Check changes
git status

# Add all files
git add .

# Commit
git commit -m "feat: implement programmatic email verification"

# Push (triggers Vercel deployment)
git push origin main
```

Wait for Vercel to deploy (~2 minutes).

---

## Step 3: Test (5 min)

### Test the Full Flow

1. Visit: https://sports-hub-khaki.vercel.app
2. Click "Sign Up"
3. Fill in form and submit
4. Check email inbox (including spam)
5. Click verification link in email
6. Should redirect to `/auth/action`
7. Should show success message
8. Should auto-redirect to login (2.2s)
9. Log in with verified account

✅ If all steps work, you're done!

---

## ❌ If Something Goes Wrong

### Email not received?
- Check spam folder
- Wait a few minutes (can take up to 60 seconds)
- Try different email provider (Gmail, Outlook)

### "Unauthorized domain" error?
- Double-check domain was added to Firebase
- Wait 5-10 minutes for changes to propagate
- Clear browser cache and try again

### Link doesn't work?
- Check if link was already clicked (can only use once)
- Check if link is expired (>1 hour old)
- Request new verification email

---

## 📚 More Help?

- **Quick reference**: `docs/EMAIL_VERIFICATION_QUICK_REFERENCE.md`
- **Setup guide**: `FIREBASE_CONSOLE_SETUP.md`
- **Complete docs**: `docs/EMAIL_VERIFICATION_SETUP.md`
- **Troubleshooting**: `docs/EMAIL_VERIFICATION_CHECKLIST.md`

---

## ✅ Success Criteria

Your setup is working when:
- ✅ Signup sends email
- ✅ Verification link works
- ✅ Email gets verified
- ✅ User can log in

---

## 🎉 That's It!

Three simple steps:
1. ✅ Add domain to Firebase
2. ✅ Deploy code
3. ✅ Test it works

**Total time: 15 minutes**

---

Need more details? Start with `FIREBASE_CONSOLE_SETUP.md` →
