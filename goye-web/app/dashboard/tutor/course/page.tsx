"use client";

import DashboardSearch from "@/app/component/dashboard_search";
import Image from "next/image";
import { CiBookmark } from "react-icons/ci";
import { FaAngleDoubleUp } from "react-icons/fa";
import { IoBookmark } from "react-icons/io5";
import { LuUser } from "react-icons/lu";
import { MdAdd } from "react-icons/md";
import pic from "@/public/images/overview.png";
import pic2 from "@/public/images/notfound.png";

import { useEffect, useState } from "react";
import DashboardTutorCreateCourse from "@/app/component/dashboard_tutor_create-course";
import DashboardTutorCourseBreakdown from "@/app/component/dashboard_tutor_course_breakdown";
import { IoMdRefresh } from "react-icons/io";
import Loader from "@/app/component/loader";

interface Course {
  id?: string;
  course_image: any;
  course_title: string;
  course_description: string;
  createdBy: string;
  course_duration: string;
  course_level: string;
  enrolled: string;
}

export default function TutorCourse() {
  const [fill, setFill] = useState<string[]>([]);
  const [showCourse, setShowCourse] = useState<boolean>(true);
  const [showCourseDetails, setShowCourseDetails] = useState<boolean>(false);
  const [showCreateCourse, setShowCreateCourse] = useState<boolean>(false);
  const [courseDetails, setCourseDetails] = useState<Course[]>([]);
  const [search, setSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [courseId, setCourseId] = useState<string>("");

  const filterCourse = courseDetails.filter(
    (course) =>
      course.course_title.toLowerCase().includes(search.toLowerCase()) ||
      course.course_description.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBookMark = (id: string) => {
    setFill((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/course/get-courses-by-tutor`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log("An error occurred while fetching courses");
      }
      setIsLoading(false);
      setCourseDetails(data.data[0].Courses);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCourse = () => {
    fetchCourse();
  };

  const handleAddCourse = (newCourse: Course) => {
    setCourseDetails((prev) => [newCourse, ...prev]);
  };

  // ✅ FIXED: Delete function
  const handleDelete = async (courseId?: string) => {
    if (!courseId) return;


    try {
      // Remove from UI immediately
      setCourseDetails((prev) => prev.filter((c) => c.id !== courseId));

      // Delete from backend
      await deleteCourseFromBackend(courseId);

      // Go back to course list
      backFunc();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteCourseFromBackend = async (courseId: string): Promise<void> => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(
        `${API_URL}/api/course/delete-course/${courseId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      await response.json();

      if (!response.ok) {
        console.error("Failed to delete course from backend");
      } else {
        console.log("Course deleted successfully from backend");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  const backFunc = () => {
    setCourseId("");
    setShowCreateCourse(false);
    setShowCourse(true);
    setShowCourseDetails(false);
  };

  const showCourseFunc = () => {
    backFunc();
  };

  const showCreateCourseFunc = () => {
    setShowCourse(false);
    setShowCreateCourse(true);
  };

  const showCourseDetailsFunc = (id: string) => {
    setCourseId(id);
    setShowCourse(false);
    setShowCourseDetails(true);
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  return (
    <>
      {showCourse && (
        <div>
          <div className="flex justify-between items-center">
            <h1 className="dashboard_h1">Course</h1>
            <div className="flex items-center gap-3">
              <span
                className="text-primaryColors-0 font-semibold flex items-center gap-2 md:hidden cursor-pointer"
                onClick={showCreateCourseFunc}
              >
                <MdAdd /> New Course
              </span>
              <span
                className="text-white h-[35px] w-[35px] bg-primaryColors-0 rounded-full font-semibold flex items-center justify-center gap-2 md:hidden cursor-pointer"
                onClick={refreshCourse}
              >
                <IoMdRefresh />
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center gap-4">
            <div className="md:w-[75%] w-full">
              <DashboardSearch
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                placeholder="Search courses..."
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                className="md:flex items-center justify-center gap-2 border border-[#D9D9D9] bg-white h-[36px] md:w-[131px] hidden text-primaryColors-0 cursor-pointer"
                onClick={showCreateCourseFunc}
              >
                <MdAdd /> New course
              </button>
              <span
                className="text-white h-[35px] w-[35px] bg-primaryColors-0 rounded-full font-semibold md:flex items-center justify-center gap-2 hidden cursor-pointer"
                onClick={refreshCourse}
              >
                <IoMdRefresh />
              </span>
            </div>
          </div>

          {!isLoading ? (
            <div>
              {filterCourse.length === 0 ? (
                <div className="flex justify-center items-center flex-col gap-1 md:mt-10 mt-[8rem]">
                  <Image src={pic2} alt="pic" height={100} width={100} />
                  <h1 className="text-textSlightDark-0 font-semibold text-[18px]">
                    No Course Found
                  </h1>
                  <p className="text-textGrey-0">Create a Course</p>
                </div>
              ) : (
                <div>
                  {filterCourse.map((course, i) => (
                    <div
                      key={course.id || i}
                      className="dashboard_content_mainbox overflow-hidden"
                    >
                      <div className="flex justify-start items-start w-full gap-3">
                        <div className="relative">
                          <img
                            src={course.course_image || pic}
                            alt="pic"
                            className="h-[89.16px] w-[130px] object-cover"
                          />
                          <span
                            className="absolute top-1 right-1 cursor-pointer"
                            onClick={() =>
                              toggleBookMark(course.id || i.toString())
                            }
                          >
                            {!fill.includes(course.id || i.toString()) ? (
                              <CiBookmark color="#B1B1B6" size={23} />
                            ) : (
                              <IoBookmark color="#ffffff" size={23} />
                            )}
                          </span>
                        </div>
                        <div className="w-full flex flex-col gap-2">
                          <div className="flex justify-between items-center w-full">
                            <h1 className="text-[14px] font-[700] text-[#41415A] line-clamp-1">
                              {course.course_title}
                            </h1>
                            <span className="text-[10px] text-[#41415A] bg-[#F1F1F4] px-[4px]">
                              {course.enrolled || "Enrolled"}
                            </span>
                          </div>
                          <p className="text-[#71748C] text-[13px] font-[600] line-clamp-2 md:line-clamp-3">
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
                        className="h-[36px] text-[14px] bg-shadyColor-0 text-primaryColors-0 my-3 w-full cursor-pointer"
                        onClick={() =>
                          showCourseDetailsFunc(course.id || i.toString())
                        }
                      >
                        View Course
                      </button>
                      <div className="h-[1px] w-full bg-[#EFEFF2]"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-[6rem] flex justify-center">
              <Loader
                height={30}
                width={30}
                border_width={2}
                full_border_color="transparent"
                small_border_color="#3F1F22"
              />
            </div>
          )}
        </div>
      )}
      {showCreateCourse && (
        <DashboardTutorCreateCourse
          backToCourse={showCourseFunc}
          onCourseUpdate={handleAddCourse}
        />
      )}
      {showCourseDetails && (
        <DashboardTutorCourseBreakdown
          onDelete={handleDelete} // ✅ FIXED: Pass function directly
          refreshCourse={refreshCourse}
          courseId={courseId}
          backFunc={showCourseFunc}
        />
      )}
    </>
  );
}
