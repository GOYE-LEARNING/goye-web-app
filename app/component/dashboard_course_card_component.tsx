// components/CourseCard.tsx
"use client";

import Image from "next/image";
import { CiBookmark } from "react-icons/ci";
import { IoBookmark } from "react-icons/io5";
import { LuUser } from "react-icons/lu";
import { FaAngleDoubleUp } from "react-icons/fa";
import logo from "@/public/images/logo.png";
import Loader from "./loader";

interface Course {
  id: string;
  course_image: string | null;
  course_title: string;
  course_description: string;
  createdBy: string;
  course_level: string;
  enrolled: string;
}

interface CourseCardProps {
  course: Course;
  isBookmarked: boolean;
  onBookmarkToggle: (id: string) => void;
  onViewCourse: (id: string) => void;
  isViewLoading?: boolean;
  isToggling?: boolean; // ✅ Add this
}

export default function CourseCard({
  course,
  isBookmarked,
  onBookmarkToggle,
  onViewCourse,
  isViewLoading = false,
  isToggling = false, // ✅ Add this
}: CourseCardProps) {
  return (
    <div className="md:bg-white dark:md:bg-secondaryColors-0 md:drop-shadow-sm w-full md:p-[24px] my-5 flex flex-col gap-2">
      <div className="flex justify-start items-start w-full gap-3">
        <div className="relative">
          <img
            src={course.course_image || logo.src}
            alt="course"
            className="h-[89.16px] w-[130px] object-cover rounded"
          />
          <span
            className={`absolute top-1 right-1 cursor-pointer transition-opacity ${isToggling ? 'opacity-50 pointer-events-none' : 'hover:scale-110'}`}
            onClick={() => onBookmarkToggle(course.id)}
          >
            {!isBookmarked ? (
              <CiBookmark color="#B1B1B6" size={23} />
            ) : (
              <IoBookmark color="#ffffff" size={23} />
            )}
          </span>
        </div>
        <div className="w-full flex flex-col gap-2">
          <div className="flex justify-between items-center w-full">
            <h1 className="text-[14px] font-[700] text-[#41415A] dark:text-white">
              {course.course_title}
            </h1>
            <span className="text-[10px] text-[#41415A] bg-[#F1F1F4] px-[4px] rounded">
              {course.enrolled}
            </span>
          </div>
          <p className="text-[#71748C] text-[13px] font-[600] line-clamp-3">
            {course.course_description}
          </p>
          <p className="flex items-center gap-6">
            <span className="flex items-center gap-3 text-[#71748C] md:text-[13px] text-[12px]">
              <LuUser /> {course.createdBy}
            </span>
            <span className="flex items-center gap-3 text-[#30A46F] text-[13px]">
              <FaAngleDoubleUp />
              {course.course_level}
            </span>
          </p>
        </div>
      </div>
      <button
        className="h-[36px] text-[14px] dark:bg-shadyColor-0 dark:text-primaryColors-0 bg-primaryColors-0 text-white my-3 w-full rounded transition-opacity duration-200 disabled:opacity-70 flex items-center justify-center"
        onClick={() => onViewCourse(course.id)}
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
        ) : (
          "View Course"
        )}
      </button>
      <div className="h-[1px] w-full dark:bg-[#EFEFF2]/20 bg-[#ccc]/20"></div>
    </div>
  );
}