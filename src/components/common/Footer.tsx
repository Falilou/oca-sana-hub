/**
 * Footer Component
 * Copyright and attribution footer
 */

'use client';

import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto py-4 px-6 border-t border-slate-700 dark:border-slate-800 bg-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between text-sm text-gray-400">
        <p>
          © {currentYear} OCA Sana Hub. All rights reserved.
        </p>
        <p className="text-xs">
          Powered by Next.js 15 & React
        </p>
      </div>
    </footer>
  );
};
