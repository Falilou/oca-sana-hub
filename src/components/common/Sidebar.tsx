/**
 * Sidebar Navigation Component
 * Clean navigation sidebar for OCA Sana Hub
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { DashboardIcon, LogIcon, AnalyticsIcon, SettingsIcon } from './Icons';
import { shouldHideFeature } from '@/config/standalone';

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onToggle }) => {
  const pathname = usePathname();

  const allNavItems = [
    {
      label: 'Dashboard',
      icon: DashboardIcon,
      href: '/',
      active: pathname === '/',
      feature: null,
    },
    {
      label: 'Log Analysis',
      icon: LogIcon,
      href: '/log-analysis',
      active: pathname === '/log-analysis',
      feature: 'logs' as const,
    },
    {
      label: 'Portal Analytics',
      icon: AnalyticsIcon,
      href: '/dashboard',
      active: pathname === '/dashboard',
      feature: 'analytics' as const,
    },
    {
      label: 'Settings',
      icon: SettingsIcon,
      href: '/settings',
      active: pathname === '/settings',
      feature: 'settings' as const,
    },
  ];

  // Filter navigation items based on standalone mode
  const navItems = allNavItems.filter(item => {
    if (!item.feature) return true; // Always show items without feature flag
    return !shouldHideFeature(item.feature);
  });

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-slate-800 dark:bg-slate-900 border-r border-slate-700 dark:border-slate-800 transition-all duration-300 z-40 ${
          isOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-center h-[73px] border-b border-slate-700 dark:border-slate-800">
          {isOpen ? (
            <Link href="/" className="flex items-center gap-3 px-6">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg relative flex-shrink-0">
                <Image 
                  src="/oca-logo.svg" 
                  alt="OCA Sana Hub" 
                  width={40} 
                  height={40}
                  priority
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-tight">OCA Sana</h1>
                <p className="text-xs text-gray-400 leading-tight">Hub Portal</p>
              </div>
            </Link>
          ) : (
            <Link href="/" className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg relative">
              <Image 
                src="/oca-logo.svg" 
                alt="OCA Sana Hub" 
                width={40} 
                height={40}
                priority
              />
            </Link>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="py-6">
          <div className="space-y-1 px-3">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    item.active
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'text-gray-300 hover:bg-slate-700'
                  } ${!isOpen && 'justify-center'}`}
                  title={!isOpen ? item.label : ''}
                >
                  <IconComponent size={20} className="flex-shrink-0" />
                  {isOpen && <span className="text-sm">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="none" 
            stroke="currentColor"
            className="text-gray-300"
          >
            {isOpen ? (
              <path d="M10 4L6 8l4 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            ) : (
              <path d="M6 4l4 4-4 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            )}
          </svg>
        </button>
      </aside>
    </>
  );
};
