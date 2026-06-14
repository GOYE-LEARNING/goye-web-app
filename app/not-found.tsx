// app/not-found.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MdHome, MdArrowBack, MdRefresh } from "react-icons/md";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Log 404 error for monitoring
    console.error("404: Page not found", window.location.pathname);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl"
      >
        {/* Animated 404 */}
        <div className="relative mb-8">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, -5, 5, 0]
            }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-primaryColors-0 to-purple-600 bg-clip-text text-transparent">
              404
            </h1>
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-primaryColors-0/10 rounded-full animate-pulse"></div>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
          Oops! Page Not Found
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <MdArrowBack /> Go Back
          </button>
          
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-primaryColors-0 text-white rounded-xl font-semibold hover:bg-primaryColors-600 transition-colors flex items-center gap-2"
          >
            <MdHome /> Go Home
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <MdRefresh /> Refresh
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">
            Try these helpful links:
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="/dashboard" className="text-sm text-primaryColors-0 hover:underline">
              Dashboard
            </a>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <a href="/dashboard/student/courses" className="text-sm text-primaryColors-0 hover:underline">
              My Courses
            </a>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <a href="/dashboard/student/community" className="text-sm text-primaryColors-0 hover:underline">
              Community
            </a>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <a href="/support" className="text-sm text-primaryColors-0 hover:underline">
              Support
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}