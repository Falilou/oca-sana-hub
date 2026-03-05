import { PortalInfo, UserStory, Environment } from '@/types';
import { PortalService } from './portalService';

export interface DashboardMetrics {
  totalPortals: number;
  activePortals: number;
  prodEnvironments: number;
  indusEnvironments: number;
  ssoEnabledCount: number;
  bcIntegratedCount: number;
  totalAccesses: number;
  uniqueUsers: number;
}

export interface CountryUsageData {
  country: string;
  countryCode: string;
  accessCount: number;
  lastAccessed: string;
  flagEmoji: string;
}

export interface EnvironmentDistribution {
  name: string;
  value: number;
  percentage: number;
}

export interface ActivityTimelineData {
  date: string;
  accesses: number;
  uniquePortals: number;
}

export interface SSOAdoptionData {
  category: string;
  enabled: number;
  total: number;
  percentage: number;
}

/**
 * Analytics Service
 * Processes portal data and user stories to generate dashboard metrics
 */
class AnalyticsService {
  /**
   * Get all portals (combines PROD and INDUS)
   */
  private getAllPortals(): PortalInfo[] {
    // Get unique portals from both environments
    const prodPortals = PortalService.getAllPortals('PROD');
    return prodPortals; // Since it's the same portals, just return one set
  }

  /**
   * Get comprehensive dashboard metrics
   */
  getDashboardMetrics(): DashboardMetrics {
    const portals = this.getAllPortals();
    const userStories = this.getUserStories();

    // Calculate unique portals accessed
    const accessedPortalIds = new Set(
      userStories
        .filter(story => story.action === 'portal_access' || story.action === 'portal_select')
        .map(story => story.details?.country_id || story.details?.portal_id)
        .filter(Boolean)
    );

    // Count portals with Business Central integration
    const bcIntegrated = portals.filter(
      (p: PortalInfo) => p.businessCentralUrl && p.businessCentralUrl.length > 0
    ).length;

    // Count SSO enabled portals
    const ssoEnabled = portals.filter(
      (p: PortalInfo) => p.ssoAdminEnabled || p.ssoSalesforceEnabled
    ).length;

    // Get unique users (based on user stories)
    const uniqueUsers = new Set(
      userStories.map(story => story.details?.user || 'anonymous')
    ).size;

    return {
      totalPortals: portals.length,
      activePortals: accessedPortalIds.size,
      prodEnvironments: portals.length, // Each portal has PROD
      indusEnvironments: portals.length, // Each portal has INDUS
      ssoEnabledCount: ssoEnabled,
      bcIntegratedCount: bcIntegrated,
      totalAccesses: userStories.filter(
        s => s.action === 'portal_access' || s.action === 'portal_select'
      ).length,
      uniqueUsers: uniqueUsers,
    };
  }

  /**
   * Get usage data by country
   */
  getCountryUsageData(): CountryUsageData[] {
    const portals = this.getAllPortals();
    const userStories = this.getUserStories();

    // Create usage map
    const usageMap = new Map<string, { count: number; lastAccessed: Date; portal: PortalInfo }>();

    userStories
      .filter(story => story.action === 'portal_access' || story.action === 'portal_select')
      .forEach(story => {
        const countryId = story.details?.country_id || story.details?.portal_id;
        if (countryId) {
          const portal = portals.find((p: PortalInfo) => p.country === countryId);
          if (portal) {
            const existing = usageMap.get(countryId);
            const accessDate = new Date(story.timestamp);
            
            if (!existing || accessDate > existing.lastAccessed) {
              usageMap.set(countryId, {
                count: (existing?.count || 0) + 1,
                lastAccessed: accessDate,
                portal: portal,
              });
            } else {
              usageMap.set(countryId, {
                ...existing,
                count: existing.count + 1,
              });
            }
          }
        }
      });

    // Convert to array and add portals with 0 usage
    const result: CountryUsageData[] = portals.map((portal: PortalInfo) => {
      const usage = usageMap.get(portal.country);
      return {
        country: portal.name,
        countryCode: portal.countryCode,
        accessCount: usage?.count || 0,
        lastAccessed: usage?.lastAccessed.toISOString() || 'Never',
        flagEmoji: this.getFlagEmoji(portal.countryCode),
      };
    });

    // Sort by access count (descending)
    return result.sort((a, b) => b.accessCount - a.accessCount);
  }

  /**
   * Get environment distribution data
   */
  getEnvironmentDistribution(): EnvironmentDistribution[] {
    const userStories = this.getUserStories();

    const prodCount = userStories.filter(
      story => story.details?.environment === 'PROD'
    ).length;

    const indusCount = userStories.filter(
      story => story.details?.environment === 'INDUS'
    ).length;

    const total = prodCount + indusCount || 1; // Avoid division by zero

    return [
      {
        name: 'Production',
        value: prodCount,
        percentage: Math.round((prodCount / total) * 100),
      },
      {
        name: 'Testing (INDUS)',
        value: indusCount,
        percentage: Math.round((indusCount / total) * 100),
      },
    ];
  }

  /**
   * Get activity timeline (last 7 days)
   */
  getActivityTimeline(days: number = 7): ActivityTimelineData[] {
    const userStories = this.getUserStories();
    const now = new Date();
    const timeline: ActivityTimelineData[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayStories = userStories.filter(story => {
        const storyDate = new Date(story.timestamp);
        return storyDate >= date && storyDate < nextDate;
      });

      const uniquePortals = new Set(
        dayStories
          .filter(s => s.action === 'portal_access' || s.action === 'portal_select')
          .map(s => s.details?.country_id || s.details?.portal_id)
          .filter(Boolean)
      );

      timeline.push({
        date: date.toISOString().split('T')[0], // YYYY-MM-DD
        accesses: dayStories.filter(
          s => s.action === 'portal_access' || s.action === 'portal_select'
        ).length,
        uniquePortals: uniquePortals.size,
      });
    }

    return timeline;
  }

  /**
   * Get SSO adoption metrics
   */
  getSSOAdoptionData(): SSOAdoptionData[] {
    const portals = this.getAllPortals();

    const ssoAdminEnabled = portals.filter(
      (p: PortalInfo) => p.ssoAdminEnabled
    ).length;

    const ssoSalesforceEnabled = portals.filter(
      (p: PortalInfo) => p.ssoSalesforceEnabled
    ).length;

    const total = portals.length;

    return [
      {
        category: 'SSO Admin',
        enabled: ssoAdminEnabled,
        total: total,
        percentage: Math.round((ssoAdminEnabled / total) * 100),
      },
      {
        category: 'SSO Salesforce',
        enabled: ssoSalesforceEnabled,
        total: total,
        percentage: Math.round((ssoSalesforceEnabled / total) * 100),
      },
    ];
  }

  /**
   * Get Business Central integration status
   */
  getBCIntegrationStatus(): { integrated: number; total: number; percentage: number } {
    const portals = this.getAllPortals();
    const integrated = portals.filter(
      (p: PortalInfo) => p.businessCentralUrl && p.businessCentralUrl.length > 0
    ).length;

    return {
      integrated,
      total: portals.length,
      percentage: Math.round((integrated / portals.length) * 100),
    };
  }

  /**
   * Get recent activity (last N user stories)
   */
  getRecentActivity(limit: number = 10): UserStory[] {
    const stories = this.getUserStories();
    return stories
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get top performing portals
   */
  getTopPortals(limit: number = 5): CountryUsageData[] {
    return this.getCountryUsageData().slice(0, limit);
  }

  /**
   * Helper: Load user stories from localStorage
   */
  private getUserStories(): UserStory[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem('oca-sana-user-stories');
      if (!stored) return [];

      const data = JSON.parse(stored);
      return data.stories || [];
    } catch (error) {
      console.error('Error loading user stories:', error);
      return [];
    }
  }

  /**
   * Helper: Get flag emoji for country code
   */
  private getFlagEmoji(countryCode: string): string {
    const flagMap: Record<string, string> = {
      CO: '🇨🇴',
      AU: '🇦🇺',
      MA: '🇲🇦',
      CL: '🇨🇱',
      AR: '🇦🇷',
      VN: '🇻🇳',
      ZA: '🇿🇦',
      MY: '🇲🇾',
      KR: '🇰🇷',
    };
    return flagMap[countryCode] || '🌎';
  }

  /**
   * Generate mock data for demonstration (if no real data exists)
   */
  generateMockData(): void {
    if (typeof window === 'undefined') return;

    const stories = this.getUserStories();
    if (stories.length > 0) return; // Don't generate if data exists

    const portals = this.getAllPortals();
    const mockStories: UserStory[] = [];

    // Generate mock access data for the last 7 days
    const now = new Date();
    for (let day = 6; day >= 0; day--) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);

      // Random number of accesses per day (5-15)
      const accessCount = Math.floor(Math.random() * 10) + 5;

      for (let i = 0; i < accessCount; i++) {
        const randomPortal = portals[Math.floor(Math.random() * portals.length)];
        const randomEnv: Environment = Math.random() > 0.5 ? 'PROD' : 'INDUS';

        mockStories.push({
          timestamp: new Date(
            date.getTime() + Math.random() * 24 * 60 * 60 * 1000
          ).toISOString(),
          action: Math.random() > 0.3 ? 'portal_access' : 'portal_select',
          details: {
            country_id: randomPortal.country,
            country_name: randomPortal.name,
            environment: randomEnv,
            user: `user${Math.floor(Math.random() * 5) + 1}`,
          },
        });
      }
    }

    // Save mock data
    localStorage.setItem(
      'oca-sana-user-stories',
      JSON.stringify({
        stories: mockStories,
        lastUpdated: new Date().toISOString(),
      })
    );
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
