/**
 * Custom Recharts Tooltip Component
 * Fixes readability issues in dark theme by using light background and dark text
 */

import React from 'react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    color?: string;
    dataKey?: string;
    fill?: string;
    name?: string;
    payload?: any;
    type?: string;
    unit?: string;
    value?: number | string;
  }>;
  label?: string;
  formatter?: (value: any) => string | number;
  contentStyle?: React.CSSProperties;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  contentStyle,
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div
      className="rounded-lg border border-slate-300 bg-white p-3 shadow-lg"
      style={{
        ...contentStyle,
        backgroundColor: '#ffffff',
        borderColor: '#cbd5e1',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      {label && (
        <p className="text-xs font-semibold text-slate-900 mb-2">
          {label}
        </p>
      )}
      {payload.map((entry, index) => (
        <p
          key={`tooltip-${index}`}
          className="text-xs text-slate-700"
          style={{ color: entry.color || '#334155' }}
        >
          <span className="font-medium">{entry.name || entry.dataKey}:</span>{' '}
          <span className="font-semibold">
            {typeof entry.value === 'number'
              ? entry.value.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })
              : entry.value}
          </span>
          {entry.unit && <span className="text-slate-600"> {entry.unit}</span>}
        </p>
      ))}
    </div>
  );
};

/**
 * Heatmap-specific tooltip for better visualization
 */
export const HeatmapTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const entry = payload[0];
  const dayOfWeek = entry.payload?.day || 'Unknown';
  const hour = entry.payload?.hour || 0;
  const count = entry.payload?.count || 0;

  return (
    <div className="rounded-lg border border-slate-300 bg-white p-3 shadow-lg">
      <p className="text-xs font-semibold text-slate-900 mb-1">
        {dayOfWeek} {hour.toString().padStart(2, '0')}:00
      </p>
      <p className="text-xs text-slate-700">
        <span className="font-medium">Errors:</span>{' '}
        <span className="font-semibold text-red-600 text-sm">{count.toLocaleString()}</span>
      </p>
    </div>
  );
};

/**
 * Pie chart-specific tooltip
 */
export const PieTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const entry = payload[0];
  const name = entry.payload?.name || entry.name || 'Unknown';
  const value = entry.value || 0;
  const percentage = entry.payload?.percentage || entry.payload?.value || 0;

  return (
    <div className="rounded-lg border border-slate-300 bg-white p-3 shadow-lg">
      <p className="text-xs font-semibold text-slate-900 mb-1">{name}</p>
      <p className="text-xs text-slate-700">
        <span className="font-medium">Count:</span>{' '}
        <span className="font-semibold">{value.toLocaleString()}</span>
      </p>
      {typeof percentage === 'number' && (
        <p className="text-xs text-slate-700">
          <span className="font-medium">Percentage:</span>{' '}
          <span className="font-semibold">{percentage.toFixed(1)}%</span>
        </p>
      )}
    </div>
  );
};
