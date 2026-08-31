"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import pic2 from "@/public/images/notfound.png";
import logo from "@/public/images/goye_final_logo.png";
import Loader from "./loader";
import { LuUser } from "react-icons/lu";
import { FaAngleDoubleUp } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import { useEffect, useState } from "react";

interface CompletedCourse {
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

export default function DashboardCourseDone({ openCourse, search, isRefreshing }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [completedCourses, setCompletedCourses] = useState<CompletedCourse[]>([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const pathname = usePathname();

  // ✅ Check if we're in an organization route
  const isOrganizationRoute = pathname?.includes('/organization/');

  const fetchCompletedCourses = async () => {
    try {
      setIsLoading(true);
      
      // ✅ Use different endpoint based on route
      const endpoint = isOrganizationRoute
        ? `${API_URL}/api/organizations/get-courses-by-organization`
        : `${API_URL}/api/enroll/get-courses-enrolled-by-student`;
      
      console.log(`📡 Fetching completed courses from: ${endpoint}`);
      
      const res = await fetch(endpoint, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        console.log("Error fetching courses", data);
        return;
      }

      let courses = [];
      if (isOrganizationRoute) {
        // ✅ Organization endpoint - we need to check if user is enrolled/completed
        const orgCourses = data.data?.courses || [];
        // For organization courses, we mark them as completed if they have enrollment status
        // This is a placeholder - you may need to adjust based on your actual data
        courses = orgCourses
          .filter((course: any) => course.enrollmentStatus === "COMPLETED")
          .map((course: any) => ({
            enrollment_id: course.id,
            enrollment_status: course.enrollmentStatus || "COMPLETED",
            enrollment_date: course.createdAt || new Date().toISOString(),
            started_at: null,
            completed_at: null,
            course_score: 0,
            course_progress: {
              percentage: 100,
              completed_lessons: 0,
              total_lessons: 0,
            },
            course: {
              id: course.id,
              course_title: course.course_title,
              course_description: course.course_description,
              course_short_description: course.course_short_description,
              course_image: course.course_image,
              course_level: course.course_level,
              point: 0,
              createdBy: course.organizationName || "GOYE Instructor",
            }
          }));
      } else {
        // ✅ Regular endpoint - filter only COMPLETED courses
        const allCourses = data.data?.courses || [];
        courses = allCourses.filter(
          (item: CompletedCourse) => item.enrollment_status === "COMPLETED"
        );
      }
      
      setCompletedCourses(courses);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedCourses();
  }, [isOrganizationRoute]); // ✅ Re-fetch when route changes

  // ✅ Refresh when isRefreshing changes
  useEffect(() => {
    if (isRefreshing) {
      fetchCompletedCourses();
    }
  }, [isRefreshing]);

  const filterCourse = completedCourses.filter(
    (item: any) =>
      item.course.course_title?.toLowerCase().includes(search.toLowerCase()) ||
      item.course.course_description?.toLowerCase().includes(search.toLowerCase())
  );

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
        <Image src={pic2} alt="No completed courses" height={100} width={100} />
        <h1 className="text-textSlightDark-0 font-semibold text-[18px]">
          {isOrganizationRoute ? "No Completed Organization Courses" : "No Completed Courses Yet"}
        </h1>
        <p className="text-textGrey-0">
          {isOrganizationRoute ? "Complete courses in this organization" : "Finish a course to see it here"}
        </p>
      </div>
    );
  }

  return (
    <div>
      {filterCourse.map((item: any) => (
        <div
          key={item.enrollment_id}
          className="bg-white dark:bg-secondaryColors-0 px-10 py-5 rounded-[15px] md:drop-shadow-sm w-full md:p-[24px] my-5 flex flex-col gap-2"
        >
          <div className="flex justify-start items-start w-full gap-3">
            <img
              src={item.course.course_image || logo.src}
              alt="course"
              className="md:h-[89.16px] h-[100px] w-[130px] object-cover rounded"
            />
            <div className="w-full flex flex-col gap-2">
              <div className="flex justify-between items-center w-full">
                <h1 className="text-[14px] font-[700] text-[#41415A] dark:text-white">
                  {item.course.course_title}
                </h1>
                {/* Completed badge */}
                <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-2 py-0.5 rounded-full">
                  <FaCheckCircle size={12} /> Completed
                </span>
              </div>

              {/* Progress Bar at 100% */}
              <div className="w-full">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>100%</span>
                </div>
                <div className="w-full h-2 dark:bg-shadyColor-0 bg-lightWhite-0 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-full" />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {item.course_progress.completed_lessons} of {item.course_progress.total_lessons} lessons
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
            View Course
          </button>
          <div className="hidden md:block h-[1px] w-full dark:bg-[#EFEFF2]/20 bg-[#ccc]/20"></div>
        </div>
      ))}
    </div>
  );
}