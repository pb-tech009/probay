# PropBay - Mobile App Release Guide

Complete guide for building and releasing PropBay mobile app to Google Play Store.

---

## 📋 Overview

**Backend:** Deployed on AWS EC2 (automatic via CI/CD)  
**Frontend:** Built as Android APK/AAB and uploaded to Google Play Console manually

---

## 🔧 Prerequisites

1. **Expo Account**
   - Sign up: https://expo.dev
   - Install EAS CLI: `npm install -g eas-cli`

2. **Google Play Console**
   - Account: Already setup ✅
   - App created in console

3. **Backend Deployed**
   - EC2 server running
   - API accessible

---

## 🚀 Step 1: Configure API URL

Update API URL to point to your EC2 server:

**File:** `frontend/constants/api.ts`

```typescript
// Development (local testing)
// export const API_BASE_URL = 'http://10.32.8.253:5000/api';

// Production (EC2 server)
export const API_BASE_URL = 'http://YOUR_EC2_IP:5000/api';
// or with domain:
// export const API_BASE_URL = 'https://api.propbay.com/api';
```

**Important:** Replace `YOUR_EC2_IP` with your actual EC2 public IP or domain.

---

## 🔨 Step 2: Configure App for Production

### 2.1 Update app.json

**File:** `frontend/app.json`

```json
{
  "expo": {
    "name": "PropBay",
    "slug": "propbay",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0A0A0A"
    },
    "android": {
      "package": "com.propbay.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0A0A0A"
      },
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "plugins": [
      "expo-router"
    ],
    "extra": {
      "eas": {
        "projectId": "YOUR_PROJECT_ID"
      }
    }
  }
}
```

### 2.2 Create EAS Configuration

**File:** `frontend/eas.json`

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

---

## 🏗️ Step 3: Build Android App

### 3.1 Login to Expo
```bash
cd frontend
eas login
```

### 3.2 Configure Project
```bash
eas build:configure
```

### 3.3 Build APK (for testing)
```bash
# Build APK for testing
eas build --platform android --profile preview
```

This will:
- Upload your code to Expo servers
- Build Android APK
- Provide download link

**Download APK and test on device!**

### 3.4 Build AAB (for Play Store)
```bash
# Build AAB for production
eas build --platform android --profile production
```

This creates an Android App Bundle (.aab) file for Play Store.

---

## 📤 Step 4: Upload to Google Play Console

### 4.1 Download AAB File
After build completes, download the `.aab` file from Expo dashboard.

### 4.2 Upload to Play Console

1. **Go to Google Play Console**
   - https://play.google.com/console

2. **Select Your App**
   - Click on PropBay app

3. **Create Release**
   - Go to: Production → Create new release
   - Or: Internal testing → Create new release

4. **Upload AAB**
   - Click "Upload"
   - Select downloaded `.aab` file
   - Wait for upload to complete

5. **Fill Release Details**
   - Release name: `1.0.0`
   - Release notes:
     ```
     Initial release of PropBay
     
     Features:
     - WhatsApp OTP authentication
     - Browse premium properties
     - Post luxury listings (Pro Partners)
     - Lead management
     - Real-time notifications
     - Property search & filters
     ```

6. **Review & Rollout**
   - Review all details
   - Click "Review release"
   - Click "Start rollout to production"

---

## 🔄 Step 5: Update Process (Future Updates)

When you make changes to mobile app:

### 5.1 Update Version
**File:** `frontend/app.json`
```json
{
  "expo": {
    "version": "1.0.1",  // Increment version
    "android": {
      "versionCode": 2   // Increment version code
    }
  }
}
```

### 5.2 Build New Version
```bash
cd frontend
eas build --platform android --profile production
```

### 5.3 Upload to Play Store
- Download new AAB
- Upload to Play Console
- Create new release

---

## 🧪 Testing Before Release

### Test on Physical Device

1. **Build APK**
   ```bash
   eas build --platform android --profile preview
   ```

2. **Download APK**
   - Get download link from Expo

3. **Install on Device**
   - Transfer APK to phone
   - Enable "Install from unknown sources"
   - Install and test

### Test Checklist
- [ ] Login with WhatsApp OTP works
- [ ] API calls to EC2 server work
- [ ] Property listing loads
- [ ] Image upload works
- [ ] Notifications work
- [ ] Role selection works
- [ ] All tabs visible correctly
- [ ] No crashes or errors

---

## 🔐 Security Checklist

Before releasing:

- [ ] API URL points to production EC2 server
- [ ] No test/debug code in production
- [ ] No console.logs with sensitive data
- [ ] API keys secured (not in code)
- [ ] HTTPS enabled (if using domain)
- [ ] Firebase configured correctly
- [ ] WhatsApp API working

---

## 📊 Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│  Developer                                          │
│  ├── Push to GitHub (main branch)                  │
│  └── Build mobile app (eas build)                  │
└─────────────────────────────────────────────────────┘
              ↓                           ↓
┌─────────────────────────┐   ┌──────────────────────┐
│  GitHub Actions         │   │  Expo Build Service  │
│  ├── Auto deploy        │   │  ├── Build APK/AAB   │
│  └── EC2 Backend        │   │  └── Download link   │
└─────────────────────────┘   └──────────────────────┘
              ↓                           ↓
┌─────────────────────────┐   ┌──────────────────────┐
│  AWS EC2 Server         │   │  Google Play Console │
│  ├── Backend API        │   │  ├── Upload AAB      │
│  ├── MongoDB            │   │  └── Publish app     │
│  └── Port 5000          │   └──────────────────────┘
└─────────────────────────┘              ↓
              ↕                ┌──────────────────────┐
              └────────────────│  Users Download App  │
                               │  from Play Store     │
                               └──────────────────────┘
```

---

## 🆘 Troubleshooting

### Build Failed
```bash
# Clear cache and retry
cd frontend
rm -rf node_modules
npm install
eas build --platform android --profile production --clear-cache
```

### API Not Connecting
- Check EC2 security group allows port 5000
- Verify API URL in `constants/api.ts`
- Test API: `curl http://YOUR_EC2_IP:5000/api/health`

### Upload Failed to Play Console
- Check AAB file size (max 150MB)
- Ensure version code is incremented
- Check app signing configuration

---

## 📝 Release Checklist

### Before First Release
- [ ] EC2 backend deployed and running
- [ ] MongoDB configured
- [ ] WhatsApp API working
- [ ] Firebase configured
- [ ] API URL updated to production
- [ ] App tested on physical device
- [ ] Screenshots prepared for Play Store
- [ ] App description written
- [ ] Privacy policy created
- [ ] Terms of service created

### For Each Update
- [ ] Version number incremented
- [ ] Version code incremented
- [ ] Changes tested locally
- [ ] APK tested on device
- [ ] Release notes written
- [ ] AAB built successfully
- [ ] Uploaded to Play Console

---

## 📱 Play Store Listing

### App Title
```
PropBay - Premium Property Booking
```

### Short Description
```
Find and book premium properties. Connect property owners with elite tenants.
```

### Full Description
```
PropBay is your premium property booking platform connecting property owners with quality tenants.

FOR PROPERTY OWNERS (PRO PARTNERS):
• Post unlimited luxury properties
• Manage leads efficiently
• Real-time notifications
• Direct tenant communication
• Property analytics dashboard

FOR TENANTS (ELITE MEMBERS):
• Browse premium properties
• Advanced search filters
• Save favorite properties
• Request contact information
• Property reviews and ratings

FEATURES:
• Secure WhatsApp OTP authentication
• Real-time notifications
• High-quality property images
• Detailed property information
• Lead management system
• User-friendly interface

Download PropBay today and find your perfect property!
```

### Category
```
House & Home
```

### Content Rating
```
Everyone
```

---

## 🔄 CI/CD Summary

**Backend (Automatic):**
```bash
git push origin main
↓
GitHub Actions triggers
↓
Deploy to EC2 automatically
✅ Backend updated
```

**Frontend (Manual):**
```bash
eas build --platform android --profile production
↓
Download AAB from Expo
↓
Upload to Google Play Console
↓
Create release
✅ App updated on Play Store
```

---

## 📞 Support

For build issues:
- Expo Docs: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction/

For Play Store issues:
- Play Console Help: https://support.google.com/googleplay/android-developer

---

**Version:** 1.0.0  
**Last Updated:** 2026-02-24
