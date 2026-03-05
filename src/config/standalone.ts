/**
 * Standalone Mode Configuration
 * Controls which features are available in desktop standalone mode
 */

export interface StandaloneConfig {
  isStandalone: boolean;
  hideLogAnalysis: boolean;
  hidePortalAnalytics: boolean;
  hideSettings: boolean;
}

/**
 * Check if running in standalone desktop mode
 */
export function isStandaloneMode(): boolean {
  // Check if NEXT_PUBLIC_STANDALONE_MODE is set
  return process.env.NEXT_PUBLIC_STANDALONE_MODE === 'true';
}

/**
 * Get standalone configuration
 */
export function getStandaloneConfig(): StandaloneConfig {
  const isStandalone = isStandaloneMode();
  
  return {
    isStandalone,
    hideLogAnalysis: isStandalone, // Hide log analysis in standalone mode
    hidePortalAnalytics: isStandalone, // Hide portal analytics in standalone mode
    hideSettings: false, // Keep settings visible
  };
}

/**
 * Check if a specific feature should be hidden
 */
export function shouldHideFeature(feature: 'logs' | 'analytics' | 'settings'): boolean {
  const config = getStandaloneConfig();
  
  switch (feature) {
    case 'logs':
      return config.hideLogAnalysis;
    case 'analytics':
      return config.hidePortalAnalytics;
    case 'settings':
      return config.hideSettings;
    default:
      return false;
  }
}
