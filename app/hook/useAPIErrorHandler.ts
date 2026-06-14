"use client";

import { useCallback } from "react";

// Store for error listeners since hooks can't be called outside components
let errorListeners: Set<(error: any) => void> = new Set();

export function registerErrorListener(listener: (error: any) => void) {
  errorListeners.add(listener);
  return () => {
    errorListeners.delete(listener);
  };
}

export function dispatchAPIError(error: any) {
  console.error("🚨 API Error dispatched:", error);
  errorListeners.forEach(listener => listener(error));
}

export function useAPIErrorHandler() {
  const handleError = useCallback((error: any) => {
    console.error("📡 Error caught in useAPIErrorHandler:", error);
    
    // Check if it's a rate limit error (429)
    if (error?.status === 429 || error?.statusCode === 429) {
      dispatchAPIError({
        status: 429,
        message: error.message || "Too many requests, please slow down and try again later.",
        retryAfter: error.retryAfter || error.retry_after || 5,
        endpoint: error.endpoint || "unknown"
      });
      return true;
    }
    
    // Handle other error statuses
    if (error?.status === 401 || error?.statusCode === 401) {
      dispatchAPIError({
        status: 401,
        message: "Your session has expired. Please login again.",
        endpoint: error.endpoint || "unknown"
      });
      return true;
    }
    
    if (error?.status === 403 || error?.statusCode === 403) {
      dispatchAPIError({
        status: 403,
        message: "You don't have permission to perform this action.",
        endpoint: error.endpoint || "unknown"
      });
      return true;
    }
    
    if (error?.status === 404 || error?.statusCode === 404) {
      dispatchAPIError({
        status: 404,
        message: "The requested resource was not found.",
        endpoint: error.endpoint || "unknown"
      });
      return true;
    }
    
    if (error?.status === 500 || error?.statusCode === 500) {
      dispatchAPIError({
        status: 500,
        message: "Server error. Please try again later.",
        endpoint: error.endpoint || "unknown"
      });
      return true;
    }
    
    // Handle other errors
    if (error instanceof Error) {
      dispatchAPIError({
        status: error.name === "TypeError" ? 0 : 500,
        message: error.message || "An unexpected error occurred.",
        endpoint: "unknown"
      });
      return true;
    }
    
    return false;
  }, []);

  return { handleError };
}
