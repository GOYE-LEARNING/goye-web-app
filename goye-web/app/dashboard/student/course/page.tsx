"use client";

import DashboardCourseAllProvider from "@/app/component/dashboard_course_all";
import DashboardCourseDone from "@/app/component/dashboard_course_done";
import DashboardCourseEnrolled from "@/app/component/dashboard_course_enroll";
import DashboardCourseSaved from "@/app/component/dashboard_course_saved";
import DashboardSearch from "@/app/component/dashboard_search";
import DashboardCourseView from "@/app/component/dashboard_student_courseview";
import DashboardTabSelection from "@/app/component/dashboard_tab_selection";
import Loader from "@/app/component/loader";
import { useEffect, useState } from "react";
import { IoMdRefresh } from "react-icons/io";

export default function MainContainer() {
  const [all, setAll] = useState<boolean>(true);
  const [enrolled, setEnrolled] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [done, setDone] = useState<boolean>(false);
  const [showCoursePage, setShowCoursePage] = useState<boolean>(true);
  const [showCourse, setShowCourse] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [refresh, setRefresh] = useState<boolean>(false);
  const [courseId, setCourseId] = useState<string>("");
  const [isLoadingCourse, setIsLoadingCourse] = useState<boolean>(false);

  const allFunc = () => {
    setAll(true);
    setEnrolled(false);
    setSaved(false);
    setDone(false);
  };

  const enrolledFunc = () => {
    setAll(false);
    setEnrolled(true);
    setSaved(false);
    setDone(false);
  };

  const savedFunc = () => {
    setAll(false);
    setEnrolled(false);
    setSaved(true);
    setDone(false);
  };

  const doneFunc = () => {
    setAll(false);
    setEnrolled(false);
    setSaved(false);
    setDone(true);
  };

  const openCourse = async (selectedCourseId: string) => {
    setIsLoadingCourse(true);
    try {
      // Verify the course exists first
      await fetchCourseById(selectedCourseId);
      setCourseId(selectedCourseId);
      setShowCourse(true);
      setShowCoursePage(false);
    } catch (error) {
      console.error("Error opening course:", error);
    } finally {
      setIsLoadingCourse(false);
    }
  };

  const backFunction = () => {
    setShowCourse(false);
    setShowCoursePage(true);
    setCourseId("");
  };

  const refreshCourse = () => {
    setRefresh(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const fetchCourse = async () => {
      try {
        const res = await fetch(`${API_URL}/api/course/get-all-courses`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) {
          console.log("An error occurred while fetching courses");
        }
        console.log(data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setRefresh(false);
      }
    };

    fetchCourse();
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const fetchCourseById = async (selectedCourseId: string) => {
    try {
      const res = await fetch(
        `${API_URL}/api/course/get-course/${selectedCourseId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch course: ${res.status}`);
      }

      const data = await res.json();
      console.log("Course data:", data);
      return data; // Return the data for verification
    } catch (error) {
      console.error("Error fetching course by ID:", error);
      throw error;
    }
  };

  return (
    <>
      {showCoursePage && (
        <div>
          <div className="flex justify-between items-center">
            <h1 className="dashboard_h1">Course</h1>
            <div className="flex items-center gap-3">
              <span
                className="text-white h-[35px] w-[35px] bg-primaryColors-0 rounded-full font-semibold flex items-center justify-center gap-2 md:hidden"
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
              <span
                className="text-white h-[35px] w-[35px] bg-primaryColors-0 rounded-full font-semibold md:flex items-center justify-center gap-2 hidden"
                onClick={refreshCourse}
              >
                <IoMdRefresh />
              </span>
            </div>
          </div>
          <DashboardTabSelection
            allFunc={allFunc}
            enrolledFunc={enrolledFunc}
            savedFunc={savedFunc}
            doneFunc={doneFunc}
          />
          {all && (
            <DashboardCourseAllProvider
              isRefreshing={refresh}
              search={search}
              openCourse={openCourse}
            />
          )}
          {enrolled && <DashboardCourseEnrolled />}
          {saved && <DashboardCourseSaved />}
          {done && <DashboardCourseDone />}
        </div>
      )}

      {showCourse && courseId && (
        <DashboardCourseView backFunction={backFunction} courseId={courseId} />
      )}

      {isLoadingCourse && (
        <Loader
          height={30}
          width={30}
          border_width={2}
          full_border_color="transparent"
          small_border_color="#3F1F22"
        />
      )}
    </>
  );
}
