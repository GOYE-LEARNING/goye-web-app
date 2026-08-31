"use client";

import { useEffect, useState } from "react";
import Loader from "./loader";

interface GrowthData {
  user: {
    name: string;
    totalXP: number;
    currentLevel: string;
    levelNumber: number;
    nextLevelXP: number;
    nextLevelName: string;
    currentLevelXP: number;
    xpForCurrentLevel: number;
    progressToNextLevel: number;
  };
  stats: {
    totalBadges: number;
    totalAchievements: number;
    completedCourses: number;
    inProgressCourses: number;
    enrolledCourses: number;
    totalPoints: number;
  };
  journey: {
    startedAt: string;
    progressBar: number;
    startedJourney: boolean;
  };
}

export default function DashboardStudentGrowthMore() {
  const [growthData, setGrowthData] = useState<GrowthData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchGrowthData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/api/growth/fetch-growth-user`, {
        method: "GET",
        credentials: "include",
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch growth data");
      }
      
      console.log("Growth data:", data);
      setGrowthData(data.data);
      
    } catch (error) {
      console.error("Error fetching growth data:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrowthData();
  }, []);

  if (isLoading) {
    return (
      <div className="dashboard_content_box">
        <div className="flex justify-center items-center h-64">
          <Loader height={40} width={40} border_width={3} full_border_color="transparent" small_border_color="#30A46F"/>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard_content_box">
        <div className="text-center py-8">
          <p className="text-red-500 dark:text-red-400">{error}</p>
          <button 
            onClick={fetchGrowthData}
            className="mt-4 px-4 py-2 bg-primaryColors-0 text-white rounded-lg hover:bg-primaryColors-0/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!growthData) {
    return (
      <div className="dashboard_content_box">
        <div className="text-center py-8">
          <p className="text-gray-500">Start your journey to see your growth!</p>
        </div>
      </div>
    );
  }

  const { user, stats } = growthData;
  const currentLevel = user.currentLevel || "Seeker";
  const totalXP = user.totalXP || 0;
  const currentLevelXP = user.currentLevelXP || 0;
  const xpForCurrentLevel = user.xpForCurrentLevel || 0;
  const nextLevelXP = user.nextLevelXP || 0;
  const nextLevelName = user.nextLevelName || "Max Level";
  const progressToNext = user.progressToNextLevel || 0;

  return (
    <>
      <div className="dashboard_content_box">
        {/* Level Progress Section */}
        <div className="dashboard_content_progress">
          <div className="dashboard_content_header">
            <h1 className="text-[#41415A] dark:text-white font-[600] capitalize">
              {currentLevel}
            </h1>
            <span className="font-[500] text-[12px] text-[#71748C] dark:text-gray-400">
              {xpForCurrentLevel > 0 ? (
                <>{totalXP} / {xpForCurrentLevel} XP</>
              ) : (
                <>Max level</>
              )}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-[8px] dark:bg-shadyColor-0 bg-lightWhite-0 rounded-full overflow-hidden">
            <div 
              className="h-[8px] bg-[#30A46F] transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressToNext}%` }}
            ></div>
          </div>
          
          {/* Next Level Info */}
          <div className="text-[#41415A] dark:text-white font-[600] text-center my-3">
            {nextLevelXP > 0 ? `${nextLevelXP} XP to ${nextLevelName}` : "Maximum Level Reached! 🎉"}
          </div>
          
          <div className="bg-[#EFEFF2] dark:bg-[#ccc]/20 h-[1px] w-full"></div>
        </div>

        {/* Stats Section */}
        <div className="flex justify-around items-center w-full flex-wrap gap-4 py-4">
          <div className="flex flex-col justify-center items-center gap-2 min-w-[70px]">
            <span className="font-[700] text-xl text-primaryColors-0">
              {stats.totalAchievements || 0}
            </span>
            <p className="font-[400] text-[#71748C] dark:text-gray-400 text-sm">
              Achievements
            </p>
          </div>

          <div className="flex flex-col justify-center items-center gap-2 min-w-[70px]">
            <span className="font-[700] text-xl text-primaryColors-0">
              {stats.completedCourses || 0}
            </span>
            <p className="font-[400] text-[#71748C] dark:text-gray-400 text-sm">
              Completed Courses
            </p>
          </div>

          <div className="flex flex-col justify-center items-center gap-2 min-w-[70px]">
            <span className="font-[700] text-xl text-primaryColors-0">
              {stats.totalBadges || 0}
            </span>
            <p className="font-[400] text-[#71748C] dark:text-gray-400 text-sm">
              Badges
            </p>
          </div>
          
          <div className="flex flex-col justify-center items-center gap-2 min-w-[70px]">
            <span className="font-[700] text-xl text-primaryColors-0">
              {totalXP}
            </span>
            <p className="font-[400] text-[#71748C] dark:text-gray-400 text-sm">
              Total XP
            </p>
          </div>
        </div>

        {/* Additional Stats (Optional) */}
        {stats.inProgressCourses > 0 && (
          <div className="mt-4 pt-4 border-t border-[#EFEFF2] dark:border-[#ccc]/20">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#71748C] dark:text-gray-400">In Progress</span>
              <span className="font-semibold text-primaryColors-0">{stats.inProgressCourses} courses</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}