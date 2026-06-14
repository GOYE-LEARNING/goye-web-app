"use client";

import { CiClock2 } from "react-icons/ci";
import { HiOutlineBookOpen } from "react-icons/hi";
import { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa6";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
}


export default function DashboardTutorActivities() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/notifications/fetch-all-notification`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Take only the first 8 activities
        setNotifications(data.data.slice(0, 8));
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}hr ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "course":
      case "quiz":
        return <HiOutlineBookOpen />;
      default:
        return <HiOutlineBookOpen />;
    }
  };

  return (
    <>

      <div className="cr_box">
        <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0 text-[14px] font-[600]">
          Fast Notifications
        </h1>
        <div className="mt-[20px] flex flex-col gap-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <FaSpinner
                className="animate-spin text-primaryColors-0"
                size={24}
              />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-textGrey-0 text-[14px]">
              No notifications yet
            </div>
          ) : (
            notifications.slice(0, 5).map((notification, index) => (
              <div key={notification.id}>
                <div className="flex gap-[12px] items-start">
                  <span className="h-[32px] w-[32px] bg-shadyBlue-0 text-boldBlue-0 flex justify-center items-center">
                    {getIcon(notification.type)}
                  </span>
                  <div className="flex flex-col gap-1">
                    <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0 text-[14px] font-[600]">
                      {notification.title || notification.message}
                    </h1>
                    <p className="flex items-center dark:text-textGrey-0 text-lightBoldText-0/70 text-[14px] gap-2">
                      <CiClock2 /> {getTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                </div>
                {index < notifications.length - 1 && (
                  <div className="dashboard_hr mt-3"></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
