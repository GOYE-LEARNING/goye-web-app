"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import pic2 from "@/public/images/notfound.png";
import { MdMenuBook } from "react-icons/md";
import { FaArrowRight } from "react-icons/fa6";
import { useTheme } from "../context/theme_provider";

interface Props {
  openCourse: () => void;
}

interface Data {
  total_courses: number;
  courses: Course[];
}
interface Course {
  course_title: string;
  course_short_description: string;
  course_description: string;
}
export default function DashboardStudentCourse({ openCourse }: Props) {
  const navigate = useRouter();
  const { darkMode, setDarkMode } = useTheme();
  const params = useParams<{ org_name: string }>();
  const type = localStorage.getItem("type");
  const [course, setCourse] = useState<Data | null>(null);
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
      setIsLoading(false);
      if (!res.ok) {
        return;
      }

      setCourse(data.data);
      console.log(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);
  return (
    <>
      <div className="dashboard_content_box">
        <div className="dashboard_content_header">
          <h1>My Courses</h1>
          {course?.courses.length == 0 ? (
            <div></div>
          ) : (
            <div>
              {" "}
              <span
                className="cursor-pointer"
                onClick={() =>
                  navigate.push(
                    type !== "invited_user"
                      ? "/dashboard/student/course"
                      : `/dashboard/${params.org_name}/organization/course`,
                  )
                }
              >
                View All
              </span>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryColors-0"></div>
            <p className="ml-2">Loading courses...</p>
          </div>
        )}

        {!isLoading && course?.courses.length === 0 ? (
          <div>
            <div className="flex justify-center items-center flex-col gap-2">
              <span>
                <MdMenuBook
                  size={60}
                  color={darkMode ? "rgb(219 204 205)" : "orange"}
                />
              </span>
              <h1 className="text-textSlightDark-0 font-semibold text-[18px] mt-4">
                No courses applied for.
              </h1>
              <button
                onClick={() =>
                  navigate.push(
                    type !== "invited_user"
                      ? "/dashboard/student/course"
                      : `/dashboard/${params.org_name}/organization/course`,
                  )
                }
                className="game_button flex items-center gap-2"
              >
                Join a course
                <FaArrowRight />
              </button>
            </div>
          </div>
        ) : (
          <div>
            {!isLoading && (
              <div>
                {course?.courses.slice(0, 1).map((c, i) => (
                  <div key={i} className="dashboard_content_subbox">
                    <h1>{c.course_title}</h1>
                    <h2>{c.course_short_description}</h2>
                    <p>{c.course_description}</p>
                    <div className="dashboard_content_progress">
                      <h3>Your Progress</h3>
                      <div className="w-full h-[8px] bg-[#E8E1E2] relative">
                        <div className="h-[8px] w-[15%] bg-[#30A46F]"></div>
                      </div>
                    </div>
                    <button
                      className="h-[36px] py-[17px] bg-primaryColors-0 flex justify-center items-center w-full text-[#ffffff]"
                      onClick={openCourse}
                    >
                      Continue Course
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
