// components/APIErrorDisplay.tsx
"use client";

import { APIError } from "@/app/hook/useAPIErrorHandler";

interface APIErrorDisplayProps {
  error: APIError | null;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export function APIErrorDisplay({ error, onDismiss, onRetry }: APIErrorDisplayProps) {
  if (!error) return null;

  const getErrorColor = (status: number) => {
    if (status === 429) return 'bg-yellow-50 border-yellow-400 text-yellow-700';
    if (status === 401 || status === 403) return 'bg-red-50 border-red-400 text-red-700';
    if (status === 404) return 'bg-blue-50 border-blue-400 text-blue-700';
    if (status >= 500) return 'bg-orange-50 border-orange-400 text-orange-700';
    return 'bg-gray-50 border-gray-400 text-gray-700';
  };

  const getIcon = (status: number) => {
    if (status === 429) return '⏳';
    if (status === 401 || status === 403) return '🔒';
    if (status === 404) return '🔍';
    if (status >= 500) return '⚠️';
    return '❌';
  };

  const getTitle = (status: number) => {
    if (status === 429) return 'Rate Limit Exceeded';
    if (status === 401) return 'Session Expired';
    if (status === 403) return 'Access Denied';
    if (status === 404) return 'Not Found';
    if (status >= 500) return 'Server Error';
    return 'Error';
  };

  return (
    <div className={`p-4 rounded-lg border ${getErrorColor(error.status)} mb-4`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className="text-xl">{getIcon(error.status)}</span>
          <div>
            <h3 className="font-semibold">{getTitle(error.status)}</h3>
            <p className="text-sm mt-1">{error.message}</p>
            {error.retryAfter && (
              <p className="text-sm mt-1 opacity-75">
                Please wait {error.retryAfter} seconds before retrying.
              </p>
            )}
            {error.endpoint && error.endpoint !== 'unknown' && (
              <p className="text-xs mt-1 opacity-50">
                Endpoint: {error.endpoint}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onRetry && error.status === 429 && (
            <button
              onClick={onRetry}
              className="px-3 py-1 text-sm bg-white rounded border hover:bg-gray-50 transition-colors"
            >
              Retry
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}