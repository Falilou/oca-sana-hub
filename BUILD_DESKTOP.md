# 📱 BUILD DESKTOP APP - READ THIS FIRST!

## 🎯 You Want a Standalone Desktop App for Presentations?

Perfect! I've set everything up for you. Here's what to do:

---

## ⚡ FASTEST WAY (Windows)

### Step 1: Run the Build Script
Double-click this file in Windows Explorer:
```
build-standalone.bat
```

### Step 2: Wait 5-10 Minutes
The script will:
- ✅ Check dependencies (auto-install if needed)
- ✅ Build the app
- ✅ Create Windows executables

### Step 3: Share With Colleagues
Find these files in the `dist-electron` folder:
- `OCA Sana Hub Setup 1.0.0.exe` ← Installer version
- `OCA Sana Hub 1.0.0.exe` ← Portable version (no install needed)

Send either file to your colleagues. **Done!** 🎉

---

## 🖥️ What's Hidden in Desktop Version

When you build the standalone desktop app:

### ✅ Visible Features (Perfect for Presentations)
- Portal Dashboard with all 9 countries
- Environment switcher (PROD/INDUS)
- Settings
- Portal access

### 🚫 Hidden Features (Clean Presentation)
- Log Analysis
- Portal Analytics

This gives you a **clean, professional interface** for demonstrations!

---

## 🔧 Alternative Commands (if script doesn't work)

Open Command Prompt or PowerShell in this folder:

```bash
# Windows Build
npm run standalone:build:win

# Or step-by-step:
npm install                          # Install dependencies (if needed)
npm run standalone:export            # Build Next.js app
npx electron-builder --win           # Create Windows executable
```

---

## 📦 What Gets Created

After building, you'll have:

```
dist-electron/
├── OCA Sana Hub Setup 1.0.0.exe    ← Share this (Installer)
├── OCA Sana Hub 1.0.0.exe          ← Or this (Portable)
└── win-unpacked/                   ← Folder version (optional)
```

**File Sizes:** ~150-250 MB each

---

## 🎓 First Time Building?

### Before You Build:

1. **Update Portal URLs** (optional)
   - Edit `.env.standalone` with actual portal URLs
   - Or leave defaults for testing

2. **Check Logo** (optional)
   - Replace `public/oca-logo.png` with your logo
   - Recommended: 512x512 PNG

### Build Requirements:
- ✅ Node.js installed (you already have this)
- ✅ Internet connection (for npm packages)
- ✅ ~5 GB free disk space
- ✅ 5-10 minutes time

---

## 📋 Presenting to Colleagues?

### What to Share:
1. **Easy:** Share just the `.exe` file
2. **Professional:** Share installer in a ZIP with instructions

### What They Need:
- ✅ Windows 10/11 (or macOS/Linux if you build for those)
- ✅ Internet connection (to access portals)
- ❌ **NO Node.js needed!**
- ❌ **NO installation of code/dependencies!**

---

## 🚨 Troubleshooting

### "npm command not found"
- Make sure Node.js is installed and in PATH
- Restart terminal/command prompt

### Build script fails?
Try manual commands:
```bash
npm install
npm run standalone:export
npx electron-builder --win
```

### Need more help?
See full documentation: [docs/STANDALONE_DESKTOP.md](docs/STANDALONE_DESKTOP.md)

---

## 🌍 Build for Other Platforms

### macOS (requires Mac):
```bash
npm run standalone:build:mac
```
Output: `dist-electron/OCA Sana Hub-1.0.0.dmg`

### Linux:
```bash
npm run standalone:build:linux
```
Output: `dist-electron/OCA Sana Hub-1.0.0.AppImage`

---

## ⏱️ Quick Timeline

| Step | Time | What Happens |
|------|------|--------------|
| Run build script | 0:00 | Script starts |
| Install packages | 0:00-2:00 | Downloads Electron (~100MB) |
| Build Next.js | 2:00-5:00 | Compiles app |
| Create .exe | 5:00-10:00 | Packages desktop app |
| **DONE!** | 10:00 | Ready to share |

---

## 💡 Pro Tips

1. **Test First:** Run `npm run standalone:dev` to test before building
2. **Portable Version:** Easiest to share - just send the .exe file
3. **Installer Version:** More professional - installs like a real app
4. **Both Work:** Share both and let colleagues choose!

---

## ✨ What Makes This Special

Unlike the web version:
- 🚫 No server needed to run
- 🚫 No command line for users
- 🚫 No visible development features
- ✅ Runs like a native Windows app
- ✅ Clean, professional interface
- ✅ Perfect for presentations

---

## 🎯 Ready to Build?

1. Double-click `build-standalone.bat` (Windows)
2. Wait for completion
3. Share files from `dist-electron` folder

**That's it!** Your colleagues will love it. 🚀

---

## 📚 More Information

- **Quick Guide:** [STANDALONE_QUICKSTART.md](STANDALONE_QUICKSTART.md)
- **Full Documentation:** [docs/STANDALONE_DESKTOP.md](docs/STANDALONE_DESKTOP.md)
- **Regular Web App:** [docs/SETUP.md](docs/SETUP.md)

---

**Questions?** Check the troubleshooting section in the full docs or review the build logs for errors.

**Happy Building! 🎉**
