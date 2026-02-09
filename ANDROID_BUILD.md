# 📱 Android Build Guide for VPet

This guide explains how to build VPet for Android using Capacitor.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Android Studio (for building APKs)
- Java Development Kit (JDK) 11 or higher

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build Web Assets**
   ```bash
   npm run build
   ```
   This copies all web files to the `www` directory.

3. **Sync with Android**
   ```bash
   npx cap sync android
   ```
   This updates the Android project with the latest web assets.

## Building

### Debug Build (for testing)

```bash
npm run android:build
```

This will:
1. Build the web assets
2. Sync with Android
3. Create a debug APK at `android/app/build/outputs/apk/debug/app-debug.apk`

### Release Build (for Play Store)

```bash
npm run android:release
```

This creates a release APK that needs to be signed before uploading to the Play Store.

## Signing for Release

1. **Generate a Keystore** (first time only):
   ```bash
   keytool -genkey -v -keystore vpet-release-key.keystore -alias vpet -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure Gradle**:
   Create `android/app/keystore.properties`:
   ```properties
   storePassword=YOUR_STORE_PASSWORD
   keyPassword=YOUR_KEY_PASSWORD
   keyAlias=vpet
   storeFile=/path/to/vpet-release-key.keystore
   ```

3. **Update `android/app/build.gradle`**:
   Add signing configuration:
   ```gradle
   android {
       ...
       signingConfigs {
           release {
               keyAlias keystoreProperties['keyAlias']
               keyPassword keystoreProperties['keyPassword']
               storeFile file(keystoreProperties['storeFile'])
               storePassword keystoreProperties['storePassword']
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               minifyEnabled false
               proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
           }
       }
   }
   ```

4. **Build Signed APK**:
   ```bash
   npm run android:release
   ```

## Testing on Device

1. **Enable USB Debugging** on your Android device
2. **Connect device** via USB
3. **Install APK**:
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

Or open the project in Android Studio and run directly:
```bash
npx cap open android
```

## Play Store Preparation

### Required Assets

1. **App Icon** (512x512 PNG)
2. **Feature Graphic** (1024x500 PNG)
3. **Screenshots** (at least 2, up to 8)
   - Phone: 320dp x 640dp minimum
   - Tablet: 1024dp x 1920dp minimum
4. **Privacy Policy URL**
5. **App Description**

### Version Management

Update version in `android/app/build.gradle`:
```gradle
android {
    defaultConfig {
        versionCode 1  // Increment for each release
        versionName "1.0.0"  // User-facing version
    }
}
```

Also update `package.json`:
```json
{
  "version": "1.0.0"
}
```

### Publishing Checklist

- [ ] Test on multiple devices/screen sizes
- [ ] Verify all features work offline
- [ ] Test payment integration thoroughly
- [ ] Check performance (no lag, smooth animations)
- [ ] Ensure proper permissions are requested
- [ ] Test deep linking (if applicable)
- [ ] Verify app icon displays correctly
- [ ] Test on Android 8.0+ (API level 26+)
- [ ] Create promotional materials
- [ ] Write comprehensive app description
- [ ] Set appropriate age rating
- [ ] Configure in-app purchases (if applicable)

## Capacitor Configuration

The app is configured in `capacitor.config.json`:

```json
{
  "appId": "com.gameaday.vpet",
  "appName": "VPet",
  "webDir": "www",
  "bundledWebRuntime": false
}
```

### Key Configuration Options

- **appId**: Unique identifier for your app (cannot be changed after publishing)
- **appName**: Display name shown to users
- **webDir**: Directory containing built web assets
- **bundledWebRuntime**: Whether to include Capacitor runtime in the app

## Permissions

The app requires the following Android permissions:

- **INTERNET**: For online battles and server connection
- **VIBRATE**: For haptic feedback (optional)

These are configured in `android/app/src/main/AndroidManifest.xml`.

## App Store Optimization (ASO)

### Title
"VPet - Virtual Pet Game | Tamagotchi Style"

### Short Description
"Raise your virtual pet, battle online, and watch it evolve! A nostalgic Tamagotchi-inspired game."

### Full Description
```
🐾 Welcome to VPet - Your Digital Companion! 🐾

Experience the nostalgia of classic virtual pets with modern features:

✨ FEATURES:
• Raise and care for your unique pet
• Watch your pet evolve through 5 stages
• Battle against AI or other players online
• Track detailed stats and personality traits
• Unlock achievements and milestones
• Play even when offline
• Auto-save your progress
• Multiple theme options

🎮 GAMEPLAY:
• Feed, play, train, and rest your pet
• Keep stats balanced for optimal growth
• Compete in battles to level up
• Discover rare evolution paths
• Customize with premium features

💎 PREMIUM FEATURES:
• 2x-3x coin earning rate
• Exclusive evolution paths
• Rare pet cosmetics
• Priority matchmaking
• Cloud save backup
• No ads

Perfect for fans of Tamagotchi, Digimon, and virtual pet games!

Download now and start your VPet journey! 🚀
```

### Keywords
- virtual pet
- tamagotchi
- digital pet
- pet simulator
- vpet
- digimon
- pocket monster
- pet care game
- evolution game
- battle pets

## Troubleshooting

### Build Errors

**Issue**: Gradle build fails
```
Solution: Ensure Android SDK is properly installed and ANDROID_HOME is set:
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

**Issue**: Web assets not copying
```
Solution: Make sure www directory exists and build script ran:
npm run build
```

**Issue**: Capacitor plugins not found
```
Solution: Sync Capacitor:
npx cap sync
```

### Runtime Errors

**Issue**: White screen on app launch
```
Solution: Check that all web assets are in www/ and paths are correct.
Open Chrome DevTools: chrome://inspect
```

**Issue**: Payment integration not working
```
Solution: Ensure proper payment provider keys are configured and test mode is enabled for development.
```

## Support

For issues or questions:
- GitHub Issues: https://github.com/Gameaday/vpet/issues
- Documentation: https://github.com/Gameaday/vpet
- Discord Community: [Coming Soon]

## License

MIT License - See LICENSE file for details
