"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowRight, FaRocket } from "react-icons/fa6";
import { MdMenuBook } from "react-icons/md";
import { useProgress } from "../context/progressContext";
import { useI18n } from "../context/I18nContext";

interface Props {
  openGrowth: () => void;
}

interface GrowthData {
  user: {
    name: string;
    totalXP: number;
    currentLevel: string;
    levelNumber: number;
    nextLevelXP: number;
    currentLevelXP: number
    xpForCurrentLevel:number
    progressToNextLevel: number;
  };
  journey: {
    startedAt: string;
    progressBar: number;
    startedJourney: boolean;
  };
  stats: {
    totalBadges: number;
    totalAchievements: number;
    completedCourses: number;
    totalPoints: number;
    badgesAndLevels: number;
  };
  achievements: {
    courseCompletions: any[];
    groupAchievements: any[];
    badges: any[];
    levelProgress: any;
  };
  recentActivity: Array<{
    action: string;
    points: number;
    date: string;
  }>;
}

export default function DashboardStudentGrowth({ openGrowth }: Props) {
  const { progressId, setProgressId } = useProgress();
  const { t } = useI18n();
  const [growthData, setGrowthData] = useState<GrowthData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const params = useParams<{ org_name: string }>();
  const type = localStorage.getItem("type");
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchGrowthData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/growth/fetch-growth-user`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Failed to fetch growth data:", data);
        setError(data.message || "Failed to load growth data");
        return;
      }

      console.log("Growth data:", data);
      setGrowthData(data.data);
    } catch (error) {
      console.error("Error fetching growth data:", error);
      setError("An error occurred while fetching your growth data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrowthData();
  }, [progressId]);

  // Get progress bar color based on percentage
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-primaryColors-0";
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get level badge color
  const getLevelBadgeColor = (levelNumber: number) => {
    if (levelNumber >= 10) return "bg-purple-500";
    if (levelNumber >= 7) return "bg-indigo-500";
    if (levelNumber >= 4) return "bg-blue-500";
    return "bg-primaryColors-0";
  };

  const roundedUpNumber = (percentage: number) => {
    return Math.round(percentage);
  };

  return (
    <>
      <div className="dashboard_content_box">
        <div className="dashboard_content_header">
          <h1>{t("My Spiritual Growth")}</h1>
          <div></div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryColors-0"></div>
            <p className="ml-2 text-gray-600 dark:text-gray-400">
              {t("Loading growth data...")}
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
            <button
              onClick={fetchGrowthData}
              className="mt-4 px-4 py-2 bg-primaryColors-0 text-white rounded-md"
            >
              {t("Try Again")}
            </button>
          </div>
        ) : growthData ? (
          <div>
            {/* Level Display */}
            <div className="font-semibold md:mb-4 mb-7 text-center">
              <h1 className="text-xl">
                {t("Level")} {growthData.user.levelNumber}{" "}
                <span className="dark:text-white">
                  {growthData.user.currentLevel}/
                  <i className="not-italic text-primaryColors-0">
                    {growthData.achievements.levelProgress.name}
                  </i>
                </span>
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {growthData.user.name}
              </p>
            </div>

            <div className="dashboard_content_subbox">
              {/* XP Progress */}
              <div className="dashboard_content_progress">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">{t("XP Progress")}</h3>
                  <span className="text-xs font-semibold text-primaryColors-0">
                    {growthData.user.xpForCurrentLevel > 0 ? (
                      <>
                        {growthData.user.totalXP} /{" "}
                        {growthData.user.xpForCurrentLevel} XP
                      </>
                    ) : (
                      <>{t("Max level reached")}</>
                    )}{" "}
                  </span>
                </div>
                <div className="w-full h-[8px] bg-[#E8E1E2] dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-[8px] ${getProgressColor(growthData.user.progressToNextLevel)} rounded-full transition-all duration-300`}
                    style={{ width: `${growthData.user.progressToNextLevel}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    {roundedUpNumber(growthData.user.progressToNextLevel)}%{" "}
                    {t("to")} {t("Level")} {growthData.user.levelNumber + 1}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("XP LEFT")}: {growthData.user.nextLevelXP} XP
                  </p>
                </div>
                <div className="dark:bg-[#EFEFF2]/10 bg-[#ccc]/20 h-[1px] w-full my-3"></div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 w-full">
                <div className="flex flex-col justify-center items-center gap-2 p-3 bg-lightWhite-0 dark:bg-secondaryColors-0 rounded-lg">
                  <span className="font-[700] text-xl dark:text-white text-lightBoldText-0">
                    {growthData.stats.totalAchievements}
                  </span>
                  <p className="font-[400] text-[12px] text-[#71748C]">
                    {t("Achievements")}
                  </p>
                </div>

                <div className="flex flex-col justify-center items-center gap-2 p-3 bg-lightWhite-0 dark:bg-secondaryColors-0 rounded-lg">
                  <span className="font-[700] text-xl dark:text-white text-lightBoldText-0">
                    {growthData.stats.completedCourses}
                  </span>
                  <p className="font-[400] text-[12px] text-[#71748C]">
                    {t("Courses")}
                  </p>
                </div>

                <div className="flex flex-col justify-center items-center gap-2 p-3 bg-lightWhite-0 dark:bg-secondaryColors-0 rounded-lg">
                  <span className="font-[700] text-xl dark:text-white text-lightBoldText-0">
                    {growthData.stats.totalBadges}
                  </span>
                  <p className="font-[400] text-[12px] text-[#71748C]">
                    {t("Badges")}
                  </p>
                </div>

                <div className="flex flex-col justify-center items-center gap-2 p-3 bg-lightWhite-0 dark:bg-secondaryColors-0 rounded-lg">
                  <span className="font-[700] text-xl text-green-500">
                    {growthData.user.totalXP}
                  </span>
                  <p className="font-[400] text-[12px] text-[#71748C]">
                    {t("Total XP")}
                  </p>
                </div>
              </div>

              {/* Recent Activity */}
              {growthData.recentActivity.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">
                    {t("Recent Activity")}
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {growthData.recentActivity
                      .slice(0, 5)
                      .map((activity, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {activity.action}
                          </span>
                          {activity.points == 0 ? (
                            <div></div>
                          ) : (
                            <span className="text-xs font-semibold text-green-500">
                              +{activity.points} XP
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <button
                className="h-[45px] py-[17px]  bg-primaryColors-0 flex justify-center items-center w-full  text-white font-[600] cursor-pointer rounded-md mt-4 hover:opacity-90 transition-opacity"
                onClick={openGrowth}
              >
                {t("View Full Growth Details")}
              </button>
            </div>
          </div>
        ) : (
          // No growth data state (user hasn't started journey)
          <div>
            <div className="flex justify-center items-center flex-col gap-2 py-8">
              <span>
                <FaRocket size={60} color="#FFA500" />
              </span>
              <h1 className="text-textSlightDark-0 font-semibold text-[18px] mt-4">
                {t("Start Your Spiritual Growth Journey")}
              </h1>
              <p className="text-gray-500 text-sm text-center max-w-md">
                {t(
                  "Begin your first course to track your progress, earn badges, and grow spiritually.",
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
