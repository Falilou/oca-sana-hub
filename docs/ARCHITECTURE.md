# Architecture Guide

## System Overview

OCA Sana Hub is built with a modular, scalable architecture using Next.js 15, React 19, and TypeScript.

```
┌─────────────────────────────────────────────────────────────────┐
│                      Browser / Client Layer                     │
│  (React Components, Hooks, Local Storage, Session Management)   │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js Layer                              │
│  (App Router, Server Components, API Routes, Middleware)        │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Application Services Layer                    │
│  (PortalService, UserStoryLogger, Portal APIs)                  │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   External Portal APIs Layer                    │
│  (9 Country E-Ordering Portals - PROD & INDUS)                 │
└─────────────────────────────────────────────────────────────────┘
```

## Layer Descriptions

### 1. Browser/Client Layer

**Components**:
- React components (Header, PortalGrid, PortalCard)
- Custom hooks (useUserStory, useUserStories)
- React Context (future state management)
- Browser storage (localStorage for user stories)

**Responsibilities**:
- Render UI
- Handle user interactions
- Display portal information
- Manage environment switching
- Log user activities

### 2. Next.js Layer

**Features Used**:
- App Router (src/app)
- Client Components with 'use client'
- TypeScript support
- Static generation where possible
- Turbopack for faster builds

**Structure**:
```
src/app/
├── page.tsx (Main Hub Page)
├── layout.tsx (Root Wrapper)
└── globals.css (Global Styles)
```

### 3. Services Layer

**PortalService** (`src/services/portalService.ts`)
- Portal discovery and listing
- Portal status checking
- API communication
- Environment configuration management

**UserStoryLogger** (`src/lib/logging/logger.ts`)
- Story creation and logging
- Data persistence
- Story retrieval and filtering
- Export functionality (JSON/CSV)

### 4. External APIs

**Portal Endpoints**:
- 9 country-specific e-ordering portals
- 2 environments per portal (PROD/INDUS)
- REST API endpoints
- Authentication/Authorization

## Data Flow

### 1. User Selects a Portal

```
User clicks PortalCard
    ↓
handlePortalSelect() called
    ↓
userStoryLogger.logPrompt() (async)
    ↓
UserStory created & stored in localStorage
    ↓
Selected portal displayed with URL
```

### 2. User Switches Environment

```
User clicks PROD/INDUS button
    ↓
handleEnvironmentChange() called
    ↓
CURRENT_ENVIRONMENT updated
    ↓
PortalGrid re-fetches portals with new URLs
    ↓
userStoryLogger.logPrompt() records switch
    ↓
UI updates with new environment data
```

### 3. Portal Data Fetch

```
PortalGrid mounts → useEffect
    ↓
PortalService.getAllPortals(environment)
    ↓
Config lookup (PROD/INDUS specific URLs)
    ↓
PortalInfo[] returned
    ↓
State updated, render cards
```

## Component Interaction

```
App Entry Point
    │
    ├── Header (Environment Control)
    │   └── Environment buttons
    │
    ├── Main Content
    │   ├── PortalGrid
    │   │   └── PortalCard[] (9 cards)
    │   │       └── Status badge
    │   │
    │   └── Portal Details Section
    │       └── Launch button
    │
    └── Footer
        └── Copyright & Info
```

## State Management Strategy

### Current Approach: React Hooks + localStorage

**Advantages**:
- Minimal complexity for current needs
- No external dependencies
- Fast performance
- Browser native storage

**State Locations**:
```
Page Component (home)
├── selectedPortal: PortalInfo | null
├── currentEnv: 'PROD' | 'INDUS'
└── User Stories
    └── localStorage: 'oca-sana-user-stories'

PortalGrid Component
└── portals: PortalInfo[]
└── isLoading: boolean
```

### Future Scalability

If needed, migrate to:
- **React Context** for global state
- **Zustand** for light-weight state management
- **TanStack Query** for server state
- **Redis** for distributed caching

## Type Safety

### Global Types (`src/types/index.ts`)

```typescript
// User Stories
UserStory, SeverityLevel, UserStoryStatus

// Portal Information
PortalInfo, PortalConfig

// API Responses
ApiResponse<T>

// User Sessions
UserSession, AppConfig
```

### Environment Types (`src/config/environments.ts`)

```typescript
EnvironmentType = 'PROD' | 'INDUS'
Country = 'colombia' | 'australia' | ...
EnvironmentConfig = { portalUrls, apiTimeout, ... }
```

## Error Handling Strategy

### Frontend Error Handling

```typescript
// Component Level
try-catch in useEffect for data fetching
Conditional rendering for error states
User-friendly error messages

// Service Level
ApiResponse wrapper with error field
Fallback values in configuration

// Logger Level
try-catch in localStorage operations
Fallback to in-memory storage
Error logging
```

### API Error Responses

```typescript
{
  success: false,
  error: {
    code: "FETCH_ERROR" | "HTTP_500" | "TIMEOUT",
    message: "Human readable message"
  },
  timestamp: "ISO timestamp"
}
```

## Performance Considerations

### Optimization Strategies

1. **Turbopack Development Builds**
   - Faster compilation
   - Near-instant HMR
   - Smaller bundle size

2. **Component Code Splitting**
   - PortalCard lazy loaded
   - Dynamic imports where needed

3. **Image Optimization**
   - Next.js Image component
   - Emoji for flags (no extra requests)

4. **Caching**
   - Portal configuration cached
   - User stories cached in localStorage
   - Browser cache headers on static assets

### Monitoring

- Component render performance
- API response times
- Storage usage
- Bundle size

## Security Considerations

### Current Implementation

```typescript
// Environment Variables
All portal URLs in NEXT_PUBLIC_* (client-safe)
No secrets stored client-side

// API Calls
CORS enabled
Standard HTTP headers
No authentication tokens visible

// Local Storage
User stories only (no PII)
Client-side only (no server sync)
```

### Future Enhancements

- API key rotation
- Rate limiting
- Request signing
- Data encryption in transit
- User authentication

## Scalability Plan

### Phase 1: Current (Multi-country Hub)
- 9 countries
- 2 environments
- Logging system
- Portal routing

### Phase 2: Portal Features
- Shopping cart
- Order management
- Payment processing
- User accounts

### Phase 3: Analytics
- Usage dashboard
- Performance metrics
- Trend analysis
- Export reports

### Phase 4: Enterprise
- Multi-user support
- Role-based access
- Audit trails
- Admin dashboard
- API webhooks

## Testing Strategy

### Unit Tests
- Service methods (PortalService, UserStoryLogger)
- Utility functions
- Type validation

### Integration Tests
- Component + Service interaction
- API response handling
- Data persistence

### E2E Tests
- Full user journeys
- Portal selection flow
- Environment switching
- Data export

## Deployment Architecture

```
Development
    ↓
Staging (INDUS testing)
    ↓
Production (PROD live)
    ↓
CDN / Edge Network
    ↓
Browser
```

### Environment Variables by Deployment

| Environment | Var | Value |
|------------|-----|-------|
| Development | NEXT_PUBLIC_ENVIRONMENT | INDUS |
| Staging | NEXT_PUBLIC_ENVIRONMENT | INDUS |
| Production | NEXT_PUBLIC_ENVIRONMENT | PROD |

## File Organization Principles

```
By Feature / Domain
├── src/components     (UI Components)
├── src/services       (Business Logic)
├── src/hooks          (Reusable Hooks)
├── src/lib            (Utilities & Core)
├── src/types          (Type Definitions)
├── src/config         (Configuration)
└── src/portals        (Country-Specific)

By Concern
├── docs               (Documentation)
├── .github            (CI/CD, etc.)
├── public             (Static Assets)
├── logs               (Runtime Logs)
└── tests              (Test Files)
```

---

**Architecture Document Version**: 1.0.0
**Last Updated**: February 21, 2026
