# OCA Sana Hub - Distribution Guide

## 📦 Package Contents

This distribution package contains the complete OCA Sana Hub MVP v1.0 application, ready for deployment or redistribution.

### Included Files

```
oca_sana_hub/
├── 📄 VERSION.md              # Version information and feature list
├── 📄 RELEASE_NOTES.md        # Detailed changelog and release notes
├── 📄 DISTRIBUTION_GUIDE.md   # This file
├── 📄 README.md               # Project overview
├── 📄 QUICKSTART.md           # Quick start guide
├── 📄 package.json            # Node.js dependencies
├── 📄 tsconfig.json           # TypeScript configuration
├── 📄 next.config.ts          # Next.js configuration
├── 📄 tailwind.config.ts      # Tailwind CSS configuration
├── 📄 .env.example            # Environment variables template
├── 🔧 create-backup.ps1       # Backup script (PowerShell)
├── 🔧 backup.bat              # Quick backup launcher (Windows)
├── 📁 src/                    # Source code
│   ├── app/                   # Next.js pages and API routes
│   ├── components/            # React components
│   ├── services/              # Business logic
│   ├── config/                # Configuration files
│   ├── types/                 # TypeScript definitions
│   ├── hooks/                 # React custom hooks
│   └── lib/                   # Utility libraries
├── 📁 docs/                   # Documentation
│   ├── README.md              # Complete project documentation
│   ├── SETUP.md               # Installation guide
│   ├── ARCHITECTURE.md        # System architecture
│   └── USER_STORIES.md        # User story system docs
├── 📁 public/                 # Static assets
└── 📁 data/                   # Configuration data
```

## 🚀 Quick Start for Recipients

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager
- Modern web browser

### Installation Steps

1. **Extract the Package**
   ```bash
   # Extract the ZIP file to your desired location
   ```

2. **Install Dependencies**
   ```bash
   cd oca_sana_hub
   npm install
   ```

3. **Configure Environment**
   ```bash
   # Copy the example file
   copy .env.example .env.local
   
   # Edit .env.local with your portal URLs
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Access at: `http://localhost:3000`

5. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## 📋 System Requirements

### Development
- **OS**: Windows, macOS, or Linux
- **Node.js**: v18.17.0 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 500MB for dependencies + source

### Production
- **Node.js**: v18.17.0 or higher
- **RAM**: 2GB minimum
- **Disk Space**: 200MB for compiled application

## 🔧 Configuration Guide

### Environment Variables

Create a `.env.local` file with the following structure:

```bash
# Production Portal URLs
NEXT_PUBLIC_PORTAL_COLOMBIA_PROD=https://colombia.portal.com
NEXT_PUBLIC_PORTAL_AUSTRALIA_PROD=https://australia.portal.com
# ... (add all countries)

# Testing/INDUS Portal URLs
NEXT_PUBLIC_PORTAL_COLOMBIA_INDUS=https://colombia-test.portal.com
NEXT_PUBLIC_PORTAL_AUSTRALIA_INDUS=https://australia-test.portal.com
# ... (add all countries)

# Environment Setting
NEXT_PUBLIC_ENVIRONMENT=INDUS
```

### Portal Configuration

After starting the application:
1. Navigate to Settings (`/settings`)
2. Configure URLs for each portal
3. Set SSO status for Admin and Salesforce
4. Add Sana Commerce version
5. Link Business Central ERP systems
6. Save configuration
7. Export backup for safekeeping

## 🌍 Custom Countries

Add new countries/portals dynamically:
1. Go to Settings page
2. Click "Add Country" button
3. Fill in required fields:
   - Country ID (unique identifier)
   - Display Name
   - Country Code (2 letters)
   - Flag Emoji
   - Sana Version
   - SSO settings
4. Click "Add Country"
5. Configure URLs for the new country
6. Save configuration

## 📊 Features Overview

### Core Features
✅ 9 pre-configured countries  
✅ Unlimited custom countries  
✅ PROD/INDUS environment switching  
✅ SSO Admin configuration  
✅ SSO Salesforce configuration  
✅ Sana version tracking  
✅ Business Central ERP linking  
✅ Search and filtering  
✅ Configuration export/import  

### User Interface
✅ Professional design  
✅ Responsive layout  
✅ Flag display for countries  
✅ Status indicators  
✅ Modal popups with details  
✅ Clean, minimal styling  

## 🔒 Security Considerations

### For Distribution
- ⚠️ Remove any `.env.local` files before distributing
- ⚠️ Remove `node_modules` folder (recipients will reinstall)
- ⚠️ Remove `.next` build folder
- ⚠️ Ensure no sensitive credentials in source code
- ✅ Include `.env.example` as template
- ✅ Document security best practices

### For Deployment
- Configure portal URLs via environment variables
- Use HTTPS for all portal connections
- Implement authentication if needed
- Set up CORS policies on backend portals
- Regular security audits recommended

## 📦 Creating Your Own Distribution

Use the included backup script:

**Windows:**
```bash
# Double-click backup.bat
# OR run PowerShell script:
powershell -ExecutionPolicy Bypass -File create-backup.ps1
```

The script will create a ZIP file in the `backups/` folder with:
- Complete source code
- Documentation
- Configuration files
- Excluding: node_modules, .next, .env files, logs

## 🎓 Documentation

Complete documentation available in the `docs/` directory:

1. **README.md** - Comprehensive project documentation
2. **SETUP.md** - Detailed installation and configuration
3. **ARCHITECTURE.md** - Technical architecture and design patterns
4. **USER_STORIES.md** - User story logging system

## 🐛 Troubleshooting

### Common Issues

**Problem: `npm install` fails**
- Solution: Ensure Node.js 18+ is installed
- Try: `npm cache clean --force` then retry

**Problem: Port 3000 already in use**
- Solution: Use different port: `npm run dev -- -p 3001`

**Problem: Portal URLs not saving**
- Solution: Check browser localStorage is enabled
- Check file permissions for `data/` directory

**Problem: Custom countries not showing**
- Solution: Clear browser cache and reload
- Verify localStorage key: `custom-countries`

### Getting Help

1. Check documentation in `docs/` folder
2. Review `RELEASE_NOTES.md` for known issues
3. Check browser console for errors (F12)
4. Verify environment configuration

## 📈 Performance Tips

### Development
- Use `npm run dev` for hot reload
- Keep browser dev tools open for debugging
- Use React Developer Tools extension

### Production
- Always run `npm run build` before deployment
- Use process manager (PM2, systemd) for uptime
- Set up monitoring and logging
- Enable compression and caching

## 🔄 Updates and Maintenance

### Keeping the Package Updated

This is MVP v1.0. For future updates:
1. Backup current version before updating
2. Review release notes for breaking changes
3. Update dependencies: `npm update`
4. Test thoroughly in development
5. Rebuild: `npm run build`

### Backing Up Configuration

Export configuration regularly:
1. Go to Settings page
2. Click "Export Configuration"
3. Save JSON file securely
4. Store with version documentation

## 📞 Support and Contact

For issues or questions:
- Review documentation in `docs/` directory
- Check `RELEASE_NOTES.md` for known issues
- Refer to `VERSION.md` for feature details

## 🎉 Success Checklist

Before using in production:
- [ ] Installed dependencies successfully
- [ ] Configured all portal URLs
- [ ] Tested PROD environment switching
- [ ] Tested INDUS environment switching
- [ ] Verified portal links work
- [ ] Added necessary custom countries
- [ ] Configured SSO settings
- [ ] Linked Business Central ERP systems
- [ ] Exported configuration backup
- [ ] Tested on target deployment environment
- [ ] Reviewed security considerations
- [ ] Documented any customizations

## 🏆 License and Usage

**License**: Internal Use  
**Version**: 1.0-MVP  
**Released**: February 22, 2026  

This package is provided as-is for internal use or redistribution within your organization.

---

## 🚀 Ready to Deploy!

This package is complete and production-ready. Follow the Quick Start section above to get started immediately.

**Thank you for using OCA Sana Hub!**
