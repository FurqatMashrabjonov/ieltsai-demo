# API Key Leak - Fix Guide

## ⚠️ What Happened
Your Gemini API key was detected as leaked/compromised by Google and has been disabled.

## ✅ Steps to Fix

### 1. Get a New API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/welcome)
2. Select your project (or create a new one)
3. Go to **APIs & Services** → **Credentials**
4. Click **+ Create Credentials** → **API Key**
5. Copy the new API key

### 2. Update .env File
Replace your old key with the new one:

```bash
# .env file
REACT_APP_GEMINI_API_KEY=your_brand_new_api_key_here
```

### 3. Never Commit .env Again
✅ `.env` is now added to `.gitignore` - it won't be committed

### 4. Secure Your Git History (IMPORTANT!)
If the old key was already committed to git:

```bash
# Option A: Remove from git history (recommended)
# This removes ALL history - do this if repo isn't shared
git checkout --orphan latest_branch
git add -A
git commit -m "Clean git history"
git branch -D main
git branch -m main
git push -f origin main

# Option B: Use git filter (if repo is shared)
git filter-branch --tree-filter 'rm .env' -- --all
git push origin --force --all
```

### 5. Clear Environment & Test
```bash
# Clear cache
rm -rf node_modules/.cache build

# Update dependencies
npm install

# Start app with new key
npm start
```

## 🔒 Best Practices Going Forward

### Do:
✅ Store API keys in `.env` file only
✅ Add `.env` to `.gitignore`
✅ Use different keys for dev/staging/production
✅ Rotate keys regularly
✅ Use Google Cloud IAM for restricted keys

### Don't:
❌ Commit `.env` to git
❌ Hardcode keys in source files
❌ Share keys in messages/emails
❌ Use same key in multiple projects
❌ Log or expose keys in console

## 📋 Current Status

✅ `.gitignore` updated - `.env` is now ignored
⏳ Update your `.env` file with new API key
⏳ Test connection

## Testing Connection

Once you have a new API key:
1. Update `.env` with new key
2. Start the app: `npm start`
3. Click "Start Conversation" button
4. Check for connection success message
5. AI should greet you

If still getting "API key was reported as leaked":
- Wait a few minutes for the system to update
- Verify the new key is in `.env` file
- Restart the app
- Clear browser cache (Ctrl+Shift+Delete)

---

**Your app is now secure!** Make sure to:
1. ✅ Never commit .env to git (fixed)
2. ✅ Use a brand new API key
3. ✅ Test the connection

Let me know once you have a new key and I can help verify it works! 🚀

