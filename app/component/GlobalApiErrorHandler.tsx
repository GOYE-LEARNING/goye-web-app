// components/GlobalAPIErrorHandler.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdWarning, MdRefresh, MdAccessTime, MdErrorOutline, MdCloudOff, MdSpeed } from "react-icons/md";
import { FaSpinner, FaWifi, FaServer } from "react-icons/fa";
import { registerErrorListener } from "@/app/hook/useAPIErrorHandler";

interface ErrorContextType {
  showError: (error: any) => void;
  hideError: () => void;
}

const ErrorContext = createContext<ErrorContextType | null>(null);

export function useAPIError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useAPIError must be used within GlobalAPIErrorHandler");
  }
  return context;
}

// Helper to get user-friendly error message
const getUserFriendlyMessage = (error: any): { title: string; message: string; icon: React.ReactNode } => {
  // Rate limiting error (429)
  if (error?.status === 429 || error?.message?.includes("Too Many Requests") || error?.message?.includes("too many requests")) {
    return {
      title: "🌟 You're on fire! But let's take a breather",
      message: "You've been quite active! Please wait a moment before continuing. This helps keep everything running smoothly for everyone.",
      icon: <MdSpeed className="text-4xl" />
    };
  }
  
  // Network/Connection errors
  if (error?.message?.includes("Failed to fetch") || error?.message?.includes("Network")) {
    return {
      title: "📡 Connection Interrupted",
      message: "We're having trouble connecting to the server. Please check your internet connection and try again.",
      icon: <FaWifi className="text-4xl" />
    };
  }
  
  // Server errors (500, 502, 503)
  if (error?.status === 500 || error?.status === 502 || error?.status === 503) {
    return {
      title: "🔧 Server Under Maintenance",
      message: "Our servers are temporarily unavailable. Our team is working on it. Please try again in a few moments.",
      icon: <FaServer className="text-4xl" />
    };
  }
  
  // Default error
  return {
    title: "⚠️ Oops! Something went wrong",
    message: error?.message || "We encountered an unexpected issue. Please try again or contact support if the problem persists.",
    icon: <MdErrorOutline className="text-4xl" />
  };
};

export function GlobalAPIErrorHandler({ children }: { children: ReactNode }) {
  const [error, setError] = useState<any>(null);
  const [countdown, setCountdown] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const unregister = registerErrorListener((err: any) => {
      console.log("GlobalAPIErrorHandler received error:", err);
      showError(err);
    });

    return unregister;
  }, []);

  const showError = (err: any) => {
    setError(err);
    if (err.retryAfter) {
      setCountdown(err.retryAfter);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  };

  const hideError = () => {
    setError(null);
    setCountdown(0);
  };

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const userFriendly = error ? getUserFriendlyMessage(error) : { title: "", message: "", icon: null };
  const isRateLimit = error?.status === 429 || error?.message?.includes("Too Many Requests");

  return (
    <ErrorContext.Provider value={{ showError, hideError }}>
      {children}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 120 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header with gradient - color changes based on error type */}
              <div className={`p-6 text-center ${
                isRateLimit 
                  ? "bg-gradient-to-r from-amber-500 to-orange-500"
                  : "bg-gradient-to-r from-red-500 to-pink-500"
              }`}>
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-white text-4xl">
                    {userFriendly.icon}
                  </div>
                </div>
                <h2 className="text-white text-2xl font-bold">
                  {userFriendly.title}
                </h2>
                <p className="text-white/90 text-sm mt-2">
                  {isRateLimit ? "Take a quick pause" : "Connection Issue"}
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Message Box */}
                <div className={`rounded-lg p-4 mb-6 ${
                  isRateLimit 
                    ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                    : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                }`}>
                  <div className="flex items-start gap-3">
                    {isRateLimit ? (
                      <MdAccessTime className="text-amber-600 dark:text-amber-500 text-xl flex-shrink-0 mt-0.5" />
                    ) : (
                      <MdCloudOff className="text-red-600 dark:text-red-500 text-xl flex-shrink-0 mt-0.5" />
                    )}
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <p className={`font-semibold mb-1 ${
                        isRateLimit 
                          ? "text-amber-800 dark:text-amber-400"
                          : "text-red-800 dark:text-red-400"
                      }`}>
                        {isRateLimit ? "You're moving fast!" : "Connection Issue"}
                      </p>
                      <p>{userFriendly.message}</p>
                    </div>
                  </div>
                </div>

                {/* Tips Box - only for rate limiting */}
                {isRateLimit && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      💡 <span className="font-semibold">Quick Tip:</span> Try slowing down a bit between clicks. This helps everything load faster for you and others!
                    </p>
                  </div>
                )}

                {/* Countdown Timer */}
                {countdown > 0 && (
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full">
                      <span className="text-3xl font-bold text-gray-700 dark:text-gray-300">
                        {countdown}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                      seconds until you can try again
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-3">
                      <div 
                        className="bg-primaryColors-0 h-1.5 rounded-full transition-all duration-1000"
                        style={{ width: `${(countdown / (error?.retryAfter || 30)) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleRetry}
                    disabled={countdown > 0 || isRetrying}
                    className={`
                      flex-1 py-3 rounded-xl font-semibold transition-all duration-200
                      flex items-center justify-center gap-2
                      ${countdown === 0 && !isRetrying
                        ? "bg-primaryColors-0 hover:bg-primaryColors-600 text-white cursor-pointer shadow-md hover:shadow-lg"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      }
                    `}
                  >
                    {isRetrying ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <MdRefresh />
                        Try Again {countdown > 0 ? `(${countdown}s)` : ""}
                      </>
                    )}
                  </button>
                  <button
                    onClick={hideError}
                    className="px-5 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>

                {/* Help Text */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    {isRateLimit 
                      ? "🔄 Still having issues? Try refreshing the page or contact support if the problem continues."
                      : "🔄 Check your internet connection and try again. If the problem persists, please contact support."
                    }
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ErrorContext.Provider>
  );
}