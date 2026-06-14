// components/RateLimitHandler.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdWarning, MdRefresh, MdAccessTime, MdCloudOff } from "react-icons/md";
import { FaExclamationTriangle, FaSpinner } from "react-icons/fa";

interface RateLimitHandlerProps {
  error: any;
  onRetry: () => void;
  retryCount?: number;
  children: React.ReactNode;
}

export default function RateLimitHandler({ 
  error, 
  onRetry, 
  retryCount = 0,
  children 
}: RateLimitHandlerProps) {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (error?.status === 429 || error?.message?.includes("Too Many Requests")) {
      setIsRateLimited(true);
      setRateLimitMessage(error?.message || "Too many requests. Please wait a moment before trying again.");
      
      // Extract retry-after header if available (default to 30 seconds)
      const retryAfter = error?.headers?.get?.("retry-after") || 30;
      setCountdown(parseInt(retryAfter));
      
      // Start countdown
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
    } else {
      setIsRateLimited(false);
    }
  }, [error]);

  const handleRetry = async () => {
    if (countdown > 0) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  if (!isRateLimited) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MdWarning className="text-white text-4xl" />
          </div>
          <h2 className="text-white text-2xl font-bold">Too Many Requests</h2>
          <p className="text-white/90 text-sm mt-2">Rate Limit Exceeded</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <MdAccessTime className="text-yellow-600 dark:text-yellow-500 text-xl flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p className="font-semibold text-yellow-800 dark:text-yellow-400 mb-1">
                  Please Slow Down
                </p>
                <p>{rateLimitMessage}</p>
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          {countdown > 0 && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full">
                <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                  {countdown}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                seconds until you can try again
              </p>
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
                  ? "bg-primaryColors-0 hover:bg-primaryColors-600 text-white cursor-pointer"
                  : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
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
              onClick={() => window.location.reload()}
              className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>

          {/* Tips */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              💡 Tip: Avoid clicking buttons too quickly. Wait a few seconds between actions.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}