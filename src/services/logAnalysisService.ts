/**
 * Log Analysis Service
 * Comprehensive log file parsing and analysis for all countries and environments
 */

export interface LogEntry {
  timestamp: string;
  date: Date;
  severity: 'Info' | 'Warning' | 'Error' | 'Fatal' | 'Debug';
  category: 'data' | 'system' | 'unknown';
  operation: string;
  errorType: string;
  message: string;
  customerId?: string;
  country: string;
  environment: 'PROD' | 'INDUS';
  hour: number;
  dayOfWeek: string;
  weekNumber: number;
}

export interface ErrorAnalysis {
  // Overview metrics
  totalRequests: number;
  totalErrors: number;
  errorRate: number;
  peakHour: string;
  peakDay: string;
  
  // Top errors
  topErrorTypes: Array<{ errorType: string; count: number; percentage: number }>;
  
  // Time-based analysis
  errorsByHour: Array<{ hour: string; count: number }>;
  errorsByDay: Array<{ day: string; count: number }>;
  errorsByWeek: Array<{ week: number; count: number; trendValue: number }>;
  errorFrequencyOverTime: Array<{ date: string; count: number; trend: number }>;
  
  // Severity & category
  errorsBySeverity: Array<{ severity: string; count: number; percentage: number }>;
  errorsByCategory: Array<{ category: string; count: number; percentage: number }>;
  
  // Operations
  topOperationsWithErrors: Array<{ operation: string; count: number }>;
  errorTrendByOperation: Array<{ operation: string; count: number }>;
  operationSuccessRate: Array<{ operation: string; successRate: string; total: number; failed: number }>;
  errorRateByHour: Array<{ hour: number; errorCount: number; errorRate: number }>;
  
  // Heatmap data
  errorHeatmap: Array<{ day: string; hour: number; count: number }>;
  
  // Box plot data (distribution by day)
  errorDistributionByDay: Array<{ day: string; min: number; q1: number; median: number; q3: number; max: number }>;
  
  // Peak analysis
  peakVsOffPeak: {
    peakHours: { hours: string; count: number; percentage: number };
    offPeakHours: { hours: string; count: number; percentage: number };
  };
  
  // Cumulative growth
  cumulativeErrorGrowth: Array<{ date: string; cumulative: number }>;

  // Attention insights
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

export interface CountryEnvironmentLogs {
  country: string;
  environment: 'PROD' | 'INDUS';
  logCount: number;
  errorCount: number;
  lastUpdated: string;
}

class LogAnalysisService {
  private logs: LogEntry[] = [];
  private analysisCache: ErrorAnalysis | null = null;

  /**
   * Parse a single log entry block from Sana Commerce log format
   * Sana logs are multi-line blocks separated by "----------------------------------------"
   */
  parseSanaLogEntry(logBlock: string, country: string, environment: 'PROD' | 'INDUS'): LogEntry | null {
    try {
      // Expected format:
      // Timestamp: MM/DD/YYYY HH:mm:ss (UTC+XX:XX)
      // Server: servername
      // Message:
      // ERP request: OperationName
      // <Request>...</Request>
      // <Response><Errors>...</Errors>...</Response>
      // Severity: Information
      // ...
      
      // Extract timestamp - format: "Timestamp: 02/20/2026 16:42:04 (UTC+11:00)"
      const timestampMatch = logBlock.match(/Timestamp:\s+(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})/);
      if (!timestampMatch) return null;
      
      const timestampStr = timestampMatch[1];
      const date = new Date(timestampStr);
      if (isNaN(date.getTime())) return null;
      
      // Extract severity - format: "Severity: Information"
      const severityMatch = logBlock.match(/Severity:\s+(\w+)/i);
      let severity: LogEntry['severity'] = 'Info';
      if (severityMatch) {
        const sev = severityMatch[1].toLowerCase();
        if (sev.includes('error')) severity = 'Error';
        else if (sev.includes('fatal')) severity = 'Fatal';
        else if (sev.includes('warn')) severity = 'Warning';
        else if (sev.includes('debug')) severity = 'Debug';
      }
      
      // Extract operation - from "ERP request: OperationName" or <Operation>OperationName</Operation>
      let operation = 'Unknown';
      const erpRequestMatch = logBlock.match(/ERP request:\s*([^\n<]+)/);
      if (erpRequestMatch) {
        operation = erpRequestMatch[1].trim();
      } else {
        const operationTagMatch = logBlock.match(/<Operation>([^<]+)<\/Operation>/);
        if (operationTagMatch) {
          operation = operationTagMatch[1].trim();
        }
      }
      
      // Extract Message - the actual error message
      let fullMessage = logBlock.substring(0, 500); // First 500 chars
      const msgMatch = logBlock.match(/Message:\s*([^\n]+(?:\n(?!Severity:|Category:|Website:).+)*)/);
      if (msgMatch) {
        fullMessage = msgMatch[1].trim();
      }
      
      // Check for errors in <Errors> tag or <Error> tags
      const errorsMatch = logBlock.match(/<Errors>([^<]*(?:<Error>[\s\S]*?<\/Error>)*[^<]*)<\/Errors>/);
      if (errorsMatch && errorsMatch[1].trim().length > 0 && !errorsMatch[1].includes('<Errors></Errors>')) {
        severity = 'Error';
        // Extract error message from <Error> tags
        const errorTagMatch = errorsMatch[1].match(/<Error[^>]*>([^<]+)<\/Error>/);
        if (errorTagMatch) {
          fullMessage = `ERP Error: ${errorTagMatch[1].trim()}`;
        }
      }
      
      // Extract error type from message
      const errorType = this.extractErrorType(fullMessage);
      
      // Classify as data error or system error using keyword analysis
      const category = this.classifyErrorCategory(errorType, fullMessage);

      // Extract customer identifier if present
      const customerId = this.extractCustomerId(logBlock);
      
      return {
        timestamp: timestampStr,
        date,
        severity,
        category,
        operation,
        errorType,
        message: fullMessage.substring(0, 500), // Store first 500 chars
        customerId,
        country,
        environment,
        hour: date.getHours(),
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
        weekNumber: this.getWeekNumber(date),
      };
    } catch (error) {
      console.error('Error parsing log entry:', error);
      return null;
    }
  }

  /**
   * Extract error type from message (mimics Python script logic)
   * For errors with "Exception", extract the exception class name
   * Otherwise, return a truncated message
   */
  private extractErrorType(message: string): string {
    const lower = message.toLowerCase();
    
    // If message contains "Exception", extract just the exception name
    if (lower.includes('exception')) {
      const exceptionMatch = message.match(/([\w\.]+Exception)/i);
      if (exceptionMatch) {
        return exceptionMatch[1];
      }
    }
    
    // Check for common error patterns
    if (lower.includes('erp error:')) {
      const erpErrorMatch = message.match(/ERP Error:\s*(.+)/);
      if (erpErrorMatch) {
        return erpErrorMatch[1].trim().substring(0, 100);
      }
    }
    
    // For other messages, return the first meaningful part
    if (message.length > 0) {
      // Split by newlines or colons and take first meaningful part
      const parts = message.split(/[\n:]/)[0].trim();
      return parts.substring(0, 100) + (parts.length > 100 ? '...' : '');
    }
    
    return 'N/A';
  }

  /**
   * Classify error as 'data' or 'system' based on keyword analysis
   * This mimics the Python script's classify_error_type function
   * 
   * Data Errors: Issues with data integrity, missing records, null values, invalid data
   * System Errors: Connection issues, internal system failures, timeouts, permission issues
   */
  private classifyErrorCategory(errorType: string, message: string): LogEntry['category'] {
    const errorText = `${errorType} ${message}`.toLowerCase();
    
    // Data error keywords (from Python script)
    const dataErrorKeywords = [
      'recordnotfound', 'not found', 'null', 'cannot find', 'does not exist',
      'invalid', 'missing', 'not exist', 'cannot initialize', 'validation',
      'incorrect', 'malformed', 'format', 'parse', 'deserialize', 'duplicate',
      'constraint', 'unique', 'primary key', 'foreign key', 'type mismatch'
    ];
    
    // System error keywords (from Python script)
    const systemErrorKeywords = [
      'connection', 'timeout', 'exception', 'fatal', 'crash', 'memory',
      'permission', 'denied', 'unauthorized', 'forbidden', 'internal',
      'server error', 'service', 'unavailable', 'network', 'socket',
      'endpoint', 'http', 'communication', 'serialization', 'deadlock',
      'lock', 'pool', 'resource'
    ];
    
    // Count keyword matches (same algorithm as Python)
    const dataErrorCount = dataErrorKeywords.filter(keyword => errorText.includes(keyword)).length;
    const systemErrorCount = systemErrorKeywords.filter(keyword => errorText.includes(keyword)).length;
    
    // If both are present, check which has higher score
    if (dataErrorCount > 0 || systemErrorCount > 0) {
      if (dataErrorCount > systemErrorCount) {
        return 'data';
      } else {
        return 'system';
      }
    }
    
    // Default: classify based on exception type
    if (errorType.toLowerCase().includes('exception')) {
      if (errorType.toLowerCase().includes('erp') || errorType.toLowerCase().includes('connection')) {
        return 'system';
      }
      return 'system'; // Most exceptions are system-level
    }
    
    // If no clear classification, default to system error
    return 'system';
  }

  private extractCustomerId(logBlock: string): string | undefined {
    const patterns = [
      /Customer\s*ID\s*[:=]\s*([A-Za-z0-9_-]+)/i,
      /CustomerId\s*[:=]\s*([A-Za-z0-9_-]+)/i,
      /Customer\s*No\.?\s*[:=]\s*([A-Za-z0-9_-]+)/i,
      /SoldTo\s*[:=]\s*([A-Za-z0-9_-]+)/i,
      /Account\s*ID\s*[:=]\s*([A-Za-z0-9_-]+)/i,
      /Account\s*Number\s*[:=]\s*([A-Za-z0-9_-]+)/i,
      /Email\s*[:=]\s*([^\s<]+)/i,
      /Customer\s*[:=]\s*([A-Za-z0-9 _-]{2,})/i,
    ];

    for (const pattern of patterns) {
      const match = logBlock.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  private isImportantTransaction(operation: string, message: string): boolean {
    const text = `${operation} ${message}`.toLowerCase();
    const keywords = [
      'order',
      'invoice',
      'payment',
      'checkout',
      'basket',
      'quote',
      'purchase',
      'credit',
      'return',
    ];
    return keywords.some((keyword) => text.includes(keyword));
  }

  /**
   * Get ISO week number
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  /**
   * Load logs from parsed data
   */
  loadLogs(entries: LogEntry[]): void {
    this.logs = entries;
    this.analysisCache = null; // Clear cache
  }

  /**
   * Add logs to existing collection
   * Uses batching to avoid stack overflow with large arrays
   */
  addLogs(entries: LogEntry[]): void {
    // For large arrays, push in batches to avoid stack overflow
    const BATCH_SIZE = 1000;
    
    if (entries.length < BATCH_SIZE) {
      this.logs.push(...entries);
    } else {
      // Process in batches
      for (let i = 0; i < entries.length; i += BATCH_SIZE) {
        const batch = entries.slice(i, i + BATCH_SIZE);
        this.logs.push(...batch);
      }
    }
    
    this.analysisCache = null;
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    this.analysisCache = null;
  }

  /**
   * Get unique countries from logs
   */
  getAvailableCountries(): string[] {
    const countries = new Set<string>();
    this.logs.forEach(log => countries.add(log.country));
    return Array.from(countries).sort();
  }

  /**
   * Get unique environments from logs
   */
  getAvailableEnvironments(): string[] {
    const environments = new Set<string>();
    this.logs.forEach(log => environments.add(log.environment));
    return Array.from(environments).sort();
  }

  /**
   * Get comprehensive error analysis
   * OPTIMIZED: Uses efficient algorithms and early termination
   */
  analyzeErrors(country?: string, environment?: string, startDate?: string, endDate?: string): ErrorAnalysis {
    // Don't cache when filtering
    const hasFilters = (country && country !== 'all') || (environment && environment !== 'all') || startDate || endDate;
    
    if (!hasFilters && this.analysisCache) {
      return this.analysisCache;
    }

    let filteredLogs = this.logs;
    
    // Single-pass filter to reduce iterations
    if (country || environment || startDate || endDate) {
      const startDateObj = startDate ? new Date(startDate) : null;
      const endDateObj = endDate ? new Date(endDate) : null;
      if (endDateObj) endDateObj.setHours(23, 59, 59, 999);
      if (startDateObj) startDateObj.setHours(0, 0, 0, 0);
      
      filteredLogs = this.logs.filter(log => {
        if (country && country !== 'all' && log.country.toLowerCase() !== country.toLowerCase()) return false;
        if (environment && environment !== 'all' && log.environment !== environment) return false;
        if (startDateObj && log.date < startDateObj) return false;
        if (endDateObj && log.date > endDateObj) return false;
        return true;
      });
    }
    
    const errors = filteredLogs.filter(log => log.severity === 'Error' || log.severity === 'Fatal');
    const totalRequests = filteredLogs.length;
    const totalErrors = errors.length;
    
    if (totalErrors === 0) {
      // Return empty analysis structure
      return {
        totalRequests,
        totalErrors: 0,
        errorRate: 0,
        peakHour: '00:00',
        peakDay: 'Mon',
        topErrorTypes: [],
        errorsByHour: Array.from({ length: 24 }, (_, i) => ({ hour: i.toString().padStart(2, '0'), count: 0 })),
        errorsByDay: [],
        errorsBySeverity: [],
        errorsByCategory: [],
        topOperationsWithErrors: [],
        errorFrequencyOverTime: [],
        cumulativeErrorGrowth: [],
        peakVsOffPeak: { peakHours: { hours: '09:00-17:00', count: 0, percentage: 0 }, offPeakHours: { hours: 'Other Hours', count: 0, percentage: 0 } },
        errorHeatmap: [],
        errorDistributionByDay: [],
        errorsByWeek: [],
        errorTrendByOperation: [],
        errorRateByHour: [],
        operationSuccessRate: [],
        customersNeedingAttention: [],
        unknownOperationSamples: [],
      };
    }
    
    // Pre-allocate maps for efficiency
    const errorTypeCounts = new Map<string, number>();
    const hourCounts = new Map<number, number>();
    const dayCounts = new Map<string, number>();
    const severityCounts = new Map<string, number>();
    const categoryCounts = new Map<string, number>();
    const operationCounts = new Map<string, number>();
    const dateCounts = new Map<string, number>();
    const heatmapData = new Map<string, number>();
    const weekCounts = new Map<number, number>();
    const operationSuccessCounts = new Map<string, { success: number; total: number }>();
    const customerStats = new Map<string, { total: number; errors: number; important: number; sampleOperation: string }>();
    
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    let peakHours = 0;
    
    // Single pass through errors to populate all maps
    for (const error of errors) {
      errorTypeCounts.set(error.errorType, (errorTypeCounts.get(error.errorType) || 0) + 1);
      hourCounts.set(error.hour, (hourCounts.get(error.hour) || 0) + 1);
      dayCounts.set(error.dayOfWeek, (dayCounts.get(error.dayOfWeek) || 0) + 1);
      severityCounts.set(error.severity, (severityCounts.get(error.severity) || 0) + 1);
      categoryCounts.set(error.category, (categoryCounts.get(error.category) || 0) + 1);
      operationCounts.set(error.operation, (operationCounts.get(error.operation) || 0) + 1);
      
      const dateKey = error.date.toISOString().split('T')[0];
      dateCounts.set(dateKey, (dateCounts.get(dateKey) || 0) + 1);
      
      const heatmapKey = `${error.dayOfWeek}-${error.hour}`;
      heatmapData.set(heatmapKey, (heatmapData.get(heatmapKey) || 0) + 1);
      
      weekCounts.set(error.weekNumber, (weekCounts.get(error.weekNumber) || 0) + 1);
      
      if (error.hour >= 9 && error.hour <= 17) peakHours++;
    }
    
    // Single pass through all logs for operation success rates
    for (const log of filteredLogs) {
      const existing = operationSuccessCounts.get(log.operation) || { success: 0, total: 0 };
      existing.total++;
      if (log.severity === 'Info' || log.severity === 'Debug') {
        existing.success++;
      }
      operationSuccessCounts.set(log.operation, existing);

      const customerKey = (log.customerId || '').trim();
      if (customerKey) {
        const stats = customerStats.get(customerKey) || { total: 0, errors: 0, important: 0, sampleOperation: log.operation };
        stats.total++;
        if (log.severity === 'Error' || log.severity === 'Fatal') {
          stats.errors++;
        }
        if (this.isImportantTransaction(log.operation, log.message)) {
          stats.important++;
        }
        if (!stats.sampleOperation && log.operation) {
          stats.sampleOperation = log.operation;
        }
        customerStats.set(customerKey, stats);
      }
    }
    
    // Build results from maps (avoiding multiple iterations)
    const topErrorTypes = Array.from(errorTypeCounts.entries())
      .map(([errorType, count]) => ({ errorType, count, percentage: (count / totalErrors) * 100 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    const errorsByHour = Array.from({ length: 24 }, (_, hour) => ({
      hour: hour.toString().padStart(2, '0'),
      count: hourCounts.get(hour) || 0,
    }));
    
    const peakHourData = errorsByHour.reduce((max, curr) => curr.count > max.count ? curr : max);
    const peakHour = `${peakHourData.hour}:00`;

    const errorsByDay = dayOrder.map(day => ({
      day: day.substring(0, 3),
      count: dayCounts.get(day) || 0,
    }));
    
    const peakDayData = errorsByDay.reduce((max, curr) => curr.count > max.count ? curr : max);

    const errorsBySeverity = Array.from(severityCounts.entries())
      .map(([severity, count]) => ({ severity, count, percentage: (count / totalErrors) * 100 }));

    const errorsByCategory = Array.from(categoryCounts.entries())
      .map(([category, count]) => ({
        category: category === 'system' ? 'system error' : category === 'data' ? 'data error' : category,
        count,
        percentage: (count / totalErrors) * 100,
      }));

    const topOperationsWithErrors = Array.from(operationCounts.entries())
      .map(([operation, count]) => ({ operation, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const sortedDates = Array.from(dateCounts.keys()).sort();
    const errorFrequencyOverTime = sortedDates.map((date, index) => ({
      date,
      count: dateCounts.get(date) || 0,
      trend: index > 0 ? (dateCounts.get(date) || 0) - (dateCounts.get(sortedDates[index - 1]) || 0) : 0,
    }));

    let cumulative = 0;
    const cumulativeErrorGrowth = sortedDates.map(date => {
      cumulative += dateCounts.get(date) || 0;
      return { date, cumulative };
    });

    const errorHeatmap = dayOrder.flatMap(day =>
      Array.from({ length: 24 }, (_, hour) => ({
        day: day.substring(0, 3),
        hour,
        count: heatmapData.get(`${day}-${hour}`) || 0,
      }))
    );

    const offPeakHours = totalErrors - peakHours;
    const peakVsOffPeak = {
      peakHours: {
        hours: '09:00-17:00',
        count: peakHours,
        percentage: (peakHours / totalErrors) * 100,
      },
      offPeakHours: {
        hours: 'Other Hours',
        count: offPeakHours,
        percentage: (offPeakHours / totalErrors) * 100,
      },
    };

    const errorDistributionByDay = dayOrder.map(day => {
      const dayErrors = errors.filter(e => e.dayOfWeek === day).map(e => e.hour);
      if (dayErrors.length === 0) {
        return { day: day.substring(0, 3), min: 0, q1: 0, median: 0, q3: 0, max: 0 };
      }
      
      dayErrors.sort((a, b) => a - b);
      const min = Math.min(...dayErrors);
      const max = Math.max(...dayErrors);
      const median = dayErrors[Math.floor(dayErrors.length / 2)];
      const q1 = dayErrors[Math.floor(dayErrors.length * 0.25)];
      const q3 = dayErrors[Math.floor(dayErrors.length * 0.75)];
      
      return { day: day.substring(0, 3), min, q1, median, q3, max };
    });

    const weeks = Array.from(weekCounts.keys()).sort((a, b) => a - b);
    const errorsByWeek = weeks.map((week, index) => ({
      week,
      count: weekCounts.get(week) || 0,
      trendValue: index > 0 ? (weekCounts.get(week) || 0) - (weekCounts.get(weeks[index - 1]) || 0) : 0,
    }));
    
    // New analysis: Error rate by hour
    const errorRateByHour = errorsByHour.map(({ hour, count }) => ({
      hour: parseInt(hour),
      errorCount: count,
      errorRate: filteredLogs.filter(l => l.hour === parseInt(hour)).length > 0 
        ? (count / filteredLogs.filter(l => l.hour === parseInt(hour)).length) * 100 
        : 0,
    }));
    
    // New analysis: Operation success rate
    const operationSuccessRate = Array.from(operationSuccessCounts.entries())
      .map(([operation, { success, total }]) => ({
        operation,
        successRate: ((success / total) * 100).toFixed(1),
        total,
        failed: total - success,
      }))
      .sort((a, b) => parseFloat(a.successRate) - parseFloat(b.successRate))
      .slice(0, 10);
    
    // New analysis: Errors by operation (trend)
    const errorTrendByOperation = Array.from(operationCounts.entries())
      .map(([operation, count]) => ({ operation, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const customersNeedingAttention = Array.from(customerStats.entries())
      .map(([customerId, stats]) => {
        const errorRate = stats.total > 0 ? (stats.errors / stats.total) * 100 : 0;
        const attentionScore = (stats.errors * 2) + (stats.important * 3) + Math.round(errorRate * 0.5);
        return {
          customerId,
          errorCount: stats.errors,
          totalTransactions: stats.total,
          errorRate,
          importantTransactions: stats.important,
          attentionScore,
          sampleOperation: stats.sampleOperation || 'Unknown',
        };
      })
      .filter((item) => item.customerId.toLowerCase() !== 'unknown')
      .sort((a, b) => b.attentionScore - a.attentionScore)
      .slice(0, 10);

    const unknownOperationSamples = errors
      .filter((entry) => entry.operation === 'Unknown')
      .slice(0, 5)
      .map((entry) => ({
        message: entry.message,
        timestamp: entry.timestamp,
        country: entry.country,
        environment: entry.environment,
      }));

    const analysis: ErrorAnalysis = {
      totalRequests,
      totalErrors,
      errorRate: (totalErrors / totalRequests) * 100,
      peakHour,
      peakDay: peakDayData.day,
      topErrorTypes,
      errorsByHour,
      errorsByDay,
      errorsByWeek,
      errorFrequencyOverTime,
      cumulativeErrorGrowth,
      peakVsOffPeak,
      errorHeatmap,
      errorDistributionByDay,
      errorsBySeverity,
      errorsByCategory,
      topOperationsWithErrors,
      errorTrendByOperation,
      errorRateByHour,
      operationSuccessRate,
      customersNeedingAttention,
      unknownOperationSamples,
    };

    // Only cache when analyzing all countries and all environments
    if (!hasFilters) {
      this.analysisCache = analysis;
    }

    return analysis;
  }

  /**
   * Get current loaded logs
   */
  getLogs(): LogEntry[] {
    return this.logs;
  }

  /**
   * Filter logs by criteria
   */
  filterLogs(criteria: {
    country?: string;
    environment?: 'PROD' | 'INDUS';
    severity?: string;
    startDate?: Date;
    endDate?: Date;
  }): LogEntry[] {
    return this.logs.filter(log => {
      if (criteria.country && log.country !== criteria.country) return false;
      if (criteria.environment && log.environment !== criteria.environment) return false;
      if (criteria.severity && log.severity !== criteria.severity) return false;
      if (criteria.startDate && log.date < criteria.startDate) return false;
      if (criteria.endDate && log.date > criteria.endDate) return false;
      return true;
    });
  }
}

export const logAnalysisService = new LogAnalysisService();
