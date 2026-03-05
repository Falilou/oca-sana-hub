# OCA Sana Hub - Documentation

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Overview](#project-overview)
3. [Architecture](#architecture)
4. [Components](#components)
5. [Services](#services)
6. [User Story Logging](#user-story-logging)
7. [Environment Configuration](#environment-configuration)
8. [API Integration](#api-integration)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

- Node.js 18+ (LTS)
- npm 9+
- Git
- VS Code (recommended)

### Installation

1. **Clone the repository** (if applicable)
   ```bash
   git clone <repository-url>
   cd oca_sana_hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Then update `.env.local` with your actual portal URLs and configuration values.

4. **Run the development server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:3000`

---

## Project Overview

**OCA Sana Hub** is a modern, comprehensive web application that serves as a unified gateway to e-ordering portals across 9 countries.

### Key Features

- **Multi-Country Support**: Access e-ordering portals for:
  - 🇨🇴 Colombia
  - 🇦🇺 Australia
  - 🇲🇦 Morocco
  - 🇨🇱 Chile
  - 🇦🇷 Argentina
  - 🇻🇳 Vietnam
  - 🇿🇦 South Africa
  - 🇲🇾 Malaysia
  - 🇰🇷 South Korea

- **Dual Environment Support**:
  - **PROD**: Production environment for live operations
  - **INDUS**: Industrial/Testing environment for quality assurance

- **User Story Logging**: All interactions are automatically logged as user stories for better tracking and documentation

- **Modern Tech Stack**:
  - Next.js 15 (React 19)
  - TypeScript
  - Tailwind CSS
  - React Hooks
  - Client-side state management

---

## Architecture

### Directory Structure

```
oca_sana_hub/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Main hub page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── common/            # Shared components (Header, Footer, etc.)
│   │   └── portals/           # Portal-specific components (PortalCard, PortalGrid)
│   ├── config/                # Configuration files
│   │   └── environments.ts    # Environment setup (PROD/INDUS)
│   ├── hooks/                 # Custom React hooks
│   │   └── useUserStory.ts   # User story logging hook
│   ├── lib/                   # Utility libraries
│   │   └── logging/           # User story logger
│   ├── portals/               # Portal-specific implementations
│   │   ├── colombia/
│   │   ├── australia/
│   │   ├── morocco/
│   │   ├── chile/
│   │   ├── argentina/
│   │   ├── vietnam/
│   │   ├── south-africa/
│   │   ├── malaysia/
│   │   └── south-korea/
│   ├── services/              # Business logic services
│   │   └── portalService.ts  # Portal operations
│   └── types/                 # TypeScript type definitions
│       └── index.ts
├── public/                    # Static assets
├── docs/                      # Documentation
├── logs/                      # User story logs (runtime)
├── .github/                   # GitHub-specific configs
│   ├── copilot-instructions.md
│   └── workflows/
├── .env.example              # Environment variables template
├── next.config.ts            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── package.json              # Dependencies and scripts

```

### Component Hierarchy

```
RootLayout
└── Home (page.tsx)
    ├── Header
    │   └── Environment Switcher (PROD/INDUS)
    ├── PortalGrid
    │   └── PortalCard[] (9 cards, one per country)
    └── Footer
```

---

## Components

### Header Component
**Location**: `src/components/common/Header.tsx`

Displays the application branding and environment switcher.

**Props**:
- `onEnvironmentChange?: (env: 'PROD' | 'INDUS') => void`

**Features**:
- OCA Sana Hub branding with logo
- PROD/INDUS environment toggle buttons
- Current environment indicator badge

### PortalGrid Component
**Location**: `src/components/portals/PortalGrid.tsx`

Displays all available portals in a responsive grid layout.

**Props**:
- `onPortalSelect?: (portal: PortalInfo) => void`
- `environment?: 'PROD' | 'INDUS'`

**Features**:
- Responsive grid (1 column mobile, 2-3 columns desktop)
- Loads portals based on selected environment
- Handles loading states

### PortalCard Component
**Location**: `src/components/portals/PortalCard.tsx`

Individual portal card with country information and status.

**Props**:
- `portal: PortalInfo` - Portal details
- `onSelect: (portal: PortalInfo) => void` - Selection handler
- `isLoading?: boolean` - Loading state

**Features**:
- Country flag emoji
- Portal name and country code
- Status badge (Active/Offline/Maintenance)
- Portal URL display
- Click handler for selection
- Hover effects and animations

---

## Services

### PortalService
**Location**: `src/services/portalService.ts`

Handles all portal-related operations.

**Key Methods**:

```typescript
// Get all portals for an environment
getAllPortals(environment: EnvironmentType): PortalInfo[]

// Get specific portal
getPortal(country: Country, environment: EnvironmentType): PortalInfo | null

// Check portal status
async checkPortalStatus(portal: PortalInfo): Promise<'active' | 'offline' | 'maintenance'>

// Fetch data from portal
async fetchFromPortal<T>(portal: PortalInfo, endpoint: string, options?: RequestInit): Promise<ApiResponse<T>>

// Get localized welcome message
getPortalWelcome(country: Country): string
```

---

## User Story Logging

The application automatically logs all user interactions as "user stories" for comprehensive tracking and documentation.

### UserStoryLogger
**Location**: `src/lib/logging/logger.ts`

Core logging system that manages user stories.

**Key Methods**:

```typescript
// Log a new prompt/interaction
logPrompt(
  title: string,
  description: string,
  promptContent: string,
  options?: {
    country?: string;
    environment?: 'PROD' | 'INDUS';
    severity?: SeverityLevel;
    status?: UserStoryStatus;
    tags?: string[];
    author?: string;
    metadata?: Record<string, any>;
  }
): UserStory

// Log response/completion
logResponse(storyId: string, responseContent: string): UserStory | null

// Update story status
updateStoryStatus(storyId: string, status: UserStoryStatus, metadata?: Record<string, any>): UserStory | null

// Export stories
exportAsJSON(): string
exportAsCSV(): string

// Retrieve stories
getAllStories(): UserStory[]
getStoriesByCountry(country: string): UserStory[]
getStoriesByEnvironment(environment: 'PROD' | 'INDUS'): UserStory[]
getStoriesBySeverity(severity: SeverityLevel): UserStory[]
```

### useUserStory Hook
**Location**: `src/hooks/useUserStory.ts`

React hook for convenient user story logging in components.

**Usage Example**:

```typescript
import { useUserStory } from '@/hooks/useUserStory';

export function MyComponent() {
  const { logPrompt, logResponse, updateStatus } = useUserStory({
    country: 'colombia',
    environment: 'PROD'
  });

  const handleAction = () => {
    const story = logPrompt(
      'User Action Title',
      'Description of the action',
      'Full prompt content',
      {
        severity: 'high',
        tags: ['important', 'user-action']
      }
    );

    // Do something...

    logResponse(story.id, 'Response/completion details');
  };
}
```

### User Story Data Structure

```typescript
interface UserStory {
  id: string;                           // Unique identifier
  timestamp: string;                    // ISO 8601 timestamp
  title: string;                        // Story title
  description: string;                  // Detailed description
  country: string;                      // Related country
  environment: 'PROD' | 'INDUS';       // Environment
  severity: 'low' | 'medium' | 'high' | 'critical';  // Importance level
  status: 'backlog' | 'in-progress' | 'in-review' | 'completed' | 'archived';
  promptContent: string;                // Original prompt/request
  responseContent?: string;             // Response/completion details
  tags: string[];                       // Categorization tags
  author?: string;                      // User who initiated
  assignee?: string;                    // Assigned to user
  relatedStories?: string[];            // Related story IDs
  metadata?: Record<string, any>;       // Custom metadata
}
```

### Severity Levels

- **low**: Minor issues or non-critical actions
- **medium**: Standard interactions (default)
- **high**: Important operations
- **critical**: System-critical events

### Status Values

- **backlog**: Initial state
- **in-progress**: Currently being processed
- **in-review**: Under review
- **completed**: Finished successfully
- **archived**: Historical record

---

## Environment Configuration

### Environment Types

- **PROD**: Production environment for live e-ordering operations
- **INDUS**: Industrial/Testing environment for QA and testing

### Setting Environment

```typescript
// In src/config/environments.ts
export const CURRENT_ENVIRONMENT = (
  process.env.NEXT_PUBLIC_ENVIRONMENT || 'INDUS'
) as EnvironmentType;
```

### Environment-Specific URLs

Portal URLs are configured separately for each environment in `.env.local`:

```env
# PROD URLs
NEXT_PUBLIC_PORTAL_COLOMBIA_PROD=https://portal.colombia.oca-sana.com/api
NEXT_PUBLIC_PORTAL_AUSTRALIA_PROD=https://portal.australia.oca-sana.com/api
# ... etc

# INDUS URLs
NEXT_PUBLIC_PORTAL_COLOMBIA_INDUS=https://test.colombia.oca-sana.com/api
NEXT_PUBLIC_PORTAL_AUSTRALIA_INDUS=https://test.australia.oca-sana.com/api
# ... etc
```

### Configuration Function

```typescript
import { getEnvironmentConfig, CURRENT_ENVIRONMENT } from '@/config/environments';

const config = getEnvironmentConfig(CURRENT_ENVIRONMENT);
// config.portalUrls, config.apiTimeout, config.retryAttempts, etc.
```

---

## API Integration

### PortalService API Calls

```typescript
import { PortalService } from '@/services/portalService';

// Get all portals
const portals = PortalService.getAllPortals('PROD');

// Fetch data from specific portal
const response = await PortalService.fetchFromPortal(
  portal,
  '/orders',  // endpoint
  { method: 'GET' }
);

if (response.success) {
  console.log(response.data);
} else {
  console.error(response.error);
}
```

### API Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}
```

---

## Deployment

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Production Start

```bash
npm start
```

### Environment Variables for Deployment

Set the following environment variables in your deployment platform:

- `NEXT_PUBLIC_ENVIRONMENT`: Either 'PROD' or 'INDUS'
- `NEXT_PUBLIC_PORTAL_*_PROD`: All production portal URLs
- `NEXT_PUBLIC_PORTAL_*_INDUS`: All testing portal URLs
- `NEXT_PUBLIC_LOG_LEVEL`: 'debug' | 'info' | 'warn' | 'error'

---

## Troubleshooting

### Portal Not Loading

1. Check `.env.local` has correct portal URLs
2. Verify the selected environment (PROD/INDUS)
3. Check browser console for network errors
4. Ensure portal is online using `PortalService.checkPortalStatus()`

### User Stories Not Saving

1. Check browser localStorage is enabled
2. Verify available storage space
3. Check browser console for errors
4. Use DevTools to inspect localStorage under 'oca-sana-user-stories'

### Build Errors

1. Run `npm install` to ensure all dependencies are installed
2. Check TypeScript errors: `npm run type-check`
3. Verify environment variables are set
4. Clear `.next` cache: `rm -rf .next`

### Performance Issues

1. Enable Turbopack in development for faster rebuilds
2. Check for large bundle sizes: `npm run build -- --analyze` (if analyzer is installed)
3. Verify no console errors or warnings
4. Use React DevTools profiler to identify slow components

---

## Code Standards

- Use TypeScript for type safety
- Follow ESLint configuration
- Use Tailwind CSS for styling
- Maintain component composition
- Document complex logic
- Write descriptive commit messages
- Log important user interactions

---

## Contributing

When making changes:

1. Create a feature branch
2. Make changes and test locally
3. Log user stories for new features
4. Run linting and type checks
5. Create a pull request with documentation

---

## Support

For issues or questions:

1. Check this documentation
2. Review the troubleshooting section
3. Check application console for errors
4. Inspect user story logs for context
5. Contact the development team

---

**Last Updated**: February 21, 2026
**Version**: 1.0.0
**Documentation Status**: Complete
