# Finora Mobile App - Android Build Guide

## Prerequisites

1. **Node.js & npm** (v18+)
2. **Expo CLI**: `npm install -g expo-cli`
3. **EAS CLI**: `npm install -g eas-cli`
4. **Android Studio** (optional, for emulator)
5. **Expo Account** (free at https://expo.dev)

## Setup

### 1. Install Dependencies

```bash
cd finora-mobile
npm install
```

### 2. Login to Expo

```bash
eas login
```

### 3. Configure API Endpoint

Edit `src/api/config.ts`:
- **Android Emulator**: Use `http://10.0.2.2:8000/api` (points to localhost on host machine)
- **Physical Device**: Use your machine's IP (e.g., `http://192.168.1.100:8000/api`)

## Development

### Test on Emulator

```bash
npm run android
```

This opens the Expo dev client on Android emulator.

### Test on Physical Device

1. Install Expo Go from Play Store
2. Run: `npx expo start`
3. Scan QR code with Expo Go app

## Build for Production

### Option 1: Build APK (for direct installation)

```bash
npm run android:apk
```

This builds a preview APK. Install with:
```bash
adb install app-release.apk
```

### Option 2: Build AAB (for Play Store)

```bash
npm run android:aab
```

Upload to Google Play Console.

## Backend Setup

Ensure backend is running:
```bash
cd ../backend
python -m uvicorn main:app --reload
```

**Important**: Backend must be accessible from device/emulator!

## Testing Credentials

- Email: `demo@finora.app`
- Password: `password123`

Or create a new account from the signup screen.

## Troubleshooting

### App won't connect to backend

1. Check backend is running (`http://localhost:8000/api/health`)
2. Verify API endpoint in `src/api/config.ts`
3. On device: Use your machine's local IP, not localhost
4. On emulator: Use `10.0.2.2` instead of `localhost`

### Build fails

```bash
# Clear cache
npm run android -- --clear

# Or completely reset
rm -rf node_modules package-lock.json
npm install
```

### AsyncStorage not working

Make sure `@react-native-async-storage/async-storage` is installed:
```bash
npm install @react-native-async-storage/async-storage
```

## App Features

✅ User authentication (email/password)
✅ Real-time account & transaction sync
✅ Offline support with local storage
✅ Multi-currency support
✅ Transaction analytics
✅ User profile management
✅ Dark/light theme

## Architecture

- **Frontend**: React Native with Expo
- **Backend**: FastAPI (shared with web app)
- **Database**: Supabase (PostgreSQL)
- **Storage**: AsyncStorage for offline data
- **Build**: EAS Build service

## Next Steps

1. Upload signed APK to Play Store
2. Configure Google OAuth for mobile (if needed)
3. Add push notifications
4. Implement biometric authentication
