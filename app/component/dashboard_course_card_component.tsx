// components/dashboard_course_card_component.tsx
"use client";

import { memo, useState } from "react";
import { CiBookmark } from "react-icons/ci";
import { IoBookmark } from "react-icons/io5";
import { LuUser } from "react-icons/lu";
import { FaAngleDoubleUp } from "react-icons/fa";
import { MdCheckCircle, MdPlayCircleFilled } from "react-icons/md";
import { HiOutlineClock } from "react-icons/hi";
import logo from "@/public/images/goye_final_logo.png";
import Loader from "./loader";
import { useI18n } from "@/app/context/I18nContext";

interface Course {
  id: string;
  course_image: string | null;
  course_title: string;
  course_description: string;
  course_short_description?: string;
  course_level: string;
  createdBy?: string;
  organizationName?: string;
  enrollmentStatus: string;
  isEnrolled: boolean;
  enrollment: [];
  enrollmentCount?: number;
  progress: {
    percentage: number;
    completedLessons: number;
    totalLessons: number;
    totalDurationMinutes: number;
    watchedDurationMinutes: number;
    isCompleted: boolean;
  } | null;
  totalDuration: number;
  lessonCount: number;
  module?: [
    {
      lesson: [{ duration: number }];
      _count: {
        lesson: number;
      };
    },
  ];
  moduleCount: number;
  lastAccessed?: string | null;
  completedAt?: string | null;
  createdByDetails?: {
    user_pic: string;
  };
}

interface CourseCardProps {
  course: Course;
  isBookmarked: boolean;
  onBookmarkToggle: (id: string) => void;
  onViewCourse: (id: string) => void;
  isViewLoading?: boolean;
  isToggling?: boolean;
}

// ✅ Memoized CourseCard with custom comparison
const CourseCard = memo(function CourseCard({
  course,
  isBookmarked,
  onBookmarkToggle,
  onViewCourse,
  isViewLoading = false,
  isToggling = false,
}: CourseCardProps) {
  const { t } = useI18n();
  const enrollmentStatus = course.enrollmentStatus || "NOT_ENROLLED";
  const isActuallyEnrolled = Boolean(course.isEnrolled) && enrollmentStatus !== "NOT_ENROLLED";

  const getStatusInfo = () => {
    switch (course.enrollmentStatus) {
      case "COMPLETED":
        return {
          color: "text-green-700 bg-green-100 dark:bg-green-900/40 border border-green-200 dark:border-green-800",
          icon: <MdCheckCircle className="w-4 h-4" />,
          label: t("Completed"),
        };
      case "IN_PROGRESS":
        return {
          color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
          icon: <MdPlayCircleFilled className="w-4 h-4" />,
          label: t("In Progress"),
        };
      case "ENROLLED":
        return {
          color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
          icon: <MdPlayCircleFilled className="w-4 h-4" />,
          label: t("Enrolled"),
        };
      default:
        return {
          color: "text-gray-600 bg-gray-50 dark:bg-gray-900/20",
          icon: null,
          label: t("Not Enrolled"),
        };
    }
  };

  const statusInfo = getStatusInfo();
  const progress = course.progress;
  const progressPercentage = progress?.percentage || 0;
  const isCompleted = progress?.isCompleted || false;
  
  const totalLessons = course.module?.reduce((sum, item) => sum + item._count.lesson, 0) || course.lessonCount || 0;
  
  const totalDuration = course.module?.reduce((total, module) => {
    const moduleDuration = module.lesson?.reduce((sum, lesson) => sum + (lesson.duration || 0), 0) || 0;
    return total + moduleDuration;
  }, 0) || course.totalDuration || 0;

  const formatDuration = (duration: number) => {
    if (duration === 0) return <span>0min</span>;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours > 0 && minutes > 0) {
      return <span>{hours}hr {minutes}min</span>;
    } else if (hours > 0) {
      return <span>{hours}hr</span>;
    } else {
      return <span>{minutes}min</span>;
    }
  };

  const enrollmentCount = course.enrollmentCount || course.enrollment?.length || 0;
  const showProgressBar = isActuallyEnrolled && progress !== null;

  return (
    <div className="bg-white dark:bg-secondaryColors-0 p-3 sm:p-5 rounded-[10px] md:drop-shadow-sm w-full md:p-[24px] my-5 flex flex-col gap-2 hover:border-2 hover:border-dashed hover:border-primaryColors-0/50 transition-all duration-200 cursor-pointer min-w-0">
      <div className="flex justify-start items-start w-full gap-2 sm:gap-3 min-w-0">
        <div className="relative flex-shrink-0">
          <img
            src={course.course_image || logo.src}
            alt={course.course_title}
            className="h-[64px] w-[92px] sm:h-[89.16px] sm:w-[130px] object-cover rounded-[10px] sm:rounded-[15px]"
            onError={(e) => {
              (e.target as HTMLImageElement).src = logo.src;
            }}
          />
          <span
            className={`absolute top-1 right-1 cursor-pointer transition-opacity ${isToggling ? "opacity-50 pointer-events-none" : "hover:scale-110"}`}
            onClick={(e) => {
              e.stopPropagation();
              onBookmarkToggle(course.id);
            }}
          >
            {!isBookmarked ? (
              <CiBookmark color="#B1B1B6" size={23} />
            ) : (
              <IoBookmark color="#ffffff" size={23} />
            )}
          </span>

          {isCompleted && (
            <div className="absolute bottom-1 left-1 z-10 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <MdCheckCircle className="w-3 h-3" />
              {t("Complete")}
            </div>
          )}
        </div>

        <div className="w-full min-w-0 flex flex-col gap-2">
          <div className="flex justify-between items-start w-full gap-2">
            <h1 className="text-[13px] sm:text-[14px] font-[700] text-[#41415A] dark:text-white flex-1 min-w-0 line-clamp-2">
              {t(course.course_title)}
            </h1>
            <span className="text-[9px] sm:text-[10px] text-[#41415A] bg-[#F1F1F4] dark:bg-gray-700 dark:text-white px-[4px] rounded whitespace-nowrap flex-shrink-0">
              {enrollmentCount} {t("students")}
            </span>
          </div>

          <p className="text-[#71748C] text-[12px] sm:text-[13px] font-[600] line-clamp-2">
            {t(course.course_short_description || course.course_description)}
          </p>

          {showProgressBar && (
            <div className="w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center text-[11px] text-gray-600 dark:text-gray-300 mb-0.5">
                <span>{t("Progress")}</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    isCompleted ? "bg-green-500" : "bg-primaryColors-0"
                  }`}
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-x-2 gap-y-1 sm:gap-x-4 flex-wrap min-w-0">
            <span className="flex items-center gap-1 sm:gap-2 text-primaryColors-0 md:text-[13px] text-[11px] sm:text-[12px] min-w-0">
              <LuUser className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <div className="truncate max-w-[120px] sm:max-w-none">
                {course.organizationName || course.createdBy || t("Unknown")}
              </div>
            </span>

            <span className="flex items-center gap-1 sm:gap-2 text-[#30A46F] text-[11px] sm:text-[13px]">
              <FaAngleDoubleUp className="w-3 h-3" />
              {course.course_level ? t(course.course_level) : t("Beginner")}
            </span>

            <span className="flex items-center gap-1 sm:gap-2 text-gray-500 text-[11px] sm:text-[12px]">
              <HiOutlineClock className="w-3 h-3" />
              {formatDuration(totalDuration)}
            </span>

            <span className="flex items-center gap-1 sm:gap-2 text-gray-500 text-[11px] sm:text-[12px]">
              {totalLessons} {t("lessons")}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${statusInfo.color}`}
            >
              {statusInfo.icon}
              {statusInfo.label}
            </span>

            {isActuallyEnrolled && progress && (
              <span className="text-[10px] text-gray-500">
                {progress.completedLessons || 0}/
                {progress.totalLessons || totalLessons || 0} {t("lessons")}
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        className="h-[40px] text-[14px] dark:bg-shadyColor-0 bg-lightWhite-0 text-primaryColors-0 my-3 w-full cursor-pointer hover:bg-primaryColors-0 hover:text-white transition-colors duration-200 rounded-md"
        onClick={(e) => {
          e.stopPropagation();
          onViewCourse(course.id);
        }}
        disabled={isViewLoading}
      >
        {isViewLoading ? (
          <Loader
            height={20}
            width={20}
            border_width={2}
            full_border_color="transparent"
            small_border_color="white"
          />
        ) : isActuallyEnrolled ? (
          isCompleted ? t("Review Course") : t("Continue Learning")
        ) : (
          t("View Course")
        )}
      </button>

      <div className="h-[1px] hidden md:block w-full dark:bg-[#EFEFF2]/20 bg-[#ccc]/20"></div>
    </div>
  );
}, (prevProps, nextProps) => {
  // ✅ Only re-render if these specific props change
  return (
    prevProps.course.id === nextProps.course.id &&
    prevProps.isBookmarked === nextProps.isBookmarked &&
    prevProps.isViewLoading === nextProps.isViewLoading &&
    prevProps.isToggling === nextProps.isToggling &&
    prevProps.course.progress?.percentage === nextProps.course.progress?.percentage &&
    prevProps.course.enrollmentStatus === nextProps.course.enrollmentStatus &&
    prevProps.course.isEnrolled === nextProps.course.isEnrolled
  );
});

export default CourseCard;