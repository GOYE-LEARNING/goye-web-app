"use client";

import { useEffect, useState } from "react";
import Loader from "@/app/component/loader";
import { formatDistanceToNow } from "date-fns";
import {
  HiOutlineBookOpen,
  HiOutlineUserGroup,
  HiOutlineChatAlt2,
} from "react-icons/hi";

type FeedbackType = "COURSE" | "GROUP" | "OTHER";

interface FeedbackItem {
  id: string;
  message: string;
  type: FeedbackType;
  createdAt: string;
  user?: { first_name?: string; last_name?: string; email_address?: string; role?: string } | null;
  organization?: { organization_name?: string } | null;
}

const FEEDBACK_ICON: Record<FeedbackType, React.ReactNode> = {
  COURSE: <HiOutlineBookOpen />,
  GROUP: <HiOutlineUserGroup />,
  OTHER: <HiOutlineChatAlt2 />,
};

const FEEDBACK_COLOR: Record<FeedbackType, string> = {
  COURSE: "bg-boldGreen-0/10 text-boldGreen-0",
  GROUP: "bg-boldBlue-0/10 text-boldBlue-0",
  OTHER: "bg-primaryColors-0/10 text-primaryColors-0",
};

export default function SuperAdminFeedback() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeedback = async () => {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_URL) {
        setError("API URL not configured");
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/feedback/fetch-feedbacks`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to load feedback");
          setIsLoading(false);
          return;
        }

        setFeedback(data.data || []);
      } catch (err) {
        console.error("Error fetching feedback:", err);
        setError("We couldn't reach the server. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  return (
    <div className="w-full">
      <h1 className="dashboard_h1">User Feedback</h1>
      <p className="text-textGrey-0 text-[13px] mb-4">
        Feedback submitted by students, tutors, and organizations across GOYE.
      </p>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader height={35} width={35} border_width={4} full_border_color="transparent" small_border_color="#FFA500" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <HiOutlineChatAlt2 className="text-3xl text-textGrey-0" />
          <p className="text-textGrey-0 text-sm">{error}</p>
        </div>
      ) : feedback.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <HiOutlineChatAlt2 className="text-3xl text-textGrey-0" />
          <p className="text-textGrey-0 text-sm">No feedback submitted yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {feedback.map((item) => {
            const name =
              `${item.user?.first_name || ""} ${item.user?.last_name || ""}`.trim() ||
              item.user?.email_address ||
              "Unknown user";
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 py-3 border-b border-[#ccc]/10 last:border-0"
              >
                <div className={`h-9 w-9 rounded-full flex items-center justify-center text-base flex-shrink-0 ${FEEDBACK_COLOR[item.type]}`}>
                  {FEEDBACK_ICON[item.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-textSlightDark-0 dark:text-white text-[13px]">
                    {item.message}
                  </p>
                  <p className="text-textGrey-0 text-[11px] mt-1">
                    {name}
                    {item.organization?.organization_name ? ` · ${item.organization.organization_name}` : ""}
                  </p>
                </div>
                <span className="text-textGrey-0 text-[11px] flex-shrink-0 whitespace-nowrap">
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
