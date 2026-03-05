/**
 * User Story Logger
 * Logs all user interactions and prompts as user stories
 */

import { UserStory, SeverityLevel, UserStoryStatus } from '@/types';
import { CURRENT_ENVIRONMENT } from '@/config/environments';
import { STORAGE_KEYS } from '@/constants';

interface LoggerConfig {
  storageType: 'memory' | 'localStorage' | 'file';
  maxStoredStories: number;
  autoSave: boolean;
}

class UserStoryLogger {
  private stories: UserStory[] = [];
  private config: LoggerConfig;
  private storyIdCounter: number = 0;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      storageType: 'localStorage',
      maxStoredStories: 1000,
      autoSave: true,
      ...config,
    };

    this.loadStories();
  }

  /**
   * Log a new user story (prompt)
   */
  public logPrompt(
    title: string,
    description: string,
    promptContent: string,
    options?: {
      country?: string;
      environment?: 'PROD' | 'INDUS';
      severity?: SeverityLevel;
      status?: UserStoryStatus;
      tags?: string[];
      author?: string;
      metadata?: Record<string, any>;
    }
  ): UserStory {
    const story: UserStory = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      title,
      description,
      country: options?.country || 'global',
      environment: options?.environment || CURRENT_ENVIRONMENT,
      severity: options?.severity || 'medium',
      status: options?.status || 'backlog',
      promptContent,
      tags: options?.tags || [],
      author: options?.author,
      metadata: options?.metadata,
    };

    this.stories.push(story);

    if (this.config.maxStoredStories && this.stories.length > this.config.maxStoredStories) {
      this.stories = this.stories.slice(-this.config.maxStoredStories);
    }

    if (this.config.autoSave) {
      this.saveStories();
    }

    return story;
  }

  /**
   * Log a response to a prompt
   */
  public logResponse(storyId: string, responseContent: string): UserStory | null {
    const story = this.stories.find((s) => s.id === storyId);
    if (story) {
      story.responseContent = responseContent;
      story.status = 'completed';

      if (this.config.autoSave) {
        this.saveStories();
      }

      return story;
    }
    return null;
  }

  /**
   * Update a user story status
   */
  public updateStoryStatus(
    storyId: string,
    status: UserStoryStatus,
    metadata?: Record<string, any>
  ): UserStory | null {
    const story = this.stories.find((s) => s.id === storyId);
    if (story) {
      story.status = status;
      if (metadata) {
        story.metadata = { ...story.metadata, ...metadata };
      }

      if (this.config.autoSave) {
        this.saveStories();
      }

      return story;
    }
    return null;
  }

  /**
   * Get all stories
   */
  public getAllStories(): UserStory[] {
    return [...this.stories];
  }

  /**
   * Filter stories
   */
  public filterStories(predicate: (story: UserStory) => boolean): UserStory[] {
    return this.stories.filter(predicate);
  }

  /**
   * Get stories by country
   */
  public getStoriesByCountry(country: string): UserStory[] {
    return this.stories.filter((s) => s.country === country);
  }

  /**
   * Get stories by environment
   */
  public getStoriesByEnvironment(environment: 'PROD' | 'INDUS'): UserStory[] {
    return this.stories.filter((s) => s.environment === environment);
  }

  /**
   * Get stories by severity
   */
  public getStoriesBySeverity(severity: SeverityLevel): UserStory[] {
    return this.stories.filter((s) => s.severity === severity);
  }

  /**
   * Export stories as JSON
   */
  public exportAsJSON(): string {
    return JSON.stringify(this.stories, null, 2);
  }

  /**
   * Export stories as CSV
   */
  public exportAsCSV(): string {
    if (this.stories.length === 0) return '';

    const headers = ['ID', 'Timestamp', 'Title', 'Country', 'Environment', 'Severity', 'Status', 'Tags'].join(',');
    const rows = this.stories.map((s) =>
      [
        s.id || '',
        s.timestamp,
        `"${(s.title || '').replace(/"/g, '""')}"`,
        s.country || '',
        s.environment || '',
        s.severity || '',
        s.status || '',
        (s.tags || []).join(';'),
      ].join(',')
    );

    return [headers, ...rows].join('\n');
  }

  /**
   * Clear all stories
   */
  public clearAll(): void {
    this.stories = [];
    this.saveStories();
  }

  /**
   * Get story count
   */
  public getCount(): number {
    return this.stories.length;
  }

  // Private methods

  private generateId(): string {
    return `story-${Date.now()}-${++this.storyIdCounter}`;
  }

  private saveStories(): void {
    if (this.config.storageType === 'localStorage' && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.USER_STORIES, JSON.stringify(this.stories));
      } catch (error) {
        console.error('Failed to save stories to localStorage:', error);
      }
    }
  }

  private loadStories(): void {
    if (this.config.storageType === 'localStorage' && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.USER_STORIES);
        if (stored) {
          const parsed = JSON.parse(stored);
          this.stories = Array.isArray(parsed) ? parsed : [];
        }
      } catch (error) {
        console.error('Failed to load stories from localStorage:', error);
        this.stories = [];
      }
    }
  }
}

// Create and export singleton instance
export const userStoryLogger = new UserStoryLogger({
  storageType: 'localStorage',
  maxStoredStories: 1000,
  autoSave: true,
});

export default UserStoryLogger;
