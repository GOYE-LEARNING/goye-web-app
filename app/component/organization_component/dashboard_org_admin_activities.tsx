// components/DashboardOrgAdminActivities.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CiClock2 } from "react-icons/ci";
import { 
  HiOutlineBookOpen, 
  HiOutlineUserGroup, 
  HiOutlineCalendar,
  HiOutlineChat,
  HiOutlineStar,
  HiOutlineClipboardList,
  HiOutlineAcademicCap
} from "react-icons/hi";
import { formatDistanceToNow } from "date-fns";
import { BiTrophy } from "react-icons/bi";

interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  icon: string;
  user?: {
    id: string;
    name: string;
    first_name: string;
    last_name: string;
    user_pic?: string;
  };
  course?: {
    id: string;
    title: string;
    image?: string;
  };
  group?: {
    id: string;
    title: string;
    image?: string;
  };
  quiz?: {
    id: string;
    title: string;
    score: number;
  };
  achievement?: {
    id: string;
    title: string;
    content: string;
    point: number;
  };
  post?: {
    id: string;
    title: string;
    content: string;
    replyCount: number;
    likeCount: number;
  };
}

interface ActivitySummary {
  course_joins: number;
  course_completions: number;
  event_joins: number;
  group_joins: number;
  posts: number;
  quiz_completions: number;
  achievements: number;
}

export default function DashboardOrgAdminActivities() {
  const params = useParams<{ org_name: string }>();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        
        // First get the organization ID
        const orgRes = await fetch(
          `${API_URL}/api/organizations/fetch-specific-organization/${params.org_name}`,
          {
            credentials: "include",
          }
        );
        
        if (!orgRes.ok) throw new Error("Failed to fetch organization");
        const orgData = await orgRes.json();
        const organizationId = orgData.data?.id;
        
        if (!organizationId) throw new Error("Organization ID not found");

        // Fetch activities
        const res = await fetch(
          `${API_URL}/api/organizations/activities/${organizationId}`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch activities");
        const result = await res.json();
        
        if (result.success) {
          setActivities(result.data.activities || []);
          setSummary(result.data.summary || null);
        } else {
          setError(result.message || "Failed to fetch data");
        }
      } catch (err) {
        console.error("Error fetching activities:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (params.org_name) {
      fetchActivities();
    }
  }, [params.org_name]);

  // Get icon component based on activity type
  const getActivityIcon = (type: string) => {
    const iconProps = {
      className: "w-4 h-4",
    };
    
    switch (type) {
      case 'COURSE_JOIN':
        return <HiOutlineAcademicCap {...iconProps} />;
      case 'COURSE_COMPLETE':
        return <BiTrophy {...iconProps} />;
      case 'EVENT_JOIN':
        return <HiOutlineCalendar {...iconProps} />;
      case 'GROUP_JOIN':
        return <HiOutlineUserGroup {...iconProps} />;
      case 'POST':
        return <HiOutlineChat {...iconProps} />;
      case 'QUIZ_COMPLETE':
        return <HiOutlineClipboardList {...iconProps} />;
      case 'ACHIEVEMENT':
        return <HiOutlineStar {...iconProps} />;
      default:
        return <HiOutlineBookOpen {...iconProps} />;
    }
  };

  // Get icon background color based on activity type
  const getIconBgColor = (type: string) => {
    switch (type) {
      case 'COURSE_JOIN':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'COURSE_COMPLETE':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'EVENT_JOIN':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      case 'GROUP_JOIN':
        return 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400';
      case 'POST':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
      case 'QUIZ_COMPLETE':
        return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400';
      case 'ACHIEVEMENT':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };

  const displayedActivities = showAll ? activities : activities.slice(0, 5);

  if (loading) {
    return (
      <div className="cr_box">
        <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0 text-[14px] font-[600]">
          Activities
        </h1>
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cr_box">
        <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0 text-[14px] font-[600]">
          Activities
        </h1>
        <p className="text-red-500 dark:text-red-400 text-center py-4">{error}</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="cr_box">
        <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0 text-[14px] font-[600]">
          Activities
        </h1>
        <div className="flex flex-col items-center justify-center py-8">
          <HiOutlineBookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" />
          <p className="text-gray-500 dark:text-gray-400 text-center">No recent activities</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cr_box">
      <div className="flex justify-between items-center">
        <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0 text-[14px] font-[600]">
          Activities
        </h1>
     
      </div>
      <div className="mt-[20px] flex flex-col gap-3">
        {displayedActivities.map((activity, index) => (
          <div key={activity.id}>
            <div className="flex gap-[12px] items-start">
              <div className={`h-[32px] w-[32px] flex justify-center items-center rounded-md flex-shrink-0 ${getIconBgColor(activity.type)}`}>
                {/* ✅ FIX: Always use getActivityIcon based on type, ignore the icon from API */}
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0 text-[14px] font-[600] break-words">
                  {activity.message}
                </h1>
                <p className="flex items-center text-textGrey-0 dark:text-gray-400 text-[13px] gap-2">
                  <CiClock2 className="flex-shrink-0 w-4 h-4" /> 
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
            {index < displayedActivities.length - 1 && (
              <div className="dashboard_hr my-3"></div>
            )}
          </div>
        ))}
        
        {activities.length > 5 && (
          <button 
            onClick={() => setShowAll(!showAll)}
            className="text-primary-500 dark:text-primary-400 text-sm text-center hover:underline mt-2 transition-colors"
          >
            {showAll ? 'Show less' : `View all ${activities.length} activities`}
          </button>
        )}
      </div>
    </div>
  );
}