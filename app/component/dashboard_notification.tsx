"use client";
import { useEffect, useState, useRef } from "react";
import { HiOutlineUserGroup } from "react-icons/hi";
import { PiThumbsUpLight } from "react-icons/pi";
import { RiCheckDoubleFill } from "react-icons/ri";
import { formatDate, formatTime } from "../hook/formatDate";
import { FaSpinner } from "react-icons/fa";

interface Notification {
  id: string;
  title: string;
  message: string;
  courseId?: string;
  groupId?: string;
  type?: string;
  achievementId?: string;
  createdAt?: string;
  isRead?: boolean;
}

interface DashboardNotificationProps {
  onClose?: () => void;
}

export default function DashboardNotification({
  onClose,
}: DashboardNotificationProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notifications, setNotification] = useState<Notification[]>([]);
  const [unRead, setUnread] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [isMarkingAll, setIsMarkingAll] = useState<boolean>(false);
  const [isMarkingSpecific, setIsMarkingSpecific] = useState<string | null>(
    null,
  );
  
  const panelRef = useRef<HTMLDivElement | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchAllNotification = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/notifications/user`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        console.log("An error occurred");
        return;
      }

      setNotification(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotificationUnread = async () => {
    try {
      const res = await fetch(`${API_URL}/api/notifications/unread`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        console.log(data);
        return;
      }

      setUnread(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      setIsMarkingAll(true);
      const res = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: "PUT",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        console.log(data);
        return;
      }

      // Refresh both notification lists
      await fetchAllNotification();
      await fetchNotificationUnread();

      // Optional: Close notification panel after marking all as read
      // if (onClose) onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const markSpecificNotificationAsRead = async (id: string) => {
    try {
      setIsMarkingSpecific(id);
      const res = await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: "PUT",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        console.log(data);
        return;
      }

      // Update the notification in the list to mark it as read
      setNotification((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification,
        ),
      );

      // Refresh unread count
      await fetchNotificationUnread();
    } catch (error) {
      console.error(error);
    } finally {
      setIsMarkingSpecific(null);
    }
  };

  const deleteAllNotifications = async () => {
    if (!confirm("Are you sure you want to delete all notifications?")) return;

    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/notifications/clear-all`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        console.log(data);
        return;
      }

      // Clear notifications
      setNotification([]);
      setUnread([]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // If notification is unread, mark it as read
    if (!notification.isRead) {
      markSpecificNotificationAsRead(notification.id);
    }

    // Handle navigation based on notification type
    // Uncomment and implement navigation when needed
    // if (notification.type === "course" && notification.courseId) {
    //   router.push(`/dashboard/courses/${notification.courseId}`);
    //   if (onClose) onClose();
    // } else if (notification.type === "group" && notification.groupId) {
    //   router.push(`/dashboard/groups/${notification.groupId}`);
    //   if (onClose) onClose();
    // }
    
    // Do NOT call onClose() here - let the user close manually or click outside
  };

  useEffect(() => {
    fetchAllNotification();
    fetchNotificationUnread();
    
    // Prevent clicks inside the panel from bubbling to document
    const handlePanelClick = (e: MouseEvent) => {
      e.stopPropagation();
    };
    
    const panel = panelRef.current;
    if (panel) {
      panel.addEventListener('click', handlePanelClick, true);
    }
    
    return () => {
      if (panel) {
        panel.removeEventListener('click', handlePanelClick, true);
      }
    };
  }, []);

  const displayedNotifications = activeTab === "all" ? notifications : unRead;

  return (
    <div
      ref={panelRef}
      className="h-[700px] w-[390px] bg-secondaryColors-0 backdrop-blur-lg border border-[#ccc]/10 drop-shadow-lg md:h-[509px] md:w-[400px] z-30 md:-right-[120px] right-0 md:top-10 top-[2.4rem] absolute p-[20px]"
    >
      <div className="dashboard_triangle absolute md:right-[123px] md:-top-[0.9rem] -top-[0.8rem] right-2"></div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab("all");
            }}
            className={`bg-secondaryColors-0 p-[10px] flex gap-3 items-center justify-center transition-all ${
              activeTab === "all" ? "opacity-100" : "opacity-70"
            }`}
          >
            <p
              className={`font-[600] ${activeTab === "all" ? "text-primaryColors-0" : "text-textGrey-0"}`}
            >
              All
            </p>
            <span className="w-[24px] h-[19px] flex justify-center items-center flex-col pt-[4px] bg-primaryColors-0 text-[#ffffff] text-[12px] rounded-full">
              {notifications.length}
            </span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab("unread");
            }}
            className={`bg-secondaryColors-0 p-[10px] flex gap-3 items-center justify-center transition-all ${
              activeTab === "unread" ? "opacity-100" : "opacity-70"
            }`}
          >
            <p
              className={`font-[500] ${activeTab === "unread" ? "text-primaryColors-0" : "text-textGrey-0"}`}
            >
              Unread
            </p>
            <span className="w-[24px] h-[19px] flex justify-center items-center flex-col pt-[4px] bg-shadyColor-0 text-white text-[12px] rounded-full">
              {unRead.length}
            </span>
          </button>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            markAllNotificationsAsRead();
          }}
          disabled={isMarkingAll || unRead.length === 0}
          className="h-[36px] py-[17px] px-[10px] border border-[#D9D9D9]/10 flex justify-center items-center text-primaryColors-0 text-[13px] gap-2 hover:bg-primaryColors-0/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isMarkingAll ? (
            <FaSpinner className="animate-spin" size={14} />
          ) : (
            <RiCheckDoubleFill />
          )}
          <span>Mark All Read</span>
        </button>
      </div>

      {!isLoading && displayedNotifications.length === 0 ? (
        <div className="h-full flex justify-center items-center flex-col gap-3 w-full">
          <div className="h-[100px] w-[100px] bg-secondaryColors-0 rounded-full flex justify-center items-center flex-col">
            <div className="w-[76px] h-[76px] bg-shadyColor-0 rounded-full border-[5px] border-[#F1F1F4]/10 flex justify-center items-center flex-col text-[#71748C]">
              <span>
                <PiThumbsUpLight size={40} color="orange" />
              </span>
            </div>
          </div>
          <h1 className="text-[32px] text-[#111827] font-[500]">
            All Caught Up
          </h1>
          <p className="text-[16px] text-[#41415A]">
            {activeTab === "all"
              ? "No notifications yet."
              : "No unread notifications."}
          </p>
        </div>
      ) : (
        <div className="my-5 overflow-y-auto h-[calc(100%-80px)]">
          <div className="flex flex-col">
            {!isLoading &&
              displayedNotifications.map((n, i) => (
                <div
                  key={n.id || i}
                  className="relative group cursor-pointer hover:bg-shadyColor-0/50 transition-all rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNotificationClick(n);
                  }}
                >
                  <div className="flex justify-between items-start p-2">
                    <div className="flex items-start gap-2 flex-1">
                      <div className="bg-shadyColor-0 border border-[#ccc]/10 flex justify-center items-center rounded-md p-2">
                        {n?.type === "group" ? (
                          <HiOutlineUserGroup size={18} color="#49151B" />
                        ) : n?.type === "course" ? (
                          <div className="text-primaryColors-0">📚</div>
                        ) : (
                          <div className="text-primaryColors-0">🔔</div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 flex-1">
                        <div
                          className={`text-[0.9rem] font-medium ${
                            !n?.isRead
                              ? "text-primaryColors-0"
                              : "text-textSlightDark-0"
                          }`}
                        >
                          {n?.title}
                          {!n?.isRead && (
                            <span className="ml-2 inline-block w-2 h-2 bg-primaryColors-0 rounded-full"></span>
                          )}
                        </div>
                        <div className="text-[0.8rem] text-nearTextColors-0 line-clamp-2">
                          {n?.message}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-nearTextColors-0 text-[0.7rem] whitespace-nowrap">
                        {formatTime(n?.createdAt as any)}
                      </div>
                      {!n?.isRead && activeTab === "all" && (
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
              ))}
          </div>
        </div>
      )}
    </div>
  );
}