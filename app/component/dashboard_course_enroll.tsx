"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  const isOrganizationRoute = pathname?.includes("/organization/");

  const fetchCourse = async () => {
    try {
      setIsLoading(true);

      const endpoint = isOrganizationRoute
        ? `${API_URL}/api/organizations/get-courses-by-organization`
        : `${API_URL}/api/enroll/get-courses-enrolled-by-student`;

      console.log(`📡 Fetching enrolled courses from: ${endpoint}`);

      const res = await fetch(endpoint, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        console.log("An error occurred while fetching courses", data);
        return;
      }

      let courses = [];
      if (isOrganizationRoute) {
        const orgCourses = data.data?.courses || [];
        courses = orgCourses.map((course: any) => ({
          enrollment_id: course.id,
          enrollment_status: course.enrollmentStatus || "NOT_ENROLLED",
          enrollment_date: course.createdAt || new Date().toISOString(),
          started_at: null,
          completed_at: null,
          course_score: 0,
          course_progress: {
            percentage: course.progress?.percentage || 0,
            completed_lessons: course.progress?.completedLessons || 0,
            total_lessons: course.progress?.totalLessons || 0,
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
          },
        }));
      } else {
        courses = data.data?.courses || [];
      }

      setEnrolledCourses(courses);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [isOrganizationRoute]);

  useEffect(() => {
    if (isRefreshing) {
      fetchCourse();
    }
  }, [isRefreshing]);

  const filterCourse = enrolledCourses.filter(
    (item: any) =>
      item.course.course_title?.toLowerCase().includes(search.toLowerCase()) ||
      item.course.course_description
        ?.toLowerCase()
        .includes(search.toLowerCase()),
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
          {isOrganizationRoute
            ? "No Enrolled Organization Courses"
            : "No Enrolled Course Found"}
        </h1>
        <p className="text-textGrey-0">
          {isOrganizationRoute
            ? "Browse organization courses"
            : "Join a Course"}
        </p>
      </div>
    );
  }

  return (
    <div>
      {filterCourse.map((item: any) => (
        <div
          key={item.enrollment_id}
          className="md:bg-white dark:md:bg-secondaryColors-0 md:drop-shadow-sm w-full md:p-[24px] my-5 flex flex-col gap-2 hover:border-2 hover:border-dashed hover:border-primaryColors-0/50 transition-all duration-200 cursor-pointer"
        >
          <div className="flex gap-4">
            <img
              src={item.course.course_image || logo.src}
              alt={item.course.course_title}
              className="h-[89.16px] w-[130px] object-cover rounded"
            />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">
                {item.course.course_title}
              </h1>

              {/* Progress Section */}
              <div className="mt-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(item.course_progress.percentage)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getProgressColor(item.course_progress.percentage)} transition-all duration-300`}
                    style={{ width: `${item.course_progress.percentage}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {item.course_progress.completed_lessons} of{" "}
                  {item.course_progress.total_lessons} lessons completed
                </p>
              </div>

              <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 line-clamp-2">
                {item.course.course_description}
              </p>

              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="flex items-center gap-2 text-gray-500">
                  <LuUser /> {item.course.createdBy || "GOYE Instructor"}
                </span>
                <span className="flex items-center gap-2 text-green-600">
                  <FaAngleDoubleUp /> {item.course.course_level}
                </span>
              </div>
            </div>
          </div>

          <button
            className="mt-4 w-full py-2 bg-primaryColors-0 text-white rounded hover:opacity-90 transition-opacity"
            onClick={() => openCourse(item.course.id)}
          >
            {item.enrollment_status === "IN_PROGRESS"
              ? "Continue Course"
              : "View Course"}
          </button>
        </div>
      ))}
    </div>
  );
}
