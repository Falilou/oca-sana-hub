# 🎯 DESKTOP BUILD - QUICK REFERENCE CARD

## ⚡ Fastest Way to Build

### Windows (Easy Mode)
```
1. Double-click: build-standalone.bat
2. Wait 5-10 minutes  
3. Share from: dist-electron/
```

### Command Line
```bash
npm run standalone:build:win
```

---

## 📦 Output Files

```
dist-electron/
├─ OCA Sana Hub Setup 1.0.0.exe  [Installer - 150MB]
└─ OCA Sana Hub 1.0.0.exe        [Portable - 200MB]
```

---

## ✅ What's Visible | 🚫 What's Hidden

| Feature | Web | Desktop |
|---------|-----|---------|
| Portal Dashboard | ✅ | ✅ |
| 9 Countries | ✅ | ✅ |
| Env Switch | ✅ | ✅ |
| Settings | ✅ | ✅ |
| **Log Analysis** | ✅ | **🚫** |
| **Analytics** | ✅ | **🚫** |

---

## 🧪 Test Before Building

```bash
npm run standalone:dev
```

Opens Electron window with features hidden.

---

## 📤 Share With Colleagues

1. Send `.exe` from `dist-electron/`
2. Include `USER_GUIDE.md`
3. Done!

**They need:** Windows 10/11 + Internet  
**They DON'T need:** Node.js, npm, tech skills

---

## 🔧 All Build Commands

```bash
# Windows
npm run standalone:build:win

# macOS (requires Mac)
npm run standalone:build:mac

# Linux  
npm run standalone:build:linux

# Test mode
npm run standalone:dev
```

---

## 📚 Documentation Quick Links

- **Simple Guide:** [BUILD_DESKTOP.md](BUILD_DESKTOP.md)
- **Quick Ref:** [STANDALONE_QUICKSTART.md](STANDALONE_QUICKSTART.md)
- **Full Docs:** [docs/STANDALONE_DESKTOP.md](docs/STANDALONE_DESKTOP.md)
- **User Guide:** [USER_GUIDE.md](USER_GUIDE.md) ← Share with colleagues
- **Overview:** [DESKTOP_BUILD_OVERVIEW.txt](DESKTOP_BUILD_OVERVIEW.txt)
- **Workflow:** [DESKTOP_WORKFLOW.txt](DESKTOP_WORKFLOW.txt)

---

## 🚨 Quick Troubleshooting

### Build fails?
```bash
npm install
npm run standalone:build:win
```

### Dependencies missing?
```bash
npm install --save-dev electron electron-builder
```

### Out of memory?
```bash
set NODE_OPTIONS=--max-old-space-size=8192
npm run standalone:build:win
```

---

## ⚙️ Before You Build

- [ ] Portal URLs in `.env.standalone`
- [ ] Logo updated (optional): `public/oca-logo.png`
- [ ] ~5 GB free disk space
- [ ] Internet connection

---

## 💡 Pro Tips

1. **Test first:** `npm run standalone:dev`
2. **Portable = easiest** to share
3. **Installer = most professional**
4. **Share both** - let colleagues choose!

---

## 🎯 File Sizes

- Installer: ~150 MB (compressed)
- Portable: ~200 MB (full size)
- Build time: ~10 min (first time)

---

## 🎊 Ready?

```bash
build-standalone.bat
```

**That's it! Happy presenting! 🚀**

---

*Need help? Check BUILD_DESKTOP.md*
