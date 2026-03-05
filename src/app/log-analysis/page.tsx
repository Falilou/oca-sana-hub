'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { Header } from '@/components/common/Header';
import { Sidebar } from '@/components/common/Sidebar';
import { Footer } from '@/components/common/Footer';
import { CustomTooltip, HeatmapTooltip, PieTooltip } from '@/components/dashboard/CustomTooltip';
import { ServerCapacityInfo, type ServerCapacity } from '@/components/dashboard/ServerCapacityInfo';
import { AnalysisProgressBar } from '@/components/dashboard/AnalysisProgressBar';
import { FileIngestionInfo } from '@/components/dashboard/FileIngestionInfo';
import { FileNotificationCenter, type FileNotification } from '@/components/dashboard/FileNotificationCenter';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter
} from 'recharts';

interface ErrorAnalysis {
  totalRequests: number;
  totalErrors: number;
  errorRate: number;
  peakHour: string;
  peakDay: string;
  topErrorTypes: Array<{ errorType: string; count: number; percentage: number }>;
  errorsByHour: Array<{ hour: string; count: number }>;
  errorsByDay: Array<{ day: string; count: number }>;
  errorsByWeek: Array<{ week: number; count: number; trendValue: number }>;
  errorsBySeverity: Array<{ severity: string; count: number; percentage: number }>;
  errorsByCategory: Array<{ category: string; count: number; percentage: number }>;
  topOperationsWithErrors: Array<{ operation: string; count: number }>;
  errorFrequencyOverTime: Array<{ date: string; count: number; trend: number }>;
  cumulativeErrorGrowth: Array<{ date: string; cumulative: number }>;
  peakVsOffPeak: {
    peakHours: { hours: string; count: number; percentage: number };
    offPeakHours: { hours: string; count: number; percentage: number };
  };
  errorHeatmap: Array<{ day: string; hour: number; count: number }>;
  errorDistributionByDay: Array<{ day: string; min: number; q1: number; median: number; q3: number; max: number }>;
  errorRateByHour: Array<{ hour: number; errorCount: number; errorRate: number }>;
  operationSuccessRate: Array<{ operation: string; successRate: string; total: number; failed: number }>;
  errorTrendByOperation: Array<{ operation: string; count: number }>;
  customersNeedingAttention: Array<{
    customerId: string;
    errorCount: number;
    totalTransactions: number;
    errorRate: number;
    importantTransactions: number;
    attentionScore: number;
    sampleOperation: string;
  }>;
  unknownOperationSamples: Array<{
    message: string;
    timestamp: string;
    country: string;
    environment: 'PROD' | 'INDUS';
  }>;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6'];

const COUNTRY_FLAGS: Record<string, string> = {
  colombia: '🇨🇴',
  australia: '🇦🇺',
  morocco: '🇲🇦',
  chile: '🇨🇱',
  argentina: '🇦🇷',
  vietnam: '🇻🇳',
  'south-africa': '🇿🇦',
  malaysia: '🇲🇾',
  'south-korea': '🇰🇷',
};

export default function LogAnalysisDashboard() {
  const [basePath, setBasePath] = useState('C:\\Users\\falseck\\OneDrive - Capgemini\\Documents\\Michelin\\Michelin Australia logs analysis\\SANA_LOGS');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ErrorAnalysis | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('all');
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [availableEnvironments, setAvailableEnvironments] = useState<string[]>([]);
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [discoveries, setDiscoveries] = useState<Array<{
    country: string;
    environment: string;
    path: string;
    fileCount: number;
  }>>([]);
  const [selectedSources, setSelectedSources] = useState<Set<number>>(new Set());
  const [statusMessage, setStatusMessage] = useState('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [generatingViz, setGeneratingViz] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<{
    currentFile: string;
    filesProcessed: number;
    totalFiles: number;
    entriesFound: number;
    estimatedTimeRemaining: string;
  } | null>(null);
  const [vizResult, setVizResult] = useState<{
    success: boolean;
    visualizations?: string[];
    summary?: any;
    executionTimeSeconds?: string;
    outputDirectory?: string;
    error?: string;
  } | null>(null);
  const [noLogsMessage, setNoLogsMessage] = useState<string>('');
  const [urlParamsApplied, setUrlParamsApplied] = useState(false);
  const [serverCapacity, setServerCapacity] = useState<ServerCapacity | null>(null);
  const [capacityLoading, setCapacityLoading] = useState(true);
  const [analysisStartTime, setAnalysisStartTime] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<FileNotification[]>([]);
  const [databaseStatus, setDatabaseStatus] = useState<any>(null);
  const [databaseInitialized, setDatabaseInitialized] = useState(false);
  const [startupIngestComplete, setStartupIngestComplete] = useState(false);
  const [startupIngestInProgress, setStartupIngestInProgress] = useState(false);
  const [startupIngestProgress, setStartupIngestProgress] = useState<{
    inProgress: boolean;
    processedFiles: number;
    totalFiles: number;
    parsedEntries: number;
    percent: number;
  } | null>(null);
  const [fileChangeCheckInterval, setFileChangeCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const startupProgressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Parse URL parameters on component mount
  useEffect(() => {
    if (urlParamsApplied) return;

    const params = new URLSearchParams(window.location.search);

    const country = params.get('country');
    const environment = params.get('environment');

    if (country) {
      setSelectedCountry(country.toLowerCase());
    }
    if (environment) {
      setSelectedEnvironment(environment.toUpperCase());
    }

    if (country || environment) {
      setUrlParamsApplied(true);
    }
  }, [urlParamsApplied]);

  // Auto-fetch analysis when URL params are applied
  useEffect(() => {
    if (urlParamsApplied && selectedCountry !== 'all' && selectedEnvironment !== 'all') {
      setAnalyzing(true);
    }
  }, [urlParamsApplied, selectedCountry, selectedEnvironment]);

  // Sync filter options with discovered log sources
  useEffect(() => {
    if (discoveries.length === 0) return;

    const countries = Array.from(
      new Set(discoveries.map((discovery) => discovery.country))
    ).sort();
    const environments = Array.from(
      new Set(discoveries.map((discovery) => discovery.environment))
    ).sort();

    setAvailableCountries(countries);
    setAvailableEnvironments(environments);
  }, [discoveries]);

  // Fetch server capacity on component mount
  useEffect(() => {
    const fetchCapacity = async () => {
      try {
        const response = await fetch('/api/logs/server-capacity');
        const data = await response.json();
        if (data.success && data.capacity) {
          setServerCapacity(data.capacity);
        }
      } catch (error) {
        console.error('Failed to fetch server capacity:', error);
      } finally {
        setCapacityLoading(false);
      }
    };

    fetchCapacity();
  }, []);

  // Fetch database status
  const fetchDatabaseStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/logs/database-status', { cache: 'no-cache' });
      const data = await response.json();
      if (data.success) {
        setDatabaseStatus(data.database);
      }
    } catch (error) {
      console.error('Failed to fetch database status:', error);
    }
  }, []);

  // On-demand ingestion handler
  const handleOnDemandIngest = useCallback(async () => {
    try {
      setLoading(true);
      setStatusMessage('📥 Starting on-demand batch ingestion...');

      const response = await fetch('/api/logs/on-demand-ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ basePath, maxFiles: 500 }),
      });

      const result = await response.json();

      if (result.success) {
        const newNotification: FileNotification = {
          id: `ondemand_${Date.now()}`,
          type: 'database_update',
          title: '💾 Batch Ingestion Complete',
          message: `${result.ingestion.entriesIngested} new entries added to database`,
          count: result.ingestion.filesProcessed,
          timestamp: Date.now(),
          dismissible: true,
        };

        setNotifications((prev) => [newNotification, ...prev]);
        setStatusMessage(`✅ On-demand ingestion complete: ${result.ingestion.filesProcessed} files processed`);

        // Refresh database status
        await fetchDatabaseStatus();
      } else {
        setStatusMessage(`❌ On-demand ingestion failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error during on-demand ingestion:', error);
      setStatusMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [basePath, fetchDatabaseStatus]);

  // Start polling for file changes
  const startFileChangePolling = useCallback(() => {
    // Check for file changes every 15 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/logs/file-changes?basePath=${encodeURIComponent(basePath)}`, {
          cache: 'no-cache',
        });
        const result = await response.json();

        if (result.success && result.notification.hasNewFiles) {
          const filesInfo = result.changes.newFiles
            .slice(0, 10)
            .map((f: any) => f.fileName);

          const newNotification: FileNotification = {
            id: `newfiles_${Date.now()}`,
            type: 'new_files',
            title: `📄 ${result.notification.newFileCount} New Log Files`,
            message: `New log files detected in your directory`,
            count: result.notification.newFileCount,
            files: filesInfo,
            timestamp: Date.now(),
            dismissible: true,
            actionLabel: 'Ingest Now',
            onAction: () => handleOnDemandIngest(),
          };

          setNotifications((prev) => [newNotification, ...prev]);
        }
      } catch (error) {
        console.error('Error checking for file changes:', error);
      }
    }, 15000);

    setFileChangeCheckInterval(interval);
    return () => clearInterval(interval);
  }, [basePath, handleOnDemandIngest]);

  // Dismiss notification
  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const fetchStartupProgress = useCallback(async () => {
    if (!basePath || !basePath.trim()) return;

    try {
      const response = await fetch(`/api/logs/startup-ingest?basePath=${encodeURIComponent(basePath)}`, {
        cache: 'no-cache',
      });
      const result = await response.json();
      if (result.success && result.progress) {
        setStartupIngestProgress(result.progress);
        if (!result.progress.inProgress) {
          setStartupIngestInProgress(false);
        }
      }
    } catch (error) {
      console.error('Error fetching startup progress:', error);
    }
  }, [basePath]);

  const startStartupProgressPolling = useCallback(() => {
    if (startupProgressIntervalRef.current) return;
    startupProgressIntervalRef.current = setInterval(() => {
      fetchStartupProgress();
    }, 1000);
  }, [fetchStartupProgress]);

  const stopStartupProgressPolling = useCallback(() => {
    if (startupProgressIntervalRef.current) {
      clearInterval(startupProgressIntervalRef.current);
      startupProgressIntervalRef.current = null;
    }
  }, []);

  // Fetch analysis with country and environment filters
  const fetchAnalysis = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCountry && selectedCountry !== 'all') {
        params.append('country', selectedCountry);
      }
      if (selectedEnvironment && selectedEnvironment !== 'all') {
        params.append('environment', selectedEnvironment);
      }
      if (dateRange.start) {
        params.append('startDate', dateRange.start);
      }
      if (dateRange.end) {
        params.append('endDate', dateRange.end);
      }
      
      const url = params.toString() 
        ? `/api/logs/analysis?${params.toString()}`
        : '/api/logs/analysis';
      
      const analysisResponse = await fetch(url);
      const analysisData = await analysisResponse.json();
      
      if (analysisData.success) {
        setAnalysis(analysisData.analysis);
        setAvailableCountries(analysisData.availableCountries || []);
        setAvailableEnvironments(analysisData.availableEnvironments || []);
        setProcessingTime(analysisData.processingTimeMs || 0);
        
        const filterInfo = [];
        if (selectedCountry !== 'all') filterInfo.push(selectedCountry.toUpperCase());
        if (selectedEnvironment !== 'all') filterInfo.push(selectedEnvironment);
        if (dateRange.start || dateRange.end) {
          const dateRangeText = `${dateRange.start || 'start'} to ${dateRange.end || 'end'}`;
          filterInfo.push(dateRangeText);
        }
        const filterText = filterInfo.length > 0 ? ` (${filterInfo.join(' • ')})` : '';
        
        // Check if no logs found
        if (analysisData.analysis.totalErrors === 0 && analysisData.analysis.totalRequests === 0) {
          const countryDisplay = selectedCountry !== 'all' ? selectedCountry.charAt(0).toUpperCase() + selectedCountry.slice(1) : 'All';
          const envDisplay = selectedEnvironment !== 'all' ? selectedEnvironment : 'All Environments';
          setNoLogsMessage(`📭 No logs found for ${countryDisplay} • ${envDisplay}. Please check that logs exist for this country and environment, or expand your date range.`);
        } else {
          setNoLogsMessage('');
          setStatusMessage(`✅ Analysis complete! Found ${analysisData.analysis.totalErrors} errors in ${analysisData.totalLogs} log entries${filterText}.`);
        }
      }
    } catch (error: any) {
      setStatusMessage(`❌ Error analyzing: ${error.message}`);
    } finally {
      setAnalyzing(false);
    }
  }, [selectedCountry, selectedEnvironment, dateRange]);


  // Startup ingestion - auto-ingest logs when basePath is set
  useEffect(() => {
    // Skip if basePath is not set (empty string)
    if (!basePath || !basePath.trim()) {
      console.log('[Startup] Skipping - basePath not set yet');
      return;
    }
    
    // Skip if already ingested
    if (databaseInitialized || startupIngestComplete) {
      console.log('[Startup] Skipping - already initialized');
      return;
    }
    
    const performStartupIngest = async () => {
      try {
        console.log('[Startup] Triggering automatic log ingestion for basePath:', basePath);
        setStatusMessage('🚀 Starting automatic log ingestion from default directory...');
        setStartupIngestInProgress(true);
        setStartupIngestProgress({
          inProgress: true,
          processedFiles: 0,
          totalFiles: 0,
          parsedEntries: 0,
          percent: 0,
        });
        startStartupProgressPolling();
        
        const response = await fetch('/api/logs/startup-ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ basePath }),
        });

        const result = await response.json();

        if (result.success) {
          setDatabaseInitialized(true);
          setStartupIngestComplete(true);
          setStartupIngestInProgress(false);
          stopStartupProgressPolling();
          console.log('[Startup] Ingestion complete:', result.stats);

          // Show success notification
          const newNotification: FileNotification = {
            id: `startup_${Date.now()}`,
            type: 'ingestion_complete',
            title: '✅ Database Initialized',
            message: `${result.stats.databaseStats.totalLogs} log entries indexed and ready to analyze`,
            count: result.stats.databaseStats.totalLogs,
            timestamp: Date.now(),
            dismissible: true,
          };

          setNotifications((prev) => [newNotification, ...prev]);
          
          // Show detailed status message
          const statusDetails = `✅ Automatic ingestion complete!
Files processed: ${result.stats.filesProcessed}
Parsed entries: ${result.stats.parsedEntries}
Ingested: ${result.stats.totalIngested}
Total in DB: ${result.stats.databaseStats.totalLogs}
Countries: ${result.stats.databaseStats.countries?.join(', ') || 'none'}
Environments: ${result.stats.databaseStats.environments?.join(', ') || 'none'}`;
          
          setStatusMessage(statusDetails);

          // Start file change polling
          startFileChangePolling();

          // Trigger analysis to populate graphs
          console.log('[Startup] Triggering analysis to generate graphs...');
          setTimeout(async () => {
            // Fetch analysis without adding fetchAnalysis to deps to avoid circular dependency
            try {
              const params = new URLSearchParams();
              if (selectedCountry && selectedCountry !== 'all') {
                params.append('country', selectedCountry);
              }
              if (selectedEnvironment && selectedEnvironment !== 'all') {
                params.append('environment', selectedEnvironment);
              }
              
              const url = params.toString() 
                ? `/api/logs/analysis?${params.toString()}`
                : '/api/logs/analysis';
              
              const analysisResponse = await fetch(url);
              const analysisData = await analysisResponse.json();
              
              if (analysisData.success) {
                setAnalysis(analysisData.analysis);
                setAvailableCountries(analysisData.availableCountries || []);
                setAvailableEnvironments(analysisData.availableEnvironments || []);
                setProcessingTime(analysisData.processingTimeMs || 0);
                setStatusMessage(`✅ Analysis complete! Found ${analysisData.analysis.totalErrors} errors in ${analysisData.totalLogs} log entries.`);
              }
            } catch (error: any) {
              console.error('[Startup] Error triggering analysis:', error);
            }
          }, 500); // Small delay to ensure database is ready
        } else {
          console.error('[Startup] Ingestion failed:', result.error);
          const errorDetails = `⚠️ Startup ingestion failed
Error: ${result.error || 'Unknown error'}
Please check the logs directory and try again.`;
          setStatusMessage(errorDetails);
          // Reset so it can retry when basePath changes
          setStartupIngestComplete(false);
        }
      } catch (error) {
        console.error('[Startup] Error during startup ingestion:', error);
        const errorMsg = error instanceof Error ? error.message : String(error);
        setStatusMessage(`ℹ️ Startup ingestion error: ${errorMsg}\nTry clicking "Ingest New Files" to load logs manually.`);
        // Reset so it can retry when basePath changes
        setStartupIngestComplete(false);
      }
    };

    performStartupIngest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePath, databaseInitialized, startupIngestComplete, startStartupProgressPolling, stopStartupProgressPolling]);

  // Cleanup: Stop file watcher and polling on unmount
  useEffect(() => {
    return () => {
      if (fileChangeCheckInterval) {
        clearInterval(fileChangeCheckInterval);
      }
      if (startupProgressIntervalRef.current) {
        clearInterval(startupProgressIntervalRef.current);
        startupProgressIntervalRef.current = null;
      }
    };
  }, [fileChangeCheckInterval]);

  // Generate Python visualizations
  const generateVisualizations = useCallback(async () => {
    if (!basePath.trim()) {
      setStatusMessage('❌ Please provide a base directory path');
      return;
    }

    setGeneratingViz(true);
    setVizResult(null);
    setStatusMessage('🎨 Generating Python visualizations...');

    try {
      const response = await fetch('/api/logs/generate-visualizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logFolder: basePath.trim() + '\\**\\*.txt',
          startDate: dateRange.start || undefined,
          endDate: dateRange.end || undefined,
          country: selectedCountry !== 'all' ? selectedCountry : undefined,
          environment: selectedEnvironment !== 'all' ? selectedEnvironment : undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setVizResult(result);
        setStatusMessage(`✅ Visualizations generated in ${result.executionTimeSeconds}s`);
      } else {
        setVizResult({
          success: false,
          error: result.error || 'Failed to generate visualizations',
        });
        setStatusMessage(`❌ ${result.error || 'Failed to generate visualizations'}`);
      }
    } catch (error) {
      setVizResult({
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
      setStatusMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setGeneratingViz(false);
    }
  }, [basePath, dateRange, selectedCountry, selectedEnvironment]);

  const getDateRangeSuffix = useCallback(() => {
    return dateRange.start && dateRange.end
      ? `${dateRange.start}_to_${dateRange.end}`
      : dateRange.start
        ? `from_${dateRange.start}`
        : dateRange.end
          ? `until_${dateRange.end}`
          : 'all_dates';
  }, [dateRange]);

  const renderChartToBlob = useCallback(async (chartRef: HTMLDivElement | null): Promise<Blob | null> => {
    if (!chartRef) return null;

    const svg = chartRef.querySelector('svg');
    if (!svg) return null;

    try {
      const bbox = svg.getBoundingClientRect();
      const width = bbox.width || 800;
      const height = bbox.height || 600;
      const scale = 2;

      const clonedSvg = svg.cloneNode(true) as SVGElement;
      clonedSvg.setAttribute('width', (width * scale).toString());
      clonedSvg.setAttribute('height', (height * scale).toString());
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', '100%');
      rect.setAttribute('height', '100%');
      rect.setAttribute('fill', '#1e293b');
      clonedSvg.insertBefore(rect, clonedSvg.firstChild);

      const svgData = new XMLSerializer().serializeToString(clonedSvg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });

      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d', {
        alpha: false,
        willReadFrequently: false,
      });

      if (!ctx) return null;

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const img = new Image();
      const url = URL.createObjectURL(svgBlob);

      return await new Promise<Blob | null>((resolve) => {
        const cleanup = () => {
          URL.revokeObjectURL(url);
          img.src = '';
          canvas.width = 0;
          canvas.height = 0;
        };

        img.onload = () => {
          try {
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              cleanup();
              resolve(blob || null);
            }, 'image/png', 1.0);
          } catch (error) {
            console.error('Export error:', error);
            cleanup();
            resolve(null);
          }
        };

        img.onerror = () => {
          cleanup();
          resolve(null);
        };

        img.src = url;
      });
    } catch (error) {
      console.error('Chart export failed:', error);
      return null;
    }
  }, []);

  // Export individual chart as high-quality PNG
  const exportChart = useCallback(async (chartRef: HTMLDivElement | null, chartName: string) => {
    const blob = await renderChartToBlob(chartRef);
    if (!blob) {
      setStatusMessage('⚠️ Export failed. Try refreshing the analysis.');
      return;
    }

    const link = document.createElement('a');
    link.download = `${chartName}_${getDateRangeSuffix()}.png`;
    link.href = URL.createObjectURL(blob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }, [getDateRangeSuffix, renderChartToBlob]);

  const exportAllCharts = useCallback(async () => {
    const buttons = Array.from(
      document.querySelectorAll<HTMLButtonElement>('button[data-export-name]')
    );

    if (buttons.length === 0) {
      setStatusMessage('⚠️ No charts found to export yet.');
      return;
    }

    setStatusMessage('📦 Building ZIP with all charts...');

    const zip = new JSZip();
    let exportCount = 0;

    for (let index = 0; index < buttons.length; index += 1) {
      const button = buttons[index];
      const chartName = button.getAttribute('data-export-name') || `chart_${index + 1}`;
      const chartDiv = button.closest('.bg-white, .dark\\:bg-slate-800') as HTMLDivElement | null;
      const blob = await renderChartToBlob(chartDiv);
      if (blob) {
        zip.file(`${chartName}_${getDateRangeSuffix()}.png`, blob);
        exportCount += 1;
      }
    }

    if (exportCount === 0) {
      setStatusMessage('⚠️ No charts were exported.');
      return;
    }

    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    const link = document.createElement('a');
    link.download = `log-analysis-charts_${getDateRangeSuffix()}.zip`;
    link.href = URL.createObjectURL(zipBlob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);

    setStatusMessage(`✅ Exported ${exportCount} charts to ZIP.`);
  }, [getDateRangeSuffix, renderChartToBlob]);

  // Scan directories for log files
  const handleScanDirectories = useCallback(async () => {
    setLoading(true);
    setStatusMessage('Scanning directories...');
    setAnalysis(null); // Clear previous analysis
    
    try {
      const response = await fetch('/api/logs/scanDirectories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ basePath }),
      });

      const data = await response.json();
      
      if (data.success) {
        setDiscoveries(data.discoveries);
        // Auto-select all sources
        setSelectedSources(new Set(data.discoveries.map((_: any, index: number) => index)));
        setStatusMessage(`✅ Found ${data.totalDiscovered} log sources. Select which ones to analyze.`);
      } else {
        setStatusMessage(`❌ Error: ${data.error}`);
      }
    } catch (error: any) {
      setStatusMessage(`❌ Error scanning: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [basePath]);

  // Analyze selected log sources
  const handleAnalyzeLogs = useCallback(async () => {
    if (selectedSources.size === 0) {
      setStatusMessage('⚠️ Please select at least one log source to analyze.');
      return;
    }

    setAnalyzing(true);
    setAnalysisStartTime(Date.now());
    setStatusMessage('📊 Preparing analysis...');
    
    // Clear existing logs first
    await fetch('/api/logs/clear', { method: 'POST' });

    let totalProcessed = 0;
    let totalEntries = 0;
    const selectedDiscoveries = discoveries.filter((_, index) => selectedSources.has(index));
    const startTime = Date.now();

    for (let i = 0; i < selectedDiscoveries.length; i++) {
      const discovery = selectedDiscoveries[i];
      const sourceLabel = `${discovery.country}/${discovery.environment}`;
      
      // Calculate estimated time remaining
      const elapsedMs = Date.now() - startTime;
      const avgTimePerSource = i > 0 ? elapsedMs / i : 0;
      const remainingSources = selectedDiscoveries.length - i;
      const estimatedRemainingMs = avgTimePerSource * remainingSources;
      const estimatedTimeRemaining = estimatedRemainingMs > 0 
        ? `~${Math.ceil(estimatedRemainingMs / 1000)}s remaining`
        : 'calculating...';

      // Update detailed progress
      setLoadingProgress({
        currentFile: sourceLabel,
        filesProcessed: totalProcessed,
        totalFiles: selectedDiscoveries.reduce((sum, d) => sum + d.fileCount, 0),
        entriesFound: totalEntries,
        estimatedTimeRemaining,
      });

      setStatusMessage(`📂 Processing ${sourceLabel} (${i + 1}/${selectedDiscoveries.length})\n📄 Files: ${totalProcessed} processed · 📊 Entries: ${totalEntries.toLocaleString()} found\n⏱️ ${estimatedTimeRemaining}`);

      try {
        const response = await fetch('/api/logs/ingestFromPath', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            folderPath: discovery.path,
            country: discovery.country,
            environment: discovery.environment,
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          totalProcessed += data.filesProcessed;
          totalEntries += data.entriesFound;
          
          // Update progress after each successful ingestion
          setLoadingProgress({
            currentFile: sourceLabel,
            filesProcessed: totalProcessed,
            totalFiles: selectedDiscoveries.reduce((sum, d) => sum + d.fileCount, 0),
            entriesFound: totalEntries,
            estimatedTimeRemaining,
          });
        }
      } catch (error) {
        console.error(`Error loading ${sourceLabel}:`, error);
      }
    }

    setLoadingProgress(null);
    setAnalysisStartTime(null);
    setStatusMessage(`🔍 Analyzing ${totalEntries.toLocaleString()} log entries from ${totalProcessed} files...`);

    // Fetch analysis and show graphs
    await fetchAnalysis();
  }, [discoveries, selectedSources, fetchAnalysis]);

  // Handle country change
  const handleCountryChange = useCallback(async (country: string) => {
    setSelectedCountry(country);
    if (analysis) {
      setLoading(true);
      await fetchAnalysis();
      setLoading(false);
    }
  }, [analysis, fetchAnalysis]);
  const handleEnvironmentChange = useCallback(async (environment: string) => {
    setSelectedEnvironment(environment);
    if (analysis) {
      setLoading(true);
      await fetchAnalysis();
      setLoading(false);
    }
  }, [analysis, fetchAnalysis]);

  const startupProgressPercent = Math.min(
    100,
    Math.max(
      0,
      startupIngestProgress?.percent ??
        (startupIngestProgress?.totalFiles
          ? Math.round((startupIngestProgress.processedFiles / startupIngestProgress.totalFiles) * 100)
          : 0)
    )
  );

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-slate-950 flex flex-col">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 px-6 py-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Log Error Analysis Dashboard
            </h1>
            <p className="text-gray-400">
              Comprehensive log analysis across all countries and environments
            </p>
          </div>

          {/* Grafana-like Toolbar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 border border-slate-800 rounded-lg px-4 py-3">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-gray-400">Time range</span>
              <span className="px-3 py-1 bg-slate-950/60 border border-slate-800 rounded-md text-white">
                {dateRange.start || 'Start'} {dateRange.start && dateRange.end && '→'} {dateRange.end || 'End'}
              </span>
              <span className="text-xs text-slate-500">Applied to all panels</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  if (!analysis) return;
                  setAnalyzing(true);
                  await fetchAnalysis();
                }}
                disabled={!analysis || analyzing}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-white text-xs font-semibold rounded-md border border-slate-700 transition-all"
              >
                Refresh
              </button>
              <button
                onClick={() => setDateRange({ start: '', end: '' })}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-gray-300 text-xs font-semibold rounded-md border border-slate-700 transition-all"
              >
                Clear time
              </button>
            </div>
          </div>

          {/* Query Builder */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 mb-6 shadow-lg">
            {/* Welcome Section */}
            {!analysis && discoveries.length === 0 && (
              <div className="text-center mb-8 py-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600/20 rounded-full mb-4">
                  <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Welcome to Log Analysis
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Start by scanning your log directory to discover all available log files across countries and environments. 
                  Then ingest and analyze to gain comprehensive insights.
                </p>
              </div>
            )}

            {/* Workflow */}
            <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="px-2 py-1 bg-slate-800 border border-slate-700 rounded">1. Source</span>
              <span className="px-2 py-1 bg-slate-800 border border-slate-700 rounded">2. Scope</span>
              <span className="px-2 py-1 bg-slate-800 border border-slate-700 rounded">3. Run</span>
              <span className="text-slate-500">Set filters, then run analysis to refresh panels.</span>
            </div>

            {/* Directory Path */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Data source path
              </label>
              <input
                type="text"
                value={basePath}
                onChange={(e) => setBasePath(e.target.value)}
                className="w-full px-4 py-3 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-950/60 text-white placeholder-gray-500 transition-all"
                placeholder="C:\path\to\logs"
              />
            </div>

            {/* Server Capacity Information */}
            <ServerCapacityInfo capacity={serverCapacity} loading={capacityLoading} />

            {/* File Ingestion Information */}
            {serverCapacity && <FileIngestionInfo capabilities={{
              supportedFormats: serverCapacity.supportedFormats,
              maxFileSize: serverCapacity.maxFileSize,
              maxFileSizeGB: serverCapacity.maxFileSizeGB,
              maxFilesPerSession: serverCapacity.maxFilesPerSession,
              maxEntriesPerSession: serverCapacity.maxEntriesPerSession,
              estimatedProcessingRate: serverCapacity.estimatedProcessingRate,
            }} />}

            {/* Date Range Picker */}
            <div className="mb-6 p-5 bg-slate-950/60 border border-slate-800 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Time range</h3>
                  <p className="text-xs text-gray-400">Applied to all panels</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">From</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={async (e) => {
                      const newStart = e.target.value;
                      setDateRange(r => ({ ...r, start: newStart }));
                      // Re-fetch analysis if we already have data
                      if (analysis) {
                        setLoading(true);
                        setStatusMessage('🔄 Updating analysis with new date range...');
                        await fetchAnalysis();
                        setLoading(false);
                      }
                    }}
                    className="w-full px-4 py-2.5 border border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-900/70 text-white transition-all [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">To</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={async (e) => {
                      const newEnd = e.target.value;
                      setDateRange(r => ({ ...r, end: newEnd }));
                      // Re-fetch analysis if we already have data
                      if (analysis) {
                        setLoading(true);
                        setStatusMessage('🔄 Updating analysis with new date range...');
                        await fetchAnalysis();
                        setLoading(false);
                      }
                    }}
                    className="w-full px-4 py-2.5 border border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-900/70 text-white transition-all [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            {/* Filters Grid - Only show when data is analyzed */}
            {(availableCountries.length > 0 || availableEnvironments.length > 0) && (
              <div className="space-y-6 mb-6">
                {/* Active Filters Summary - Prominent Display */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      Query variables
                    </h3>
                    {(selectedCountry !== 'all' || selectedEnvironment !== 'all' || dateRange.start || dateRange.end) && (
                      <button
                        onClick={() => {
                          setSelectedCountry('all');
                          setSelectedEnvironment('all');
                          setDateRange({ start: '', end: '' });
                        }}
                        className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-gray-300 border border-slate-700 rounded-md transition-all font-medium"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Country Filter - Large Card */}
                    {availableCountries.length > 0 && (
                      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 hover:border-slate-600 transition-all">
                        <label htmlFor="country-filter" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                          Country
                        </label>
                        <select
                          id="country-filter"
                          value={selectedCountry}
                          onChange={(e) => handleCountryChange(e.target.value)}
                          disabled={loading || analyzing}
                          className="w-full px-4 py-3 border border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-950/60 text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [color-scheme:dark] font-semibold text-sm"
                        >
                          <option value="all">🌐 All Countries</option>
                          {availableCountries.map((country) => {
                            const flag = COUNTRY_FLAGS[country.toLowerCase().replace(' ', '-')] || '📍';
                            return (
                              <option key={country} value={country}>
                                {flag} {country.charAt(0).toUpperCase() + country.slice(1)}
                              </option>
                            );
                          })}
                        </select>
                        {selectedCountry !== 'all' && (
                          <div className="mt-2 text-xs text-blue-300 font-semibold">
                            ✓ Applied
                          </div>
                        )}
                      </div>
                    )}

                    {/* Environment Filter - Large Card */}
                    {availableEnvironments.length > 0 && (
                      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 hover:border-slate-600 transition-all">
                        <label htmlFor="environment-filter" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                          Environment
                        </label>
                        <select
                          id="environment-filter"
                          value={selectedEnvironment}
                          onChange={(e) => handleEnvironmentChange(e.target.value)}
                          disabled={loading || analyzing}
                          className="w-full px-4 py-3 border border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-950/60 text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [color-scheme:dark] font-semibold text-sm"
                        >
                          <option value="all">🔄 All Environments</option>
                          {availableEnvironments.map((env) => (
                            <option key={env} value={env}>
                              {env === 'PROD' ? '🟢 PRODUCTION' : '🟠 TESTING (INDUS)'}
                            </option>
                          ))}
                        </select>
                        {selectedEnvironment !== 'all' && (
                          <div className="mt-2 text-xs text-green-300 font-semibold">
                            ✓ Applied
                          </div>
                        )}
                      </div>
                    )}

                    {/* Date Range - Large Card */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 hover:border-slate-600 transition-all">
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Date range
                      </label>
                      <div className="space-y-2">
                        <input
                          type="date"
                          value={dateRange.start}
                          onChange={(e) => {
                            setDateRange({ ...dateRange, start: e.target.value });
                            if (analysis) {
                              setLoading(true);
                              fetchAnalysis();
                              setLoading(false);
                            }
                          }}
                          className="w-full px-3 py-2 border border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-950/60 text-white transition-all cursor-pointer [color-scheme:dark] text-xs font-medium"
                          placeholder="Start date"
                        />
                        <input
                          type="date"
                          value={dateRange.end}
                          onChange={(e) => {
                            setDateRange({ ...dateRange, end: e.target.value });
                            if (analysis) {
                              setLoading(true);
                              fetchAnalysis();
                              setLoading(false);
                            }
                          }}
                          className="w-full px-3 py-2 border border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-950/60 text-white transition-all cursor-pointer [color-scheme:dark] text-xs font-medium"
                          placeholder="End date"
                        />
                        {(dateRange.start || dateRange.end) && (
                          <div className="mt-2 text-xs text-blue-300 font-semibold">
                            ✓ {dateRange.start && `From ${dateRange.start}`} {dateRange.start && dateRange.end && '→'} {dateRange.end && `To ${dateRange.end}`}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Filter Status Summary */}
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="text-gray-400">Current filter:</span>
                      {selectedCountry !== 'all' && (
                        <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-blue-200 font-semibold">
                          {COUNTRY_FLAGS[selectedCountry.toLowerCase().replace(' ', '-')] || '📍'} {selectedCountry.charAt(0).toUpperCase() + selectedCountry.slice(1)}
                        </span>
                      )}
                      {selectedEnvironment !== 'all' && (
                        <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-green-200 font-semibold">
                          {selectedEnvironment}
                        </span>
                      )}
                      {(dateRange.start || dateRange.end) && (
                        <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-blue-200 font-semibold">
                          {dateRange.start} {dateRange.start && dateRange.end && '→'} {dateRange.end}
                        </span>
                      )}
                      {selectedCountry === 'all' && selectedEnvironment === 'all' && !dateRange.start && !dateRange.end && (
                        <span className="text-gray-500 italic">No filters applied - showing all data</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Query Bar */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-950/60 border border-slate-800 rounded-lg p-3">
              <button
                onClick={async () => {
                  if (!analysis) return;
                  setAnalyzing(true);
                  await fetchAnalysis();
                }}
                disabled={!analysis || analyzing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-md text-sm font-semibold transition-all"
              >
                Run query
              </button>
              <button
                onClick={handleScanDirectories}
                disabled={loading || analyzing}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:cursor-not-allowed text-white rounded-md text-sm font-semibold transition-all flex items-center gap-2 border border-slate-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {loading ? 'Scanning...' : 'Scan Directories'}
              </button>

              <button
                onClick={handleOnDemandIngest}
                disabled={loading || analyzing || !databaseInitialized}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-900 disabled:cursor-not-allowed text-white rounded-md text-sm font-semibold transition-all flex items-center gap-2 border border-purple-500"
                title="Ingest new or updated log files from the monitored directory"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {loading ? 'Ingesting...' : '📥 Ingest New Files'}
              </button>

              <button
                onClick={generateVisualizations}
                disabled={generatingViz || !basePath.trim()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:cursor-not-allowed text-white rounded-md text-sm font-semibold transition-all flex items-center gap-2 border border-slate-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                {generatingViz ? (
                  <>
                    <span className="animate-spin">⚙️</span>
                    Generating...
                  </>
                ) : (
                  '📊 Generate Python Visualizations'
                )}
              </button>

              {discoveries.length > 0 && !analysis && (
                <button
                  onClick={handleAnalyzeLogs}
                  disabled={loading || analyzing || selectedSources.size === 0}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:cursor-not-allowed text-white rounded-md text-sm font-semibold transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {analyzing ? 'Analyzing...' : `Analyze ${selectedSources.size} Selected`}
                </button>
              )}

              {analysis && (
                <button
                  onClick={async () => {
                    await fetch('/api/logs/clear', { method: 'POST' });
                    setAnalysis(null);
                    setDiscoveries([]);
                    setAvailableCountries([]);
                    setAvailableEnvironments([]);
                    setSelectedCountry('all');
                    setSelectedEnvironment('all');
                    setSelectedSources(new Set());
                    setProcessingTime(0);
                    setStatusMessage('\u2728 Ready for new analysis');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-sm font-semibold transition-all flex items-center gap-2 border border-slate-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  New Analysis
                </button>
              )}

              {processingTime > 0 && (
                <div className="ml-auto px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg">
                  <div className="text-[11px] font-semibold text-slate-400 mb-1">
                    Processing time
                  </div>
                  <div className="text-lg font-bold text-white">
                    {(processingTime / 1000).toFixed(2)}s
                  </div>
                </div>
              )}
            </div>

            {(startupIngestInProgress || startupIngestProgress?.inProgress) && (
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-200 text-sm backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
                  <div className="font-semibold">Ingestion in progress</div>
                  <div className="ml-auto text-xs font-mono text-blue-100">
                    {startupProgressPercent}%
                  </div>
                </div>
                <div className="mt-3 w-full bg-slate-800/60 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                    style={{ width: `${startupProgressPercent}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-blue-300">
                  Files: {startupIngestProgress?.processedFiles?.toLocaleString() || 0}
                  /{startupIngestProgress?.totalFiles?.toLocaleString() || 0} · Entries: {startupIngestProgress?.parsedEntries?.toLocaleString() || 0}
                </div>
              </div>
            )}

            {/* Status Message */}
            {statusMessage && (
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-200 text-sm backdrop-blur-sm whitespace-pre-line">
                {statusMessage}
              </div>
            )}

            {/* Database Status Widget */}
            {databaseStatus && (
              <div className="mt-4 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-600/30 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-green-300">📊 Indexed Database</div>
                      <div className="text-sm text-green-200 font-medium">
                        {databaseStatus.totalLogs?.toLocaleString()} log entries ready
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-green-300/70 mb-1">Countries indexed:</div>
                    <div className="text-xs font-mono text-green-200">
                      {databaseStatus.countryIndex?.length || 0}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analysis Progress Bar */}
            {analyzing && analysisStartTime && loadingProgress && (
              <AnalysisProgressBar
                isActive={analyzing}
                filesProcessed={loadingProgress.filesProcessed}
                totalFiles={loadingProgress.totalFiles}
                entriesFound={loadingProgress.entriesFound}
                estimatedTimeRemaining={loadingProgress.estimatedTimeRemaining}
                startTime={analysisStartTime}
              />
            )}

            {/* Detailed Loading Progress */}
            {loadingProgress && (
              <div className="mt-4 p-5 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/40 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600/30 rounded-lg flex items-center justify-center animate-pulse">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Processing Logs</h4>
                    <p className="text-xs text-blue-300">Please wait while we ingest and parse log files...</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Current Source</div>
                    <div className="text-sm font-semibold text-white truncate">{loadingProgress.currentFile}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Files Processed</div>
                    <div className="text-sm font-semibold text-white">{loadingProgress.filesProcessed.toLocaleString()} files</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Log Entries Found</div>
                    <div className="text-sm font-semibold text-cyan-400">{loadingProgress.entriesFound.toLocaleString()} entries</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Time Remaining</div>
                    <div className="text-sm font-semibold text-blue-400">{loadingProgress.estimatedTimeRemaining}</div>
                  </div>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 animate-pulse"
                    style={{ width: `${(loadingProgress.filesProcessed / loadingProgress.totalFiles) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 text-center mt-2">
                  {Math.round((loadingProgress.filesProcessed / loadingProgress.totalFiles) * 100)}% complete
                </div>
              </div>
            )}

            {/* Visualization Results */}
            {vizResult && (
              <div className="mt-6 pt-6 border-t border-slate-700">
                {vizResult.success ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-green-400 flex items-center gap-2">
                          ✅ Python Visualizations Generated Successfully
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Processing time: {vizResult.executionTimeSeconds}s · {vizResult.summary?.totalErrors || 0} errors analyzed
                        </p>
                        <p className="text-xs text-purple-400 mt-1">
                          📁 Stored in: {vizResult.outputDirectory || '/dashboard-visualizations/[timestamp]'}
                        </p>
                      </div>
                      <button
                        onClick={() => setVizResult(null)}
                        className="text-xs text-slate-500 hover:text-slate-300 px-3 py-1.5 bg-slate-700/50 rounded-lg transition"
                      >
                        Clear
                      </button>
                    </div>

                    {vizResult.visualizations && vizResult.visualizations.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-purple-400 font-semibold">Generated Dashboards</p>
                            <p className="text-xs text-slate-400">High-resolution PNG visualizations</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {vizResult.visualizations?.map((viz, idx) => {
                            const vizFilename = viz.split('/').pop() || `dashboard-${idx + 1}.png`;
                            const timestamp = vizResult.outputDirectory?.split('/').pop();
                            return (
                            <div key={idx} className="bg-slate-950 border border-slate-700 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all group">
                              <div className="relative">
                                <img
                                  src={viz}
                                  alt={`Dashboard ${idx + 1}`}
                                  className="w-full h-auto"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="p-4 flex flex-col gap-3 bg-gradient-to-br from-slate-800 to-slate-900">
                                <div>
                                  <p className="text-sm font-semibold text-white">Dashboard {idx + 1}</p>
                                  <p className="text-xs text-slate-400">Python-generated analysis</p>
                                </div>
                                <div className="flex gap-2">
                                  <a
                                    href={viz}
                                    download
                                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all shadow-sm flex items-center justify-center gap-2"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Direct
                                  </a>
                                  <button
                                    onClick={async () => {
                                      if (!timestamp) return;
                                      try {
                                        const response = await fetch(`/api/logs/download-visualizations?type=individual&timestamp=${timestamp}&filename=${vizFilename}`);
                                        if (response.ok) {
                                          const blob = await response.blob();
                                          const url = window.URL.createObjectURL(blob);
                                          const a = document.createElement('a');
                                          a.href = url;
                                          a.download = vizFilename;
                                          a.click();
                                          window.URL.revokeObjectURL(url);
                                        }
                                      } catch (error) {
                                        console.error('Download failed:', error);
                                      }
                                    }}
                                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1"
                                    title="Download from server API"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    API
                                  </button>
                                </div>
                              </div>
                            </div>
                            );
                          })}
                        </div>
                        <div className="pt-6 border-t border-slate-700 mt-6">
                          <div className="flex items-center gap-2 mb-4">
                            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">Batch Operations</p>
                          </div>
                          <button
                            onClick={async () => {
                              const timestamp = vizResult.outputDirectory?.split('/').pop();
                              if (!timestamp) return;
                              try {
                                const response = await fetch(`/api/logs/download-visualizations?type=all&timestamp=${timestamp}`);
                                if (response.ok) {
                                  const blob = await response.blob();
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `log-visualizations-${timestamp}.zip`;
                                  a.click();
                                  window.URL.revokeObjectURL(url);
                                }
                              } catch (error) {
                                console.error('Batch download failed:', error);
                              }
                            }}
                            className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-all shadow-sm flex items-center justify-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download All as ZIP
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-sm font-semibold text-red-400 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Visualization Generation Failed
                    </p>
                    <p className="text-xs text-red-300 mt-2">{vizResult.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>

        {/* Discovered Sources with Selection */}
        {discoveries.length > 0 && !analysis && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8 shadow-xl mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Select Log Sources to Analyze
                  </h3>
                  <p className="text-sm text-gray-400">
                    {selectedSources.size} of {discoveries.length} sources selected
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedSources(new Set(discoveries.map((_, i) => i)))}
                  className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-300 rounded-lg text-sm font-medium transition-all"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedSources(new Set())}
                  className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-gray-300 rounded-lg text-sm font-medium transition-all"
                >
                  Deselect All
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {discoveries.map((discovery, index) => {
                const isSelected = selectedSources.has(index);
                return (
                  <div
                    key={index}
                    onClick={() => {
                      const newSelected = new Set(selectedSources);
                      if (isSelected) {
                        newSelected.delete(index);
                      } else {
                        newSelected.add(index);
                      }
                      setSelectedSources(newSelected);
                    }}
                    className={`p-5 border rounded-xl shadow-lg transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 shadow-blue-500/30'
                        : 'bg-slate-700/50 border-slate-600 hover:border-blue-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-blue-600 border-blue-500'
                          : 'border-slate-500 bg-slate-800'
                      }`}>
                        {isSelected && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      </div>
                      <div className="font-bold text-white flex-1">
                        {discovery.country} / {discovery.environment}
                      </div>
                    </div>
                    <div className="text-sm text-gray-400 pl-11">
                      📄 {discovery.fileCount} log files
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <>
            {/* Active Filters & Actions Bar */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 mb-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Active Filters Display */}
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">📊 Active Analysis Filters</h3>
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Date Range Badge */}
                    {(dateRange.start || dateRange.end) ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/50 rounded-lg">
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium text-purple-200">
                          {dateRange.start || '...'} → {dateRange.end || '...'}
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-400">All Dates</span>
                      </div>
                    )}
                    
                    {/* Country Badge */}
                    {selectedCountry && selectedCountry !== 'all' && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/50 rounded-lg">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium text-blue-200 capitalize">{selectedCountry}</span>
                      </div>
                    )}
                    
                    {/* Environment Badge */}
                    {selectedEnvironment && selectedEnvironment !== 'all' && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-600/20 border border-green-500/50 rounded-lg">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                        </svg>
                        <span className="text-sm font-medium text-green-200">{selectedEnvironment}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={exportAllCharts}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm flex items-center gap-2"
                    title="Export all charts as high-quality PNG"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export All Charts
                  </button>
                  {/* Generate Executive Summary */}
                  <button
                    onClick={() => {
                      // Generate and download executive summary
                      const summary = `
LOG ERROR ANALYSIS - EXECUTIVE SUMMARY
Generated: ${new Date().toLocaleString()}
==========================================

OVERVIEW
--------
Total Requests: ${analysis.totalRequests.toLocaleString()}
Total Errors: ${analysis.totalErrors.toLocaleString()}
Error Rate: ${analysis.errorRate.toFixed(2)}%
Peak Error Hour: ${analysis.peakHour}
Peak Error Day: ${analysis.peakDay}

FILTERS APPLIED
---------------
Date Range: ${dateRange.start || 'All'} to ${dateRange.end || 'All'}
Country: ${selectedCountry === 'all' ? 'All Countries' : selectedCountry}
Environment: ${selectedEnvironment === 'all' ? 'All Environments' : selectedEnvironment}

TOP ERROR TYPES
---------------
${analysis.topErrorTypes.slice(0, 10).map((error, idx) => 
  `${idx + 1}. ${error.errorType}: ${error.count} occurrences (${error.percentage.toFixed(2)}%)`
).join('\\n')}

ERROR DISTRIBUTION BY SEVERITY
------------------------------
${analysis.errorsBySeverity.map(sev => 
  `${sev.severity}: ${sev.count} (${sev.percentage.toFixed(2)}%)`
).join('\\n')}

ERROR DISTRIBUTION BY CATEGORY
------------------------------
${analysis.errorsByCategory.map(cat => 
  `${cat.category}: ${cat.count} (${cat.percentage.toFixed(2)}%)`
).join('\\n')}

PEAK VS OFF-PEAK ANALYSIS
-------------------------
Peak Hours (${analysis.peakVsOffPeak.peakHours.hours}): ${analysis.peakVsOffPeak.peakHours.count} errors (${analysis.peakVsOffPeak.peakHours.percentage.toFixed(2)}%)
Off-Peak Hours (${analysis.peakVsOffPeak.offPeakHours.hours}): ${analysis.peakVsOffPeak.offPeakHours.count} errors (${analysis.peakVsOffPeak.offPeakHours.percentage.toFixed(2)}%)

TOP OPERATIONS WITH ERRORS
--------------------------
${analysis.topOperationsWithErrors.slice(0, 10).map((op, idx) => 
  `${idx + 1}. ${op.operation}: ${op.count} errors`
).join('\\n')}

RECOMMENDATIONS
---------------
1. Focus on addressing the top ${Math.min(3, analysis.topErrorTypes.length)} error types which account for the majority of issues
2. Investigate peak hour (${analysis.peakHour}) performance and capacity
3. Review ${analysis.peakVsOffPeak.peakHours.hours} patterns for potential optimization
4. Examine operations with highest error counts for process improvements

==========================================
End of Executive Summary
                      `.trim();

                      const blob = new Blob([summary], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.download = `executive-summary-${new Date().toISOString().split('T')[0]}.txt`;
                      link.href = url;
                      link.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-all shadow-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Executive Summary
                  </button>
                </div>
              </div>
            </div>

            {/* No Logs Found Message */}
            {noLogsMessage && (
              <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/50 rounded-xl p-6 mb-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2M7.08 6.47a8.001 8.001 0 0111.84 0M4.25 9.22c2.35-2.35 6.15-2.35 8.5 0m-11 4.96c3.53-3.53 9.23-3.53 12.76 0" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-200 mb-2">No Logs Found</h3>
                    <p className="text-yellow-100/90 mb-3">{noLogsMessage}</p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setDateRange({ start: '', end: '' })}
                        className="px-4 py-2 bg-yellow-600/30 hover:bg-yellow-600/40 text-yellow-200 border border-yellow-500/50 rounded-lg text-sm font-medium transition-all"
                      >
                        Clear Date Filter
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCountry('all');
                          setSelectedEnvironment('all');
                        }}
                        className="px-4 py-2 bg-yellow-600/30 hover:bg-yellow-600/40 text-yellow-200 border border-yellow-500/50 rounded-lg text-sm font-medium transition-all"
                      >
                        View All Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-slate-700/70">
                <div className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Total Requests</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{analysis.totalRequests.toLocaleString()}</div>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-slate-700/70">
                <div className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Total Errors</div>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">{analysis.totalErrors.toLocaleString()}</div>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-slate-700/70">
                <div className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Error Rate</div>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{(analysis.errorRate || 0).toFixed(2)}%</div>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-slate-700/70">
                <div className="text-slate-600 text-sm mb-1">Peak Hour</div>
                <div className="text-3xl font-bold text-blue-600">{analysis.peakHour}</div>
              </div>
            </div>

            {/* Attention Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Customers Needing Attention */}
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-slate-700/70">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/70 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customers Needing Attention</h3>
                    <p className="text-xs text-gray-400">High-value transactions with elevated error impact</p>
                  </div>
                </div>
                {analysis.customersNeedingAttention.length === 0 ? (
                  <div className="text-sm text-gray-400">No customer identifiers found in current logs.</div>
                ) : (
                  <div className="space-y-3">
                    {analysis.customersNeedingAttention.slice(0, 8).map((customer) => (
                      <div key={customer.customerId} className="flex items-center justify-between text-sm">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">{customer.customerId}</div>
                          <div className="text-xs text-gray-400">
                            {customer.sampleOperation} · {customer.importantTransactions} important
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-red-500 font-semibold">{customer.errorCount} errors</div>
                          <div className="text-xs text-gray-400">{customer.errorRate.toFixed(1)}% · {customer.totalTransactions} total</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Unknown Operation Samples */}
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-slate-700/70">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/70 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Unknown Operation Samples</h3>
                    <p className="text-xs text-gray-400">Inspect raw messages to identify missing operation names</p>
                  </div>
                </div>
                {analysis.unknownOperationSamples.length === 0 ? (
                  <div className="text-sm text-gray-400">No unknown operations found in the current filter.</div>
                ) : (
                  <div className="space-y-3">
                    {analysis.unknownOperationSamples.map((sample, idx) => (
                      <div key={`${sample.timestamp}-${idx}`} className="text-sm">
                        <div className="text-xs text-gray-400 mb-1">
                          {sample.country} · {sample.environment} · {sample.timestamp}
                        </div>
                        <div className="text-gray-900 dark:text-gray-100">
                          {sample.message.length > 140 ? `${sample.message.slice(0, 140)}...` : sample.message}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Row 1: Top Errors, Frequency Over Time, By Hour */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Top 15 Error Types */}
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-slate-700/70">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/70 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top 15 Error Types</h3>
                  <button
                    onClick={(e) => {
                      const chartDiv = e.currentTarget.closest('.bg-white, .dark\\:bg-slate-800') as HTMLDivElement;
                      exportChart(chartDiv, 'top_15_error_types');
                    }}
                    data-export-name="top_15_error_types"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
                    title="Export this chart as high-quality PNG"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analysis.topErrorTypes.slice(0, 15)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="errorType" type="category" width={150} tick={{ fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Error Frequency Over Time */}
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-slate-700/70">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/70 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Error Frequency Over Time</h3>
                  <button
                    onClick={(e) => {
                      const chartDiv = e.currentTarget.closest('.bg-white, .dark\\:bg-slate-800') as HTMLDivElement;
                      exportChart(chartDiv, 'error_frequency_over_time');
                    }}
                    data-export-name="error_frequency_over_time"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
                    title="Export this chart as high-quality PNG"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analysis.errorFrequencyOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Error Distribution by Hour */}
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-slate-700/70">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Error Distribution by Hour</h3>
                  <button
                    onClick={(e) => {
                      const chartDiv = e.currentTarget.closest('.bg-white, .dark\\:bg-slate-800') as HTMLDivElement;
                      exportChart(chartDiv, 'error_distribution_by_hour');
                    }}
                    data-export-name="error_distribution_by_hour"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
                    title="Export this chart as high-quality PNG"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analysis.errorsByHour}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Row 2: Severity, Category, Day of Week */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Error Distribution by Severity */}
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-slate-700/70">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Error Distribution by Severity</h3>
                  <button
                    onClick={(e) => {
                      const chartDiv = e.currentTarget.closest('.bg-white, .dark\\:bg-slate-800') as HTMLDivElement;
                      exportChart(chartDiv, 'error_distribution_by_severity');
                    }}
                    data-export-name="error_distribution_by_severity"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
                    title="Export this chart as high-quality PNG"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analysis.errorsBySeverity}
                      cx="50%"
                      cy="50%"
                      label={(entry: any) => `${entry.severity}: ${(entry.percentage || 0).toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analysis.errorsBySeverity.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Error Distribution by Category */}
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-slate-700/70">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Error Distribution by Category</h3>
                  <button
                    onClick={(e) => {
                      const chartDiv = e.currentTarget.closest('.bg-white, .dark\\:bg-slate-800') as HTMLDivElement;
                      exportChart(chartDiv, 'error_distribution_by_category');
                    }}
                    data-export-name="error_distribution_by_category"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
                    title="Export this chart as high-quality PNG"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analysis.errorsByCategory}
                      cx="50%"
                      cy="50%"
                      label={(entry: any) => `${entry.category}: ${(entry.percentage || 0).toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analysis.errorsByCategory.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Error Distribution by Day of Week */}
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-slate-700/70">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Error Distribution by Day of Week</h3>
                  <button
                    onClick={(e) => {
                      const chartDiv = e.currentTarget.closest('.bg-white, .dark\\:bg-slate-800') as HTMLDivElement;
                      exportChart(chartDiv, 'error_distribution_by_day');
                    }}
                    data-export-name="error_distribution_by_day"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
                    title="Export this chart as high-quality PNG"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analysis.errorsByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#a855f7" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Row 3: Top Operations, Cumulative Growth, Peak vs Off-Peak */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Top 10 Operations with Errors */}
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-slate-700/70">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top 10 Operations with Errors</h3>
                  <button
                    onClick={(e) => {
                      const chartDiv = e.currentTarget.closest('.bg-white, .dark\\:bg-slate-800') as HTMLDivElement;
                      exportChart(chartDiv, 'top_operations_with_errors');
                    }}
                    data-export-name="top_operations_with_errors"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
                    title="Export this chart as high-quality PNG"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analysis.topOperationsWithErrors} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" />
                    <YAxis dataKey="operation" type="category" width={120} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Cumulative Error Growth */}
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-slate-700/70">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cumulative Error Growth</h3>
                  <button
                    onClick={(e) => {
                      const chartDiv = e.currentTarget.closest('.bg-white, .dark\\:bg-slate-800') as HTMLDivElement;
                      exportChart(chartDiv, 'cumulative_error_growth');
                    }}
                    data-export-name="cumulative_error_growth"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
                    title="Export this chart as high-quality PNG"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analysis.cumulativeErrorGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="cumulative" stroke="#6366f1" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Peak vs Off-Peak Hours */}
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-slate-700/70">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Peak vs Off-Peak Hours Error Comparison</h3>
                  <button
                    onClick={(e) => {
                      const chartDiv = e.currentTarget.closest('.bg-white, .dark\\:bg-slate-800') as HTMLDivElement;
                      exportChart(chartDiv, 'peak_vs_offpeak_hours');
                    }}
                    data-export-name="peak_vs_offpeak_hours"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
                    title="Export this chart as high-quality PNG"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[analysis.peakVsOffPeak.peakHours, analysis.peakVsOffPeak.offPeakHours]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="hours" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#14b8a6">
                      <Cell fill="#ef4444" />
                      <Cell fill="#22c55e" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center">
                    Peak: {(analysis.peakVsOffPeak?.peakHours?.percentage || 0).toFixed(1)}% | 
                    Off-Peak: {(analysis.peakVsOffPeak?.offPeakHours?.percentage || 0).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Row 4: Heatmap, Error Rate by Hour, Operation Success Rate */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Error Heatmap */}
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm lg:col-span-2 relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-slate-700/70">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Error Heatmap (Day × Hour)</h3>
                  <button
                    onClick={(e) => {
                      const chartDiv = e.currentTarget.closest('.bg-white, .dark\\:bg-slate-800') as HTMLDivElement;
                      exportChart(chartDiv, 'error_heatmap');
                    }}
                    data-export-name="error_heatmap"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
                    title="Export this chart as high-quality PNG"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="hour" name="Hour" />
                    <YAxis dataKey="day" name="Day" type="category" />
                    <Tooltip content={<HeatmapTooltip />} />
                    <Scatter name="Error Count" data={analysis.errorHeatmap} fill="#ef4444">
                      {analysis.errorHeatmap.map((_, index) => (
                        <Cell
                          key={`heatmap-cell-${index}`}
                          fill={`rgba(239, 68, 68, ${Math.min((analysis.errorHeatmap[index]?.count || 0) / Math.max(...analysis.errorHeatmap.map(h => h.count || 1)) * 0.8 + 0.2, 1)})`}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              {/* Error Rate by Hour */}
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-slate-700/70">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Error Rate by Hour (%)</h3>
                  <button
                    onClick={(e) => {
                      const chartDiv = e.currentTarget.closest('.bg-white, .dark\\:bg-slate-800') as HTMLDivElement;
                      exportChart(chartDiv, 'error_rate_by_hour');
                    }}
                    data-export-name="error_rate_by_hour"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
                    title="Export this chart as high-quality PNG"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analysis.errorRateByHour || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                    <YAxis label={{ value: 'Error Rate (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="errorRate" stroke="#f97316" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Row 5: Operation Success Rate, Error Trend by Operation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Operation Success Rate */}
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-slate-700/70">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Operations by Success Rate</h3>
                  <button
                    onClick={(e) => {
                      const chartDiv = e.currentTarget.closest('.bg-white, .dark\\:bg-slate-800') as HTMLDivElement;
                      exportChart(chartDiv, 'operation_success_rate');
                    }}
                    data-export-name="operation_success_rate"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
                    title="Export this chart as high-quality PNG"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analysis.operationSuccessRate || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="operation" type="category" width={120} tick={{ fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="successRate" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Error Trend by Operation */}
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-slate-700/70">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Operations by Error Count</h3>
                  <button
                    onClick={(e) => {
                      const chartDiv = e.currentTarget.closest('.bg-white, .dark\\:bg-slate-800') as HTMLDivElement;
                      exportChart(chartDiv, 'error_trend_by_operation');
                    }}
                    data-export-name="error_trend_by_operation"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
                    title="Export this chart as high-quality PNG"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analysis.errorTrendByOperation || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" />
                    <YAxis dataKey="operation" type="category" width={120} tick={{ fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
        </main>

        {/* Footer */}
        <Footer />

        {/* File Notification Center - Toast notifications for file changes and ingestion */}
        <FileNotificationCenter
          notifications={notifications}
          onDismiss={dismissNotification}
        />
      </div>
    </div>
  );
}



