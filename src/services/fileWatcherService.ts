/**
 * File Watcher Service
 * Monitors log directories for new or modified files
 * Provides notifications when changes are detected
 */

import fs from 'fs';
import path from 'path';

export interface FileChangeEvent {
  type: 'added' | 'modified' | 'deleted';
  filePath: string;
  fileName: string;
  size: number;
  modifiedTime: string;
  timestamp: number;
}

export interface DirectoryWatchState {
  basePath: string;
  isWatching: boolean;
  lastScanTime: number;
  fileSnapshot: Map<string, number> & { timestamp?: number };
  newFiles: FileChangeEvent[];
  modifiedFiles: FileChangeEvent[];
}

class FileWatcherService {
  private watchers: Map<string, DirectoryWatchState> = new Map();
  private scanIntervals: Map<string, NodeJS.Timeout> = new Map();
  private lastNotifications: Map<string, number> = new Map();
  private supportedExtensions = ['.log', '.txt', '.xml', '.csv'];

  /**
   * Start watching a directory for changes
   */
  startWatching(basePath: string, intervalSeconds: number = 10): DirectoryWatchState {
    try {
      const normalizedPath = path.normalize(basePath);

      // Stop existing watcher if any
      if (this.watchers.has(normalizedPath)) {
        this.stopWatching(normalizedPath);
      }

      console.log(`[Watcher] Starting to watch: ${normalizedPath}`);

      // Create initial snapshot
      const snapshot = this.createFileSnapshot(normalizedPath);

      const watchState: DirectoryWatchState = {
        basePath: normalizedPath,
        isWatching: true,
        lastScanTime: Date.now(),
        fileSnapshot: snapshot as any,
        newFiles: [],
        modifiedFiles: [],
      };

      this.watchers.set(normalizedPath, watchState);

      // Set up periodic scanning
      const interval = setInterval(() => {
        this.scanDirectory(normalizedPath);
      }, intervalSeconds * 1000);

      this.scanIntervals.set(normalizedPath, interval);

      return watchState;
    } catch (error) {
      console.error(`[Watcher] Error starting watcher:`, error);
      throw error;
    }
  }

  /**
   * Stop watching a directory
   */
  stopWatching(basePath: string): void {
    try {
      const normalizedPath = path.normalize(basePath);

      const interval = this.scanIntervals.get(normalizedPath);
      if (interval) {
        clearInterval(interval);
        this.scanIntervals.delete(normalizedPath);
      }

      this.watchers.delete(normalizedPath);
      console.log(`[Watcher] Stopped watching: ${normalizedPath}`);
    } catch (error) {
      console.error(`[Watcher] Error stopping watcher:`, error);
    }
  }

  /**
   * Create file snapshot with sizes for comparison
   */
  private createFileSnapshot(
    basePath: string
  ): Record<string, number> {
    const snapshot: Record<string, number> = {};

    try {
      if (!fs.existsSync(basePath)) {
        return snapshot;
      }

      const files = fs.readdirSync(basePath, { recursive: true });

      for (const file of files) {
        const filePath = path.join(basePath, file as string);
        const stat = fs.statSync(filePath);

        if (stat.isFile() && this.isSupportedFile(filePath)) {
          snapshot[filePath] = stat.size;
        }
      }

      return snapshot;
    } catch (error) {
      console.error(`[Watcher] Error creating snapshot:`, error);
      return snapshot;
    }
  }

  /**
   * Scan directory for changes
   */
  private scanDirectory(basePath: string): void {
    try {
      const watchState = this.watchers.get(basePath);
      if (!watchState || !watchState.isWatching) {
        return;
      }

      const newSnapshot = this.createFileSnapshot(basePath);
      const oldSnapshot = Object.fromEntries(watchState.fileSnapshot || new Map()) as Record<string, number>;

      const newFiles: FileChangeEvent[] = [];
      const modifiedFiles: FileChangeEvent[] = [];

      // Check for new and modified files
      for (const [filePath, size] of Object.entries(newSnapshot)) {
        const oldSize = oldSnapshot[filePath];

        if (!oldSize) {
          // New file
          newFiles.push(this.createFileChangeEvent('added', filePath, size));
        } else if (oldSize !== size) {
          // Modified file
          modifiedFiles.push(this.createFileChangeEvent('modified', filePath, size));
        }
      }

      // Only update if there are changes
      if (newFiles.length > 0 || modifiedFiles.length > 0) {
        watchState.newFiles = newFiles;
        watchState.modifiedFiles = modifiedFiles;
        watchState.lastScanTime = Date.now();
        watchState.fileSnapshot = newSnapshot as any;

        console.log(
          `[Watcher] Found ${newFiles.length} new and ${modifiedFiles.length} modified files in ${basePath}`
        );
      }
    } catch (error) {
      console.error(`[Watcher] Error scanning directory:`, error);
    }
  }

  /**
   * Create file change event
   */
  private createFileChangeEvent(
    type: 'added' | 'modified' | 'deleted',
    filePath: string,
    size: number
  ): FileChangeEvent {
    const stat = fs.statSync(filePath);
    return {
      type,
      filePath,
      fileName: path.basename(filePath),
      size,
      modifiedTime: new Date(stat.mtime).toISOString(),
      timestamp: Date.now(),
    };
  }

  /**
   * Get changes for a watched directory
   */
  getChanges(basePath: string): {
    newFiles: FileChangeEvent[];
    modifiedFiles: FileChangeEvent[];
  } {
    const normalizedPath = path.normalize(basePath);
    const watchState = this.watchers.get(normalizedPath);

    if (!watchState) {
      return { newFiles: [], modifiedFiles: [] };
    }

    return {
      newFiles: watchState.newFiles,
      modifiedFiles: watchState.modifiedFiles,
    };
  }

  /**
   * Clear changes (mark as read)
   */
  clearChanges(basePath: string): void {
    const normalizedPath = path.normalize(basePath);
    const watchState = this.watchers.get(normalizedPath);

    if (watchState) {
      watchState.newFiles = [];
      watchState.modifiedFiles = [];
    }
  }

  /**
   * Get notification state
   */
  getNotificationState(basePath: string): {
    hasNewFiles: boolean;
    newFileCount: number;
    hasModifiedFiles: boolean;
    modifiedFileCount: number;
    lastChangeTime: number;
  } {
    const normalizedPath = path.normalize(basePath);
    const watchState = this.watchers.get(normalizedPath);

    if (!watchState) {
      return {
        hasNewFiles: false,
        newFileCount: 0,
        hasModifiedFiles: false,
        modifiedFileCount: 0,
        lastChangeTime: 0,
      };
    }

    return {
      hasNewFiles: watchState.newFiles.length > 0,
      newFileCount: watchState.newFiles.length,
      hasModifiedFiles: watchState.modifiedFiles.length > 0,
      modifiedFileCount: watchState.modifiedFiles.length,
      lastChangeTime: watchState.lastScanTime,
    };
  }

  /**
   * Check if file is supported
   */
  private isSupportedFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return this.supportedExtensions.includes(ext) || !ext; // Include files without extension
  }

  /**
   * Get watch state
   */
  getWatchState(basePath: string): DirectoryWatchState | undefined {
    return this.watchers.get(path.normalize(basePath));
  }

  /**
   * Stop all watchers
   */
  stopAllWatchers(): void {
    for (const [basePath] of this.watchers) {
      this.stopWatching(basePath);
    }
  }

  /**
   * Get all watched directories
   */
  getWatchedDirectories(): string[] {
    return Array.from(this.watchers.keys());
  }
}

// Singleton instance
let watcherInstance: FileWatcherService | null = null;

export function getFileWatcher(): FileWatcherService {
  if (!watcherInstance) {
    watcherInstance = new FileWatcherService();
  }
  return watcherInstance;
}

export default FileWatcherService;
