'use client';

import React from 'react';

export interface ServerCapacity {
  maxFilesPerSession: number;
  maxEntriesPerSession: number;
  maxFileSize: number;
  maxFileSizeGB: string;
  supportedFormats: string[];
  timeoutSeconds: number;
  estimatedProcessingRate: {
    entriesPerSecond: number;
    megabytesPerSecond: number;
    filesPerSecond: number;
  };
  maxConcurrentSessions: number;
  currentSessions: number;
}

interface ServerCapacityInfoProps {
  capacity?: ServerCapacity | null;
  loading?: boolean;
}

export const ServerCapacityInfo: React.FC<ServerCapacityInfoProps> = ({ 
  capacity, 
  loading = false 
}) => {
  const defaultCapacity: ServerCapacity = {
    maxFilesPerSession: 1000,
    maxEntriesPerSession: 10000000,
    maxFileSize: 536870912, // 512MB
    maxFileSizeGB: '0.5 GB',
    supportedFormats: ['.log', '.txt', '.xml', '.csv'],
    timeoutSeconds: 300,
    estimatedProcessingRate: {
      entriesPerSecond: 50000,
      megabytesPerSecond: 50,
      filesPerSecond: 10,
    },
    maxConcurrentSessions: 5,
    currentSessions: 1,
  };

  const info = capacity || defaultCapacity;
  const capacityUsage = info.currentSessions / info.maxConcurrentSessions;
  const capacityPercentage = Math.round(capacityUsage * 100);

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 mb-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Server Capacity & Configuration
        </h3>
        {loading && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">Loading...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Max Files */}
        <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-4">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            Max Files Per Session
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {info.maxFilesPerSession.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">
            files can be processed simultaneously
          </div>
        </div>

        {/* Max Entries */}
        <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-4">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            Max Entries Per Session
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {(info.maxEntriesPerSession / 1000000).toFixed(1)}M
          </div>
          <div className="text-xs text-gray-500">
            log entries total capacity
          </div>
        </div>

        {/* Max File Size */}
        <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-4">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            Max Individual File Size
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {info.maxFileSizeGB}
          </div>
          <div className="text-xs text-gray-500">
            per file limit
          </div>
        </div>

        {/* Processing Rate */}
        <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-4">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            Processing Speed
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {info.estimatedProcessingRate.megabytesPerSecond} MB/s
          </div>
          <div className="text-xs text-gray-500">
            {(info.estimatedProcessingRate.entriesPerSecond / 1000).toFixed(0)}K entries/s
          </div>
        </div>
      </div>

      {/* Session Capacity */}
      <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Active Sessions
          </div>
          <div className="text-sm font-semibold text-white">
            {info.currentSessions} / {info.maxConcurrentSessions}
          </div>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              capacityPercentage > 80 
                ? 'bg-red-500' 
                : capacityPercentage > 50 
                ? 'bg-yellow-500' 
                : 'bg-green-500'
            }`}
            style={{ width: `${capacityPercentage}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          {capacityPercentage}% of concurrent sessions in use
        </div>
      </div>

      {/* Supported Formats */}
      <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-4 mb-4">
        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          Supported File Formats
        </div>
        <div className="flex flex-wrap gap-2">
          {info.supportedFormats.map((format) => (
            <span
              key={format}
              className="px-3 py-1 bg-blue-900/30 border border-blue-700/50 rounded-md text-sm text-blue-300 font-medium"
            >
              {format}
            </span>
          ))}
        </div>
      </div>

      {/* Timeout and Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-4">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            Session Timeout
          </div>
          <div className="text-lg font-bold text-white">
            {info.timeoutSeconds} seconds
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.round(info.timeoutSeconds / 60)} minutes
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-700/30 rounded-lg p-4">
          <div className="text-xs font-medium text-green-400 uppercase tracking-wide mb-2">
            Status
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-green-300">
              Server Ready
            </span>
          </div>
          <div className="text-xs text-green-400/70 mt-1">
            All systems operational
          </div>
        </div>
      </div>

      {/* Info Message */}
      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg text-xs text-blue-300">
        💡 <span className="font-medium">Tip:</span> The analysis will automatically optimize processing based on your dataset size. 
        For files exceeding capacity limits, consider splitting large datasets into multiple sessions.
      </div>
    </div>
  );
};
