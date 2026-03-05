/**
 * React Hook for User Story Logging
 * Provides easy access to user story logging in React components
 */

import { useCallback, useEffect, useRef } from 'react';
import { userStoryLogger } from '@/lib/logging/logger';
import { UserStory, SeverityLevel, UserStoryStatus } from '@/types';
import { CURRENT_ENVIRONMENT } from '@/config/environments';

interface UseUserStoryOptions {
  country?: string;
  environment?: 'PROD' | 'INDUS';
  autoSave?: boolean;
}

/**
 * Hook to manage user story logging
 */
export function useUserStory(options: UseUserStoryOptions = {}) {
  const storyIdRef = useRef<string | null>(null);
  const { country = 'global', environment = CURRENT_ENVIRONMENT, autoSave = true } = options;

  /**
   * Log a new prompt
   */
  const logPrompt = useCallback(
    (
      title: string,
      description: string,
      promptContent: string,
      additionalOptions?: {
        severity?: SeverityLevel;
        status?: UserStoryStatus;
        tags?: string[];
        author?: string;
        metadata?: Record<string, any>;
      }
    ): UserStory => {
      const story = userStoryLogger.logPrompt(title, description, promptContent, {
        country,
        environment,
        ...additionalOptions,
      });

      storyIdRef.current = story.id || null;
      return story;
    },
    [country, environment]
  );

  /**
   * Log a response to the prompt
   */
  const logResponse = useCallback((responseContent: string): UserStory | null => {
    if (storyIdRef.current) {
      return userStoryLogger.logResponse(storyIdRef.current, responseContent);
    }
    return null;
  }, []);

  /**
   * Update story status
   */
  const updateStatus = useCallback(
    (status: UserStoryStatus, metadata?: Record<string, any>): UserStory | null => {
      if (storyIdRef.current) {
        return userStoryLogger.updateStoryStatus(storyIdRef.current, status, metadata);
      }
      return null;
    },
    []
  );

  /**
   * Get current story ID
   */
  const getCurrentStoryId = useCallback(() => storyIdRef.current, []);

  return {
    logPrompt,
    logResponse,
    updateStatus,
    getCurrentStoryId,
  };
}

/**
 * Hook to retrieve stored user stories
 */
export function useUserStories() {
  const getAllStories = useCallback(() => userStoryLogger.getAllStories(), []);

  const getStoriesByCountry = useCallback(
    (country: string) => userStoryLogger.getStoriesByCountry(country),
    []
  );

  const getStoriesByEnvironment = useCallback(
    (environment: 'PROD' | 'INDUS') => userStoryLogger.getStoriesByEnvironment(environment),
    []
  );

  const getStoriesBySeverity = useCallback(
    (severity: SeverityLevel) => userStoryLogger.getStoriesBySeverity(severity),
    []
  );

  const exportJSON = useCallback(() => userStoryLogger.exportAsJSON(), []);

  const exportCSV = useCallback(() => userStoryLogger.exportAsCSV(), []);

  const getCount = useCallback(() => userStoryLogger.getCount(), []);

  return {
    getAllStories,
    getStoriesByCountry,
    getStoriesByEnvironment,
    getStoriesBySeverity,
    exportJSON,
    exportCSV,
    getCount,
  };
}
