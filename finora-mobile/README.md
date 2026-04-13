# Finora Mobile (Expo)

React Native Expo app for the Finora mobile experience. This is a separate mobile workspace that mirrors the core structure of the web app with placeholder screens.

## Quick start

```bash
npm install
npm run android
```

## Android APK build (release)

This uses EAS Build. You will need an Expo account and EAS CLI access.

```bash
npm install -g eas-cli
npx eas login
npm run android:apk
```

The APK will be available in your EAS build dashboard once the build completes.

## Notes

- Screens are placeholders and should be wired to real data and APIs.
- Replace the default Expo assets in the assets/ folder with final artwork.
