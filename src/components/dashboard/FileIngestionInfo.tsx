'use client';

import React from 'react';

export interface FileIngestionCapabilities {
  supportedFormats: string[];
  maxFileSize: number;
  maxFileSizeGB: string;
  maxFilesPerSession: number;
  maxEntriesPerSession: number;
  estimatedProcessingRate: {
    entriesPerSecond: number;
    megabytesPerSecond: number;
    filesPerSecond: number;
  };
}

interface FileIngestionInfoProps {
  capabilities?: FileIngestionCapabilities | null;
}

export const FileIngestionInfo: React.FC<FileIngestionInfoProps> = ({ capabilities }) => {
  const defaultCapabilities: FileIngestionCapabilities = {
    supportedFormats: ['.log', '.txt', '.xml', '.csv'],
    maxFileSize: 536870912, // 512MB
    maxFileSizeGB: '0.5 GB',
    maxFilesPerSession: 1000,
    maxEntriesPerSession: 10000000,
    estimatedProcessingRate: {
      entriesPerSecond: 50000,
      megabytesPerSecond: 50,
      filesPerSecond: 10,
    },
  };

  const info = capabilities || defaultCapabilities;

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-400/50">
          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">
            File Ingestion & Formats
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Supported file formats and processing capabilities
          </p>
        </div>
      </div>

      {/* File Format Support */}
      <div className="mb-6 pb-6 border-b border-slate-700">
        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          Supported Formats
        </div>
        <div className="flex flex-wrap gap-2">
          {info.supportedFormats.map((format) => (
            <div
              key={format}
              className="px-3 py-2 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-600/40 rounded-lg text-sm text-purple-300 font-semibold flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {format}
            </div>
          ))}
        </div>
      </div>

      {/* File Limits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b border-slate-700">
        <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-4">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            Max Individual File
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{info.maxFileSizeGB}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            per file maximum
          </div>
        </div>

        <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-4">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            Max Files Per Session
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {info.maxFilesPerSession.toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            files total
          </div>
        </div>

        <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-4">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            Max Entries Total
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {(info.maxEntriesPerSession / 1000000).toFixed(1)}M
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            log entries
          </div>
        </div>
      </div>

      {/* Processing Speed */}
      <div className="mb-6">
        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          Processing Performance
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span className="text-xs font-semibold text-green-400">Speed (MB/s)</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {info.estimatedProcessingRate.megabytesPerSecond}
            </div>
            <div className="text-xs text-gray-500">
              megabytes per second
            </div>
          </div>

          <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span className="text-xs font-semibold text-blue-400">Entries/s</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {(info.estimatedProcessingRate.entriesPerSecond / 1000).toFixed(0)}K
            </div>
            <div className="text-xs text-gray-500">
              entries per second
            </div>
          </div>

          <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400"></div>
              <span className="text-xs font-semibold text-purple-400">Files/s</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {info.estimatedProcessingRate.filesPerSecond}
            </div>
            <div className="text-xs text-gray-500">
              files per second
            </div>
          </div>
        </div>
      </div>

      {/* Processing Example */}
      <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-4">
        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          Example Processing Times
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-2 px-3 bg-slate-900/30 rounded">
            <span className="text-gray-300">100 KB file (~1,000 entries)</span>
            <span className="font-semibold text-green-400">~0.1 seconds</span>
          </div>
          <div className="flex items-center justify-between py-2 px-3 bg-slate-900/30 rounded">
            <span className="text-gray-300">10 MB file (~100,000 entries)</span>
            <span className="font-semibold text-blue-400">~2 seconds</span>
          </div>
          <div className="flex items-center justify-between py-2 px-3 bg-slate-900/30 rounded">
            <span className="text-gray-300">100 MB file (~1,000,000 entries)</span>
            <span className="font-semibold text-purple-400">~20 seconds</span>
          </div>
          <div className="flex items-center justify-between py-2 px-3 bg-slate-900/30 rounded">
            <span className="text-gray-300">500 MB file (~5,000,000 entries)</span>
            <span className="font-semibold text-orange-400">~100 seconds</span>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-4 space-y-2">
        <div className="p-3 bg-emerald-900/20 border border-emerald-700/30 rounded-lg text-xs text-emerald-300">
          ✅ <span className="font-medium">Optimal Size:</span> For best performance, keep individual files under 200MB
        </div>
        <div className="p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg text-xs text-blue-300">
          💡 <span className="font-medium">Multiple Files:</span> Process multiple files in parallel for faster analysis
        </div>
        <div className="p-3 bg-amber-900/20 border border-amber-700/30 rounded-lg text-xs text-amber-300">
          ⚡ <span className="font-medium">Bulk Import:</span> Use directory scanning to bulk-ingest all logs at once
        </div>
      </div>
    </div>
  );
};
