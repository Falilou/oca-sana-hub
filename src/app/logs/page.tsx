'use client';

import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Header } from '@/components/common/Header';
// TODO: Implement these components
// import { IngestProgressBar, ProgressData } from '@/components/logs/IngestProgressBar';
// import { ExecutiveSummary } from '@/components/logs/ExecutiveSummary';
// import { PerformanceMetrics } from '@/components/logs/PerformanceMetrics';
// import { ExportButtons, generateCSVReport, downloadFile } from '@/components/logs/ExportButtons';

// Temporary type definition
interface ProgressData {
  percentage: number;
  currentFile?: string;
  processedFiles?: number;
  totalFiles?: number;
  phase?: string;
  dirsScanned?: number;
  filesFound?: number;
  filesProcessed?: number;
  linesProcessed?: number;
  totalLines?: number;
  [key: string]: any; // Allow any additional properties
}

interface OverviewData {
  totalRequests: number;
  errorRequests: number;
  errorRate: number;
  peakHour: string;
  ordersCount: number;
  requestsByHour: Array<{ hour: string; count: number }>;
  requestsByDay: Array<{ day: string; count: number }>;
  errorsBySeverity: Array<{ severity: string; count: number }>;
  topOperations: Array<{ operation: string; count: number }>;
  topItems: Array<{ itemId: string; description: string; quantity: number }>;
  topCustomers: Array<{ customerId: string; orders: number; totalValue: number }>;
  topOrders: Array<{ documentId: string; customerId: string; orderDate: string; totalInclTax: number; currencyId: string }>;
}

interface CountryRow {
  country: string;
  environment: string;
  count: number;
  firstSeen?: string;
  lastSeen?: string;
}

interface EntryRow {
  id: number;
  timestamp?: string;
  server?: string;
  severity?: string;
  category?: string;
  website?: string;
  operation?: string;
  message: string;
  errorsCount: number;
  country?: string;
  environment?: string;
}

interface WatchRow {
  id: number;
  folderPath: string;
  intervalMinutes: number;
  enabled: number;
  lastRunAt?: string;
}

const emptyOverview: OverviewData = {
  totalRequests: 0,
  errorRequests: 0,
  errorRate: 0,
  peakHour: '00',
  ordersCount: 0,
  requestsByHour: [],
  requestsByDay: [],
  errorsBySeverity: [],
  topOperations: [],
  topItems: [],
  topCustomers: [],
  topOrders: [],
};

const buildHourSeries = (data: OverviewData['requestsByHour']) => {
  const map = new Map(data.map((item) => [item.hour, item.count]));
  return Array.from({ length: 24 }, (_, hour) => {
    const label = hour.toString().padStart(2, '0');
    return { hour: label, count: map.get(label) || 0 };
  });
};

const formatNumber = (value?: number | null) => {
  if (value === undefined || value === null || Number.isNaN(value)) return '0';
  return value.toLocaleString();
};
const formatTimestamp = (value?: string) => {
  if (!value) return 'Unknown';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const getSeverityBadge = (value?: string) => {
  const normalized = value?.toLowerCase();
  if (!normalized) return 'bg-slate-800 text-slate-300';
  if (['error', 'critical', 'fatal'].includes(normalized)) return 'bg-red-500/20 text-red-300';
  if (['warning', 'warn'].includes(normalized)) return 'bg-yellow-500/20 text-yellow-300';
  if (['information', 'info'].includes(normalized)) return 'bg-cyan-500/20 text-cyan-300';
  return 'bg-slate-800 text-slate-300';
};

const LineChart = ({ data }: { data: Array<{ day: string; count: number }> }) => {
  if (data.length === 0) {
    return <div className="text-sm text-slate-400">No data yet.</div>;
  }

  const maxValue = Math.max(...data.map((item) => item.count), 1);
  const points = data
    .map((item, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * 100;
      const y = 100 - (item.count / maxValue) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="h-32 w-full">
      <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2"
        />
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="mt-2 flex justify-between text-xs text-slate-400">
        <span>{data[0]?.day || ''}</span>
        <span>{data[data.length - 1]?.day || ''}</span>
      </div>
    </div>
  );
};

const BarChart = ({ data }: { data: Array<{ label: string; value: number }> }) => {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="flex items-end gap-1 h-28">
      {data.map((item) => (
        <div key={item.label} className="flex flex-col items-center flex-1">
          <div
            title={`${item.label}: ${item.value}`}
            className="w-full rounded-md bg-gradient-to-t from-cyan-500/30 to-cyan-500/80"
            style={{ height: `${(item.value / maxValue) * 100}%` }}
          />
          <span className="mt-1 text-[10px] text-slate-500">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default function LogsPage() {
    const [analysisOverview, setAnalysisOverview] = useState<Array<{ folder_path: string; country: string; environment: string; file_count: number; line_count: number; started_at: string; finished_at: string }>>([]);
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [overview, setOverview] = useState<OverviewData>(emptyOverview);
  const [countries, setCountries] = useState<CountryRow[]>([]);
  const [countryStats, setCountryStats] = useState<Array<{ country: string; environment: string; fileCount: number; processingTime: number }>>([]);
  const [countryFilter, setCountryFilter] = useState('ALL');
  const [environmentFilter, setEnvironmentFilter] = useState('ALL');
  const [days, setDays] = useState(30);
  const [folderPath, setFolderPath] = useState('');
  const [ingestResult, setIngestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [ingestProgress, setIngestProgress] = useState<ProgressData | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [entriesTotal, setEntriesTotal] = useState(0);
  const [entryPage, setEntryPage] = useState(0);
  const [entrySearch, setEntrySearch] = useState('');
  const [entrySeverity, setEntrySeverity] = useState('ALL');
  const [entryOperation, setEntryOperation] = useState('ALL');
  const [watches, setWatches] = useState<WatchRow[]>([]);
  const [watchInterval, setWatchInterval] = useState(60);
  const [watchEnabled, setWatchEnabled] = useState(true);
  const [watchStatus, setWatchStatus] = useState('');
  const [autoWatch, setAutoWatch] = useState(true);
  const [viewMode, setViewMode] = useState<'executive' | 'detailed'>('executive');
  const [generatingViz, setGeneratingViz] = useState(false);
  const [vizResult, setVizResult] = useState<{
    success: boolean;
    visualizations?: string[];
    summary?: any;
    executionTimeSeconds?: string;
    error?: string;
  } | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);

  const entryPageSize = 25;

  const hourSeries = useMemo(() => buildHourSeries(overview.requestsByHour), [overview.requestsByHour]);
  const totalPages = Math.max(1, Math.ceil(entriesTotal / entryPageSize));
  const countryList = useMemo(
    () => Array.from(new Set(countries.map((row) => row.country))).sort(),
    [countries]
  );

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        country: countryFilter,
        environment: environmentFilter,
        days: days.toString(),
      });
      const response = await fetch(`/api/logs/overview?${params.toString()}`);
      const payload = await response.json();
      if (payload.success) {
        setOverview(payload.data as OverviewData);
      }
    } finally {
      setLoading(false);
    }
  }, [countryFilter, environmentFilter, days]);

  const fetchCountries = useCallback(async () => {
    const response = await fetch('/api/logs/countries');
    const payload = await response.json();
    if (payload.success) {
      setCountries(payload.data as CountryRow[]);
    }
  }, []);

  const fetchEntries = useCallback(async () => {
    const params = new URLSearchParams({
      country: countryFilter,
      environment: environmentFilter,
      days: days.toString(),
      severity: entrySeverity,
      operation: entryOperation,
      search: entrySearch.trim(),
      limit: entryPageSize.toString(),
      offset: (entryPage * entryPageSize).toString(),
    });
    const response = await fetch(`/api/logs/entries?${params.toString()}`);
    const payload = await response.json();
    if (payload.success) {
      setEntries(payload.data as EntryRow[]);
      setEntriesTotal(payload.meta?.total || 0);
    }
  }, [countryFilter, environmentFilter, days, entrySeverity, entryOperation, entrySearch, entryPage, entryPageSize]);

  const fetchWatches = useCallback(async () => {
    const response = await fetch('/api/logs/watch');
    const payload = await response.json();
    if (payload.success) {
      setWatches(payload.data as WatchRow[]);
    }
  }, []);

  const runWatcher = useCallback(async () => {
    setWatchStatus('Running watcher...');
    try {
      const response = await fetch('/api/logs/watch/run', { method: 'POST' });
      const payload = await response.json();
      if (payload.success) {
        const runs = payload.data?.runs as Array<{ folderPath: string; status: string }> | undefined;
        setWatchStatus(runs && runs.length ? `Watcher ran ${runs.length} folder(s).` : 'Watcher up to date.');
        fetchCountries();
        fetchOverview();
        fetchEntries();
        fetchWatches();
      } else {
        setWatchStatus(payload.error?.message || 'Watcher failed.');
      }
    } catch (error) {
      setWatchStatus(error instanceof Error ? error.message : 'Watcher failed.');
    }
  }, [fetchCountries, fetchEntries, fetchOverview, fetchWatches]);

  const saveWatch = async () => {
    if (!folderPath.trim()) return;
    setWatchStatus('Saving watch...');
    try {
      const response = await fetch('/api/logs/watch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderPath: folderPath.trim(),
          intervalMinutes: watchInterval,
          enabled: watchEnabled,
        }),
      });
      const payload = await response.json();
      if (payload.success) {
        setWatchStatus('Watcher saved.');
        fetchWatches();
      } else {
        setWatchStatus(payload.error?.message || 'Watcher save failed.');
      }
    } catch (error) {
      setWatchStatus(error instanceof Error ? error.message : 'Watcher save failed.');
    }
  };

  const generateVisualizations = async () => {
    if (!folderPath.trim()) {
      alert('Please provide a log folder path');
      return;
    }

    setGeneratingViz(true);
    setVizResult(null);

    try {
      const response = await fetch('/api/logs/generate-visualizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logFolder: folderPath.trim() + '\\**\\*.txt',
          startDate: dateRange.start || undefined,
          endDate: dateRange.end || undefined,
          country: countryFilter !== 'ALL' ? countryFilter : undefined,
          environment: environmentFilter !== 'ALL' ? environmentFilter : undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setVizResult(result);
      } else {
        setVizResult({
          success: false,
          error: result.error || 'Failed to generate visualizations',
        });
      }
    } catch (error) {
      setVizResult({
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setGeneratingViz(false);
    }
  };

  const handleIngest = async () => {
    if (!folderPath.trim()) return;
    
    // Clean up any existing event source
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    setIngesting(true);
    setShowProgress(true);
    setIngestResult('');
    setIngestProgress({
      phase: 'scanning',
      dirsScanned: 0,
      filesFound: 0,
      filesProcessed: 0,
      filesSkipped: 0,
      entriesIngested: 0,
      percentage: 0,
      message: 'Initializing...',
    });

    try {
      // Use fetch for streaming instead of EventSource (better for POST requests)
      const response = await fetch('/api/logs/ingest/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath: folderPath.trim() }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to start ingestion');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.substring(6));
            setIngestProgress(data);
            
            if (data.phase === 'complete') {
              setIngestResult(
                `✓ Ingested ${formatNumber(data.entriesIngested || data.entryCount || 0)} entries from ${data.fileCount || data.filesFound || 0} files (skipped ${data.skippedFiles || data.filesSkipped || 0}).`
              );
              // Delay hiding progress to let user see completion
              setTimeout(() => {
                setShowProgress(false);
                fetchCountries();
                fetchOverview();
                fetchEntries();
                fetchWatches();
              }, 2000);
            } else if (data.phase === 'error') {
              setIngestResult(data.error || 'Ingest failed.');
              setTimeout(() => setShowProgress(false), 3000);
            }
          }
        }
      }
    } catch (error) {
      setIngestResult(error instanceof Error ? error.message : 'Ingest failed.');
      setIngestProgress({
        phase: 'error',
        dirsScanned: 0,
        filesFound: 0,
        filesProcessed: 0,
        filesSkipped: 0,
        entriesIngested: 0,
        percentage: 0,
        message: 'Error occurred',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      setTimeout(() => setShowProgress(false), 3000);
    } finally {
      setIngesting(false);
    }
  };

  // Export handlers
  const handleExportCSV = useCallback(() => {
    // TODO: Implement generateCSVReport function
    const csvData = `Total Requests,Error Requests,Error Rate,Orders Count,Peak Hour
${overview.totalRequests},${overview.errorRequests},${overview.errorRate}%,${overview.ordersCount},${overview.peakHour}`;
    
    const timestamp = new Date().toISOString().split('T')[0];
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oca-sana-report-${timestamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [overview]);

  const handleExportPDF = useCallback(() => {
    // For now, print to PDF using browser
    window.print();
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  useEffect(() => {
        // Fetch analysis overview with date range
        const params = new URLSearchParams();
        if (dateRange.start) params.append('startDate', dateRange.start);
        if (dateRange.end) params.append('endDate', dateRange.end);
        fetch(`/api/logs/analysisOverview?${params.toString()}`).then(async (res) => {
          const payload = await res.json();
          if (payload.success) setAnalysisOverview(payload.data);
        });
    fetchCountries();
    // Fetch country stats (file count, processing time)
    fetch('/api/logs/countryStats').then(async (res) => {
      const payload = await res.json();
      if (payload.success) setCountryStats(payload.data);
    });
  }, [fetchCountries]);

  useEffect(() => {
    fetchWatches();
  }, [fetchWatches]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    if (!autoWatch) return;
    const timer = window.setInterval(() => {
      runWatcher();
    }, 60000);
    return () => window.clearInterval(timer);
  }, [autoWatch, runWatcher]);
  
  // Cleanup event source on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" suppressHydrationWarning>
      <Header />
      
      {/* Progress Bar Overlay - TODO: Implement IngestProgressBar component */}
      {showProgress && ingestProgress && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-800 border border-slate-700 rounded-lg p-4 min-w-[300px]">
          <p className="text-slate-300">Processing... {ingestProgress.percentage}%</p>
        </div>
      )}
      
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.15),_transparent_55%),radial-gradient(circle_at_30%_30%,_rgba(99,102,241,0.12),_transparent_50%)]" />
        <main className="relative max-w-7xl mx-auto px-6 py-10" suppressHydrationWarning>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">Log Intelligence</p>
              <h1 className="text-3xl md:text-4xl font-semibold text-white mt-2">
                State-of-the-art monitoring for Sana log streams
              </h1>
              <p className="text-slate-400 mt-3 max-w-2xl">
                Batch ingest ERP traces, normalize them by country, and surface instant KPIs for usage, errors,
                and order behavior.
              </p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 w-full lg:w-[420px]">
              <p className="text-sm font-semibold text-slate-100">Batch ingest folder</p>
              <p className="text-xs text-slate-500 mt-1">Example: C:\\logs\\SANA_LOGS\\PROD</p>
              <div className="mt-3 flex gap-2">
                <input
                  value={folderPath}
                  onChange={(event) => setFolderPath(event.target.value)}
                  placeholder="Paste folder path"
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  onClick={handleIngest}
                  disabled={ingesting}
                  className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-semibold text-sm hover:bg-cyan-400 transition disabled:opacity-60"
                >
                  {ingesting ? 'Ingesting...' : 'Ingest'}
                </button>
              </div>
              <div className="mt-4 border-t border-slate-800 pt-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Watcher</p>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min={5}
                    value={watchInterval}
                    onChange={(event) => setWatchInterval(Number(event.target.value))}
                    className="w-20 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200"
                  />
                  <span className="text-xs text-slate-400">min interval</span>
                  <label className="ml-auto flex items-center gap-2 text-xs text-slate-400">
                    <input
                      type="checkbox"
                      checked={watchEnabled}
                      onChange={(event) => setWatchEnabled(event.target.checked)}
                      className="accent-cyan-400"
                    />
                    Enabled
                  </label>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={saveWatch}
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 hover:bg-slate-700 transition"
                  >
                    Save watch
                  </button>
                  <button
                    onClick={runWatcher}
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 hover:bg-slate-700 transition"
                  >
                    Run watcher
                  </button>
                </div>
                <label className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                  <input
                    type="checkbox"
                    checked={autoWatch}
                    onChange={(event) => setAutoWatch(event.target.checked)}
                    className="accent-cyan-400"
                  />
                  Auto-run watcher every minute
                </label>
                {watchStatus && <p className="text-xs text-slate-400 mt-2">{watchStatus}</p>}
              </div>
              {ingestResult && <p className="text-xs text-slate-300 mt-2">{ingestResult}</p>}
            </div>
          </div>

          {/* View Mode Toggle and Export */}
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('executive')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'executive'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📊 Executive View
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'detailed'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🔍 Detailed View
              </button>
            </div>

            {/* TODO: Implement ExportButtons component */}
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                disabled={overview.totalRequests === 0}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all"
              >
                📥 Export CSV
              </button>
              <button
                onClick={handlePrint}
                disabled={overview.totalRequests === 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all"
              >
                🖨️ Print
              </button>
            </div>
          </div>

          {/* Quick Country Navigation */}
          <div className="mt-6 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Quick Country Filter</p>
                <p className="text-sm text-slate-300 mt-1">Tap a country to instantly view its logs</p>
              </div>
              <button
                onClick={() => {
                  setCountryFilter('ALL');
                  setEntryPage(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  countryFilter === 'ALL'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                All Countries
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {countryList.length === 0 && (
                <span className="text-xs text-slate-500">No countries detected yet.</span>
              )}
              {countryList.map((country, idx) => (
                <button
                  key={`${country}-${idx}`}
                  onClick={() => {
                    setCountryFilter(country);
                    setEntryPage(0);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    countryFilter === country
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>
          </div>

          {/* Executive View */}
          {viewMode === 'executive' && (
            <div className="mt-8 space-y-8">
              {/* TODO: Implement ExecutiveSummary component */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-slate-200 mb-4">Executive Summary</h3>
                <p className="text-slate-400">Component coming soon...</p>
              </div>

              {/* TODO: Implement PerformanceMetrics component */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-slate-200 mb-4">Performance Metrics</h3>
                <p className="text-slate-400">Component coming soon...</p>
              </div>
            </div>
          )}

          {/* Detailed View (Original Content) */}
          {viewMode === 'detailed' && (
                      <>
                        {/* Date Range Picker & Visualization Generator */}
                        <div className="mt-8 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">Advanced Analysis</p>
                              <h3 className="text-lg font-semibold text-white mt-1">Generate Python Visualizations</h3>
                              <p className="text-xs text-slate-400 mt-1">Create comprehensive dashboard charts from your log data</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 items-end">
                            <div>
                              <label className="block text-xs text-slate-400 mb-1">Start Date</label>
                              <input 
                                type="date" 
                                value={dateRange.start} 
                                onChange={e => setDateRange(r => ({ ...r, start: e.target.value }))} 
                                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-slate-400 mb-1">End Date</label>
                              <input 
                                type="date" 
                                value={dateRange.end} 
                                onChange={e => setDateRange(r => ({ ...r, end: e.target.value }))} 
                                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                              />
                            </div>
                            
                            <button 
                              onClick={generateVisualizations}
                              disabled={generatingViz || !folderPath.trim()}
                              className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {generatingViz ? (
                                <>
                                  <span className="animate-spin">⚙️</span>
                                  Generating...
                                </>
                              ) : (
                                <>
                                  📊 Generate Visualizations
                                </>
                              )}
                            </button>
                            
                            <button 
                              onClick={() => {
                                // Refetch analysis overview
                                const params = new URLSearchParams();
                                if (dateRange.start) params.append('startDate', dateRange.start);
                                if (dateRange.end) params.append('endDate', dateRange.end);
                                fetch(`/api/logs/analysisOverview?${params.toString()}`).then(async (res) => {
                                  const payload = await res.json();
                                  if (payload.success) setAnalysisOverview(payload.data);
                                });
                              }} 
                              className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 text-sm font-semibold hover:bg-cyan-400 transition"
                            >
                              Apply Filters
                            </button>
                          </div>

                          {/* Visualization Results */}
                          {vizResult && (
                            <div className="mt-6 pt-6 border-t border-slate-800">
                              {vizResult.success ? (
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-semibold text-green-400 flex items-center gap-2">
                                        ✅ Visualizations Generated Successfully
                                      </p>
                                      <p className="text-xs text-slate-400 mt-1">
                                        Processing time: {vizResult.executionTimeSeconds}s · {vizResult.summary?.totalErrors || 0} errors analyzed
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => setVizResult(null)}
                                      className="text-xs text-slate-500 hover:text-slate-300"
                                    >
                                      Clear
                                    </button>
                                  </div>

                                  {vizResult.visualizations && vizResult.visualizations.length > 0 && (
                                    <div className="space-y-4">
                                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Generated Dashboards</p>
                                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {vizResult.visualizations.map((viz, idx) => (
                                          <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                                            <img 
                                              src={viz} 
                                              alt={`Dashboard ${idx + 1}`} 
                                              className="w-full h-auto"
                                            />
                                            <div className="p-3 flex items-center justify-between">
                                              <p className="text-xs text-slate-400">Dashboard {idx + 1}</p>
                                              <a
                                                href={viz}
                                                download
                                                className="px-3 py-1 bg-cyan-500 text-slate-950 text-xs font-semibold rounded hover:bg-cyan-400 transition"
                                              >
                                                Download
                                              </a>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                  <p className="text-sm font-semibold text-red-400">❌ Visualization Generation Failed</p>
                                  <p className="text-xs text-red-300 mt-2">{vizResult.error}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Directory Analysis Table */}
                        <div className="mt-8 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                          <h2 className="font-semibold text-white mb-2">Analyzed Directories</h2>
                          <table className="w-full text-sm text-slate-200">
                            <thead>
                              <tr>
                                <th className="text-left">Directory</th>
                                <th>Country</th>
                                <th>Environment</th>
                                <th>Files</th>
                                <th>Lines</th>
                                <th>Start</th>
                                <th>End</th>
                              </tr>
                            </thead>
                            <tbody>
                              {analysisOverview.length === 0 && (
                                <tr><td colSpan={7} className="text-slate-400">No analysis data yet.</td></tr>
                              )}
                              {analysisOverview.map((row, idx) => (
                                <tr key={row.folder_path + '-' + idx}>
                                  <td className="truncate max-w-[220px]">{row.folder_path}</td>
                                  <td>{row.country}</td>
                                  <td>{row.environment}</td>
                                  <td>{row.file_count}</td>
                                  <td>{row.line_count}</td>
                                  <td>{row.started_at ? new Date(row.started_at).toLocaleString() : ''}</td>
                                  <td>{row.finished_at ? new Date(row.finished_at).toLocaleString() : ''}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-4">
            {[
              { label: 'Total Requests', value: formatNumber(overview.totalRequests) },
              { label: 'Error Rate', value: `${overview.errorRate}%` },
              { label: 'Peak Hour', value: `${overview.peakHour}:00` },
              { label: 'Orders Found', value: formatNumber(overview.ordersCount) },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-lg"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{card.label}</p>
                <p className="text-2xl font-semibold text-white mt-2">{card.value}</p>
              </div>
            ))}
          </div>
          {/* Country/Environment Stats */}
          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {countryStats.length === 0 && (
              <div className="text-sm text-slate-400">No country stats yet.</div>
            )}
            {countryStats.map((stat, idx) => (
              <div key={`${stat.country}-${stat.environment}-${idx}`} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-lg">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{stat.country} / {stat.environment}</p>
                <p className="text-lg text-slate-200 mt-2">{stat.fileCount} files</p>
                <p className="text-xs text-slate-400 mt-1">Processing time: {stat.processingTime}s</p>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-3 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Filters</p>
            </div>
            <select
              value={countryFilter}
              onChange={(event) => setCountryFilter(event.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200"
            >
              <option value="ALL">All Countries</option>
              {Array.from(new Set(countries.map((row) => row.country))).map((country, idx) => (
                <option key={`${country || 'unknown'}-${idx}`} value={country}>
                  {country}
                </option>
              ))}
            </select>
            <select
              value={environmentFilter}
              onChange={(event) => setEnvironmentFilter(event.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200"
            >
              <option value="ALL">All Environments</option>
              <option value="PROD">PROD</option>
              <option value="INDUS">INDUS</option>
            </select>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Window</span>
              <input
                type="range"
                min={7}
                max={180}
                value={days}
                onChange={(event) => setDays(Number(event.target.value))}
                className="accent-cyan-400"
              />
              <span>{days} days</span>
            </div>
            <button
              onClick={fetchOverview}
              className="ml-auto px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 hover:bg-slate-700 transition"
            >
              {loading ? 'Refreshing...' : 'Refresh data'}
            </button>
          </div>

          <div className="mt-6 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">Watchlist</h2>
              <span className="text-xs text-slate-500">{watches.length} folders</span>
            </div>
            <div className="mt-3 space-y-2">
              {watches.length === 0 && (
                <div className="text-sm text-slate-400">No watched folders yet.</div>
              )}
              {watches.map((watch) => (
                <div key={watch.id} className="flex flex-wrap items-center gap-3 text-sm text-slate-200">
                  <span className="px-2 py-1 rounded-md bg-slate-800 text-xs text-slate-400">
                    {watch.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <span className="text-slate-300">{watch.folderPath}</span>
                  <span className="text-xs text-slate-500">Every {watch.intervalMinutes} min</span>
                  <span className="text-xs text-slate-500">
                    Last run: {watch.lastRunAt ? formatTimestamp(watch.lastRunAt) : 'Never'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white">Requests by hour</h2>
                <span className="text-xs text-slate-500">24-hour view</span>
              </div>
              <div className="mt-4">
                <BarChart
                  data={hourSeries.map((item) => ({ label: item.hour, value: item.count }))}
                />
              </div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white">Requests by day</h2>
                <span className="text-xs text-slate-500">Rolling window</span>
              </div>
              <div className="mt-4">
                <LineChart data={overview.requestsByDay} />
              </div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white">Error distribution</h2>
                <span className="text-xs text-slate-500">Severity levels</span>
              </div>
              <div className="mt-4 space-y-3">
                {overview.errorsBySeverity.length === 0 && (
                  <div className="text-sm text-slate-400">No errors recorded.</div>
                )}
                {overview.errorsBySeverity.slice(0, 10).map((item, idx) => (
                  <div key={`${item.severity}-${idx}`} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-20">{item.severity}</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-800">
                      <div
                        className="h-2 rounded-full bg-red-400"
                        style={{
                          width: `${
                            overview.errorRequests
                              ? Math.min(100, (item.count / overview.errorRequests) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-300">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h2 className="font-semibold text-white">Top operations</h2>
              <div className="mt-4 space-y-2">
                {overview.topOperations.length === 0 && (
                  <div className="text-sm text-slate-400">No operations parsed yet.</div>
                )}
                {overview.topOperations.slice(0, 10).map((item, idx) => (
                  <div key={`${item.operation}-${idx}`} className="flex items-center justify-between text-sm">
                    <span className="text-slate-200">{item.operation}</span>
                    <span className="text-slate-400">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h2 className="font-semibold text-white">Most ordered items</h2>
              <div className="mt-4 space-y-2">
                {overview.topItems.length === 0 && (
                  <div className="text-sm text-slate-400">No order items detected.</div>
                )}
                {overview.topItems.map((item, idx) => (
                  <div key={`${item.itemId || 'unknown'}-${item.description || 'unknown'}-${idx}`} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-slate-200">{item.description}</p>
                      <p className="text-xs text-slate-500">{item.itemId}</p>
                    </div>
                    <span className="text-slate-400">{formatNumber(item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h2 className="font-semibold text-white">Top customers by value</h2>
              <div className="mt-4 space-y-2">
                {overview.topCustomers.length === 0 && (
                  <div className="text-sm text-slate-400">No customer totals yet.</div>
                )}
                {overview.topCustomers.map((item, idx) => (
                  <div key={`${item.customerId || 'unknown'}-${idx}`} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-slate-200">{item.customerId}</p>
                      <p className="text-xs text-slate-500">{item.orders} orders</p>
                    </div>
                    <span className="text-slate-400">{formatNumber(item.totalValue)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h2 className="font-semibold text-white">Largest orders</h2>
              <div className="mt-4 space-y-2">
                {overview.topOrders.length === 0 && (
                  <div className="text-sm text-slate-400">No orders parsed yet.</div>
                )}
                {overview.topOrders.map((item, idx) => (
                  <div key={`${item.documentId || 'unknown'}-${item.customerId || 'unknown'}-${idx}`} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-slate-200">{item.documentId}</p>
                      <p className="text-xs text-slate-500">{item.customerId || 'Unknown'}</p>
                    </div>
                    <span className="text-slate-400">
                      {formatNumber(item.totalInclTax || 0)} {item.currencyId || ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold text-white">Timeline explorer</h2>
              <span className="text-xs text-slate-500">
                Showing {entries.length} of {formatNumber(entriesTotal)} entries
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 items-center">
              <input
                value={entrySearch}
                onChange={(event) => {
                  setEntrySearch(event.target.value);
                  setEntryPage(0);
                }}
                placeholder="Search message text"
                className="flex-1 min-w-[220px] px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200"
              />
              <select
                value={entrySeverity}
                onChange={(event) => {
                  setEntrySeverity(event.target.value);
                  setEntryPage(0);
                }}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200"
              >
                <option value="ALL">All severities</option>
                <option value="Information">Information</option>
                <option value="Warning">Warning</option>
                <option value="Error">Error</option>
              </select>
              <select
                value={entryOperation}
                onChange={(event) => {
                  setEntryOperation(event.target.value);
                  setEntryPage(0);
                }}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200"
              >
                <option value="ALL">All operations</option>
                {overview.topOperations.map((item, idx) => (
                  <option key={`${item.operation}-${idx}`} value={item.operation}>
                    {item.operation}
                  </option>
                ))}
              </select>
              <button
                onClick={fetchEntries}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 hover:bg-slate-700 transition"
              >
                Refresh
              </button>
            </div>

            <div className="mt-4 divide-y divide-slate-800">
              {entries.length === 0 && (
                <div className="text-sm text-slate-400">No log entries found for this view.</div>
              )}
              {entries.map((entry) => (
                <div key={entry.id} className="py-3">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span>{formatTimestamp(entry.timestamp)}</span>
                    <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-300">
                      {entry.country || 'Unknown'} / {entry.environment || 'Unknown'}
                    </span>
                    <span className={`px-2 py-1 rounded-md ${getSeverityBadge(entry.severity)}`}>
                      {entry.severity || 'Unknown'}
                    </span>
                    {entry.operation && <span className="text-slate-300">{entry.operation}</span>}
                  </div>
                  <p className="mt-2 text-sm text-slate-200">
                    {entry.message.length > 220 ? `${entry.message.slice(0, 220)}...` : entry.message}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
              <button
                onClick={() => setEntryPage((page) => Math.max(0, page - 1))}
                disabled={entryPage === 0}
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {entryPage + 1} of {totalPages}
              </span>
              <button
                onClick={() => setEntryPage((page) => Math.min(totalPages - 1, page + 1))}
                disabled={entryPage >= totalPages - 1}
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
          </>
          )}
        </main>
      </div>
    </div>
  );
}
