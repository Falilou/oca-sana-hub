/**
 * TypeScript Type Definitions
 * Global types used across the application
 */

/**
 * Portal URL Configuration
 */
export interface PortalUrls {
  public: string;
  admin: string;
}

/**
 * Portal Configuration (stored in settings)
 */
export interface PortalConfig {
  PROD: {
    public: string;
    admin: string;
    ssoAdminEnabled: boolean;
    ssoSalesforceEnabled: boolean;
    sanaVersion: string;
    businessCentralUrl: string;
  };
  INDUS: {
    public: string;
    admin: string;
    ssoAdminEnabled: boolean;
    ssoSalesforceEnabled: boolean;
    sanaVersion: string;
    businessCentralUrl: string;
  };
}

/**
 * User Story Severity Levels
 */
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * User Story Status
 */
export type UserStoryStatus = 'backlog' | 'in-progress' | 'in-review' | 'completed' | 'archived';

/**
 * Environment Type
 */
export type Environment = 'PROD' | 'INDUS';

/**
 * User Story Interface
 */
export interface UserStory {
  id?: string;
  timestamp: string;
  title?: string;
  description?: string;
  country?: string;
  environment?: Environment;
  severity?: SeverityLevel;
  status?: UserStoryStatus;
  promptContent?: string;
  responseContent?: string;
  tags?: string[];
  author?: string;
  assignee?: string;
  relatedStories?: string[];
  metadata?: Record<string, any>;
  // Analytics tracking properties
  action?: string;
  details?: {
    country_id?: string;
    country_name?: string;
    portal_id?: string;
    environment?: Environment;
    user?: string;
    [key: string]: any;
  };
}

/**
 * Portal Information
 */
export interface PortalInfo {
  name: string;
  country: string;
  countryCode: string;
  url: string; // For backward compatibility (public URL)
  publicUrl: string;
  adminUrl: string;
  status: 'active' | 'inactive' | 'maintenance' | 'offline';
  lastChecked?: string;
  supportedEnvironments: ('PROD' | 'INDUS')[];
  ssoAdminEnabled: boolean;
  ssoSalesforceEnabled: boolean;
  sanaVersion: string;
  businessCentralUrl: string;
  lastUpdated?: string;
}

/**
 * API Response Wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

/**
 * User Session
 */
export interface UserSession {
  id: string;
  userId?: string;
  startTime: string;
  lastActivity: string;
  environment: 'PROD' | 'INDUS';
  country?: string;
}

/**
 * Custom Country Configuration (for dynamically added countries)
 */
export interface CustomCountry {
  id: string; // Unique identifier (kebab-case, e.g., 'brazil')
  name: string; // Display name (e.g., 'Brazil E-Ordering Portal')
  countryCode: string; // ISO code (e.g., 'BR')
  flagEmoji: string; // Flag emoji (e.g., '🇧🇷')
  ssoAdminEnabled: boolean;
  ssoSalesforceEnabled: boolean;
  sanaVersion: string;
}

/**
 * Application Configuration
 */
export interface AppConfig {
  apiTimeout: number;
  retryAttempts: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableUserStoryLogging: boolean;
}
