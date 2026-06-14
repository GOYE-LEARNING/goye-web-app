"use client";

import Image from "next/image";
import pic2 from "@/public/images/notfound.png";
import logo from "@/public/images/logo.png";
import Loader from "./loader";
import { LuUser } from "react-icons/lu";
import { FaAngleDoubleUp } from "react-icons/fa";
import { useEffect, useState } from "react";

interface EnrolledCourse {
  enrollment_id: string;
  enrollment_status: string;
  enrollment_date: string;
  started_at: string | null;
  completed_at: string | null;
  course_score: number;
  course_progress: {
    percentage: number;
    completed_lessons: number;
    total_lessons: number;
  };
  course: {
    id: string;
    course_title: string;
    course_description: string;
    course_short_description: string;
    course_image: string | null;
    course_level: string;
    point: number;
    createdBy?: string;
  };
}

interface Props {
  openCourse: (id: string) => void;
  search: string;
  isRefreshing: boolean;
}

export default function DashboardCourseEnrolled({
  openCourse,
  search,
  isRefreshing,
}: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `${API_URL}/api/enroll/get-courses-enrolled-by-student`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await res.json();

      if (!res.ok) {
        console.log("An error occurred while fetching courses", data);
        return;
      }

      const courses = data.data?.courses || [];
      setEnrolledCourses(courses);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  const filterCourse = enrolledCourses.filter(
    (item: any) =>
      item.course.course_title.toLowerCase().includes(search.toLowerCase()) ||
      item.course.course_description.toLowerCase().includes(search.toLowerCase())
  );

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-primaryColors-0";
  };

  if (isRefreshing || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader
          height={40}
          width={40}
          border_width={3}
          full_border_color="transparent"
          small_border_color="#FFA500"
        />
      </div>
    );
  }

  if (filterCourse.length === 0) {
    return (
      <div className="flex justify-center items-center flex-col gap-1 md:mt-10 mt-[8rem]">
        <Image src={pic2} alt="pic" height={100} width={100} />
        <h1 className="text-textSlightDark-0 font-semibold text-[18px]">
          No Enrolled Course Found
        </h1>
        <p className="text-textGrey-0">Join a Course</p>
      </div>
    );
  }

  return (
    <div>
      {filterCourse.map((item: any) => (
        <div
          key={item.enrollment_id}
          className="md:bg-white dark:md:bg-secondaryColors-0 md:drop-shadow-sm w-full md:p-[24px] my-5 flex flex-col gap-2"
        >
          <div className="flex justify-start items-start w-full gap-3">
            <img
              src={item.course.course_image || logo.src}
              alt="course"
              className="h-[89.16px] w-[130px] object-cover rounded"
            />
            <div className="w-full flex flex-col gap-2">
              <div className="flex justify-between items-center w-full">
                <h1 className="text-[14px] font-[700] text-[#41415A] dark:text-white">
                  {item.course.course_title}
                </h1>
              </div>

              {/* Progress Bar */}
              <div className="w-full">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(item.course_progress.percentage)}%</span>
                </div>
                <div className="w-full h-2 dark:bg-shadyColor-0 bg-lightWhite-0 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getProgressColor(item.course_progress.percentage)} transition-all duration-300`}
                    style={{ width: `${item.course_progress.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {item.course_progress.completed_lessons} of{" "}
                  {item.course_progress.total_lessons} lessons completed
                </p>
              </div>

              <p className="text-[#71748C] text-[13px] font-[600] line-clamp-2">
                {item.course.course_description}
              </p>
              <p className="flex items-center gap-6">
                <span className="flex items-center gap-3 text-[#71748C] md:text-[13px] text-[12px]">
                  <LuUser /> {item.course.createdBy || "GOYE Instructor"}
                </span>
                <span className="flex items-center gap-3 text-[#30A46F] text-[13px]">
                  <FaAngleDoubleUp /> {item.course.course_level}
                </span>
              </p>
            </div>
          </div>
          <button
            className="h-[36px] text-[14px] dark:bg-shadyColor-0 dark:text-primaryColors-0 bg-primaryColors-0 text-white my-3 w-full rounded-md hover:opacity-90 transition-opacity cursor-pointer"
            onClick={() => openCourse(item.course.id)}
          >
            {item.enrollment_status === "IN_PROGRESS"
              ? "Continue Course"
              : "View Course"}
          </button>
          <div className="h-[1px] w-full dark:bg-[#EFEFF2]/20 bg-[#ccc]/20"></div>
        </div>
      ))}
    </div>
  );
}