"use client";

import { useEffect, useState } from "react";
import Loader from "@/app/component/loader";
import { formatDistanceToNow } from "date-fns";
import {
  HiOutlineUserAdd,
  HiOutlineOfficeBuilding,
  HiOutlineBookOpen,
  HiOutlineClock,
} from "react-icons/hi";

interface ActivityItem {
  type: "user_signup" | "organization_created" | "course_created";
  id: string;
  title: string;
  detail: string;
  createdAt: string;
}

const ACTIVITY_ICON: Record<ActivityItem["type"], React.ReactNode> = {
  user_signup: <HiOutlineUserAdd />,
  organization_created: <HiOutlineOfficeBuilding />,
  course_created: <HiOutlineBookOpen />,
};

const ACTIVITY_COLOR: Record<ActivityItem["type"], string> = {
  user_signup: "bg-boldBlue-0/10 text-boldBlue-0",
  organization_created: "bg-primaryColors-0/10 text-primaryColors-0",
  course_created: "bg-boldGreen-0/10 text-boldGreen-0",
};

export default function SuperAdminActivity() {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActivity = async () => {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_URL) {
        setError("API URL not configured");
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/super-admin/activity`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.message || "Failed to load platform activity");
          setIsLoading(false);
          return;
        }

        setActivity(data.data || []);
      } catch (err) {
        console.error("Error fetching platform activity:", err);
        setError("We couldn't reach the server. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivity();
  }, []);

  return (
    <div className="w-full">
      <h1 className="dashboard_h1">Platform Activity</h1>
      <p className="text-textGrey-0 text-[13px] mb-4">
        The most recent signups, organizations, and courses across GOYE.
      </p>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader height={35} width={35} border_width={4} full_border_color="transparent" small_border_color="#FFA500" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <HiOutlineClock className="text-3xl text-textGrey-0" />
          <p className="text-textGrey-0 text-sm">{error}</p>
        </div>
      ) : activity.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <HiOutlineClock className="text-3xl text-textGrey-0" />
          <p className="text-textGrey-0 text-sm">No recent activity yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {activity.map((item, i) => (
            <div
              key={`${item.type}-${item.id}-${i}`}
              className="flex items-start gap-3 py-3 border-b border-[#ccc]/10 last:border-0"
            >
              <div className={`h-9 w-9 rounded-full flex items-center justify-center text-base flex-shrink-0 ${ACTIVITY_COLOR[item.type]}`}>
                {ACTIVITY_ICON[item.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-textSlightDark-0 dark:text-white text-[13px] font-[600] truncate">
                  {item.title}
                </p>
                <p className="text-textGrey-0 text-[12px]">{item.detail}</p>
              </div>
              <span className="text-textGrey-0 text-[11px] flex-shrink-0 whitespace-nowrap">
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
