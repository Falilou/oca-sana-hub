/**
 * Indexed Database Service
 * High-performance log storage with indexing system
 * Stores parsed logs in indexed JSON format for fast querying
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { LogEntry } from './logAnalysisService';

export interface IndexedLog {
  id: string;
  timestamp: string;
  date: string;
  severity: string;
  category: string;
  operation: string;
  errorType: string;
  message: string;
  customerId?: string;
  country: string;
  environment: string;
  hour: number;
  dayOfWeek: string;
  weekNumber: number;
  ingestionTime: string;
}

export interface DatabaseIndex {
  totalLogs: number;
  totalErrors: number;
  countries: string[];
  environments: string[];
  severeErrorTypes: string[];
  lastUpdated: string;
  indexedAt: number;
}

class IndexedDatabaseService {
  private dataDir: string;
  private indexFile: string;
  private logsFile: string;
  private index: Map<string, DatabaseIndex> = new Map();
  private indexCache: DatabaseIndex | null = null;
  private lastIndexedTime: number = 0;

  constructor() {
    this.dataDir = path.join(process.cwd(), '.next-indexed-logs');
    this.indexFile = path.join(this.dataDir, 'index.json');
    this.logsFile = path.join(this.dataDir, 'logs.json');
    this.ensureDataDir();
    this.initializeDatabase();
  }

  /**
   * Ensure data directory exists
   */
  private ensureDataDir(): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
        console.log(`[DB] Created data directory: ${this.dataDir}`);
      }
    } catch (error) {
      console.error(`[DB] Error creating data directory:`, error);
    }
  }

  /**
   * Initialize database - load existing index
   */
  private initializeDatabase(): void {
    try {
      if (fs.existsSync(this.indexFile)) {
        const data = fs.readFileSync(this.indexFile, 'utf-8');
        this.indexCache = JSON.parse(data);
        this.lastIndexedTime = this.indexCache?.indexedAt || 0;
        console.log(`[DB] Loaded index: ${this.indexCache?.totalLogs || 0} logs`);
      } else {
        this.createEmptyIndex();
      }
    } catch (error) {
      console.error(`[DB] Error initializing database:`, error);
      this.createEmptyIndex();
    }
  }

  /**
   * Create empty index
   */
  private createEmptyIndex(): void {
    this.indexCache = {
      totalLogs: 0,
      totalErrors: 0,
      countries: [],
      environments: [],
      severeErrorTypes: [],
      lastUpdated: new Date().toISOString(),
      indexedAt: Date.now(),
    };
    this.saveIndex();
  }

  /**
   * Save index to disk
   */
  private saveIndex(): void {
    try {
      if (this.indexCache) {
        fs.writeFileSync(this.indexFile, JSON.stringify(this.indexCache, null, 2));
        this.lastIndexedTime = this.indexCache.indexedAt;
      }
    } catch (error) {
      console.error(`[DB] Error saving index:`, error);
    }
  }

  /**
   * Ingest logs into database with indexing
   * Use bulkMode for large ingestions to improve performance
   */
  async ingestLogs(logs: LogEntry[], bulkMode = false): Promise<{
    ingested: number;
    indexed: number;
    errors: string[];
  }> {
    try {
      if (logs.length === 0) {
        return { ingested: 0, indexed: 0, errors: [] };
      }

      const baseTime = Date.now();
      const indexedLogs: IndexedLog[] = logs.map((log, idx) => ({
        id: `${log.country}_${log.environment}_${baseTime}_${idx}`,
        timestamp: log.timestamp,
        date: log.date.toISOString(),
        severity: log.severity,
        category: log.category,
        operation: log.operation,
        errorType: log.errorType,
        message: log.message,
        customerId: log.customerId,
        country: log.country,
        environment: log.environment,
        hour: log.hour,
        dayOfWeek: log.dayOfWeek,
        weekNumber: log.weekNumber,
        ingestionTime: new Date().toISOString(),
      }));

      // Append to logs file - use bulk mode for large ingestions
      if (bulkMode) {
        this.bulkAppendLogs(indexedLogs);
      } else {
        this.appendLogs(indexedLogs);
      }

      // Update index
      this.updateIndex(indexedLogs);

      return {
        ingested: indexedLogs.length,
        indexed: indexedLogs.length,
        errors: [],
      };
    } catch (error) {
      return {
        ingested: 0,
        indexed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Generate content-based hash for a log entry to detect duplicates
   */
  private getLogHash(log: IndexedLog): string {
    // Create hash from unique content (timestamp + country + env + operation + message)
    const content = `${log.timestamp}|${log.country}|${log.environment}|${log.operation}|${log.message.substring(0, 200)}`;
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * Bulk append logs efficiently with deduplication
   * Used for large ingestions - appends directly to file
   */
  private bulkAppendLogs(logs: IndexedLog[]): void {
    try {
      // For bulk operations, append to file without reading existing data
      if (fs.existsSync(this.logsFile)) {
        // Read only the metadata to check if we need to trim
        const stats = fs.statSync(this.logsFile);
        
        // If file is getting too large (>100MB), do a full read/trim with dedup
        if (stats.size > 100 * 1024 * 1024) {
          this.appendLogs(logs);
          return;
        }
        
        // Read existing logs and build hash set for deduplication
        const existingData = fs.readFileSync(this.logsFile, 'utf-8');
        let existingLogs: IndexedLog[] = [];
        
        try {
          existingLogs = JSON.parse(existingData);
        } catch {
          existingLogs = [];
        }
        
        // Build hash set of existing logs
        const existingHashes = new Set<string>();
        existingLogs.forEach(log => {
          existingHashes.add(this.getLogHash(log));
        });
        
        // Filter out duplicates from new logs
        const uniqueNewLogs = logs.filter(log => {
          const hash = this.getLogHash(log);
          if (existingHashes.has(hash)) {
            return false; // Skip duplicate
          }
          existingHashes.add(hash); // Add to set for intra-batch dedup
          return true;
        });
        
        if (uniqueNewLogs.length < logs.length) {
          console.log(`[DB] Filtered out ${logs.length - uniqueNewLogs.length} duplicate logs`);
        }
        
        const combined = [...existingLogs, ...uniqueNewLogs];
        fs.writeFileSync(this.logsFile, JSON.stringify(combined));
      } else {
        // New file - remove intra-batch duplicates
        const uniqueLogs = this.removeDuplicatesFromArray(logs);
        if (uniqueLogs.length < logs.length) {
          console.log(`[DB] Filtered out ${logs.length - uniqueLogs.length} duplicate logs in new database`);
        }
        fs.writeFileSync(this.logsFile, JSON.stringify(uniqueLogs));
      }
    } catch (error) {
      console.error(`[DB] Error bulk appending logs:`, error);
    }
  }

  /**
   * Remove duplicates from an array of logs
   */
  private removeDuplicatesFromArray(logs: IndexedLog[]): IndexedLog[] {
    const seen = new Set<string>();
    return logs.filter(log => {
      const hash = this.getLogHash(log);
      if (seen.has(hash)) {
        return false;
      }
      seen.add(hash);
      return true;
    });
  }

  /**
   * Append logs to storage file
   */
  private appendLogs(logs: IndexedLog[]): void {
    try {
      let existingLogs: IndexedLog[] = [];

      if (fs.existsSync(this.logsFile)) {
        const data = fs.readFileSync(this.logsFile, 'utf-8');
        existingLogs = JSON.parse(data);
      }

      // Keep only last 100,000 logs to maintain performance
      const combined = [...existingLogs, ...logs];
      const trimmed = combined.slice(Math.max(0, combined.length - 100000));

      fs.writeFileSync(this.logsFile, JSON.stringify(trimmed, null, 2));
    } catch (error) {
      console.error(`[DB] Error appending logs:`, error);
    }
  }

  /**
   * Update index metadata
   */
  private updateIndex(logs: IndexedLog[]): void {
    try {
      if (!this.indexCache) {
        this.createEmptyIndex();
        return;
      }

      // Update totals
      this.indexCache.totalLogs += logs.length;
      this.indexCache.totalErrors += logs.filter(
        (log) => log.severity === 'Error' || log.severity === 'Fatal'
      ).length;

      // Update countries
      const newCountries = new Set(this.indexCache.countries);
      logs.forEach((log) => newCountries.add(log.country));
      this.indexCache.countries = Array.from(newCountries).sort();

      // Update environments
      const newEnvs = new Set(this.indexCache.environments);
      logs.forEach((log) => newEnvs.add(log.environment));
      this.indexCache.environments = Array.from(newEnvs).sort();

      // Update error types
      const errorTypes = new Set(this.indexCache.severeErrorTypes);
      logs
        .filter((log) => log.errorType && log.errorType !== 'Unknown')
        .forEach((log) => errorTypes.add(log.errorType));
      this.indexCache.severeErrorTypes = Array.from(errorTypes)
        .sort()
        .slice(0, 50); // Keep top 50

      // Update timestamp
      this.indexCache.lastUpdated = new Date().toISOString();
      this.indexCache.indexedAt = Date.now();

      this.saveIndex();
    } catch (error) {
      console.error(`[DB] Error updating index:`, error);
    }
  }

  /**
   * Get current index
   */
  getIndex(): DatabaseIndex | null {
    return this.indexCache;
  }

  /**
   * Query logs by filters
   */
  queryLogs(filters: {
    country?: string;
    environment?: string;
    severity?: string;
    limit?: number;
  }): IndexedLog[] {
    try {
      if (!fs.existsSync(this.logsFile)) {
        return [];
      }

      const data = fs.readFileSync(this.logsFile, 'utf-8');
      let logs: IndexedLog[] = JSON.parse(data);

      // Apply filters
      if (filters.country) {
        logs = logs.filter((log) => log.country === filters.country);
      }
      if (filters.environment) {
        logs = logs.filter((log) => log.environment === filters.environment);
      }
      if (filters.severity) {
        logs = logs.filter((log) => log.severity === filters.severity);
      }

      // Apply limit
      const limit = filters.limit || 1000;
      return logs.slice(-limit);
    } catch (error) {
      console.error(`[DB] Error querying logs:`, error);
      return [];
    }
  }

  /**
   * Deduplicate all logs in database
   * Removes duplicate entries based on content hash
   */
  async deduplicateDatabase(): Promise<{
    originalCount: number;
    duplicatesRemoved: number;
    finalCount: number;
  }> {
    try {
      if (!fs.existsSync(this.logsFile)) {
        return { originalCount: 0, duplicatesRemoved: 0, finalCount: 0 };
      }

      console.log('[DB] Starting deduplication...');
      const data = fs.readFileSync(this.logsFile, 'utf-8');
      const allLogs: IndexedLog[] = JSON.parse(data);
      const originalCount = allLogs.length;

      // Remove duplicates
      const uniqueLogs = this.removeDuplicatesFromArray(allLogs);
      const duplicatesRemoved = originalCount - uniqueLogs.length;

      if (duplicatesRemoved > 0) {
        // Write back deduplicated logs
        fs.writeFileSync(this.logsFile, JSON.stringify(uniqueLogs));
        
        // Rebuild index
        this.indexCache = null;
        this.initializeDatabase();
        this.updateIndex(uniqueLogs);
        
        console.log(`[DB] ✓ Deduplication complete: removed ${duplicatesRemoved} duplicates (${originalCount} → ${uniqueLogs.length})`);
      } else {
        console.log('[DB] ✓ No duplicates found');
      }

      return {
        originalCount,
        duplicatesRemoved,
        finalCount: uniqueLogs.length,
      };
    } catch (error) {
      console.error(`[DB] Error during deduplication:`, error);
      return { originalCount: 0, duplicatesRemoved: 0, finalCount: 0 };
    }
  }

  /**
   * Clear all data
   */
  async clearDatabase(): Promise<void> {
    try {
      if (fs.existsSync(this.logsFile)) {
        fs.unlinkSync(this.logsFile);
      }
      this.createEmptyIndex();
      console.log('[DB] Database cleared');
    } catch (error) {
      console.error(`[DB] Error clearing database:`, error);
    }
  }

  /**
   * Get database statistics
   */
  getStats(): {
    totalLogs: number;
    totalErrors: number;
    countries: number;
    environments: number;
    errorTypes: number;
    lastUpdated: string;
  } {
    if (!this.indexCache) {
      return {
        totalLogs: 0,
        totalErrors: 0,
        countries: 0,
        environments: 0,
        errorTypes: 0,
        lastUpdated: '',
      };
    }

    return {
      totalLogs: this.indexCache.totalLogs,
      totalErrors: this.indexCache.totalErrors,
      countries: this.indexCache.countries.length,
      environments: this.indexCache.environments.length,
      errorTypes: this.indexCache.severeErrorTypes.length,
      lastUpdated: this.indexCache.lastUpdated,
    };
  }

  /**
   * Check if database has been indexed recently
   */
  isRecentlyIndexed(withinSeconds: number = 300): boolean {
    const secondsSinceIndex = (Date.now() - this.lastIndexedTime) / 1000;
    return secondsSinceIndex < withinSeconds;
  }

  /**
   * Get all indexed countries
   */
  getCountries(): string[] {
    return this.indexCache?.countries || [];
  }

  /**
   * Get all indexed environments
   */
  getEnvironments(): string[] {
    return this.indexCache?.environments || [];
  }
}

// Singleton instance
let dbInstance: IndexedDatabaseService | null = null;

export function getDatabase(): IndexedDatabaseService {
  if (!dbInstance) {
    dbInstance = new IndexedDatabaseService();
  }
  return dbInstance;
}

export default IndexedDatabaseService;
