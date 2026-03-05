'use client';

import React, { useState, useEffect } from 'react';

export interface FileNotification {
  id: string;
  type: 'new_files' | 'modified_files' | 'database_update' | 'ingestion_complete' | 'info';
  title: string;
  message: string;
  count?: number;
  files?: string[];
  timestamp: number;
  dismissible: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

interface FileNotificationCenterProps {
  notifications: FileNotification[];
  onDismiss: (id: string) => void;
  onIngestNew?: () => void;
}

export const FileNotificationCenter: React.FC<FileNotificationCenterProps> = ({
  notifications,
  onDismiss,
  onIngestNew,
}) => {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 space-y-3 max-w-md z-50">
      {notifications.map((notification) => (
        <FileNotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
};

interface FileNotificationItemProps {
  notification: FileNotification;
  onDismiss: (id: string) => void;
}

const FileNotificationItem: React.FC<FileNotificationItemProps> = ({
  notification,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!notification.dismissible) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss(notification.id);
    }, 8000); // Auto-dismiss after 8 seconds

    return () => clearTimeout(timer);
  }, [notification.id, notification.dismissible, onDismiss]);

  if (!isVisible) {
    return null;
  }

  const bgColor = {
    new_files: 'from-blue-900/50 to-cyan-900/50 border-blue-700/50',
    modified_files: 'from-yellow-900/50 to-orange-900/50 border-yellow-700/50',
    database_update: 'from-purple-900/50 to-indigo-900/50 border-purple-700/50',
    ingestion_complete: 'from-green-900/50 to-emerald-900/50 border-green-700/50',
    info: 'from-slate-900/50 to-slate-800/50 border-slate-700/50',
  }[notification.type];

  const icon = {
    new_files: '📄',
    modified_files: '✏️',
    database_update: '💾',
    ingestion_complete: '✅',
    info: 'ℹ️',
  }[notification.type];

  const borderColor = {
    new_files: 'border-blue-500/50',
    modified_files: 'border-yellow-500/50',
    database_update: 'border-purple-500/50',
    ingestion_complete: 'border-green-500/50',
    info: 'border-slate-500/50',
  }[notification.type];

  const textColor = {
    new_files: 'text-blue-300',
    modified_files: 'text-yellow-300',
    database_update: 'text-purple-300',
    ingestion_complete: 'text-green-300',
    info: 'text-slate-300',
  }[notification.type];

  return (
    <div
      className={`
        bg-gradient-to-br ${bgColor}
        border ${borderColor} rounded-lg p-4 shadow-xl backdrop-blur-sm
        animate-in fade-in slide-in-from-right-4 duration-300
      `}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{icon}</span>

        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${textColor} mb-1`}>
            {notification.title}
          </h3>

          <p className="text-xs text-gray-300 mb-2">
            {notification.message}
          </p>

          {notification.count && (
            <div className="inline-block px-2 py-1 bg-black/20 rounded text-xs font-mono text-gray-200 mb-2">
              {notification.count} file{notification.count !== 1 ? 's' : ''}
            </div>
          )}

          {notification.files && notification.files.length > 0 && (
            <div className="mt-2 max-h-32 overflow-y-auto">
              <div className="text-xs space-y-1">
                {notification.files.slice(0, 5).map((file, idx) => (
                  <div key={idx} className="text-gray-300 truncate">
                    • {file}
                  </div>
                ))}
                {notification.files.length > 5 && (
                  <div className="text-gray-400 italic">
                    +{notification.files.length - 5} more...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {notification.dismissible && (
          <button
            onClick={() => {
              setIsVisible(false);
              onDismiss(notification.id);
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-200 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {notification.actionLabel && notification.onAction && (
        <button
          onClick={() => {
            notification.onAction?.();
            setIsVisible(false);
            onDismiss(notification.id);
          }}
          className="mt-3 w-full px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-xs font-semibold transition-colors"
        >
          {notification.actionLabel}
        </button>
      )}
    </div>
  );
};

export default FileNotificationCenter;
