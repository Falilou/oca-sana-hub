/**
 * Logo Section Component
 * Displays Sana Commerce and OCA Michelin logos
 */

import React from 'react';

interface LogoSectionProps {
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const LogoSection: React.FC<LogoSectionProps> = ({ 
  showLabel = true, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: { container: 'gap-2 px-2 py-1.5', sana: 'h-5', oca: 'h-4', label: 'text-xs' },
    md: { container: 'gap-3 px-3 py-2', sana: 'h-7', oca: 'h-6', label: 'text-xs' },
    lg: { container: 'gap-4 px-4 py-3', sana: 'h-9', oca: 'h-8', label: 'text-sm' },
  };

  const classes = sizeClasses[size];

  return (
    <div className="flex items-center gap-3">
      <div className={`flex items-center ${classes.container} bg-slate-900/70 border border-slate-800 rounded-lg`}>
        <img
          src="/logos/sana-commerce.png"
          alt="Sana Commerce"
          className={`${classes.sana} w-auto object-contain`}
        />
        <span className="text-xs text-slate-500">×</span>
        <div className="bg-black rounded-md px-2 py-1">
          <img
            src="/logos/oca-michelin.png"
            alt="OCA Michelin"
            className={`${classes.oca} w-auto object-contain`}
          />
        </div>
      </div>
      {showLabel && (
        <span className={`${classes.label} text-slate-500`}>Collaboration</span>
      )}
    </div>
  );
};

export default LogoSection;
