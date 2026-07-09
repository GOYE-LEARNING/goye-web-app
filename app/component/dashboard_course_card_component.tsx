// components/dashboard_course_card_component.tsx
"use client";

import Image from "next/image";
import { CiBookmark } from "react-icons/ci";
import { IoBookmark } from "react-icons/io5";
import { LuUser } from "react-icons/lu";
import { FaAngleDoubleUp } from "react-icons/fa";
import { MdCheckCircle, MdPlayCircleFilled } from "react-icons/md";
import { HiOutlineClock } from "react-icons/hi";
import logo from "@/public/images/logo.png";
import Loader from "./loader";

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
  totalEnrollments: number;
  progress: {
    percentage: number;
    completedLessons: number;
    totalLessons: number;
    totalDurationMinutes: number;
    watchedDurationMinutes: number;
    isCompleted: boolean;
  };
  totalDuration: number;
  lessonCount: number;
  moduleCount: number;
  lastAccessed?: string | null;
  completedAt?: string | null;
}

interface CourseCardProps {
  course: Course;
  isBookmarked: boolean;
  onBookmarkToggle: (id: string) => void;
  onViewCourse: (id: string) => void;
  isViewLoading?: boolean;
  isToggling?: boolean;
}

export default function CourseCard({
  course,
  isBookmarked,
  onBookmarkToggle,
  onViewCourse,
  isViewLoading = false,
  isToggling = false,
}: CourseCardProps) {
  // Get status color and icon
  const getStatusInfo = () => {
    switch (course.enrollmentStatus) {
      case "COMPLETED":
        return {
          color: "text-green-600 bg-green-50 dark:bg-green-900/20",
          icon: <MdCheckCircle className="w-4 h-4" />,
          label: "Completed",
        };
      case "IN_PROGRESS":
        return {
          color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
          icon: <MdPlayCircleFilled className="w-4 h-4" />,
          label: "In Progress",
        };
      case "ENROLLED":
        return {
          color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
          icon: <MdPlayCircleFilled className="w-4 h-4" />,
          label: "Enrolled",
        };
      default:
        return {
          color: "text-gray-600 bg-gray-50 dark:bg-gray-900/20",
          icon: null,
          label: "Not Enrolled",
        };
    }
  };

  const statusInfo = getStatusInfo();
  const progressPercentage = course.progress?.percentage || 0;
  const isCompleted = course.progress?.isCompleted || false;

  return (
    <div className="md:bg-white dark:md:bg-secondaryColors-0 md:drop-shadow-sm w-full md:p-[24px] my-5 flex flex-col gap-2 hover:border-2 hover:border-dashed hover:border-primaryColors-0/50 transition-all duration-200 cursor-pointer">
      <div className="flex justify-start items-start w-full gap-3">
        <div className="relative flex-shrink-0">
          <img
            src={course.course_image || logo.src}
            alt={course.course_title}
            className="h-[89.16px] w-[130px] object-cover rounded-[15px]"
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

          {/* Progress badge on image */}
          {isCompleted && (
            <div className="absolute bottom-1 left-1 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
              <MdCheckCircle className="w-3 h-3" />
              Complete
            </div>
          )}
        </div>

        <div className="w-full flex flex-col gap-2">
          <div className="flex justify-between items-start w-full gap-2">
            <h1 className="text-[14px] font-[700] text-[#41415A] dark:text-white flex-1 line-clamp-2">
              {course.course_title}
            </h1>
            <span className="text-[10px] text-[#41415A] bg-[#F1F1F4] dark:bg-gray-700 dark:text-white px-[4px] rounded whitespace-nowrap">
              {course.totalEnrollments || 0} students
            </span>
          </div>

          <p className="text-[#71748C] text-[13px] font-[600] line-clamp-2">
            {course.course_short_description || course.course_description}
          </p>

          {/* Progress Bar */}
          {course.isEnrolled && (
            <div className="w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center text-[11px] text-gray-600 dark:text-gray-300 mb-0.5">
                <span>Progress</span>
                <span>{progressPercentage}%</span>
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

          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-2 text-primaryColors-0 md:text-[13px] text-[12px]">
              <LuUser className="w-4 h-4" />
              {course.organizationName || "Unknown"}
            </span>

            <span className="flex items-center gap-2 text-[#30A46F] text-[13px]">
              <FaAngleDoubleUp className="w-3 h-3" />
              {course.course_level}
            </span>

            <span className="flex items-center gap-2 text-gray-500 text-[12px]">
              <HiOutlineClock className="w-3 h-3" />
              {course.totalDuration || 0} min
            </span>

            <span className="flex items-center gap-2 text-gray-500 text-[12px]">
              {course.lessonCount || 0} lessons
            </span>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${statusInfo.color}`}
            >
              {statusInfo.icon}
              {statusInfo.label}
            </span>

            {course.isEnrolled && course.progress && (
              <span className="text-[10px] text-gray-500">
                {course.progress.completedLessons || 0}/
                {course.progress.totalLessons || 0} lessons
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
        ) : course.isEnrolled ? (
          "Continue Learning"
        ) : (
          "View Course"
        )}
      </button>

      <div className="h-[1px] w-full dark:bg-[#EFEFF2]/20 bg-[#ccc]/20"></div>
    </div>
  );
}