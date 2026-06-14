"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdHome,
  MdSettings,
  MdPerson,
  MdNotifications,
  MdChat,
  MdInfo,
  MdLock,
  MdEmail,
  MdEvent,
  MdGroup,
  MdVideoLibrary,
  MdAssignment,
  MdForum,
  MdRefresh,
  MdOpenInNew,
  MdWarning,
} from "react-icons/md";
import { FaArrowLeft, FaSync, FaExternalLinkSquareAlt, FaTimes } from "react-icons/fa";
import Loader from "./loader";

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  badge?: number;
  disabled?: boolean;
}

interface DashboardInbuiltTabProps {
  tabs: TabItem[];
  defaultTabId?: string;
  onTabChange?: (tabId: string) => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
  headerTitle?: string;
  variant?: "underline" | "pill" | "button" | "sidebar";
}

// Enhanced WebView Component with better error handling for X-Frame-Options
const WebView = ({ url, onClose }: { url: string; onClose: () => void }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(Date.now());
  const [showFallback, setShowFallback] = useState(false);
  const [blockedError, setBlockedError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if URL is from a known platform that blocks iframes
  const isKnownBlockedPlatform = (url: string): { blocked: boolean; message: string } => {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      
      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
        return { 
          blocked: true, 
          message: "YouTube videos cannot be embedded due to security restrictions (X-Frame-Options)." 
        };
      }
      if (hostname.includes('meet.google.com')) {
        return { 
          blocked: true, 
          message: "Google Meet cannot be embedded due to security restrictions (X-Frame-Options)." 
        };
      }
      if (hostname.includes('zoom.us') || hostname.includes('zoom.com')) {
        return { 
          blocked: true, 
          message: "Zoom meetings cannot be embedded due to security restrictions." 
        };
      }
      if (hostname.includes('drive.google.com')) {
        return { 
          blocked: true, 
          message: "Google Drive cannot be embedded directly. Please open in a new tab." 
        };
      }
    } catch {
      // Invalid URL
    }
    return { blocked: false, message: "" };
  };

  const checkIframeAccessibility = () => {
    // Check for known blocked platforms first
    const { blocked, message } = isKnownBlockedPlatform(url);
    if (blocked) {
      setIsLoading(false);
      setBlockedError(message);
      setShowFallback(true);
      return;
    }

    // Set a timeout to check if iframe loads within 8 seconds
    timeoutRef.current = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setError("The website is taking too long to load.");
        setShowFallback(true);
      }
    }, 8000);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    setBlockedError(null);
    setShowFallback(false);
    setIframeKey(Date.now());
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
    
    checkIframeAccessibility();
  };

  const openInNewTab = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    checkIframeAccessibility();
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [url]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError("Unable to load this webpage. It may be blocking embedded views.");
    setShowFallback(true);
  };

  // Extract domain for display
  const getDomain = (urlString: string) => {
    try {
      const urlObj = new URL(urlString);
      return urlObj.hostname;
    } catch {
      return urlString;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 120 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tab Header with better controls */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex-1 px-3 py-1.5 bg-white dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 truncate">
              {getDomain(url)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Refresh"
            >
              <FaSync className="text-gray-500 dark:text-gray-400 text-sm" />
            </button>
            <button
              onClick={openInNewTab}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Open in new tab"
            >
              <FaExternalLinkSquareAlt className="text-gray-500 dark:text-gray-400 text-sm" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Close"
            >
              <FaTimes className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader
                full_border_color="transparent"
                small_border_color="#FFA500"
                height={50}
                width={50}
                border_width={3}
              />
              <p className="mt-4 text-gray-500 dark:text-gray-400">Loading content...</p>
            </div>
          </div>
        )}

        {/* Error/Fallback State for blocked platforms */}
        {(error || blockedError || showFallback) && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                <MdWarning className="text-yellow-600 dark:text-yellow-500 text-4xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                Cannot Embed This Website
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {blockedError || error || "This website has security settings that prevent it from being displayed in an embedded frame."}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <FaSync /> Try Again
                </button>
                <button
                  onClick={openInNewTab}
                  className="px-4 py-2 bg-primaryColors-0 text-white rounded-lg hover:bg-primaryColors-600 transition-colors flex items-center gap-2"
                >
                  <MdOpenInNew /> Open in New Tab
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Iframe Content - only show if no error and not known blocked platform */}
        {!showFallback && !blockedError && (
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={url}
            className="flex-1 w-full"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads allow-modals"
            referrerPolicy="no-referrer"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title="Embedded Content"
            style={{ display: isLoading ? 'none' : 'block' }}
          />
        )}
      </motion.div>
    </motion.div>
  );
};

// WebView Container for managing multiple tabs
const WebViewContainer = ({
  tabs,
  onClose,
}: {
  tabs: { id: string; url: string; title: string }[];
  onClose: (id: string) => void;
}) => {
  const [activeWebView, setActiveWebView] = useState<string>(tabs[0]?.id || "");

  // Close the entire container if no tabs left
  useEffect(() => {
    if (tabs.length === 0) {
      return;
    }
  }, [tabs]);

  if (tabs.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Tab Bar */}
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveWebView(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all
                ${
                  activeWebView === tab.id
                    ? "text-primaryColors-0 border-b-2 border-primaryColors-0"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }
              `}
            >
              <span>{tab.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(tab.id);
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </button>
          ))}
        </div>

        {/* Active WebView */}
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={activeWebView === tab.id ? "flex-1" : "hidden"}
          >
            <WebView url={tab.url} onClose={() => onClose(tab.id)} />
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default function DashboardInbuiltTab({
  tabs,
  defaultTabId,
  onTabChange,
  showBackButton = false,
  onBackClick,
  headerTitle,
  variant = "underline",
}: DashboardInbuiltTabProps) {
  const [activeTab, setActiveTab] = useState<string>(
    defaultTabId || tabs[0]?.id || "",
  );
  const [externalTabs, setExternalTabs] = useState<
    { id: string; url: string; title: string }[]
  >([]);
  const [showWebView, setShowWebView] = useState(false);

  const handleTabClick = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab?.disabled) return;

    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  // Function to open external URL in built-in tab
  const openExternalUrl = (url: string, title: string) => {
    const newTab = {
      id: Date.now().toString(),
      url,
      title,
    };
    setExternalTabs([...externalTabs, newTab]);
    setShowWebView(true);
  };

  // Function to close external tab
  const closeExternalTab = (id: string) => {
    const newTabs = externalTabs.filter((tab) => tab.id !== id);
    setExternalTabs(newTabs);
    if (newTabs.length === 0) {
      setShowWebView(false);
    }
  };

  // Make openExternalUrl available to child components via a custom event or context
  // For now, we'll attach it to window for global access
  useEffect(() => {
    // @ts-ignore
    window.openInBuiltTab = openExternalUrl;
    return () => {
      // @ts-ignore
      delete window.openInBuiltTab;
    };
  }, [externalTabs]);

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  // Animation variants
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  const underlineVariants = {
    initial: { scaleX: 0 },
    animate: { scaleX: 1 },
    transition: { duration: 0.3, ease: "easeOut" },
  };

  // Different tab styles
  const renderTabs = () => {
    switch (variant) {
      case "pill":
        return (
          <div className="flex flex-wrap gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                disabled={tab.disabled}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                  ${
                    activeTab === tab.id
                      ? "bg-primaryColors-0 text-white shadow-md"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }
                  ${tab.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
                whileHover={!tab.disabled ? { scale: 1.05 } : {}}
                whileTap={!tab.disabled ? { scale: 0.95 } : {}}
              >
                {tab.icon && <span className="text-lg">{tab.icon}</span>}
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {tab.badge}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        );

      case "button":
        return (
          <div className="flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                disabled={tab.disabled}
                className={`
                  flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all
                  ${
                    activeTab === tab.id
                      ? "bg-primaryColors-0 text-white shadow-lg"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }
                  ${tab.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
                whileHover={!tab.disabled ? { scale: 1.05, y: -2 } : {}}
                whileTap={!tab.disabled ? { scale: 0.95 } : {}}
              >
                {tab.icon && <span className="text-lg">{tab.icon}</span>}
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full"
                  >
                    {tab.badge}
                  </motion.span>
                )}
              </motion.button>
            ))}
          </div>
        );

      case "sidebar":
        return (
          <div className="flex flex-col gap-2 w-64 bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                disabled={tab.disabled}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all
                  ${
                    activeTab === tab.id
                      ? "bg-primaryColors-0 text-white shadow-md"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }
                  ${tab.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
                whileHover={!tab.disabled ? { x: 5 } : {}}
                whileTap={!tab.disabled ? { scale: 0.98 } : {}}
              >
                {tab.icon && <span className="text-xl">{tab.icon}</span>}
                <div className="flex-1 text-left">
                  <span>{tab.label}</span>
                </div>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {tab.badge}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        );

      default: // underline variant
        return (
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                disabled={tab.disabled}
                className={`
                  relative px-6 py-3 text-sm font-medium transition-all
                  ${
                    activeTab === tab.id
                      ? "text-primaryColors-0 dark:text-primaryColors-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }
                  ${tab.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
                whileHover={!tab.disabled ? { y: -2 } : {}}
                whileTap={!tab.disabled ? { scale: 0.95 } : {}}
              >
                <div className="flex items-center gap-2">
                  {tab.icon && <span className="text-lg">{tab.icon}</span>}
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full"
                    >
                      {tab.badge}
                    </motion.span>
                  )}
                </div>
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primaryColors-0 dark:bg-primaryColors-400"
                    variants={underlineVariants}
                    initial="initial"
                    animate="animate"
                  />
                )}
              </motion.button>
            ))}
          </div>
        );
    }
  };

  return (
    <>
      <div className="w-full">
        {/* Header with back button */}
        {(showBackButton || headerTitle) && (
          <div className="flex items-center gap-4 mb-6">
            {showBackButton && (
              <motion.button
                onClick={onBackClick}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaArrowLeft className="text-gray-600 dark:text-gray-400" />
              </motion.button>
            )}
            {headerTitle && (
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {headerTitle}
              </h2>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          {variant === "sidebar" ? (
            <div className="flex gap-6">
              <div>{renderTabs()}</div>
              <div className="flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    variants={contentVariants as any}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {activeTabContent}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <>
              {renderTabs()}
              <div className="mt-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    variants={contentVariants as any}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {activeTabContent}
                  </motion.div>
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </div>

      {/* WebView Modal for external links */}
      <AnimatePresence>
        {showWebView && externalTabs.length > 0 && (
          <WebViewContainer tabs={externalTabs} onClose={closeExternalTab} />
        )}
      </AnimatePresence>
    </>
  );
}