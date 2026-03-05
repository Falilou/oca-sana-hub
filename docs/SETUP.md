# Setup & Installation Guide

## Quick Start

### 1. Initial Setup

```bash
# Navigate to project directory
cd oca_sana_hub

# Install dependencies
npm install

# Create local environment file
cp .env.example .env.local
```

### 2. Configure Environment Variables

Edit `.env.local` and update:

```env
# Set your environment
NEXT_PUBLIC_ENVIRONMENT=INDUS  # or PROD

# Update portal URLs with actual endpoints
NEXT_PUBLIC_PORTAL_COLOMBIA_INDUS=https://test.colombia.oca-sana.com/api
NEXT_PUBLIC_PORTAL_AUSTRALIA_INDUS=https://test.australia.oca-sana.com/api
# ... update all countries
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

### Development
```bash
npm run dev      # Start development server with Turbopack
```

### Building
```bash
npm run build    # Create production build
npm start        # Run production server
```

### Code Quality
```bash
npm run lint     # Run ESLint
```

## Project Structure Understanding

### `/src/app`
- Main application pages and layout
- Uses Next.js App Router pattern
- `page.tsx`: Main hub interface
- `layout.tsx`: Root layout wrapper

### `/src/components`
- Reusable React components
- `common/`: Shared UI components (Header, Footer)
- `portals/`: Portal-specific components (PortalCard, PortalGrid)

### `/src/config`
- Application configuration
- `environments.ts`: PROD/INDUS setup and portal URLs

### `/src/services`
- Business logic and API operations
- `portalService.ts`: Portal interactions and data fetching

### `/src/lib/logging`
- User story logging system
- `logger.ts`: Core logging functionality

### `/src/hooks`
- Custom React hooks
- `useUserStory.ts`: Hook for user story logging in components

### `/src/types`
- TypeScript type definitions
- Global interfaces used across the app

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_ENVIRONMENT` | Yes | 'PROD' or 'INDUS' |
| `NEXT_PUBLIC_PORTAL_*_PROD` | Yes | Production portal URLs |
| `NEXT_PUBLIC_PORTAL_*_INDUS` | Yes | Testing portal URLs |
| `NEXT_PUBLIC_LOG_LEVEL` | No | 'debug', 'info', 'warn', 'error' |
| `NEXT_PUBLIC_API_TIMEOUT` | No | API request timeout in ms |

## First Time Users

1. **Understand the Hub Structure**
   - The main page displays all 9 country portals
   - Toggle between PROD and INDUS using top-right buttons
   - Each portal card shows status (Active/Offline/Maintenance)

2. **Explore Components**
   - `Header`: Environment switcher and branding
   - `PortalGrid`: Display of all available portals
   - `PortalCard`: Individual portal interface

3. **Access User Stories**
   Browser console → Application tab → Local Storage → 'oca-sana-user-stories'

4. **Add New Portal**
   - Add to `PORTAL_CONFIGS` in `portalService.ts`
   - Add environment URLs in `.env.example` and `.env.local`
   - Create country-specific folder in `src/portals/`

## Troubleshooting Setup

### Dependency Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use
```bash
# Use different port
npm run dev -- -p 3001
```

### TypeScript Errors
```bash
# Check for type errors
npm run type-check
```

### Build Failures
```bash
# Clean build cache
rm -rf .next
npm run build
```

## Development Workflow

1. **Make changes** to components/services
2. **Browser auto-refreshes** (hot module replacement)
3. **Check console** for errors
4. **Test user stories** are logging correctly
5. **Run lint** before committing: `npm run lint`

## Next Steps

- [View Main Documentation](./README.md)
- [Explore Components Guide](./COMPONENTS.md)
- [Review User Story Logging](./USER_STORIES.md)
- [Check Architecture Details](./ARCHITECTURE.md)

---

**Setup Last Updated**: February 21, 2026
