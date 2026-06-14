// components/BuiltInTabContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSync, FaExternalLinkSquareAlt, FaTimes, FaVideo, FaMicrophone, FaMicrophoneSlash, FaVideoSlash, FaPhoneSlash } from "react-icons/fa";
import { MdWarning, MdOpenInNew } from "react-icons/md";
import Loader from "../component/loader";

interface BuiltInTabContextType {
  openInBuiltTab: (url: string, title: string) => void;
}

interface Tab {
  id: string;
  url: string;
  title: string;
}

const BuiltInTabContext = createContext<BuiltInTabContextType | null>(null);

// Google Meet Component
const GoogleMeetEmbed = ({ meetingUrl, meetingTitle, onClose }: { meetingUrl: string; meetingTitle: string; onClose: () => void }) => {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const getMeetingId = (url: string): string => {
    const match = url.match(/meet\.google\.com\/([a-z0-9\-]+)/i);
    return match ? match[1] : "";
  };

  const meetingId = getMeetingId(meetingUrl);

  const joinMeeting = () => {
    const url = new URL(meetingUrl);
    if (!audioEnabled) url.searchParams.set('audio', '0');
    if (!videoEnabled) url.searchParams.set('video', '0');
    
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 120 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-48 bg-gradient-to-br from-blue-600 to-purple-600">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaVideo className="text-white text-3xl" />
              </div>
              <h3 className="text-white text-lg font-semibold">Google Meet</h3>
              <p className="text-white/80 text-sm mt-1 px-4 truncate">{meetingTitle}</p>
              {meetingId && (
                <p className="text-white/60 text-xs mt-1">ID: {meetingId}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <MdWarning className="text-yellow-500 text-xl flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-300">
                <p className="font-semibold text-yellow-500 mb-1">Cannot Embed Google Meet</p>
                <p>Due to security restrictions, Google Meet cannot be embedded directly. You can still join in a new tab.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`p-3 rounded-full transition-all duration-200 ${
                audioEnabled 
                  ? "bg-gray-700 hover:bg-gray-600 text-white" 
                  : "bg-red-500/20 hover:bg-red-500/30 text-red-400"
              }`}
            >
              {audioEnabled ? <FaMicrophone className="text-lg" /> : <FaMicrophoneSlash className="text-lg" />}
            </button>
            <button
              onClick={() => setVideoEnabled(!videoEnabled)}
              className={`p-3 rounded-full transition-all duration-200 ${
                videoEnabled 
                  ? "bg-gray-700 hover:bg-gray-600 text-white" 
                  : "bg-red-500/20 hover:bg-red-500/30 text-red-400"
              }`}
            >
              {videoEnabled ? <FaVideo className="text-lg" /> : <FaVideoSlash className="text-lg" />}
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={joinMeeting}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              <FaVideo /> Join Now
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <FaPhoneSlash /> Cancel
          </button>

          <p className="text-center text-gray-500 text-xs mt-4">
            The meeting will open in a new tab. Make sure to allow camera and microphone access.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Tab Item Component (fixes button nesting)
const TabItem = ({ tab, isActive, onClick, onClose }: { 
  tab: Tab; 
  isActive: boolean; 
  onClick: () => void; 
  onClose: (e: React.MouseEvent) => void;
}) => {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`
          flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all
          ${isActive
            ? "text-primaryColors-0 border-b-2 border-primaryColors-0"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }
        `}
      >
        <span>{tab.title}</span>
      </button>
      <button
        onClick={onClose}
        className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded ml-2"
        style={{ right: '-20px' }}
      >
        <FaTimes className="w-3 h-3" />
      </button>
    </div>
  );
};

// WebView Component for regular websites
const WebView = ({ url, onClose }: { url: string; onClose: () => void }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(Date.now());
  const [showFallback, setShowFallback] = useState(false);
  const [blockedError, setBlockedError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isKnownBlockedPlatform = (url: string): { blocked: boolean; message: string } => {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      
      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
        return { 
          blocked: true, 
          message: "YouTube videos cannot be embedded due to security restrictions." 
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
      if (hostname.includes('rolex.com') || hostname.includes('facebook.com') || hostname.includes('instagram.com')) {
        return { 
          blocked: true, 
          message: "This website cannot be embedded due to security restrictions (CSP/X-Frame-Options)." 
        };
      }
    } catch {
      // Invalid URL
    }
    return { blocked: false, message: "" };
  };

  const checkIframeAccessibility = () => {
    const { blocked, message } = isKnownBlockedPlatform(url);
    if (blocked) {
      setIsLoading(false);
      setBlockedError(message);
      setShowFallback(true);
      return;
    }

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
    onClose(); // Close the modal after opening in new tab
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
                  onClick={openInNewTab}
                  className="px-4 py-2 bg-primaryColors-0 text-white rounded-lg hover:bg-primaryColors-600 transition-colors flex items-center gap-2"
                >
                  <MdOpenInNew /> Open in New Tab
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

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
const WebViewContainer = ({ tabs, onClose }: { tabs: Tab[]; onClose: (id: string) => void }) => {
  const [activeWebView, setActiveWebView] = useState<string>(tabs[0]?.id || "");
  const [isGoogleMeet, setIsGoogleMeet] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [currentTitle, setCurrentTitle] = useState<string>("");

  useEffect(() => {
    const activeTab = tabs.find(tab => tab.id === activeWebView);
    if (activeTab) {
      setCurrentUrl(activeTab.url);
      setCurrentTitle(activeTab.title);
      setIsGoogleMeet(activeTab.url.includes('meet.google.com'));
    }
  }, [activeWebView, tabs]);

  if (tabs.length === 0) return null;

  if (isGoogleMeet) {
    return (
      <GoogleMeetEmbed 
        meetingUrl={currentUrl} 
        meetingTitle={currentTitle} 
        onClose={() => {
          const activeTab = tabs.find(tab => tab.id === activeWebView);
          if (activeTab) {
            onClose(activeTab.id);
          }
        }} 
      />
    );
  }

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
        {/* Tab Bar - Fixed button nesting issue */}
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-x-auto">
          {tabs.map((tab) => (
            <div key={tab.id} className="relative flex items-center">
              <button
                onClick={() => setActiveWebView(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all
                  ${activeWebView === tab.id
                    ? "text-primaryColors-0 border-b-2 border-primaryColors-0"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }
                `}
              >
                <span>{tab.title}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(tab.id);
                }}
                className="absolute right-0 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded mx-1"
                style={{ right: '-16px' }}
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

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

export function BuiltInTabProvider({ children }: { children: ReactNode }) {
  const [externalTabs, setExternalTabs] = useState<Tab[]>([]);
  const [showWebView, setShowWebView] = useState(false);

  const openInBuiltTab = (url: string, title: string) => {
    const newTab = {
      id: Date.now().toString(),
      url,
      title: title.length > 30 ? title.substring(0, 27) + "..." : title,
    };
    setExternalTabs((prev) => [...prev, newTab]);
    setShowWebView(true);
  };

  const closeExternalTab = (id: string) => {
    setExternalTabs((prev) => {
      const newTabs = prev.filter((tab) => tab.id !== id);
      if (newTabs.length === 0) {
        setShowWebView(false);
      }
      return newTabs;
    });
  };

  return (
    <BuiltInTabContext.Provider value={{ openInBuiltTab }}>
      {children}
      <AnimatePresence>
        {showWebView && externalTabs.length > 0 && (
          <WebViewContainer tabs={externalTabs} onClose={closeExternalTab} />
        )}
      </AnimatePresence>
    </BuiltInTabContext.Provider>
  );
}

export function useBuiltInTab() {
  const context = useContext(BuiltInTabContext);
  if (!context) {
    throw new Error('useBuiltInTab must be used within BuiltInTabProvider');
  }
  return context;
}