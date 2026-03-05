# OCA Sana Hub - Desktop Standalone Edition

## 📦 Overview

The OCA Sana Hub Desktop Standalone Edition is a cross-platform desktop application built with Electron. It provides a clean, presentation-ready interface for accessing OCA Michelin portals across multiple countries, with analytics and log analysis features hidden for a streamlined experience.

## ✨ Standalone Features

### Included Features
- ✅ **Portal Dashboard** - Access all 9 country portals
- ✅ **Environment Switching** - Toggle between PROD and INDUS
- ✅ **Settings** - Configure application preferences
- ✅ **Native Desktop Experience** - Windows, macOS, and Linux support
- ✅ **Offline-Ready** - No server required once built

### Hidden Features (in Standalone Mode)
- 🚫 **Log Analysis** - Hidden for presentations
- 🚫 **Portal Analytics** - Hidden for presentations

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ installed
- Git (optional)

### 1. Install Dependencies

If you haven't already installed the Electron dependencies, run:

```bash
npm install
```

This will install all required packages including Electron, electron-builder, and supporting tools.

### 2. Development Mode (Testing)

To test the standalone version in development mode:

```bash
npm run standalone:dev
```

This will:
1. Start Next.js in standalone mode with log features hidden
2. Launch Electron window automatically
3. Enable hot-reloading for development

### 3. Build for Production

#### Windows Build (Installer + Portable)
```bash
npm run standalone:build:win
```

Outputs:
- `dist-electron/OCA Sana Hub Setup 1.0.0.exe` (Installer)
- `dist-electron/OCA Sana Hub 1.0.0.exe` (Portable)

#### macOS Build (DMG)
```bash
npm run standalone:build:mac
```

Output:
- `dist-electron/OCA Sana Hub-1.0.0.dmg`

#### Linux Build (AppImage + DEB)
```bash
npm run standalone:build:linux
```

Outputs:
- `dist-electron/OCA Sana Hub-1.0.0.AppImage`
- `dist-electron/oca-sana-hub_1.0.0_amd64.deb`

#### Build for All Platforms
```bash
npm run standalone:build
```

**Note:** Building for macOS requires a Mac. Building for Linux works on Windows/Mac/Linux.

## 📁 Build Output

After building, the executables will be in the `dist-electron` directory:

```
dist-electron/
├── win-unpacked/              # Windows unpacked files
├── OCA Sana Hub Setup 1.0.0.exe   # Windows installer
├── OCA Sana Hub 1.0.0.exe         # Windows portable
├── OCA Sana Hub-1.0.0.dmg         # macOS installer
├── OCA Sana Hub-1.0.0.AppImage    # Linux AppImage
└── oca-sana-hub_1.0.0_amd64.deb   # Linux Debian package
```

## 🎯 Distribution

### For Colleagues (Presentation)

#### Windows Users
1. Share either:
   - **Installer**: `OCA Sana Hub Setup 1.0.0.exe` (recommended)
   - **Portable**: `OCA Sana Hub 1.0.0.exe` (no installation needed)

2. Recipients can:
   - Run installer and follow prompts
   - OR run portable version directly

#### macOS Users
1. Share: `OCA Sana Hub-1.0.0.dmg`
2. Recipients double-click DMG and drag app to Applications folder

#### Linux Users
1. Share:
   - **Ubuntu/Debian**: `oca-sana-hub_1.0.0_amd64.deb`
   - **Universal**: `OCA Sana Hub-1.0.0.AppImage`
2. Recipients install via package manager or make AppImage executable

### Quick Distribution via USB/Network Share

Simply copy the executable files to a USB drive or network location. No additional files needed!

## ⚙️ Configuration

### Updating Portal URLs

Before building, update portal URLs in `.env.standalone`:

```env
NEXT_PUBLIC_STANDALONE_MODE=true

# Production URLs
NEXT_PUBLIC_COLOMBIA_PROD_URL=https://your-colombia-url.com
NEXT_PUBLIC_AUSTRALIA_PROD_URL=https://your-australia-url.com
# ... etc
```

### Customizing Hidden Features

Edit `src/config/standalone.ts` to control which features are hidden:

```typescript
export function getStandaloneConfig(): StandaloneConfig {
  const isStandalone = isStandaloneMode();
  
  return {
    isStandalone,
    hideLogAnalysis: isStandalone,      // Hide log analysis
    hidePortalAnalytics: isStandalone,  // Hide analytics
    hideSettings: false,                // Keep settings visible
  };
}
```

## 🎨 Customization

### Application Icon

Replace the icon at `public/oca-logo.png` with your custom icon. Recommended dimensions:
- Windows: 256x256 PNG
- macOS: 512x512 PNG
- Linux: 512x512 PNG

### Application Branding

Update in `package.json`:

```json
{
  "build": {
    "appId": "com.yourcompany.sanahub",
    "productName": "Your Custom Name"
  }
}
```

## 🔧 Troubleshooting

### Build Issues

**Problem**: `electron-builder` not found
```bash
npm install --save-dev electron-builder
```

**Problem**: Build fails on Windows
- Run command prompt as Administrator
- Ensure Windows Build Tools are installed

**Problem**: Memory issues during build
```bash
# Increase Node.js memory
set NODE_OPTIONS=--max-old-space-size=8192
npm run standalone:build:win
```

### Runtime Issues

**Problem**: Blank white screen on launch
- Check console logs (View → Toggle Developer Tools)
- Ensure all portal URLs are properly configured

**Problem**: Portals not loading
- Verify internet connection
- Check portal URLs in environment configuration
- Verify SSL certificates are valid

## 📊 File Sizes

Approximate sizes for built applications:

- **Windows Installer**: ~150-180 MB
- **Windows Portable**: ~200-250 MB
- **macOS DMG**: ~150-180 MB
- **Linux AppImage**: ~170-200 MB

## 🔐 Security Notes

- Application uses context isolation for security
- No Node.js access from renderer process
- Web security enabled by default
- Portal credentials handled securely via HTTPS

## 📝 Advanced Configuration

### Electron Builder Options

Full configuration in `package.json` under `"build"` key. See [electron-builder docs](https://www.electron.build/) for advanced options.

### Code Signing (Optional)

For production distribution, consider code signing:

**Windows:**
```json
{
  "build": {
    "win": {
      "certificateFile": "path/to/cert.pfx",
      "certificatePassword": "your-password"
    }
  }
}
```

**macOS:**
```json
{
  "build": {
    "mac": {
      "identity": "Developer ID Application: Your Name"
    }
  }
}
```

## 🎯 Presentation Checklist

Before presenting to colleagues:

- [ ] Build the application for target platforms
- [ ] Test on a clean machine without Node.js
- [ ] Verify all portal URLs are correct
- [ ] Confirm log analysis features are hidden
- [ ] Test environment switching (PROD/INDUS)
- [ ] Check application icon and branding
- [ ] Prepare distribution method (USB, email, share)

## 📦 Deployment Options

### Option 1: Direct Distribution
Share executable files directly via:
- Email (if size permits)
- File sharing service (Google Drive, OneDrive)
- USB drive
- Network share

### Option 2: Internal Network
Host on internal file server:
```
\\fileserver\apps\oca-sana-hub\
├── windows\
│   ├── installer.exe
│   └── portable.exe
├── macos\
│   └── OCA-Sana-Hub.dmg
└── linux\
    ├── app.AppImage
    └── app.deb
```

### Option 3: Auto-Update Server (Advanced)
Use electron-updater for automatic updates. See [electron-updater docs](https://www.electron.build/auto-update).

## 🆘 Support

### Common User Questions

**Q: Do I need to install anything?**
A: Windows portable .exe requires no installation. Installers will install the app normally.

**Q: Will this work offline?**
A: The app works offline, but accessing portals requires internet connection.

**Q: Can I use this on multiple computers?**
A: Yes, copy the portable version to any computer. No license restrictions.

**Q: How do I update?**
A: Download and install the new version. Settings will be preserved.

## 📞 Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review Electron logs (Help → Developer Tools)
3. Check Next.js build logs in `.next` folder
4. Verify environment configuration

## 🔄 Updates

To rebuild with updates:

```bash
# Pull latest changes (if using git)
git pull

# Reinstall dependencies
npm install

# Rebuild
npm run standalone:build:win
```

## 📋 Version History

- **v1.0.0** - Initial desktop standalone release
  - Core portal dashboard
  - 9 country portals supported
  - Environment switching
  - Log analysis features hidden

---

## Quick Commands Reference

```bash
# Development
npm run standalone:dev           # Test in dev mode

# Build
npm run standalone:build:win     # Windows build
npm run standalone:build:mac     # macOS build  
npm run standalone:build:linux   # Linux build
npm run standalone:build         # All platforms

# Regular Web App (with all features)
npm run dev                      # Web dev mode
npm run build                    # Web production build
```

---

**Ready to present! 🎉**

Build your standalone app and share it with colleagues without worrying about exposed development features.
