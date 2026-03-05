# 🚀 Quick Start - Desktop Standalone Build

## For the Impatient

### Windows (Easiest)
1. Double-click `build-standalone.bat`
2. Wait for build to complete (~5-10 minutes)
3. Share files from `dist-electron` folder

### Alternative (all platforms)
```bash
npm run standalone:build:win    # Windows
npm run standalone:build:mac    # macOS
npm run standalone:build:linux  # Linux
```

## What Gets Built

Windows creates 2 files:
- **Installer**: `OCA Sana Hub Setup 1.0.0.exe` - Install like any program
- **Portable**: `OCA Sana Hub 1.0.0.exe` - Run directly, no install

## Share With Colleagues

Just send them the `.exe` file(s) from `dist-electron` folder. That's it!

## What's Hidden in Standalone Mode

✅ **Visible:**
- Portal Dashboard (main view)
- All 9 country portals
- Environment switcher (PROD/INDUS)
- Settings

🚫 **Hidden:**
- Log Analysis
- Portal Analytics

Perfect for presentations! 🎯

## Full Documentation

See [STANDALONE_DESKTOP.md](./STANDALONE_DESKTOP.md) for complete details.

---

**Need Help?** Check the troubleshooting section in the full docs.
