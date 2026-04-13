# Finora Android App - Quick Start Guide

## What's Been Set Up

✅ **React Native App** with Expo
✅ **Authentication System** (email/password + token-based)
✅ **Real API Integration** (connects to your FastAPI backend)
✅ **AsyncStorage** for offline persistence
✅ **Navigation** (bottom tab navigation + stack navigation)
✅ **Dashboard** with real account & transaction data
✅ **User Management** (login, signup, logout)

## 5-Minute Setup

### Step 1: Install Node Dependencies
```bash
cd finora-mobile
npm install
```

### Step 2: Start Backend (in another terminal)
```bash
cd backend
python -m uvicorn main:app --reload
```
This runs on `http://localhost:8000`

### Step 3: Run on Android Emulator
```bash
npm run android
```

Or if you have a physical device, run:
```bash
npx expo start
```
Then scan QR code with **Expo Go** app from Play Store

## Testing

1. **Create a test account** from the app's signup screen
2. **Or use demo account:**
   - Email: `demo@finora.app`
   - Password: `password123`

3. **Add some transactions** to see data on dashboard

## What's Connected

| Component | Status |
|-----------|--------|
| Login/Signup | ✅ Working |
| Dashboard | ✅ Shows real accounts & transactions |
| Add Transaction | ✅ Saves to backend |
| Add Account | ✅ Saves to backend |
| Offline Mode | ✅ Built in (AsyncStorage) |
| Theme Preference | ✅ Syncs with DB |

## Next Steps to Customize

### 1. Add More Screens
Update `src/screens/` to match your web app features

### 2. Customize Colors
Edit `src/theme/colors.ts` for branding

### 3. Add Push Notifications
```bash
npm install expo-notifications
```

### 4. Build for Play Store
```bash
npm run android:aab
# Then upload AAB file to Google Play Console
```

## Build Options

### Dev Testing
```bash
npm run android
# or
npx expo start --android
```

### Production APK (shareable)
```bash
npm run android:apk
```

### Play Store (recommended)
```bash
npm run android:aab
```

## Troubleshooting

**Can't connect to backend?**
- Make sure backend is running: `curl http://localhost:8000/api/health`
- Check `src/api/config.ts` API endpoint
- On physical device: Use your machine's IP instead of localhost

**AsyncStorage errors?**
```bash
npm install @react-native-async-storage/async-storage
npx expo prebuild --clean
```

**Build issues?**
```bash
npm run android -- --clear
```

## Project Structure

```
finora-mobile/
├── src/
│   ├── api/                  # API client (config + functions)
│   ├── context/              # AuthContext
│   ├── screens/              # Screen components
│   ├── navigation/           # Navigation setup
│   ├── components/           # Reusable components
│   └── theme/                # Colors & styling
├── App.tsx                   # Entry point
├── app.json                  # Expo config
├── eas.json                  # EAS Build config
└── ANDROID_BUILD.md          # Detailed build guide
```

## Key Features Working

- **Real-time Sync**: All changes sync with backend instantly
- **Offline Support**: Works without internet (queued for sync)
- **Session Persistence**: Stays logged in between app restarts
- **JWT Authentication**: Secure token-based auth
- **Multi-Account**: Manage multiple accounts/categories

## Deploy to Play Store

1. Create Google Play developer account ($25 one-time)
2. Build AAB: `npm run android:aab`
3. Sign in with your Google account to EAS
4. Upload AAB to Play Console
5. Set up store listing (screenshots, description, etc.)
6. Submit for review (~2-4 hours)

## Support

For issues:
1. Check backend logs: `python -m uvicorn main:app --reload`
2. Check app logs: `npx expo start` to see console output
3. Check AsyncStorage: `adb shell` → `run-as com.yourapp cat /data/data/com.yourapp/files/...`

## Need More Features?

The mobile app shares the same backend as the web app, so you can:
- Update API endpoints and mobile automatically uses new features
- Add new screens following the same pattern
- Use the same authentication system
- Share business logic between web and mobile

Happy building! 🚀
