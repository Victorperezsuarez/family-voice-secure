echo # iOS Build Guide

## Prerequisites
1. macOS with Xcode 15+
2. Apple Developer Account ($99/year)
3. Node.js 18+ and npm
4. CocoaPods: \`sudo gem install cocoapods\`

## Setup Steps
### On Windows (Preparation):
1. Clone repository
2. Run: \`npm install\`
3. Run: \`npm run build\`
4. Run: \`npx cap sync ios\`
5. Commit and push to Git

### On macOS (Actual iOS Development):
1. Clone repository: \`git clone [your-repo-url]\`
2. Install dependencies: \`npm install\`
3. Build: \`npm run ios:build\`
4. Install pods: \`cd ios/App && pod install\`
5. Open in Xcode: \`npm run ios:dev\`

## Development Build
\`\`\`bash
npm run ios:dev
\`\`\`

## Release Build
1. Archive in Xcode (Product → Archive)
2. Export as iOS App Store package
3. Upload to App Store Connect
4. Submit for review > IOS_BUILD_GUIDE.md
