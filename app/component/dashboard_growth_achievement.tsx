"use client";

import { useEffect, useState } from "react";
import { SlBadge } from "react-icons/sl";
import { FaMedal, FaStar, FaTrophy, FaAward } from "react-icons/fa";
import { GiPrayer, GiAchievement } from "react-icons/gi";
import Loader from "./loader";

interface Achievement {
  id: string;
  title: string;
  content: string;
  point: number;
  createdAt: string;
  course?: {
    course_title: string;
  };
  group?: {
    group_title: string;
  };
  badge?: Array<{
    badges: string;
  }>;
}

interface AchievementData {
  achievements: Achievement[];
  summary: {
    totalAchievements: number;
    totalBadges: number;
    currentLevel: number;
    currentLevelName: string;
    totalXP: number;
    nextLevelXP: number;
    progressToNextLevel: number;
  };
}

// Helper to get icon based on achievement title/content
const getAchievementIcon = (title: string, content: string) => {
  const lowerTitle = title.toLowerCase();
  const lowerContent = content.toLowerCase();

  if (lowerTitle.includes("pray") || lowerContent.includes("pray")) {
    return <GiPrayer className="w-5 h-5 text-[#2C7FFF]" />;
  }
  if (lowerTitle.includes("badge") || lowerContent.includes("badge")) {
    return <FaMedal className="w-5 h-5 text-[#FFB800]" />;
  }
  if (lowerTitle.includes("course") || lowerContent.includes("course")) {
    return <FaTrophy className="w-5 h-5 text-[#30A46F]" />;
  }
  if (lowerTitle.includes("level") || lowerContent.includes("level")) {
    return <FaStar className="w-5 h-5 text-[#9B59B6]" />;
  }
  return <GiAchievement className="w-5 h-5 text-[#2C7FFF]" />;
};

// Helper to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Helper to get achievement description
const getAchievementDescription = (achievement: Achievement) => {
  if (achievement.course) {
    return `Completed course: ${achievement.course.course_title}`;
  }
  if (achievement.group) {
    return `Achievement in group: ${achievement.group.group_title}`;
  }
  return achievement.content || "Achievement unlocked";
};

export default function DashboardGrowthAchievement() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [summary, setSummary] = useState<AchievementData["summary"] | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchAchievements = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/growth/fetch-achievement`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch achievements");
      }

      console.log("Achievements data:", data);
      setAchievements(data.data?.achievements || []);
      setSummary(data.data?.summary || null);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  if (isLoading) {
    return (
      <div className="my-5">
        <div className="bg-[#ffffff] dark:bg-secondaryColors-0 p-[16px]">
          <div className="flex justify-center items-center h-32">
            <Loader
              height={30}
              width={30}
              border_width={3}
              full_border_color="transparent"
              small_border_color="#30A46F"
            />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-5">
        <div className="bg-[#ffffff] dark:bg-secondaryColors-0 p-[16px]">
          <div className="text-center py-8">
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <button
              onClick={fetchAchievements}
              className="mt-4 px-4 py-2 bg-primaryColors-0 text-white rounded-lg hover:bg-primaryColors-0/90 text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!achievements || achievements.length === 0) {
    return (
      <div className="my-5">
        <div className="bg-[#ffffff] dark:bg-secondaryColors-0 p-[16px] text-center">
          <SlBadge className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-600 dark:text-gray-400">
            No Achievements Yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Complete courses and lessons to earn achievements!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-5 space-y-3">
      {/* Achievements List */}
      {achievements.slice(0, 5).map((achievement) => (
        <div
          key={achievement.id}
          className="bg-[#ffffff] dark:bg-secondaryColors-0 flex justify-between items-center p-[16px] rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-4">
            <span className="h-[40px] w-[40px] flex-shrink-0 flex justify-center items-center bg-[#2C7FFF0D] dark:bg-[#2C7FFF1A] rounded-full">
              {getAchievementIcon(achievement.title, achievement.content)}
            </span>
            <div className="flex flex-col gap-1">
              <h1 className="font-[600] text-[14px] text-[#41415A] dark:text-white">
                {achievement.title}
              </h1>
              <h2 className="text-[#71748C] dark:text-gray-400 text-[12px]">
                {getAchievementDescription(achievement)}
              </h2>
              <p className="text-[#30A46F] text-[12px] font-[600]">
                Earned {formatDate(achievement.createdAt)}
              </p>
            </div>
          </div>
          <span>
            {achievement.point == 0 ? (
              <div><FaTrophy color="gold" size={20}/></div>
            ) : (
              <span className="w-[45px] h-[22px] flex-shrink-0 flex justify-center items-center bg-[#30A46F] text-[#ffffff] rounded-[4px] text-[11px] font-semibold">
                +{achievement.point}
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
