'use client';

import React, { useEffect, useState } from 'react';

export interface ProgressPhase {
  name: string;
  weight: number; // 0-1, relative weight for time estimation
}

export interface AnalysisProgressProps {
  isActive: boolean;
  filesProcessed: number;
  totalFiles: number;
  entriesFound: number;
  estimatedTimeRemaining?: string;
  currentPhase?: string;
  startTime?: number;
}

const PHASES: ProgressPhase[] = [
  { name: 'Discovering files', weight: 0.05 },
  { name: 'Reading & parsing', weight: 0.65 },
  { name: 'Processing entries', weight: 0.20 },
  { name: 'Generating analysis', weight: 0.10 },
];

export const AnalysisProgressBar: React.FC<AnalysisProgressProps> = ({
  isActive,
  filesProcessed,
  totalFiles,
  entriesFound,
  estimatedTimeRemaining = 'calculating...',
  currentPhase = 'Processing',
  startTime,
}) => {
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [estimatedTotal, setEstimatedTotal] = useState<number>(0);

  // Update elapsed time
  useEffect(() => {
    if (!isActive || !startTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.round((now - startTime) / 1000);
      setElapsedTime(elapsed);
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, startTime]);

  // Estimate processing speed and total time
  useEffect(() => {
    if (filesProcessed === 0 || elapsedTime === 0) return;

    // Estimate time based on files processed
    const filesPerSecond = filesProcessed / elapsedTime;
    const remainingFiles = Math.max(0, totalFiles - filesProcessed);
    
    // Add overhead for analysis phase (1.2x multiplier for safety)
    const estimatedRemainingSeconds = Math.ceil((remainingFiles / filesPerSecond) * 1.2);
    const estimatedTotalSeconds = elapsedTime + estimatedRemainingSeconds;
    
    setEstimatedTotal(estimatedTotalSeconds);
  }, [filesProcessed, totalFiles, elapsedTime]);

  // Calculate progress percentage
  const fileProgress = totalFiles > 0 ? (filesProcessed / totalFiles) * 100 : 0;
  const timeProgress = estimatedTotal > 0 ? (elapsedTime / estimatedTotal) * 100 : 0;
  const overallProgress = Math.min(95, (fileProgress + timeProgress) / 2); // Cap at 95% until complete

  // Format time
  const formatTime = (seconds: number): string => {
    if (seconds < 1) return '< 1s';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  // Get current phase based on progress
  const getCurrentPhaseInfo = () => {
    let cumulativeWeight = 0;
    for (const phase of PHASES) {
      cumulativeWeight += phase.weight;
      if (overallProgress <= cumulativeWeight * 100) {
        return phase.name;
      }
    }
    return 'Finalizing';
  };

  const displayPhase = getCurrentPhaseInfo();
  const remainingSeconds = Math.max(0, estimatedTotal - elapsedTime);

  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20 border border-blue-400/50 animate-spin">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Analysis in Progress
            </h3>
            <p className="text-sm text-gray-400">
              {displayPhase}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">
            {Math.round(Math.min(100, overallProgress + 1))}%
          </div>
          <div className="text-xs text-gray-400">
            {formatTime(remainingSeconds)} remaining
          </div>
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">Overall Progress</span>
          <span className="text-xs text-gray-500">
            {elapsedTime > 0 && `${formatTime(elapsedTime)} elapsed`}
          </span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 shadow-lg"
            style={{ width: `${Math.min(100, overallProgress + 1)}%` }}
          >
            <div className="w-full h-full bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {/* Files Progress */}
        <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-3">
          <div className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">
            Files Processed
          </div>
          <div className="text-xl font-bold text-white">
            {filesProcessed}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            of {totalFiles} total
          </div>
          <div className="w-full bg-slate-800 rounded h-1 mt-2 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${fileProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Entries Found */}
        <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-3">
          <div className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">
            Entries Found
          </div>
          <div className="text-xl font-bold text-white">
            {(entriesFound / 1000).toFixed(1)}K
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {entriesFound.toLocaleString()} total
          </div>
        </div>

        {/* Processing Rate */}
        <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-3">
          <div className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">
            Speed
          </div>
          <div className="text-xl font-bold text-white">
            {elapsedTime > 0 ? (filesProcessed / elapsedTime).toFixed(1) : '—'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            files/second
          </div>
        </div>

        {/* Time Estimate */}
        <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-3">
          <div className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">
            Total Time
          </div>
          <div className="text-xl font-bold text-white">
            {formatTime(estimatedTotal || 0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            estimate
          </div>
        </div>
      </div>

      {/* Phase Breakdown */}
      <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-4">
        <div className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide">
          Processing Phases
        </div>
        <div className="space-y-2">
          {PHASES.map((phase, index) => {
            const phaseStart = PHASES.slice(0, index).reduce((sum, p) => sum + p.weight, 0) * 100;
            const phaseWidth = phase.weight * 100;
            const isCurrentPhase = displayPhase === phase.name;
            
            return (
              <div key={phase.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${
                    isCurrentPhase ? 'text-blue-400' : 'text-gray-400'
                  }`}>
                    {phase.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {Math.round(phaseWidth)}%
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isCurrentPhase 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/50' 
                        : overallProgress >= (phaseStart + phaseWidth) 
                        ? 'bg-green-500' 
                        : 'bg-slate-700'
                    }`}
                    style={{
                      width: overallProgress >= (phaseStart + phaseWidth) 
                        ? '100%' 
                        : overallProgress >= phaseStart 
                        ? `${((overallProgress - phaseStart) / phaseWidth) * 100}%`
                        : '0%'
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Message */}
      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg text-xs text-blue-300">
        ⚡ <span className="font-medium">Real-time Analysis:</span> Server is actively processing your log files.
        Do not close this tab or refresh the page during analysis.
      </div>
    </div>
  );
};
