'use client';

import React from 'react';
import { UserStory } from '@/types';

interface RecentActivityProps {
  activities: UserStory[];
}

const getActionIcon = (action: string) => {
  switch (action) {
    case 'portal_access':
      return '🚀';
    case 'portal_select':
      return '🔍';
    case 'environment_switch':
      return '🔄';
    default:
      return '📊';
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case 'portal_access':
      return 'text-green-400';
    case 'portal_select':
      return 'text-blue-400';
    case 'environment_switch':
      return 'text-purple-400';
    default:
      return 'text-slate-400';
  }
};

export default function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-slate-200 mb-4">
        Recent Activity
      </h3>
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No recent activity
          </div>
        ) : (
          activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <div className="text-2xl">{getActionIcon(activity.action || 'unknown')}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${getActionColor(activity.action || 'unknown')}`}>
                    {(activity.action || 'unknown').replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </span>
                  {activity.details?.country_name && (
                    <span className="text-slate-400 text-sm">
                      • {activity.details.country_name}
                    </span>
                  )}
                  {activity.details?.environment && (
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      activity.details.environment === 'PROD'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-green-500/20 text-green-300'
                    }`}>
                      {activity.details.environment}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {new Date(activity.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
