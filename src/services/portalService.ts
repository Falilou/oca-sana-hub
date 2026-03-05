/**
 * Portal Service
 * Handles interactions with country-specific e-ordering portals
 */

import { EnvironmentType, getEnvironmentConfig, Country } from '@/config/environments';
import { PortalInfo, ApiResponse, PortalUrls, CustomCountry } from '@/types';
import { STORAGE_KEYS, PORTAL_CONFIG } from '@/constants';

interface PortalConfig {
  country: Country;
  name: string;
  countryCode: string;
  ssoAdminEnabled: boolean;
  ssoSalesforceEnabled: boolean;
  sanaVersion: string;
  businessCentralUrl: string;
}

/**
 * Get portal URLs and config (public, admin, SSO, Sana version, BC URL) from localStorage or environment config
 */
function getPortalConfig(country: Country, environment: EnvironmentType) {
  const defaults = {
    public: '',
    admin: '',
    ssoAdminEnabled: false,
    ssoSalesforceEnabled: false,
    sanaVersion: PORTAL_CONFIG.DEFAULT_SANA_VERSION,
    businessCentralUrl: ''
  };
  
  // Try localStorage first (user-configured settings)
  if (typeof window !== 'undefined') {
    const savedConfig = localStorage.getItem(STORAGE_KEYS.PORTAL_URLS);
    console.log(`[PortalService] Loading config for ${country}/${environment}`);
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config[country] && config[country][environment]) {
          const envConfig = config[country][environment];
          return {
            public: envConfig.public || '',
            admin: envConfig.admin || '',
            ssoAdminEnabled: envConfig.ssoAdminEnabled ?? defaults.ssoAdminEnabled,
            ssoSalesforceEnabled: envConfig.ssoSalesforceEnabled ?? defaults.ssoSalesforceEnabled,
            sanaVersion: envConfig.sanaVersion || defaults.sanaVersion,
            businessCentralUrl: envConfig.businessCentralUrl || ''
          };
        }
      } catch (e) {
        console.error('Error parsing saved portal config:', e);
      }
    }
  }
  
  // Fallback to defaults from PORTAL_CONFIGS
  const portalConfig = PORTAL_CONFIGS[country];
  if (portalConfig) {
    const envConfig = getEnvironmentConfig(environment);
    const fallbackUrl = envConfig.portalUrls[country] || '';
    return {
      public: fallbackUrl,
      admin: fallbackUrl ? `${fallbackUrl}/admin` : '',
      ssoAdminEnabled: portalConfig.ssoAdminEnabled,
      ssoSalesforceEnabled: portalConfig.ssoSalesforceEnabled,
      sanaVersion: portalConfig.sanaVersion,
      businessCentralUrl: portalConfig.businessCentralUrl
    };
  }
  
  return defaults;
}

/**
 * Determine portal status based on URL availability
 */
function getPortalStatus(publicUrl: string, adminUrl: string): 'active' | 'inactive' {
  // Portal is active if at least the public URL is available
  return publicUrl && publicUrl.trim() !== '' ? 'active' : 'inactive';
}

/**
 * Load custom countries from localStorage
 */
function getCustomCountries(): CustomCountry[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const savedCustomCountries = localStorage.getItem(STORAGE_KEYS.CUSTOM_COUNTRIES);
    if (savedCustomCountries) {
      return JSON.parse(savedCustomCountries);
    }
  } catch (error) {
    console.error('Error loading custom countries:', error);
  }
  
  return [];
}

const PORTAL_CONFIGS: Record<Country, PortalConfig> = {
  colombia: { 
    country: 'colombia', 
    name: 'Colombia E-Ordering Portal', 
    countryCode: 'CO',
    ssoAdminEnabled: true,
    ssoSalesforceEnabled: true,
    sanaVersion: '9.3.47',
    businessCentralUrl: ''
  },
  australia: { 
    country: 'australia', 
    name: 'Australia E-Ordering Portal', 
    countryCode: 'AU',
    ssoAdminEnabled: true,
    ssoSalesforceEnabled: false,
    sanaVersion: '9.3.45',
    businessCentralUrl: ''
  },
  morocco: { 
    country: 'morocco', 
    name: 'Morocco E-Ordering Portal', 
    countryCode: 'MA',
    ssoAdminEnabled: false,
    ssoSalesforceEnabled: true,
    sanaVersion: '9.3.40',
    businessCentralUrl: ''
  },
  chile: { 
    country: 'chile', 
    name: 'Chile E-Ordering Portal', 
    countryCode: 'CL',
    ssoAdminEnabled: true,
    ssoSalesforceEnabled: true,
    sanaVersion: '9.3.47',
    businessCentralUrl: ''
  },
  argentina: { 
    country: 'argentina', 
    name: 'Argentina E-Ordering Portal', 
    countryCode: 'AR',
    ssoAdminEnabled: true,
    ssoSalesforceEnabled: false,
    sanaVersion: '9.3.42',
    businessCentralUrl: ''
  },
  vietnam: { 
    country: 'vietnam', 
    name: 'Vietnam E-Ordering Portal', 
    countryCode: 'VN',
    ssoAdminEnabled: false,
    ssoSalesforceEnabled: false,
    sanaVersion: '9.3.38',
    businessCentralUrl: ''
  },
  southAfrica: { 
    country: 'southAfrica', 
    name: 'South Africa E-Ordering Portal', 
    countryCode: 'ZA',
    ssoAdminEnabled: true,
    ssoSalesforceEnabled: true,
    sanaVersion: '9.3.46',
    businessCentralUrl: ''
  },
  malaysia: { 
    country: 'malaysia', 
    name: 'Malaysia E-Ordering Portal', 
    countryCode: 'MY',
    ssoAdminEnabled: false,
    ssoSalesforceEnabled: true,
    sanaVersion: '9.3.41',
    businessCentralUrl: ''
  },
  southKorea: { 
    country: 'southKorea', 
    name: 'South Korea E-Ordering Portal', 
    countryCode: 'KR',
    ssoAdminEnabled: true,
    ssoSalesforceEnabled: false,
    sanaVersion: '9.3.44',
    businessCentralUrl: ''
  },
};

export class PortalService {
  /**
   * Get all available portals (built-in + custom)
   */
  static getAllPortals(environment: EnvironmentType): PortalInfo[] {
    // Get built-in portals
    const builtInPortals = Object.entries(PORTAL_CONFIGS).map(([key, portalConfig]) => {
      const config = getPortalConfig(key as Country, environment);
      return {
        name: portalConfig.name,
        country: portalConfig.country,
        countryCode: portalConfig.countryCode,
        url: config.public, // For backward compatibility
        publicUrl: config.public,
        adminUrl: config.admin,
        status: getPortalStatus(config.public, config.admin),
        supportedEnvironments: ['PROD', 'INDUS'] as ('PROD' | 'INDUS')[],
        ssoAdminEnabled: config.ssoAdminEnabled,
        ssoSalesforceEnabled: config.ssoSalesforceEnabled,
        sanaVersion: config.sanaVersion,
        businessCentralUrl: config.businessCentralUrl,
        lastUpdated: new Date().toISOString(),
      };
    });

    // Get custom portals
    const customCountries = getCustomCountries();
    const customPortals = customCountries.map(customCountry => {
      const config = getPortalConfig(customCountry.id as Country, environment);
      return {
        name: customCountry.name,
        country: customCountry.id,
        countryCode: customCountry.countryCode,
        url: config.public,
        publicUrl: config.public,
        adminUrl: config.admin,
        status: getPortalStatus(config.public, config.admin),
        supportedEnvironments: ['PROD', 'INDUS'] as ('PROD' | 'INDUS')[],
        ssoAdminEnabled: config.ssoAdminEnabled,
        ssoSalesforceEnabled: config.ssoSalesforceEnabled,
        sanaVersion: config.sanaVersion,
        businessCentralUrl: config.businessCentralUrl,
        lastUpdated: new Date().toISOString(),
      };
    });

    return [...builtInPortals, ...customPortals];
  }

  /**
   * Get a specific portal by country (checks both built-in and custom)
   */
  static getPortal(country: Country, environment: EnvironmentType): PortalInfo | null {
    // Check built-in portals first
    const portalConfig = PORTAL_CONFIGS[country];
    if (portalConfig) {
      const config = getPortalConfig(country, environment);
      return {
        name: portalConfig.name,
        country: portalConfig.country,
        countryCode: portalConfig.countryCode,
        url: config.public, // For backward compatibility
        publicUrl: config.public,
        adminUrl: config.admin,
        status: getPortalStatus(config.public, config.admin),
        supportedEnvironments: ['PROD', 'INDUS'],
        ssoAdminEnabled: config.ssoAdminEnabled,
        ssoSalesforceEnabled: config.ssoSalesforceEnabled,
        sanaVersion: config.sanaVersion,
        businessCentralUrl: config.businessCentralUrl,
        lastUpdated: new Date().toISOString(),
      };
    }

    // Check custom portals
    const customCountries = getCustomCountries();
    const customCountry = customCountries.find(c => c.id === country);
    if (customCountry) {
      const config = getPortalConfig(country, environment);
      return {
        name: customCountry.name,
        country: customCountry.id,
        countryCode: customCountry.countryCode,
        url: config.public,
        publicUrl: config.public,
        adminUrl: config.admin,
        status: getPortalStatus(config.public, config.admin),
        supportedEnvironments: ['PROD', 'INDUS'],
        ssoAdminEnabled: config.ssoAdminEnabled,
        ssoSalesforceEnabled: config.ssoSalesforceEnabled,
        sanaVersion: config.sanaVersion,
        businessCentralUrl: config.businessCentralUrl,
        lastUpdated: new Date().toISOString(),
      };
    }

    return null;
  }

  /**
   * Check portal status
   */
  static async checkPortalStatus(portal: PortalInfo): Promise<'active' | 'offline' | 'maintenance'> {
    try {
      const response = await fetch(`${portal.url}/health`, {
        method: 'HEAD',
        mode: 'no-cors',
      });

      return response.ok ? 'active' : 'offline';
    } catch (error) {
      return 'offline';
    }
  }

  /**
   * Fetch data from portal
   */
  static async fetchFromPortal<T>(
    portal: PortalInfo,
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${portal.url}${endpoint}`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: `HTTP ${response.status}: ${response.statusText}`,
          },
          timestamp: new Date().toISOString(),
        };
      }

      const data = await response.json();

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get portal welcome message
   */
  static getPortalWelcome(country: Country): string {
    const greetings: Record<Country, string> = {
      colombia: '¡Bienvenido al Portal de Colombia!',
      australia: 'Welcome to the Australia Portal!',
      morocco: 'أهلا وسهلا بك في بوابة المغرب!',
      chile: '¡Bienvenido al Portal de Chile!',
      argentina: '¡Bienvenido al Portal de Argentina!',
      vietnam: 'Chào mừng đến với Cổng thông tin Việt Nam!',
      southAfrica: 'Welcome to the South Africa Portal!',
      malaysia: 'Selamat datang ke Portal Malaysia!',
      southKorea: '대한민국 포털에 오신 것을 환영합니다!',
    };

    return greetings[country] || 'Welcome!';
  }
}
