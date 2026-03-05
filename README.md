# 🌐 OCA Sana Hub

## Multi-Country E-Ordering Portal Hub

A modern, comprehensive web application serving as a unified gateway to e-ordering portals across 9 countries with support for PROD (production) and INDUS (testing) environments.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Electron](https://img.shields.io/badge/Electron-Desktop-47848F?style=flat-square&logo=electron)](https://www.electronjs.org/)

---

## 📱 NEW: Desktop Standalone Edition!

**Want to present to colleagues without showing development features?**

We now have a **standalone desktop application** that:
- 🚫 Hides log analysis and analytics features
- ✅ Runs as a native Windows/Mac/Linux app
- ✅ No server or Node.js required for users
- ✅ Perfect for presentations and demonstrations!

**Quick Build:** Double-click `build-standalone.bat` (Windows) or see [BUILD_DESKTOP.md](BUILD_DESKTOP.md)

---

## ✨ Features

### 🌍 Multi-Country Support
Access e-ordering portals for: Colombia, Australia, Morocco, Chile, Argentina, Vietnam, South Africa, Malaysia, and South Korea.

### 🔄 Dual Environments
- **PROD**: Production environment for live operations
- **INDUS**: Industrial/Testing environment for quality assurance

### 📊 User Story Logging
- Automatic logging of all user interactions
- Export to JSON and CSV formats
- Browser-based persistence

### 🎨 Modern UI
- Responsive design with Tailwind CSS
- Clean, intuitive interface
- Real-time environment switching

### 🖥️ Desktop App (NEW!)
- Standalone executable for Windows, macOS, and Linux
- Hide development features for presentations
- No installation required (portable version)

---

## 🚀 Quick Start

### Two Ways to Use This App:

#### 1️⃣ Web Application (Full Features)

1. **Navigate to project**
   ```bash
   cd c:\Users\falseck\oca_sana_hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your portal URLs

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

#### 2️⃣ Desktop Standalone (For Presentations)

**Quick Build:**
```bash
# Windows - Use the build script
build-standalone.bat

# Or use npm command
npm run standalone:build:win
```

**Output:** Executable files in `dist-electron/` folder

**See:** [BUILD_DESKTOP.md](BUILD_DESKTOP.md) for complete instructions

---

## 📖 Documentation

Comprehensive documentation available in `/docs`:

- **[Complete Documentation](docs/README.md)** - Full API reference and overview
- **[Setup Guide](docs/SETUP.md)** - Installation and configuration
- **[User Story Logging](docs/USER_STORIES.md)** - Activity tracking system
- **[Architecture Guide](docs/ARCHITECTURE.md)** - System design and patterns
- **[Desktop Standalone](docs/STANDALONE_DESKTOP.md)** - Build desktop app (NEW!)

### Quick Guides
- **[Desktop Build Guide](BUILD_DESKTOP.md)** - Simple desktop build instructions
- **[Quick Start](STANDALONE_QUICKSTART.md)** - Fast desktop build reference

---

## 🛠️ Available Scripts

### Web Application
```bash
npm run dev      # Start development server
npm run build    # Create production build
npm start        # Run production server
npm run lint     # Run ESLint checks
```

### Desktop Standalone (NEW!)
```bash
npm run standalone:dev          # Test desktop app in dev mode
npm run standalone:build:win    # Build Windows executable
npm run standalone:build:mac    # Build macOS app
npm run standalone:build:linux  # Build Linux app
```

---

## 📂 Project Structure

```
src/
├── components/          # React components
├── services/           # Business logic
├── hooks/              # Custom React hooks
├── config/             # Configuration
├── lib/logging/        # User story logger
├── types/              # TypeScript types
└── portals/            # Country-specific portals
```

---

## 🌍 Supported Countries

- 🇨🇴 Colombia
- 🇦🇺 Australia
- 🇲🇦 Morocco
- 🇨🇱 Chile
- 🇦🇷 Argentina
- 🇻🇳 Vietnam
- 🇿🇦 South Africa
- 🇲🇾 Malaysia
- 🇰🇷 South Korea

---

## 📊 Key Features

### Web Application
- ✅ Multi-country portal hub
- ✅ PROD/INDUS environment switching
- ✅ User story logging and tracking
- ✅ Fully typed with TypeScript
- ✅ Responsive Tailwind CSS design
- ✅ Comprehensive documentation
- ✅ Portal status monitoring
- ✅ Export to JSON/CSV

### Desktop Standalone Edition (NEW!)
- ✅ Native Windows/Mac/Linux application
- ✅ Hides development features (logs, analytics)
- ✅ Perfect for presentations and demos
- ✅ No server required - runs offline
- ✅ No installation needed (portable .exe)
- ✅ Professional installer option available
- ✅ Single-file distribution

---

## 🎯 Choose Your Version

| Feature | Web App | Desktop Standalone |
|---------|---------|-------------------|
| Portal Access | ✅ | ✅ |
| Environment Switch | ✅ | ✅ |
| Log Analysis | ✅ | 🚫 Hidden |
| Portal Analytics | ✅ | 🚫 Hidden |
| Requires Server | ✅ | ❌ |
| Best For | Development | Presentations |

---

## 📦 Distribution

### For Colleagues/Presentations
1. Build desktop app: `npm run standalone:build:win`
2. Share `.exe` file from `dist-electron/` folder
3. They double-click and run - no installation needed!

**File size:** ~150-250 MB (includes everything)

---

## 🔧 Configuration

### Web App Environment
Edit `.env.local` with portal URLs

### Desktop App Environment  
Edit `.env.standalone` before building

---

## 💡 Use Cases

- **Development:** Use web app for full features
- **Testing:** Use web app with all analytics
- **Presentations:** Use desktop standalone (clean UI)
- **Distribution:** Build desktop app for colleagues
- **Demos:** Desktop app requires no technical setup

---

## 🏗️ Project Structure

```
src/
├── components/          # React components
├── services/           # Business logic
├── hooks/              # Custom React hooks
├── config/             # Configuration
│   └── standalone.ts   # Desktop mode config (NEW!)
├── lib/logging/        # User story logger
├── types/              # TypeScript types
└── portals/            # Country-specific portals

electron/               # Desktop app files (NEW!)
├── main.js            # Electron main process
└── preload.js         # Preload script

docs/
├── README.md              # Full documentation
├── STANDALONE_DESKTOP.md  # Desktop guide (NEW!)
└── ...
```
