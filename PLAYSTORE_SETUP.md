# 🚀 PropBay - Play Store Launch Guide

## Step 1: Generate Signing Key (One-time setup)

### Windows:
```bash
cd F:\propertybooking\scripts
generate-keystore.bat
```

### Fill in details when prompted:
- **Password**: Choose a strong password (remember this!)
- **First and Last Name**: PropBay or Your Name
- **Organizational Unit**: Development
- **Organization**: PropBay
- **City**: Your City
- **State**: Your State
- **Country Code**: IN

**⚠️ IMPORTANT**: Save the password! You'll need it forever.

---

## Step 2: Convert Keystore to Base64

### Windows:
```bash
cd F:\propertybooking\scripts
certutil -encode propbay-release.keystore keystore.base64.txt
```

Then open `keystore.base64.txt` and:
1. Remove the first line: `-----BEGIN CERTIFICATE-----`
2. Remove the last line: `-----END CERTIFICATE-----`
3. Remove all line breaks (make it one long line)

---

## Step 3: Add GitHub Secrets

Go to: https://github.com/pb-tech009/probay/settings/secrets/actions

Click "New repository secret" and add these 4 secrets:

1. **ANDROID_KEYSTORE_BASE64**
   - Value: Content from keystore.base64.txt (one long line)

2. **KEYSTORE_PASSWORD**
   - Value: Password you entered when generating keystore

3. **KEY_ALIAS**
   - Value: `propbay`

4. **KEY_PASSWORD**
   - Value: Same as KEYSTORE_PASSWORD

---

## Step 4: Push and Build

```bash
cd F:\propertybooking
git add .
git commit -m "Setup Play Store build"
git push origin main
```

GitHub Actions will automatically:
- Build signed AAB file (for Play Store)
- Build signed APK file (for testing)

Monitor: https://github.com/pb-tech009/probay/actions

---

## Step 5: Download Build

After build completes (5-10 minutes):
1. Go to workflow run
2. Download artifacts:
   - **propbay-playstore-aab** → Upload to Play Store
   - **propbay-testing-apk** → Test on your phone

---

## Step 6: Upload to Play Store

1. Go to: https://play.google.com/console
2. Create new app or select existing
3. Go to "Production" → "Create new release"
4. Upload the AAB file
5. Fill in:
   - App name: PropBay
   - Description: Your app description
   - Screenshots: Take from your phone
   - Privacy policy: Add your URL
6. Submit for review

---

## 📱 Testing Before Upload

Install the APK on your phone:
```bash
adb install propbay-testing-apk.apk
```

Or transfer to phone and install manually.

---

## 🔄 Future Updates

For every update:
1. Update version in `frontend/app.json`
2. Push to GitHub
3. Download new AAB
4. Upload to Play Store

**No need to regenerate keystore!** Use the same one forever.

---

## ⚠️ Backup Keystore

**CRITICAL**: Backup `propbay-release.keystore` file!
- If you lose it, you can NEVER update your app on Play Store
- Store it in multiple safe places
- Keep the password safe

---

## 🎯 Quick Commands

Generate keystore:
```bash
cd F:\propertybooking\scripts && generate-keystore.bat
```

Convert to base64:
```bash
certutil -encode propbay-release.keystore keystore.base64.txt
```

Push and build:
```bash
cd F:\propertybooking && git add . && git commit -m "Update" && git push
```

---

## 📞 Support

If build fails, check:
1. GitHub Actions logs
2. All 4 secrets are added correctly
3. Keystore base64 has no line breaks
4. Icons exist in `frontend/assets/images/`
