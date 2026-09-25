// components/GlobalNotFoundHandler.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  MdHome,
  MdArrowBack,
  MdSearch,
  MdErrorOutline,
  MdRefresh,
  MdContactSupport,
} from "react-icons/md";
import { FaDiscord, FaTwitter } from "react-icons/fa";
import { useI18n } from "@/app/context/I18nContext";

interface NotFoundContextType {
  showNotFound: (resource?: string, customMessage?: string) => void;
  hideNotFound: () => void;
}

const NotFoundContext = createContext<NotFoundContextType | null>(null);

export function useNotFound() {
  const context = useContext(NotFoundContext);
  if (!context) {
    throw new Error("useNotFound must be used within GlobalNotFoundHandler");
  }
  return context;
}

export function GlobalNotFoundHandler({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [notFound, setNotFound] = useState<{
    show: boolean;
    resource?: string;
    customMessage?: string;
  }>({ show: false });
  const router = useRouter();

  const showNotFound = (resource?: string, customMessage?: string) => {
    setNotFound({ show: true, resource, customMessage });
  };

  const hideNotFound = () => {
    setNotFound({ show: false });
  };

  const handleGoHome = () => {
    router.push("/dashboard");
    hideNotFound();
  };

  const handleGoBack = () => {
    router.back();
    hideNotFound();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <NotFoundContext.Provider value={{ showNotFound, hideNotFound }}>
      {children}
      <AnimatePresence>
        {notFound.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="max-w-2xl w-full text-center"
            >
              {/* Animated 404 Graphic */}
              <div className="relative mb-8">
                <motion.div
                  animate={{
                    rotate: [0, -5, 5, -5, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 400 300"
                    fill="none"
                  >
                    <rect width="400" height="300" fill="#F3F4F6" rx="20" />
                    <circle cx="200" cy="150" r="80" fill="#E5E7EB" />
                    <path
                      d="M160 120 L200 160 L240 120"
                      stroke="#9CA3AF"
                      stroke-width="4"
                      fill="none"
                    />
                    <circle cx="170" cy="140" r="5" fill="#6B7280" />
                    <circle cx="230" cy="140" r="5" fill="#6B7280" />
                    <path
                      d="M170 180 Q200 200 230 180"
                      stroke="#9CA3AF"
                      stroke-width="3"
                      fill="none"
                    />
                    <text
                      x="200"
                      y="260"
                      text-anchor="middle"
                      fill="#6B7280"
                      font-size="24"
                      font-family="Arial"
                      font-weight="bold"
                    >
                      404
                    </text>
                    <text
                      x="200"
                      y="285"
                      text-anchor="middle"
                      fill="#9CA3AF"
                      font-size="14"
                      font-family="Arial"
                    >
                      {t("Page Not Found")}
                    </text>
                  </svg>
                </motion.div>

                {/* Fallback text if image not available */}
                <div className="text-9xl font-bold text-gray-200 dark:text-gray-800 select-none">
                  404
                </div>
              </div>

              {/* Error Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-center gap-2 mb-4">
                  <MdErrorOutline className="text-yellow-500 text-3xl" />
                  <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
                    {t("Page Not Found")}
                  </h1>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
                  {notFound.customMessage ||
                    t("The page you're looking for doesn't exist or has been moved.")}
                </p>

                {notFound.resource && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                    {t("Resource:")}{" "}
                    <span className="font-mono">{notFound.resource}</span>
                  </p>
                )}

                {/* Suggestions */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-8 text-left">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    {t("You might want to:")}
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <MdSearch className="text-blue-500" />
                      {t("Check the URL for typos")}
                    </li>
                    <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <MdArrowBack className="text-blue-500" />
                      {t("Go back to the previous page")}
                    </li>
                    <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <MdHome className="text-blue-500" />
                      {t("Return to the dashboard")}
                    </li>
                    <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <MdRefresh className="text-blue-500" />
                      {t("Refresh the page")}
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGoBack}
                    className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <MdArrowBack /> {t("Go Back")}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGoHome}
                    className="px-6 py-3 bg-primaryColors-0 text-white rounded-xl font-semibold hover:bg-primaryColors-600 transition-colors flex items-center gap-2"
                  >
                    <MdHome /> {t("Dashboard Home")}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRefresh}
                    className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <MdRefresh /> {t("Refresh Page")}
                  </motion.button>
                </div>

                {/* Help Section */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">
                    {t("Need help? Contact support:")}
                  </p>
                  <div className="flex gap-4 justify-center">
                    <a
                      href="/support"
                      className="text-gray-400 hover:text-primaryColors-0 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push("/support");
                        hideNotFound();
                      }}
                    >
                      <MdContactSupport size={24} />
                    </a>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-primaryColors-0 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaDiscord size={24} />
                    </a>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-primaryColors-0 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaTwitter size={24} />
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </NotFoundContext.Provider>
  );
}
