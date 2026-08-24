"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MdMenuBook } from "react-icons/md";
import { FaArrowRight } from "react-icons/fa6";
import { useTheme } from "../context/theme_provider";
import { useI18n } from "../context/I18nContext";

interface Props {
  openCourse: (courseId: string) => void;
}

interface Enrollment {
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
    completed_quizzes?: number; // optional — present once enroll endpoint sends it
    total_quizzes?: number;
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

interface CourseData {
  total_courses: number;
  completed_courses: number;
  in_progress_courses: number;
  courses: Enrollment[];
  user_stats: {
    total_xp: number;
    current_level: string;
    level_number: number;
    next_level_xp: number;
    progress_to_next_level: number;
  };
}

export default function DashboardStudentCourse({ openCourse }: Props) {
  const navigate = useRouter();
  const { t } = useI18n();
  const { darkMode, setDarkMode } = useTheme();
  const params = useParams<{ org_name: string }>();
  const type = localStorage.getItem("type");
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `${API_URL}/api/enroll/get-courses-enrolled-by-student`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      const data = await res.json();
      
      if (!res.ok) {
        console.log("Error fetching courses:", data);
        return;
      }

      setCourseData(data.data);
      console.log("Page Courses", data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-primaryColors-0";
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return t("Completed");
      case "IN_PROGRESS":
        return t("In Progress");
      default:
        return t("Enrolled");
    }
  };

  return (
    <>
      <div className="dashboard_content_box">
        <div className="dashboard_content_header">
          <h1>{t("My Courses")}</h1>
          {courseData?.courses && courseData.courses.length > 0 ? (
            <div>
              <span
                className="cursor-pointer text-primaryColors-0 hover:underline"
                onClick={() =>
                  navigate.push(
                    type !== "invited_user"
                      ? "/dashboard/student/course"
                      : `/dashboard/${params.org_name}/organization/course`,
                  )
                }
              >
                {t("View All")} ({courseData.total_courses})
              </span>
            </div>
          ) : (
            <div></div>
          )}
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryColors-0"></div>
            <p className="ml-2 text-gray-600 dark:text-gray-400">{t("Loading courses...")}</p>
          </div>
        )}

        {!isLoading && (!courseData?.courses || courseData.courses.length === 0) ? (
          <div>
            <div className="flex justify-center items-center flex-col gap-2 py-8">
              <span>
                <MdMenuBook
                  size={60}
                  color={darkMode ? "rgb(219 204 205)" : "orange"}
                />
              </span>
              <h1 className="text-textSlightDark-0 font-semibold text-[18px] mt-4">
                {t("No courses enrolled yet.")}
              </h1>
              <p className="text-gray-500 text-sm">{t("Start your learning journey by joining a course")}</p>
              <button
                onClick={() =>
                  navigate.push(
                    type !== "invited_user"
                      ? "/dashboard/student/course"
                      : `/dashboard/${params.org_name}/organization/course`,
                  )
                }
                className="game_button flex items-center gap-2 mt-2"
              >
                {t("Join a course")}
                <FaArrowRight />
              </button>
            </div>
          </div>
        ) : (
          <div>
            {!isLoading && courseData?.courses && (
              <div>
                {courseData.courses.slice(0, 1).map((enrollment, i) => (
                  <div key={enrollment.enrollment_id || i} className="dashboard_content_subbox">
                    {/* Course Title */}
                    <h1 className=" text-gray-800 dark:text-white">
                      {enrollment.course.course_title}
                    </h1>
                    
                    {/* Course Description */}
                    <h2 className=" text-gray-600 dark:text-gray-300 mt-1">
                      {enrollment.course.course_short_description}
                    </h2>
                    <p className=" text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                      {enrollment.course.course_description}
                    </p>
                    
                    {/* Progress Section */}
                    <div className="dashboard_content_progress mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t("Your Progress")}
                        </h3>
                        <span className="text-xs font-semibold" style={{
                          color: getProgressColor(enrollment.course_progress.percentage).includes("green") 
                            ? "#10B981" 
                            : getProgressColor(enrollment.course_progress.percentage).includes("yellow")
                            ? "#F59E0B"
                            : "#FFA500"
                        }}>
                          {Math.round(enrollment.course_progress.percentage)}%
                        </span>
                      </div>
                      <div className="w-full h-[8px] bg-[#E8E1E2] dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-[8px] ${getProgressColor(enrollment.course_progress.percentage)} rounded-full transition-all duration-300`}
                          style={{ width: `${enrollment.course_progress.percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {enrollment.course_progress.completed_lessons} {t("of")}{" "}
                          {enrollment.course_progress.total_lessons} {t("lessons")}
                          {typeof enrollment.course_progress.total_quizzes === "number" &&
                            enrollment.course_progress.total_quizzes > 0 && (
                              <>
                                {" "}• {enrollment.course_progress.completed_quizzes} {t("of")}{" "}
                                {enrollment.course_progress.total_quizzes} {t("quizzes")}
                              </>
                            )}
                        </p>

                      </div>
                    </div>
                  
                    
                    {/* Continue Button */}
                    <button
                      className="h-[36px] py-[17px] bg-primaryColors-0 hover:bg-primaryColors-0/90 transition-colors flex justify-center items-center w-full text-[#ffffff] rounded-md mt-4"
                      onClick={() => openCourse(enrollment.course.id)}
                    >
                      {enrollment.enrollment_status === "COMPLETED" ? t("Review Course") : t("Continue Course")}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}