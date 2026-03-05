/**
 * Portal Modal Component
 * Elegant modal displaying portal details with SSO status and Sana version
 */

'use client';

import React, { useEffect, useState } from 'react';
import { PortalInfo } from '@/types';

interface PortalModalProps {
  portal: PortalInfo | null;
  isOpen: boolean;
  onClose: () => void;
  environment: 'PROD' | 'INDUS';
}

export const PortalModal: React.FC<PortalModalProps> = ({ portal, isOpen, onClose, environment }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !portal) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsAnimating(false);
      setTimeout(onClose, 200);
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 200);
  };

  const handleLaunch = () => {
    if (portal.publicUrl) {
      window.open(portal.publicUrl, '_blank');
      handleClose();
    }
  };

  const handleAdminLaunch = () => {
    if (portal.adminUrl) {
      window.open(portal.adminUrl, '_blank');
      handleClose();
    }
  };

  const getFlagImageUrl = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map((char) => 0x1f1e6 + (char.charCodeAt(0) - 65))
      .map((cp) => cp.toString(16))
      .join('-');

    return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codePoints}.svg`;
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-none" />

      {/* Modal */}
      <div
        className={`relative w-full max-w-3xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 transform transition-all duration-300 ${
          isAnimating ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-200 border border-slate-700"
          aria-label="Close modal"
          title="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="relative p-8">
          {/* Header with flag */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <img
                src={getFlagImageUrl(portal.countryCode)}
                alt={portal.country}
                className="h-16 w-16 rounded-xl shadow-lg border-2 border-slate-700"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-1">
                {portal.name}
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-sm">Country Code: {portal.countryCode}</span>
                <span className="text-slate-600">•</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  portal.status === 'active'
                    ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/30'
                    : 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30'
                }`}>
                  {portal.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Environment Card */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 transition-colors duration-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl text-slate-400">🌍</span>
                <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Environment</span>
              </div>
              <p className="text-2xl font-bold text-white">{environment}</p>
            </div>

            {/* Sana Version Card */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 transition-colors duration-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl text-slate-400">🚀</span>
                <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Sana Version</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {portal.sanaVersion}
              </p>
            </div>
          </div>

          {/* SSO Status Section */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-xl text-slate-400">🔐</span>
              Single Sign-On (SSO) Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SSO Admin */}
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 transition-colors duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 font-medium">SSO Admin</span>
                  {portal.ssoAdminEnabled ? (
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 text-sm font-bold">ENABLED</span>
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center ring-2 ring-green-500/30">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 text-sm font-bold">DISABLED</span>
                      <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center ring-2 ring-red-500/30">
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500">Admin portal authentication</p>
              </div>

              {/* SSO Salesforce */}
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 transition-colors duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 font-medium">SSO Salesforce</span>
                  {portal.ssoSalesforceEnabled ? (
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 text-sm font-bold">ENABLED</span>
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center ring-2 ring-green-500/30">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 text-sm font-bold">DISABLED</span>
                      <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center ring-2 ring-red-500/30">
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500">Customer authentication via Salesforce</p>
              </div>
            </div>
          </div>

          {/* Business Central ERP Section */}
          <div className="mb-6">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-slate-400">🏢</span>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Business Central ERP</span>
              </div>
              {portal.businessCentralUrl ? (
                <div className="space-y-2">
                  <p className="text-sm text-blue-400 font-mono break-all">{portal.businessCentralUrl}</p>
                  <button
                    onClick={() => window.open(portal.businessCentralUrl, '_blank')}
                    className="text-xs text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1"
                  >
                    <span>Open ERP System</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No ERP system linked</p>
              )}
            </div>
          </div>

          {/* URLs Section */}
          <div className="mb-6 space-y-3">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-slate-400">🌐</span>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Public Portal URL</span>
              </div>
              {portal.publicUrl ? (
                <p className="text-sm text-cyan-400 font-mono break-all">{portal.publicUrl}</p>
              ) : (
                <p className="text-sm text-red-400">Not configured</p>
              )}
            </div>

            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-slate-400">🔧</span>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Admin Portal URL</span>
              </div>
              {portal.adminUrl ? (
                <p className="text-sm text-purple-400 font-mono break-all">{portal.adminUrl}</p>
              ) : (
                <p className="text-sm text-red-400">Not configured</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleLaunch}
              disabled={!portal.publicUrl}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-cyan-500/50 disabled:shadow-none transition-all duration-300 disabled:cursor-not-allowed disabled:text-slate-500 flex items-center justify-center gap-2 group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">🚀</span>
              Launch Public Portal
            </button>
            
            <button
              onClick={handleAdminLaunch}
              disabled={!portal.adminUrl}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-700 disabled:to-slate-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-purple-500/50 disabled:shadow-none transition-all duration-300 disabled:cursor-not-allowed disabled:text-slate-500 flex items-center justify-center gap-2 group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">🔧</span>
              Launch Admin Portal
            </button>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between text-xs text-slate-500">
            <span>Last updated: {new Date(portal.lastUpdated || Date.now()).toLocaleString()}</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Live data
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
