# OCA Sana Hub - Quick Reference

## 📋 Quick Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
copy .env.example .env.local

# 3. Edit .env.local with your portal URLs
# Open .env.local and update all NEXT_PUBLIC_PORTAL_* variables

# 4. Start development server
npm run dev

# 5. Open in browser
# Visit http://localhost:3000
```

## 🎯 Common Tasks

### Start Development
```bash
npm run dev
# Opens http://localhost:3000
# Hot reload enabled - changes auto-apply
```

### Build for Production
```bash
npm run build
npm start
```

### Run Linting
```bash
npm run lint
# Checks for code style issues
```

### View User Stories
```javascript
// In browser console (F12):
const stories = JSON.parse(localStorage.getItem('oca-sana-user-stories'));
console.log(stories);

// Export as file:
copy(JSON.stringify(stories, null, 2));
```

## 📁 Key Directories

| Path | Purpose |
|------|---------|
| `src/app/` | Main pages and layout |
| `src/components/` | React components |
| `src/services/` | Business logic |
| `src/hooks/` | Custom hooks |
| `src/config/` | Configuration |
| `src/types/` | TypeScript types |
| `docs/` | Documentation |
| `public/` | Static assets |

## 🔧 Configuration

### Environment Variables (.env.local)

```env
# Active environment
NEXT_PUBLIC_ENVIRONMENT=INDUS  # or PROD

# Portal URLs (example)
NEXT_PUBLIC_PORTAL_COLOMBIA_INDUS=https://test.colombia.oca-sana.com/api
NEXT_PUBLIC_PORTAL_AUSTRALIA_INDUS=https://test.australia.oca-sana.com/api
# ... update for all countries and environments
```

### Add New Country Portal

1. **Update portal config** (`src/services/portalService.ts`):
```typescript
const PORTAL_CONFIGS: Record<Country, PortalConfig> = {
  newCountry: { 
    country: 'newCountry', 
    name: 'Country Name Portal', 
    countryCode: 'XX' 
  },
  // ...
};
```

2. **Update environment config** (`src/config/environments.ts`):
```typescript
portalUrls: {
  newCountry: process.env.NEXT_PUBLIC_PORTAL_NEW_COUNTRY_PROD || '',
  // ...
}
```

3. **Add environment variables** (`.env.local`):
```env
NEXT_PUBLIC_PORTAL_NEW_COUNTRY_PROD=https://...
NEXT_PUBLIC_PORTAL_NEW_COUNTRY_INDUS=https://...
```

4. **Update types** (`src/types/index.ts`):
```typescript
export type Country = typeof COUNTRIES[number];
// Make sure new country is in COUNTRIES array
```

## 🪝 Using Hooks

### useUserStory Hook
```typescript
import { useUserStory } from '@/hooks/useUserStory';

function MyComponent() {
  const { logPrompt, logResponse, updateStatus } = useUserStory({
    country: 'colombia',
    environment: 'PROD'
  });

  // Log action
  const story = logPrompt('Title', 'Description', 'Content');

  // Log response
  logResponse(story.id, 'Completion details');

  // Update status
  updateStatus(story.id, 'completed');
}
```

### useUserStories Hook
```typescript
import { useUserStories } from '@/hooks/useUserStory';

function Analytics() {
  const {
    getAllStories,
    getStoriesByCountry,
    getStoriesByEnvironment,
    exportJSON,
    exportCSV,
    getCount
  } = useUserStories();

  // Get all stories
  const stories = getAllStories();

  // Filter stories
  const colombiaStories = getStoriesByCountry('colombia');
  const prodStories = getStoriesByEnvironment('PROD');

  // Export
  const json = exportJSON();
  const csv = exportCSV();
}
```

## 📊 Component Structure

### Page Hierarchy
```
Home (src/app/page.tsx)
├── Header
│   └── Environment Buttons (PROD/INDUS)
├── PortalGrid
│   ├── Loading State
│   └── PortalCard[] (9 cards)
│       ├── Country Flag
│       ├── Status Badge
│       └── Portal URL
└── Selected Portal Details
```

## 🚀 Deployment Checklist

- [ ] Run `npm run build` - verify no errors
- [ ] Run `npm run lint` - fix any issues
- [ ] Update `.env.local` for production
- [ ] Test in production environment
- [ ] Verify all 9 portals are accessible
- [ ] Check user stories logging works
- [ ] Review environment switching
- [ ] Test on mobile devices

## 🐛 Debugging Tips

### Terminal Issues
- Use VS Code integrated terminal
- Or use PowerShell with: `npm install` directly
- If hung: Ctrl+C to stop, then try again

### Port Already in Use
```bash
npm run dev -- -p 3001  # Use different port
```

### Clear Node Cache
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
npm run build  # Show all TypeScript errors
```

### Browser Console
- F12 or Ctrl+Shift+I to open DevTools
- Check "Console" tab for errors
- Check "Application" → "Local Storage" for user stories

## 📚 Documentation Quick Links

- 📖 [Full Documentation](docs/README.md)
- 🔧 [Setup Guide](docs/SETUP.md)  
- 📊 [User Story Logging](docs/USER_STORIES.md)
- 🏗️ [Architecture Guide](docs/ARCHITECTURE.md)

## 💡 Pro Tips

1. **Hot Reload**: Changes auto-refresh in dev mode
2. **User Stories**: Always check browser localStorage
3. **Environment Switcher**: Top-right corner of the app
4. **Type Safety**: Use TypeScript for IDE hints
5. **Components**: Highly composable and reusable
6. **Services**: Centralized portal operations
7. **Logging**: Every interaction is tracked
8. **Export**: Get stories as JSON or CSV

## 🆘 Getting Help

1. Check the [documentation](docs/)
2. Look in browser console (F12)
3. Review localStorage for user stories
4. Check .env.local configuration
5. Verify all dependencies: `npm install`
6. Try clearing cache: `rm -rf .next`

---

**Quick Reference Version**: 1.0.0  
**Last Updated**: February 21, 2026
