#!/bin/bash

# Generate Android Keystore for Play Store
# Run this script once to create your signing key

echo "🔐 Generating Android Keystore for PropBay..."
echo ""

# Keystore details
KEYSTORE_FILE="propbay-release.keystore"
KEY_ALIAS="propbay"
VALIDITY_DAYS=10000

# Generate keystore
keytool -genkeypair \
  -v \
  -storetype PKCS12 \
  -keystore $KEYSTORE_FILE \
  -alias $KEY_ALIAS \
  -keyalg RSA \
  -keysize 2048 \
  -validity $VALIDITY_DAYS

echo ""
echo "✅ Keystore generated: $KEYSTORE_FILE"
echo ""
echo "📝 Next Steps:"
echo "1. Keep this keystore file SAFE - you'll need it for all future updates!"
echo "2. Convert to base64 for GitHub Secrets:"
echo "   base64 -w 0 $KEYSTORE_FILE > keystore.base64.txt"
echo ""
echo "3. Add these secrets to GitHub:"
echo "   - ANDROID_KEYSTORE_BASE64 (content of keystore.base64.txt)"
echo "   - KEYSTORE_PASSWORD (password you just entered)"
echo "   - KEY_ALIAS (propbay)"
echo "   - KEY_PASSWORD (password you just entered)"
echo ""
echo "4. Go to: https://github.com/pb-tech009/probay/settings/secrets/actions"
