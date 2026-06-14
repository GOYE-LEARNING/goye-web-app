"use client";

import { useEffect, useState } from "react";
import { FaCrown, FaSync } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface TutorOverviewData {
  topCourse: {
    id: string;
    course_title: string;
    course_short_description: string;
    course_image: string;
    course_level: string;
    totalStudents: number;
  };
  totalPublishedCourses: number;
  avgCompletionPercentage: number;
}

interface Props {
  viewTutorCourseBreakdown: (id: string) => void;
}

export default function DashboardTutorOverview({ viewTutorCourseBreakdown }: Props) {
  const [overviewData, setOverviewData] = useState<TutorOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchTutorOverview = async (showRefresh = false) => {
    if (showRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const response = await fetch(`${API_URL}/api/course/tutor-overview`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch overview data");
      }

      setOverviewData(data.data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching tutor overview:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTutorOverview();
  }, []);

  const handleViewCourse = () => {
    if (overviewData?.topCourse) {
      viewTutorCourseBreakdown(overviewData.topCourse.id);
    }
  };

  if (isLoading) {
    return (
      <div className="cr_box">
        <div className="flex justify-between items-center mb-2">
          <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0 text-[14px] font-[600]">Overview</h1>
        </div>
        <div className="dark:bg-shadyColor-0 bg-lightWhite-0 p-[16px] mt-[20px] flex flex-col gap-1">
          <div className="animate-pulse space-y-3">
            <div className="h-4 dark:bg-shadyColor-0 bg-lightWhite-0 rounded w-1/3"></div>
            <div className="h-6 dark:bg-shadyColor-0 bg-lightWhite-0 rounded w-2/3"></div>
            <div className="h-16 dark:bg-shadyColor-0 bg-lightWhite-0 rounded"></div>
            <div className="flex justify-around py-4">
              <div className="h-12 w-16 dark:bg-shadyColor-0 bg-lightWhite-0 rounded"></div>
              <div className="h-12 w-16 dark:bg-shadyColor-0 bg-lightWhite-0 rounded"></div>
              <div className="h-12 w-16 dark:bg-shadyColor-0 bg-lightWhite-0 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cr_box">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-textSlightDark-0 text-[14px] font-[600]">Overview</h1>
          <button
            onClick={() => fetchTutorOverview(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <FaSync className="text-gray-400 text-sm" />
          </button>
        </div>
        <div className="bg-shadyColor-0 p-[16px] mt-[20px] flex flex-col gap-3">
          <p className="text-red-500 text-center text-sm">{error}</p>
          <button
            onClick={() => fetchTutorOverview(true)}
            className="form_more bg-primaryColors-0 text-white text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!overviewData || overviewData.totalPublishedCourses === 0) {
    return (
      <div className="cr_box">
        <div className="flex justify-between items-center mb-2">
          <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0 text-[14px] font-[600]">Overview</h1>
          <button
            onClick={() => fetchTutorOverview(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            title="Refresh"
          >
            <FaSync className="text-gray-400 text-sm" />
          </button>
        </div>
        <div className="bg-shadyColor-0 p-[16px] mt-[20px] flex flex-col gap-3 text-center">
          <p className="text-textGrey-0 text-sm">No courses published yet</p>
          <button
            onClick={() => router.push("/dashboard/tutor/course")}
            className="form_more bg-primaryColors-0 text-white text-sm"
          >
            Create Your First Course
          </button>
        </div>
      </div>
    );
  }

  const { topCourse, totalPublishedCourses, avgCompletionPercentage } = overviewData;

  return (
    <div className="cr_box">
      <div className="flex justify-between items-center mb-2">
        <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0 text-[14px] font-[600]">Overview</h1>
        <button
          onClick={() => fetchTutorOverview(true)}
          disabled={isRefreshing}
          className="p-2 hover:bg-gray-100 rounded-full transition disabled:opacity-50"
          title="Refresh"
        >
          <FaSync className={`text-gray-400 text-sm ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>
      <div className="dark:bg-shadyColor-0 bg-lightWhite-0 p-[16px] mt-[20px] flex flex-col gap-1">
        <span className="flex items-center gap-1">
          <FaCrown className="text-primaryYellow-0" />
          <h1 className="text-[13px] dark:text-textSlightDark-0 text-lightBoldText-0 font-medium">Top Performing Course</h1>
        </span>

        <div className="flex items-center gap-3 mt-1">
          {topCourse.course_image && (
            <img
              src={topCourse.course_image}
              alt={topCourse.course_title}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <h1 className="font-bold text-[15px] dark:text-textSlightDark-0 text-lightBoldText-0 line-clamp-1">
              {topCourse.course_title}
            </h1>
            <p className="text-textGrey-0 text-[11px] mt-0.5">
              {topCourse.course_level} • {topCourse.totalStudents} students
            </p>
          </div>
        </div>

        <p className="text-textGrey-0 text-[13px] md:line-clamp-none line-clamp-2 mt-1">
          {topCourse.course_short_description}
        </p>

        <div className="dashboard_hr my-3"></div>

        <div className="flex justify-around items-center w-full my-2">
          <div className="flex flex-col gap-1 items-center dark:text-textSlightDark-0 text-lightBoldText-0">
            <h1 className="font-bold text-[18px]">{topCourse.totalStudents}</h1>
            <p className="text-textGrey-0 md:text-[12px] text-[10px]">Total Students</p>
          </div>
          <div className="flex flex-col gap-1 items-center dark:text-textSlightDark-0 text-lightBoldText-0">
            <h1 className="font-bold text-[18px]">{totalPublishedCourses}</h1>
            <p className="text-textGrey-0 md:text-[12px] text-[10px]">Published Courses</p>
          </div>
          <div className="flex flex-col gap-1 items-center dark:text-textSlightDark-0 text-lightBoldText-0">
            <h1 className="font-bold text-[18px]">{avgCompletionPercentage}%</h1>
            <p className="text-textGrey-0 md:text-[12px] text-[10px]">Avg Completion</p>
          </div>
        </div>

        {/* Progress bar for completion rate */}
        <div className="w-full mt-2">
          <div className="w-full dark:bg-shadyColor-0 bg-white rounded-full h-1.5">
            <div
              className="bg-primaryColors-0 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${avgCompletionPercentage}%` }}
            />
          </div>
        </div>

        <button
          onClick={handleViewCourse}
          className="form_more dark:bg-secondaryColors-0 bg-primaryColors-0 text-white dark:text-primaryColors-0 font-semibold text-[14px] mt-3 hover:bg-boldShadyColor-0/80 transition"
        >
          View Course
        </button>
      </div>
    </div>
  );
}