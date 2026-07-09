// components/dashboard_notification.tsx - FIXED (Clickable & No Blinking)
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { HiOutlineUserGroup } from "react-icons/hi";
import { PiThumbsUpLight } from "react-icons/pi";
import { RiCheckDoubleFill } from "react-icons/ri";
import { formatTime } from "../hook/formatDate";
import { FaSpinner } from "react-icons/fa";
import { useSocket, Notification } from "@/app/context/SocketContext";

interface DashboardNotificationProps {
  onClose?: () => void;
  organizationId?: string;
}

export default function DashboardNotification({
  onClose,
  organizationId,
}: DashboardNotificationProps) {
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [showFullMessage, setShowFullMessage] = useState<string[]>([]);
  const [isMarkingSpecific, setIsMarkingSpecific] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Local state to prevent blinking
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);
  const [localUnreadCount, setLocalUnreadCount] = useState(0);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const isInitialMount = useRef(true);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use socket context
  const {
    notifications,
    unreadCount,
    isConnected,
    markNotificationRead,
    markAllNotificationsRead,
    refreshNotifications,
  } = useSocket();

  // Update local state when context notifications change
  useEffect(() => {
    if (isInitialMount.current) {
      setLocalNotifications(notifications);
      setLocalUnreadCount(unreadCount);
      setLoading(false);
      isInitialMount.current = false;
    } else {
      // Use requestAnimationFrame to batch updates and prevent blinking
      requestAnimationFrame(() => {
        setLocalNotifications(notifications);
        setLocalUnreadCount(unreadCount);
      });
    }
  }, [notifications, unreadCount]);

  // Get unread notifications from local state
  const unreadNotifications = localNotifications.filter(
    (n) => !n.isRead && !n.read
  );

  // Load notifications on mount - only once
  useEffect(() => {
    const load = async () => {
      if (notifications.length === 0) {
        setLoading(true);
        await refreshNotifications();
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    
    load();
  }, []); // Empty dependency array - only runs once

  const expandMessage = (id: string) => {
    setShowFullMessage((prev) => {
      if (prev.includes(id)) {
        return prev.filter((p) => p !== id);
      }
      return [...prev, id];
    });
  };

  const markSpecificNotificationAsRead = async (id: string) => {
    setIsMarkingSpecific(id);
    try {
      await markNotificationRead(id);
      // Update local state immediately for UI responsiveness - no blinking
      setLocalNotifications(prev => 
        prev.map(n => 
          n.id === id ? { ...n, isRead: true, read: true } : n
        )
      );
      setLocalUnreadCount(prev => Math.max(0, prev - 1));
    } finally {
      setIsMarkingSpecific(null);
    }
  };

  const markAllNotificationsAsRead = async () => {
    setIsMarkingAll(true);
    try {
      await markAllNotificationsRead();
      // Update local state immediately - no blinking
      setLocalNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true, read: true }))
      );
      setLocalUnreadCount(0);
      if (onClose) {
        onClose();
      }
    } finally {
      setIsMarkingAll(false);
    }
  };

  const deleteAllNotifications = async () => {
    if (!confirm("Are you sure you want to delete all notifications?")) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';
      const res = await fetch(`${API_URL}/api/notifications/clear-all`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setLocalNotifications([]);
        setLocalUnreadCount(0);
        // Refresh in background
        refreshNotifications();
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead && !notification.read) {
      markSpecificNotificationAsRead(notification.id);
    }
  };

  // Handle refresh with debounce - prevents multiple rapid refreshes
  const handleRefresh = useCallback(async () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    refreshTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      await refreshNotifications();
      setLoading(false);
      refreshTimeoutRef.current = null;
    }, 300);
  }, [refreshNotifications]);

  const displayedNotifications =
    activeTab === "all" ? localNotifications : unreadNotifications;

  // Close on outside click - FIXED
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (target.closest('[data-bell-button]')) return;
        if (onClose) onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={panelRef}
      className="h-[700px] w-[390px] scrollbar2 dark:bg-secondaryColors-0 bg-white backdrop-blur-md border border-[#ccc]/10 drop-shadow-2xl md:h-[509px] md:w-[400px] z-[99999] right-0 absolute p-[20px] rounded-xl overflow-hidden"
    >
      <div className="dashboard_triangle absolute -top-[0.8rem] right-4"></div>

      {/* Connection status indicator */}
      <div className="flex items-center justify-end mb-2">
        <div className={`flex items-center gap-1 text-xs ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          {isConnected ? 'Live' : 'Offline'}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab("all");
            }}
            className={`dark:bg-secondaryColors-0 bg-lightWhite-0 p-[10px] flex gap-3 items-center justify-center transition-all rounded-lg ${
              activeTab === "all" ? "opacity-100" : "opacity-70"
            }`}
          >
            <p
              className={`font-[600] ${
                activeTab === "all" ? "text-primaryColors-0" : "text-textGrey-0"
              }`}
            >
              All
            </p>

            <span className="w-[24px] h-[19px] flex justify-center items-center flex-col pt-[4px] bg-primaryColors-0 text-[#ffffff] text-[12px] rounded-full">
              {localNotifications.length}
            </span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab("unread");
            }}
            className={`dark:bg-secondaryColors-0 bg-lightWhite-0 p-[10px] flex gap-3 items-center justify-center transition-all rounded-lg ${
              activeTab === "unread" ? "opacity-100" : "opacity-70"
            }`}
          >
            <p
              className={`font-[500] ${
                activeTab === "unread" ? "text-primaryColors-0" : "text-textGrey-0"
              }`}
            >
              Unread
            </p>

            <span className="w-[24px] h-[19px] flex justify-center items-center flex-col pt-[4px] dark:bg-shadyColor-0 bg-primaryYellow-0 text-white text-[12px] rounded-full">
              {unreadNotifications.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
            disabled={loading}
            className="h-[36px] w-[36px] flex justify-center items-center border border-[#D9D9D9]/10 hover:bg-primaryColors-0/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
          >
            <FaSpinner className={`${loading ? 'animate-spin' : ''}`} size={14} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              markAllNotificationsAsRead();
            }}
            disabled={isMarkingAll || unreadNotifications.length === 0}
            className="h-[36px] py-[17px] px-[10px] border border-[#D9D9D9]/10 flex justify-center items-center text-primaryColors-0 text-[13px] gap-2 hover:bg-primaryColors-0/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
          >
            {isMarkingAll ? (
              <FaSpinner className="animate-spin" size={14} />
            ) : (
              <RiCheckDoubleFill />
            )}

            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      {!loading && displayedNotifications.length === 0 ? (
        <div className="h-full flex justify-center items-center flex-col gap-3 w-full">
          <div className="h-[100px] w-[100px] dark:bg-secondaryColors-0 bg-white rounded-full flex justify-center items-center flex-col">
            <div className="w-[76px] h-[76px] dark:bg-shadyColor-0 bg-lightWhite-0 rounded-full border-[5px] border-[#F1F1F4]/10 flex justify-center items-center flex-col text-[#71748C]">
              <span>
                <PiThumbsUpLight size={40} color="orange" />
              </span>
            </div>
          </div>

          <h1 className="text-[32px] text-[#111827] font-[500]">All Caught Up</h1>

          <p className="text-[16px] text-[#41415A]">
            {activeTab === "all" ? "No notifications yet." : "No unread notifications."}
          </p>
        </div>
      ) : (
        <div className="my-5 overflow-y-auto scrollbar2 h-[calc(100%-80px)] pr-1">
          <div className="flex flex-col">
            {!loading &&
              displayedNotifications.map((n: Notification) => {
                const isUnread = !n.isRead && !n.read;
                return (
                  <div
                    key={n.id}
                    className="relative group cursor-pointer dark:hover:bg-shadyColor-0/50 hover:bg-lightWhite-0 transition-all rounded-lg"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      expandMessage(n.id);
                      handleNotificationClick(n);
                    }}
                  >
                    <div className="flex justify-between items-start p-2">
                      <div className="flex items-start gap-2 flex-1">
                        <div className="dark:bg-shadyColor-0 bg-lightWhite-0 border border-[#ccc]/10 flex justify-center items-center rounded-md p-2">
                          {n?.type === "group" || n?.type === "GROUP_JOIN" ? (
                            <HiOutlineUserGroup size={18} color="#49151B" />
                          ) : n?.type === "course" || n?.type === "COURSE_JOIN" ? (
                            <div className="text-primaryColors-0">📚</div>
                          ) : n?.type === "MESSAGE" ? (
                            <div className="text-primaryColors-0">💬</div>
                          ) : n?.type === "POST_LIKE" ? (
                            <div className="text-red-500">❤️</div>
                          ) : n?.type === "POST_COMMENT" ? (
                            <div className="text-orange-500">💭</div>
                          ) : n?.type === "ACHIEVEMENT_UNLOCKED" ? (
                            <div className="text-yellow-500">🏆</div>
                          ) : n?.type === "SYSTEM_ANNOUNCEMENT" ? (
                            <div className="text-purple-500">📢</div>
                          ) : n?.type === "ORG_INVITE" || n?.type === "ORG_MEMBER_JOINED" ? (
                            <div className="text-blue-500">🏢</div>
                          ) : (
                            <div className="text-primaryColors-0">🔔</div>
                          )}
                        </div>

                        <div className="flex flex-col gap-1 flex-1">
                          <div
                            className={`text-[0.9rem] font-medium ${
                              isUnread
                                ? "text-primaryColors-0"
                                : "text-textSlightDark-0"
                            }`}
                          >
                            {n?.title}

                            {isUnread && (
                              <span className="ml-2 inline-block w-2 h-2 bg-primaryColors-0 rounded-full"></span>
                            )}
                          </div>

                          <div
                            className={`text-[0.8rem] text-nearTextColors-0 ${
                              showFullMessage.includes(n.id) ? "" : "line-clamp-2"
                            }`}
                          >
                            {n?.message}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-2">
                        <div className="text-nearTextColors-0 text-[0.7rem] whitespace-nowrap">
                          {formatTime(n?.createdAt as any)}
                        </div>

                        {isUnread && activeTab === "all" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markSpecificNotificationAsRead(n.id);
                            }}
                            disabled={isMarkingSpecific === n.id}
                            className="text-xs text-primaryColors-0 hover:text-primaryColors-0/70 transition-all disabled:opacity-50"
                          >
                            {isMarkingSpecific === n.id ? (
                              <FaSpinner className="animate-spin" size={12} />
                            ) : (
                              "Mark as read"
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="h-[1px] w-full bg-[#ccc]/10 my-1"></div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}