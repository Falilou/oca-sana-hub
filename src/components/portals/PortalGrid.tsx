/**
 * Portal Grid Component
 * Displays all available portals in a responsive grid
 */

'use client';

import React, { useState, useEffect } from 'react';
import { PortalCard } from './PortalCard';
import { PortalService } from '@/services/portalService';
import { PortalInfo } from '@/types';
import { CURRENT_ENVIRONMENT } from '@/config/environments';

interface PortalGridProps {
  onPortalSelect?: (portal: PortalInfo) => void;
  environment?: 'PROD' | 'INDUS';
}

export const PortalGrid: React.FC<PortalGridProps> = ({
  onPortalSelect,
  environment = CURRENT_ENVIRONMENT,
}) => {
  const [portals, setPortals] = useState<PortalInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load portal URLs from server on mount
  useEffect(() => {
    const loadPortalUrls = async () => {
      console.log('[PortalGrid] Loading portal URLs from server...');
      try {
        const response = await fetch('/api/portal-urls');
        if (response.ok) {
          const result = await response.json();
          const serverUrls = result.data || result; // Handle both wrapped and unwrapped responses
          console.log('[PortalGrid] Received URLs from server:', serverUrls);
          localStorage.setItem('portal-urls', JSON.stringify(serverUrls));
          console.log('[PortalGrid] Saved to localStorage');
          // Trigger a refresh of the portal list
          setRefreshKey(prev => prev + 1);
        } else {
          console.error('[PortalGrid] Server returned error:', response.status);
        }
      } catch (error) {
        console.error('Failed to load portal URLs from server:', error);
      }
    };

    loadPortalUrls();
  }, []);

  // Listen for focus events (when user returns from settings page)
  useEffect(() => {
    const handleFocus = async () => {
      try {
        const response = await fetch('/api/portal-urls');
        if (response.ok) {
          const result = await response.json();
          const serverUrls = result.data || result;
          localStorage.setItem('portal-urls', JSON.stringify(serverUrls));
          setRefreshKey(prev => prev + 1);
        }
      } catch (error) {
        console.error('Failed to refresh portal URLs:', error);
      }
    };

    const handlePortalUrlsUpdate = async () => {
      try {
        const response = await fetch('/api/portal-urls');
        if (response.ok) {
          const result = await response.json();
          const serverUrls = result.data || result;
          localStorage.setItem('portal-urls', JSON.stringify(serverUrls));
          setRefreshKey(prev => prev + 1);
        }
      } catch (error) {
        console.error('Failed to refresh portal URLs:', error);
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('portal-urls-updated', handlePortalUrlsUpdate);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('portal-urls-updated', handlePortalUrlsUpdate);
    };
  }, []);

  // Refresh portals when environment or refreshKey changes
  useEffect(() => {
    const fetchPortals = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        const allPortals = PortalService.getAllPortals(environment);
        setPortals(allPortals);
      } catch (error) {
        console.error('Failed to fetch portals:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortals();
  }, [environment, refreshKey]);

  const handlePortalSelect = (portal: PortalInfo) => {
    if (onPortalSelect) {
      onPortalSelect(portal);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Active Portals - with configured URLs */}
      {portals
        .filter(portal => portal.publicUrl || portal.adminUrl)
        .map((portal) => (
          <PortalCard
            key={portal.countryCode}
            portal={portal}
            onSelect={handlePortalSelect}
            isLoading={isLoading}
            environment={environment}
          />
        ))}
      
      {/* Inactive Portals - without configured URLs */}
      {portals
        .filter(portal => !portal.publicUrl && !portal.adminUrl)
        .map((portal) => (
          <PortalCard
            key={portal.countryCode}
            portal={portal}
            onSelect={handlePortalSelect}
            isLoading={isLoading}
            environment={environment}
          />
        ))}
    </div>
  );
};

export default PortalGrid;
