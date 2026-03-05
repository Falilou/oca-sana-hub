/**
 * Header Component
 * Clean, functional navigation bar for OCA Sana Hub
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toggleTheme, getCurrentTheme } from '@/context/ThemeContext';
import { SunIcon, MoonIcon } from './Icons';

interface HeaderProps {
  onEnvironmentChange?: (env: 'PROD' | 'INDUS') => void;
  currentEnvironment?: 'PROD' | 'INDUS';
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onEnvironmentChange, currentEnvironment = 'PROD', onMenuToggle }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Initialize theme state from DOM
    const currentTheme = getCurrentTheme();
    setTheme(currentTheme);
  }, []);

  const handleThemeToggle = () => {
    toggleTheme();
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const handleEnvironmentChange = (env: 'PROD' | 'INDUS') => {
    if (onEnvironmentChange) {
      onEnvironmentChange(env);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-800 dark:bg-slate-900 border-b border-slate-700 dark:border-slate-800 shadow-sm h-[73px]">
      <div className="px-6 h-full flex items-center">
        <div className="flex items-center justify-between w-full">
          {/* Left Section - Title */}
          <div className="flex items-center gap-6">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 hover:bg-slate-700 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-3">
              <img
                src="/logos/sana-commerce.png"
                alt="Sana Commerce"
                className="h-8 w-auto object-contain"
              />
              <span className="text-xs text-slate-500">×</span>
              <div className="bg-black rounded-md px-2 py-1">
                <img
                  src="/logos/oca-michelin.png"
                  alt="OCA Michelin"
                  className="h-7 w-auto object-contain"
                />
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white leading-tight">Dashboard</h1>
              <p className="text-sm text-gray-400 leading-tight">Portal Management</p>
            </div>
          </div>

          {/* Right Section - Functional Controls Only */}
          <div className="flex items-center gap-3">
            {/* Sana Sphere Ticketing Link */}
            <a
              href="https://sphere.sana-commerce.com/Ticket/Overview"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 hover:bg-slate-700 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Sana Ticketing System"
              title="Open Sana Ticketing System"
            >
              <img
                src="/logos/sana-commerce.png"
                alt="Sana Sphere"
                className="h-6 w-auto object-contain"
              />
              <span className="text-sm font-semibold text-gray-300">Sana Sphere Tickets</span>
            </a>

            {/* Environment Selector */}
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-700 dark:bg-slate-800 border border-slate-600 dark:border-slate-700 rounded-lg">
              <label htmlFor="env-selector" className="text-xs font-semibold text-gray-400">Environment:</label>
              <select
                id="env-selector"
                value={currentEnvironment}
                onChange={(e) => handleEnvironmentChange(e.target.value as 'PROD' | 'INDUS')}
                className="text-sm font-medium text-white bg-slate-700 dark:bg-slate-800 border-none focus:outline-none cursor-pointer px-2 py-1 rounded [color-scheme:dark]"
              >
                <option value="PROD" className="bg-slate-700 text-white">PROD</option>
                <option value="INDUS" className="bg-slate-700 text-white">TESTING</option>
              </select>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className="p-2.5 hover:bg-slate-700 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Toggle theme"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <SunIcon size={20} className="text-gray-300" />
              ) : (
                <MoonIcon size={20} className="text-gray-300" />
              )}
            </button>

            {/* Settings Link */}
            <Link
              href="/settings"
              className="p-2.5 hover:bg-slate-700 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Settings"
              title="Settings"
            >
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
