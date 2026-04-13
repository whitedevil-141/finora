# 🚀 Finora Android App - START HERE

## ⚡ 3-Step Quick Start

### Step 1: Install & Setup (2 min)
```bash
cd finora-mobile
npm install
```

### Step 2: Start Backend (in terminal 2)
```bash
cd backend
python -m uvicorn main:app --reload
```

### Step 3: Run Android App
```bash
cd finora-mobile
npm run android
```

That's it! The app will open in Android emulator or Expo Go.

---

## 📱 Testing the App

**Login with demo account:**
- Email: `demo@finora.app`
- Password: `password123`

Or create a new account from signup screen.

---

## 📦 Build for Play Store

### APK (for sharing/testing)
```bash
npm run android:apk
```

### AAB (for Play Store - recommended)
```bash
npm run android:aab
```

---

## 📚 Documentation

- **[MOBILE_QUICKSTART.md](MOBILE_QUICKSTART.md)** - Full quick start
- **[finora-mobile/ANDROID_BUILD.md](finora-mobile/ANDROID_BUILD.md)** - Detailed build guide
- **[WEBAPP_TO_ANDROID_CONVERSION.md](WEBAPP_TO_ANDROID_CONVERSION.md)** - What was added

---

## ✅ What's Working

- ✅ Email/Password Login & Signup
- ✅ Real-time Account Sync
- ✅ Real-time Transaction Sync
- ✅ Add Accounts & Transactions
- ✅ User Profile Management
- ✅ Offline Support
- ✅ Session Persistence
- ✅ Theme Sync with DB

---

## 🔧 First Time Setup Checklist

- [ ] Install Node.js (v18+)
- [ ] Install Expo CLI: `npm install -g expo-cli`
- [ ] Install EAS CLI: `npm install -g eas-cli`
- [ ] Create Expo account at https://expo.dev
- [ ] Run `npm install` in finora-mobile/
- [ ] Backend running on localhost:8000
- [ ] Test login works
- [ ] Add test transaction

---

## ⚠️ Common Issues & Fixes

**Backend not connecting?**
```bash
# Check backend is running
curl http://localhost:8000/api/health

# Should return {"status": "ok", "database": "connected"}
```

**AsyncStorage not found?**
```bash
npm install @react-native-async-storage/async-storage
```

**Build failed?**
```bash
npm run android -- --clear
# or
eas build --platform android --profile preview --clear
```

---

## 📖 Next Steps

1. ✅ Get it running locally (above)
2. ✅ Test with demo account
3. ✅ Customize branding (`src/theme/colors.ts`)
4. ✅ Build APK: `npm run android:apk`
5. ✅ Upload to Play Store: `npm run android:aab`

---

## 🎯 Key Files to Know

| File | Purpose |
|------|---------|
| `finora-mobile/src/api/config.ts` | Backend URL (emulator vs device) |
| `finora-mobile/src/context/AuthContext.tsx` | Authentication logic |
| `finora-mobile/src/screens/LoginScreen.tsx` | Login UI |
| `finora-mobile/src/screens/DashboardScreen.tsx` | Home screen with real data |
| `finora-mobile/App.tsx` | Entry point |
| `finora-mobile/app.json` | App metadata & Expo config |

---

## 🚀 Ready to Deploy?

```bash
# Build production AAB
npm run android:aab

# Then:
# 1. Create Play Developer account ($25)
# 2. Upload AAB to Play Console
# 3. Add screenshots and description
# 4. Submit for review (~2-4 hours)
```

---

## 💡 Architecture Overview

```
Android Device/Emulator
    ↓
React Native App (Expo)
    ↓
API Client (AsyncStorage for offline)
    ↓
FastAPI Backend (localhost:8000)
    ↓
Supabase Database
```

Both web and mobile use the **same backend** and database!

---

**Questions?** Check the full documentation files linked above.

**Ready?** → Run the 3 commands above to get started! 🎉
