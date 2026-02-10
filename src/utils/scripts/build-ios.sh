mkdir scripts 2>nul
echo #!/bin/bash
# scripts/build-ios.sh
set -e

echo "🔧 Checking prerequisites..."

# Check if running on macOS
if [[ "\$(uname)" != "Darwin" ]]; then
    echo "❌ iOS builds require macOS. Current OS: \$(uname)"
    exit 1
fi

echo "✅ macOS detected"

echo "📦 Installing dependencies..."
npm ci

echo "🔧 Building web assets..."
npm run build

echo "🔄 Syncing Capacitor..."
npx cap sync ios

echo "📱 Installing iOS dependencies..."
cd ios/App
pod install

echo "✅ iOS project ready!"
echo ""
echo "Next steps:"
echo "1. Open Xcode: open ios/App.xcworkspace"
echo "2. Select your development team in Signing & Capabilities"
echo "3. Build and run on simulator or device" > scripts/build-ios.sh
