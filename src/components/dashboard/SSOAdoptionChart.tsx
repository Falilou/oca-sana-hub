'use client';

import React from 'react';
import { SSOAdoptionData } from '@/services/analyticsService';

interface SSOAdoptionChartProps {
  data: SSOAdoptionData[];
}

export default function SSOAdoptionChart({ data }: SSOAdoptionChartProps) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-slate-200 mb-6">
        SSO Adoption Metrics
      </h3>
      <div className="space-y-6">
        {data.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-300 font-medium">{item.category}</span>
              <span className="text-slate-400 text-sm">
                {item.enabled} / {item.total} portals
              </span>
            </div>
            <div className="relative h-8 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500 flex items-center justify-center"
                style={{ width: `${item.percentage}%` }}
              >
                {item.percentage > 10 && (
                  <span className="text-white text-sm font-bold">
                    {item.percentage}%
                  </span>
                )}
              </div>
              {item.percentage <= 10 && (
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300 text-sm font-bold">
                  {item.percentage}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
