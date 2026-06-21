// hooks/useAPIErrorHandler.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Store for error listeners
let errorListeners: Set<(error: any) => void> = new Set();
let globalErrorHandler: ((error: any) => void) | null = null;

export function registerErrorListener(listener: (error: any) => void) {
  errorListeners.add(listener);
  return () => {
    errorListeners.delete(listener);
  };
}

export function dispatchAPIError(error: any) {
  console.error("🚨 API Error dispatched:", error);
  
  const errorDetails = {
    status: error?.status || error?.statusCode || 500,
    message: error?.message || "An unexpected error occurred",
    endpoint: error?.endpoint || error?.url || "unknown",
    timestamp: new Date().toISOString(),
    retryAfter: error?.retryAfter || error?.retry_after || null,
  };
  
  console.error("Error details:", errorDetails);
  
  if (globalErrorHandler) {
    globalErrorHandler(errorDetails);
  }
  
  errorListeners.forEach(listener => listener(errorDetails));
  
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('api-error', { 
      detail: errorDetails 
    });
    window.dispatchEvent(event);
  }
}

export function setGlobalErrorHandler(handler: (error: any) => void) {
  globalErrorHandler = handler;
}

export interface APIError {
  status: number;
  message: string;
  endpoint?: string;
  retryAfter?: number;
  url?: string;
  timestamp?: string;
}

export interface ErrorState {
  error: APIError | null;
  isRateLimited: boolean;
  isUnauthorized: boolean;
  isNotFound: boolean;
  isServerError: boolean;
  retryAfter: number | null;
}

export function useAPIErrorHandler() {
  const router = useRouter();
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isRateLimited: false,
    isUnauthorized: false,
    isNotFound: false,
    isServerError: false,
    retryAfter: null,
  });

  const handleError = useCallback((error: any) => {
    console.error("📡 Error caught in useAPIErrorHandler:", error);
    
    const status = error?.status || error?.statusCode || 500;
    const message = error?.message || "An unexpected error occurred";
    const endpoint = error?.endpoint || error?.url || "unknown";
    const retryAfter = error?.retryAfter || error?.retry_after || null;

    setErrorState({
      error: {
        status,
        message,
        endpoint,
        retryAfter: retryAfter || undefined,
        timestamp: new Date().toISOString(),
      },
      isRateLimited: status === 429,
      isUnauthorized: status === 401,
      isNotFound: status === 404,
      isServerError: status >= 500,
      retryAfter,
    });

    // Rate limit (429)
    if (status === 429) {
      dispatchAPIError({
        status: 429,
        message: error.message || "Too many requests. Please slow down and try again later.",
        retryAfter: retryAfter || 5,
        endpoint: endpoint,
      });
      return true;
    }
    
    // Unauthorized (401) - token expired
    if (status === 401) {
      dispatchAPIError({
        status: 401,
        message: error.message || "Your session has expired. Please login again.",
        endpoint: endpoint,
      });
      
      // Redirect to login
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
        setTimeout(() => {
          router.push(`/auth?session=expired&redirect=${encodeURIComponent(window.location.pathname)}`);
        }, 1500);
      }
      return true;
    }
    
    // Forbidden (403)
    if (status === 403) {
      dispatchAPIError({
        status: 403,
        message: error.message || "You don't have permission to perform this action.",
        endpoint: endpoint,
      });
      return true;
    }
    
    // Not Found (404)
    if (status === 404) {
      dispatchAPIError({
        status: 404,
        message: error.message || "The requested resource was not found.",
        endpoint: endpoint,
      });
      return true;
    }
    
    // Server errors (500+)
    if (status >= 500) {
      dispatchAPIError({
        status: status,
        message: error.message || "Server error. Please try again later.",
        endpoint: endpoint,
      });
      return true;
    }
    
    // Client errors (400-499)
    if (status >= 400 && status < 500) {
      dispatchAPIError({
        status: status,
        message: error.message || "Client error. Please check your request.",
        endpoint: endpoint,
      });
      return true;
    }
    
    // Other errors
    if (error instanceof Error) {
      dispatchAPIError({
        status: error.name === "TypeError" ? 0 : 500,
        message: error.message || "An unexpected error occurred.",
        endpoint: endpoint,
      });
      return true;
    }
    
    // Unknown errors
    dispatchAPIError({
      status: 500,
      message: "An unexpected error occurred.",
      endpoint: endpoint,
    });
    
    return false;
  }, [router]);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isRateLimited: false,
      isUnauthorized: false,
      isNotFound: false,
      isServerError: false,
      retryAfter: null,
    });
  }, []);

  const retryRequest = useCallback(async (retryFn: () => Promise<any>) => {
    const { retryAfter } = errorState;
    if (retryAfter) {
      console.log(`⏳ Waiting ${retryAfter} seconds before retrying...`);
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    }
    clearError();
    return retryFn();
  }, [errorState.retryAfter, clearError]);

  useEffect(() => {
    const handleGlobalError = (event: CustomEvent) => {
      const error = event.detail;
      handleError(error);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('api-error', handleGlobalError as EventListener);
      setGlobalErrorHandler(handleError);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('api-error', handleGlobalError as EventListener);
        setGlobalErrorHandler(null as any);
      }
    };
  }, [handleError]);

  return {
    errorState,
    handleError,
    clearError,
    retryRequest,
    isError: !!errorState.error,
    hasRateLimit: errorState.isRateLimited,
    isUnauthorized: errorState.isUnauthorized,
    getErrorMessage: () => errorState.error?.message || null,
    getStatus: () => errorState.error?.status || null,
  };
}

// Hook for components that need to listen to errors
export function useAPIErrorListener() {
  const [latestError, setLatestError] = useState<APIError | null>(null);

  useEffect(() => {
    const listener = (error: APIError) => {
      setLatestError(error);
    };
    
    const unsubscribe = registerErrorListener(listener);
    return () => {
      unsubscribe();
      setLatestError(null);
    };
  }, []);

  return { latestError };
}