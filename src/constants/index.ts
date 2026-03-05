/**
 * Application Constants
 * Centralized constants for the OCA Sana Hub application
 */

// API Endpoints
export const API_ENDPOINTS = {
  LOGS: '/api/logs',
  LOGS_ANALYSIS: '/api/logs/analysis',
  PORTAL_URLS: '/api/portal-urls',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  PORTAL_URLS: 'portal-urls',
  CUSTOM_COUNTRIES: 'custom-countries',
  USER_STORIES: 'oca-sana-user-stories',
  THEME: 'theme',
} as const;

// UI Configuration
export const UI_CONFIG = {
  SIDEBAR_WIDTH_OPEN: '16rem', // 256px / ml-64
  SIDEBAR_WIDTH_CLOSED: '5rem', // 80px / ml-20
  HEADER_HEIGHT: '73px',
  TRANSITION_DURATION: '300ms',
  DEFAULT_ITEMS_PER_PAGE: 10,
  MAX_RECENT_ACTIVITIES: 10,
  ACTIVITY_TIMELINE_DAYS: 7,
} as const;

// Portal Configuration
export const PORTAL_CONFIG = {
  DEFAULT_SANA_VERSION: '9.3.40',
  SUPPORTED_ENVIRONMENTS: ['PROD', 'INDUS'] as const,
  STATUS_OPTIONS: ['active', 'inactive', 'maintenance', 'offline'] as const,
} as const;

// User Story Configuration
export const USER_STORY_CONFIG = {
  SEVERITY_LEVELS: ['low', 'medium', 'high', 'critical'] as const,
  STATUS_OPTIONS: ['backlog', 'in-progress', 'in-review', 'completed', 'archived'] as const,
} as const;

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#8b5cf6',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#06b6d4',
  SLATE: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
} as const;

// Countries Configuration
export const COUNTRIES = [
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
] as const;

// Performance Configuration
export const PERFORMANCE_CONFIG = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  MAX_LOG_ENTRIES: 250000,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  FULL: 'MMMM DD, YYYY HH:mm:ss',
  TIME: 'HH:mm:ss',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  LOAD_FAILED: 'Failed to load data. Please try again.',
  SAVE_FAILED: 'Failed to save data. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_DATA: 'Invalid data format.',
  UNAUTHORIZED: 'Unauthorized access.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Successfully saved!',
  UPDATED: 'Successfully updated!',
  DELETED: 'Successfully deleted!',
  EXPORTED: 'Successfully exported!',
} as const;
