"use client";

import { useEffect, useState, useRef } from "react";
import { HiOutlineUserGroup } from "react-icons/hi";
import { PiThumbsUpLight } from "react-icons/pi";
import { RiCheckDoubleFill } from "react-icons/ri";
import { formatTime } from "../hook/formatDate";
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
  const [isLoading, setIsLoading] =
    useState<boolean>(false);

  const [notifications, setNotification] =
    useState<Notification[]>([]);

  const [unRead, setUnread] =
    useState<Notification[]>([]);

  const [activeTab, setActiveTab] = useState<
    "all" | "unread"
  >("all");

  const [isMarkingAll, setIsMarkingAll] =
    useState<boolean>(false);

  const [isMarkingSpecific, setIsMarkingSpecific] =
    useState<string | null>(null);

  const [showFullMessage, setShowFullMessage] =
    useState<string[]>([]);

  const panelRef =
    useRef<HTMLDivElement | null>(null);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL;

  const expandMessage = (id: string) => {
    setShowFullMessage((prev) => {
      if (prev.includes(id)) {
        return prev.filter((p) => p !== id);
      }

      return [...prev, id];
    });
  };

  const fetchAllNotification = async () => {
    try {
      setIsLoading(true);

      const res = await fetch(
        `${API_URL}/api/notifications/user`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      const data = await res.json();

      if (!res.ok) {
        console.log(data);
        return;
      }

      setNotification(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotificationUnread =
    async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/notifications/unread`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        const data = await res.json();

        if (!res.ok) {
          console.log(data);
          return;
        }

        setUnread(data.data || []);
      } catch (error) {
        console.error(error);
      }
    };

  const markAllNotificationsAsRead =
    async () => {
      try {
        setIsMarkingAll(true);

        const res = await fetch(
          `${API_URL}/api/notifications/read-all`,
          {
            method: "PUT",
            credentials: "include",
          },
        );

        const data = await res.json();

        if (!res.ok) {
          console.log(data);
          return;
        }

        await fetchAllNotification();

        await fetchNotificationUnread();

        if (onClose) {
          onClose();
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsMarkingAll(false);
      }
    };

  const markSpecificNotificationAsRead =
    async (id: string) => {
      try {
        setIsMarkingSpecific(id);

        const res = await fetch(
          `${API_URL}/api/notifications/${id}/read`,
          {
            method: "PUT",
            credentials: "include",
          },
        );

        const data = await res.json();

        if (!res.ok) {
          console.log(data);
          return;
        }

        setNotification((prev) =>
          prev.map((notification) =>
            notification.id === id
              ? {
                  ...notification,
                  isRead: true,
                }
              : notification,
          ),
        );

        setUnread((prev) =>
          prev.filter(
            (notification) =>
              notification.id !== id,
          ),
        );
      } catch (error) {
        console.error(error);
      } finally {
        setIsMarkingSpecific(null);
      }
    };

  const deleteAllNotifications =
    async () => {
      if (
        !confirm(
          "Are you sure you want to delete all notifications?",
        )
      )
        return;

      try {
        setIsLoading(true);

        const res = await fetch(
          `${API_URL}/api/notifications/clear-all`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );

        const data = await res.json();

        if (!res.ok) {
          console.log(data);
          return;
        }

        setNotification([]);
        setUnread([]);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

  const handleNotificationClick = (
    notification: Notification,
  ) => {
    if (!notification.isRead) {
      markSpecificNotificationAsRead(
        notification.id,
      );
    }
  };

  useEffect(() => {
    fetchAllNotification();
    fetchNotificationUnread();
  }, []);

  const displayedNotifications =
    activeTab === "all"
      ? notifications
      : unRead;

  return (
    <div
      ref={panelRef}
      onClick={(e) => e.stopPropagation()}
      className="h-[700px] w-[390px] dark:bg-secondaryColors-0 bg-white backdrop-blur-md border border-[#ccc]/10 drop-shadow-2xl md:h-[509px] md:w-[400px] z-[99999] right-0 absolute p-[20px] rounded-xl overflow-hidden"
    >
      <div className="dashboard_triangle absolute -top-[0.8rem] right-4"></div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab("all");
            }}
            className={`dark:bg-secondaryColors-0 bg-lightWhite-0 p-[10px] flex gap-3 items-center justify-center transition-all rounded-lg ${
              activeTab === "all"
                ? "opacity-100"
                : "opacity-70"
            }`}
          >
            <p
              className={`font-[600] ${
                activeTab === "all"
                  ? "text-primaryColors-0"
                  : "text-textGrey-0"
              }`}
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
            className={`dark:bg-secondaryColors-0 bg-lightWhite-0 p-[10px] flex gap-3 items-center justify-center transition-all rounded-lg ${
              activeTab === "unread"
                ? "opacity-100"
                : "opacity-70"
            }`}
          >
            <p
              className={`font-[500] ${
                activeTab === "unread"
                  ? "text-primaryColors-0"
                  : "text-textGrey-0"
              }`}
            >
              Unread
            </p>

            <span className="w-[24px] h-[19px] flex justify-center items-center flex-col pt-[4px] dark:bg-shadyColor-0 bg-primaryYellow-0 text-white text-[12px] rounded-full">
              {unRead.length}
            </span>
          </button>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            markAllNotificationsAsRead();
          }}
          disabled={
            isMarkingAll ||
            unRead.length === 0
          }
          className="h-[36px] py-[17px] px-[10px] border border-[#D9D9D9]/10 flex justify-center items-center text-primaryColors-0 text-[13px] gap-2 hover:bg-primaryColors-0/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
        >
          {isMarkingAll ? (
            <FaSpinner
              className="animate-spin"
              size={14}
            />
          ) : (
            <RiCheckDoubleFill />
          )}

          <span>Mark All Read</span>
        </button>
      </div>

      {!isLoading &&
      displayedNotifications.length === 0 ? (
        <div className="h-full flex justify-center items-center flex-col gap-3 w-full">
          <div className="h-[100px] w-[100px] dark:bg-secondaryColors-0 bg-white rounded-full flex justify-center items-center flex-col">
            <div className="w-[76px] h-[76px] dark:bg-shadyColor-0 bg-lightWhite-0 rounded-full border-[5px] border-[#F1F1F4]/10 flex justify-center items-center flex-col text-[#71748C]">
              <span>
                <PiThumbsUpLight
                  size={40}
                  color="orange"
                />
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
        <div className="my-5 overflow-y-auto h-[calc(100%-80px)] pr-1">
          <div className="flex flex-col">
            {!isLoading &&
              displayedNotifications.map(
                (n, i) => (
                  <div
                    key={n.id || i}
                    className="relative group cursor-pointer dark:hover:bg-shadyColor-0/50 hover:bg-lightWhite-0 transition-all rounded-lg"
                    onClick={(e) => {
                      e.preventDefault();

                      e.stopPropagation();

                      expandMessage(n.id);

                      handleNotificationClick(
                        n,
                      );
                    }}
                  >
                    <div className="flex justify-between items-start p-2">
                      <div className="flex items-start gap-2 flex-1">
                        <div className="dark:bg-shadyColor-0 bg-lightWhite-0 border border-[#ccc]/10 flex justify-center items-center rounded-md p-2">
                          {n?.type === "group" ? (
                            <HiOutlineUserGroup
                              size={18}
                              color="#49151B"
                            />
                          ) : n?.type ===
                            "course" ? (
                            <div className="text-primaryColors-0">
                              📚
                            </div>
                          ) : (
                            <div className="text-primaryColors-0">
                              🔔
                            </div>
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

                          <div
                            className={`text-[0.8rem] text-nearTextColors-0 ${
                              showFullMessage.includes(
                                n.id,
                              )
                                ? ""
                                : "line-clamp-2"
                            }`}
                          >
                            {n?.message}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="text-nearTextColors-0 text-[0.7rem] whitespace-nowrap">
                          {formatTime(
                            n?.createdAt as any,
                          )}
                        </div>

                        {!n?.isRead &&
                          activeTab ===
                            "all" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();

                                markSpecificNotificationAsRead(
                                  n.id,
                                );
                              }}
                              disabled={
                                isMarkingSpecific ===
                                n.id
                              }
                              className="text-xs text-primaryColors-0 hover:text-primaryColors-0/70 transition-all disabled:opacity-50"
                            >
                              {isMarkingSpecific ===
                              n.id ? (
                                <FaSpinner
                                  className="animate-spin"
                                  size={12}
                                />
                              ) : (
                                "Mark as read"
                              )}
                            </button>
                          )}
                      </div>
                    </div>

                    <div className="h-[1px] w-full bg-[#ccc]/10 my-1"></div>
                  </div>
                ),
              )}
          </div>
        </div>
      )}
    </div>
  );
}