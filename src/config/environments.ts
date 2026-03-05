/**
 * Environment Configuration
 * Manages PROD and INDUS (testing) environments
 */

export type EnvironmentType = 'PROD' | 'INDUS';

interface EnvironmentConfig {
  portalUrls: {
    colombia: string;
    australia: string;
    morocco: string;
    chile: string;
    argentina: string;
    vietnam: string;
    southAfrica: string;
    malaysia: string;
    southKorea: string;
  };
  logsDirectory: string;
  apiTimeout: number;
  retryAttempts: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

const PROD_CONFIG: EnvironmentConfig = {
  portalUrls: {
    colombia: process.env.NEXT_PUBLIC_PORTAL_COLOMBIA_PROD || '',
    australia: process.env.NEXT_PUBLIC_PORTAL_AUSTRALIA_PROD || '',
    morocco: process.env.NEXT_PUBLIC_PORTAL_MOROCCO_PROD || '',
    chile: process.env.NEXT_PUBLIC_PORTAL_CHILE_PROD || '',
    argentina: process.env.NEXT_PUBLIC_PORTAL_ARGENTINA_PROD || '',
    vietnam: process.env.NEXT_PUBLIC_PORTAL_VIETNAM_PROD || '',
    southAfrica: process.env.NEXT_PUBLIC_PORTAL_SOUTH_AFRICA_PROD || '',
    malaysia: process.env.NEXT_PUBLIC_PORTAL_MALAYSIA_PROD || '',
    southKorea: process.env.NEXT_PUBLIC_PORTAL_SOUTH_KOREA_PROD || '',
  },
  logsDirectory: process.env.NEXT_PUBLIC_LOGS_DIRECTORY || '',
  apiTimeout: 30000,
  retryAttempts: 3,
  logLevel: 'info',
};

const INDUS_CONFIG: EnvironmentConfig = {
  portalUrls: {
    colombia: process.env.NEXT_PUBLIC_PORTAL_COLOMBIA_INDUS || '',
    australia: process.env.NEXT_PUBLIC_PORTAL_AUSTRALIA_INDUS || '',
    morocco: process.env.NEXT_PUBLIC_PORTAL_MOROCCO_INDUS || '',
    chile: process.env.NEXT_PUBLIC_PORTAL_CHILE_INDUS || '',
    argentina: process.env.NEXT_PUBLIC_PORTAL_ARGENTINA_INDUS || '',
    vietnam: process.env.NEXT_PUBLIC_PORTAL_VIETNAM_INDUS || '',
    southAfrica: process.env.NEXT_PUBLIC_PORTAL_SOUTH_AFRICA_INDUS || '',
    malaysia: process.env.NEXT_PUBLIC_PORTAL_MALAYSIA_INDUS || '',
    southKorea: process.env.NEXT_PUBLIC_PORTAL_SOUTH_KOREA_INDUS || '',
  },
  logsDirectory: process.env.NEXT_PUBLIC_LOGS_DIRECTORY || '',
  apiTimeout: 30000,
  retryAttempts: 3,
  logLevel: 'debug',
};

export function getEnvironmentConfig(env: EnvironmentType): EnvironmentConfig {
  switch (env) {
    case 'PROD':
      return PROD_CONFIG;
    case 'INDUS':
      return INDUS_CONFIG;
    default:
      return INDUS_CONFIG;
  }
}

export const CURRENT_ENVIRONMENT = (
  process.env.NEXT_PUBLIC_ENVIRONMENT || 'INDUS'
) as EnvironmentType;

export const COUNTRIES = [
  'colombia',
  'australia',
  'morocco',
  'chile',
  'argentina',
  'vietnam',
  'southAfrica',
  'malaysia',
  'southKorea',
] as const;

export type Country = typeof COUNTRIES[number];
