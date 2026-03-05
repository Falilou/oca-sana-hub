/**
 * Portal Card Component
 * Displays a card for each country's e-ordering portal
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { PortalInfo } from '@/types';

interface PortalCardProps {
  portal: PortalInfo;
  onSelect: (portal: PortalInfo) => void;
  isLoading?: boolean;
  environment?: 'PROD' | 'INDUS';
}

export const PortalCard: React.FC<PortalCardProps> = ({ portal, onSelect, isLoading, environment = 'PROD' }) => {
  // Get Twemoji flag image URL for better cross-platform compatibility
  const getFlagImageUrl = (countryCode: string): string => {
    // Convert country code to regional indicator code points
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => (127397 + char.charCodeAt(0)).toString(16))
      .join('-');
    return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codePoints}.svg`;
  };

  const statusColor =
    portal.status === 'active'
      ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700'
      : portal.status === 'maintenance'
        ? 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700'
        : portal.status === 'inactive'
          ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
          : 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700';

  const getStatusBadgeColor = () => {
    switch (portal.status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100';
      case 'inactive':
        return 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100';
      case 'maintenance':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100';
      case 'offline':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100';
    }
  };

  const getStatusLabel = () => {
    if (portal.status === 'inactive') {
      return 'NO URL CONFIGURED';
    }
    return portal.status.toUpperCase();
  };

  const handleClick = () => {
    // Don't open URL here - let the URL buttons handle it
    // Just call the onSelect callback
    onSelect(portal);
  };

  const handlePublicUrlClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (portal.publicUrl && portal.status === 'active') {
      window.open(portal.publicUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleAdminUrlClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (portal.adminUrl && portal.status === 'active') {
      window.open(portal.adminUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleErpUrlClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (portal.businessCentralUrl) {
      window.open(portal.businessCentralUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-slate-800 dark:bg-slate-900 border border-slate-700 dark:border-slate-800 hover:border-blue-500 rounded-xl p-6 transition-all duration-300 cursor-pointer hover:shadow-lg group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-700 dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
            <img 
              src={getFlagImageUrl(portal.countryCode)} 
              alt={`${portal.name} flag`}
              className="w-10 h-10 object-contain drop-shadow"
            />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              {portal.name.replace(' E-Ordering Portal', '')}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">
                {environment}
              </span>
              <span className="text-gray-600">•</span>
              <span className={`text-xs font-semibold ${
                portal.status === 'active' ? 'text-green-400' : 
                portal.status === 'maintenance' ? 'text-yellow-400' : 
                'text-gray-500'
              }`}>
                {getStatusLabel()}
              </span>
            </div>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
          portal.status === 'active' 
            ? 'bg-green-900/30 text-green-300 border border-green-800' 
            : portal.status === 'maintenance'
            ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-800'
            : 'bg-gray-800 text-gray-400 border border-gray-700'
        }`}>
          {portal.status === 'active' ? '✓ Active' : portal.status === 'maintenance' ? '⚡ Maintenance' : '○ Inactive'}
        </div>
      </div>

      {/* SSO Status Indicators */}
      <div className="flex gap-2 mb-3 pb-3 border-b border-slate-700">
        <div className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium ${
          portal.ssoAdminEnabled 
            ? 'bg-purple-900/30 text-purple-300 border border-purple-800' 
            : 'bg-slate-900 text-gray-500 border border-slate-800'
        }`} title="Admin SSO Status">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Admin {portal.ssoAdminEnabled ? '✓' : '○'}
        </div>
        
        <div className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium ${
          portal.ssoSalesforceEnabled 
            ? 'bg-blue-900/30 text-blue-300 border border-blue-800' 
            : 'bg-slate-900 text-gray-500 border border-slate-800'
        }`} title="Customer SSO Status">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Customer {portal.ssoSalesforceEnabled ? '✓' : '○'}
        </div>
      </div>

      {/* Quick Access Buttons */}
      <div className="flex flex-col gap-3">
        {/* Portal Access Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handlePublicUrlClick}
            disabled={!portal.publicUrl}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              portal.publicUrl
                ? 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 hover:border-slate-500 shadow-sm hover:shadow-md cursor-pointer'
                : 'bg-slate-900 text-gray-600 border border-slate-800 cursor-not-allowed'
            }`}
            title={portal.publicUrl || 'Public URL not configured'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span>Public Portal</span>
          </button>

          <button
            onClick={handleAdminUrlClick}
            disabled={!portal.adminUrl}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              portal.adminUrl
                ? 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 hover:border-slate-500 cursor-pointer'
                : 'bg-slate-900 text-gray-600 border border-slate-800 cursor-not-allowed'
            }`}
            title={portal.adminUrl || 'Admin URL not configured'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 5a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Admin</span>
          </button>
        </div>

        {/* ERP Button */}
        <button
          onClick={handleErpUrlClick}
          disabled={!portal.businessCentralUrl}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            portal.businessCentralUrl
              ? 'bg-green-700 hover:bg-green-600 text-white border border-green-600 hover:border-green-500 shadow-sm hover:shadow-md cursor-pointer'
              : 'bg-slate-900 text-gray-600 border border-slate-800 cursor-not-allowed'
          }`}
          title={portal.businessCentralUrl || 'ERP URL not configured'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>BSC {portal.name.split(' ')[0]}</span>
        </button>

        {/* View Logs Button */}
        <a
          href={`/log-analysis?country=${portal.country.toLowerCase()}&environment=${environment}`}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-blue-700 hover:bg-blue-600 text-white border border-blue-600 hover:border-blue-500 shadow-sm hover:shadow-md transition-all cursor-pointer"
          title={`View logs for ${portal.name} (${environment})`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>View Logs</span>
        </a>
      </div>

      {!portal.publicUrl && !portal.adminUrl && (
        <div className="mt-3 px-3 py-2 bg-orange-900/20 border border-orange-800 rounded-lg text-xs text-orange-400 text-center font-medium">
          ⚠️ Configure URLs in Settings
        </div>
      )}

      {isLoading && (
        <div className="mt-3 flex justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-600 border-t-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default PortalCard;
