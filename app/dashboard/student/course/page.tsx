"use client";

import DashboardCourseAllProvider from "@/app/component/dashboard_course_all";
import DashboardCourseDone from "@/app/component/dashboard_course_done";
import DashboardCourseEnrolled from "@/app/component/dashboard_course_enroll";
import DashboardCourseSaved from "@/app/component/dashboard_course_saved";
import DashboardSearch from "@/app/component/dashboard_search";
import DashboardCourseView from "@/app/component/dashboard_student_courseview";
import DashboardTabSelection from "@/app/component/dashboard_tab_selection";
import Loader from "@/app/component/loader";
import { useState, useRef } from "react";
import { IoMdRefresh } from "react-icons/io";

type TabType = "all" | "enrolled" | "saved" | "done";

export default function MainContainer() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [showCoursePage, setShowCoursePage] = useState<boolean>(true);
  const [showCourse, setShowCourse] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [refresh, setRefresh] = useState<boolean>(false);
  const [courseId, setCourseId] = useState<string>("");
  const [isLoadingCourse, setIsLoadingCourse] = useState<boolean>(false);
  
  // Store the previous tab before opening a course
  const previousTabRef = useRef<TabType>("all");

  const openCourse = async (selectedCourseId: string) => {
    // Store which tab is currently active before navigating
    previousTabRef.current = activeTab;
    
    setIsLoadingCourse(true);
    try {
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
    // Restore the previous tab that was active before opening the course
    setActiveTab(previousTabRef.current);
    
    // Navigate back to course list
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
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          console.log(`HTTP error! status: ${res.status}`);
          return;
        }

        const responseClone = res.clone();

        let data;
        try {
          data = await res.json();
        } catch (jsonError) {
          const rawText = await responseClone.text();
          console.error("Raw response:", rawText);
          console.error("JSON parse error:", jsonError);
          return;
        }

        console.log("Courses refreshed:", data.data.getAllCourses);
      } catch (error) {
        console.error("Network error:", error);
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
        },
      );

      const data = await res.json();

      if (!res.ok) {
        console.log(data);
        throw new Error(`Failed to fetch course: ${res.status}`);
      }
      console.log("Course data:", data);
      return data;
    } catch (error) {
      console.error("Error fetching course by ID:", error);
      throw error;
    }
  };

  return (
    <>
      <br />
      {showCoursePage && (
        <div>
          <div className="flex justify-between items-center">
            <h1 className="dashboard_h1">Course</h1>
            <div className="flex items-center gap-3">
              <span
                className="text-white h-[35px] w-[35px] bg-primaryColors-0 rounded-full font-semibold flex items-center justify-center gap-2 md:hidden cursor-pointer hover:bg-primaryColors-0/90 transition-colors"
                onClick={refreshCourse}
              >
                <IoMdRefresh className={refresh ? "animate-spin" : ""} />
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
                className="text-white h-[35px] w-[35px] bg-primaryColors-0 rounded-full font-semibold md:flex items-center justify-center gap-2 hidden cursor-pointer hover:bg-primaryColors-0/90 transition-colors"
                onClick={refreshCourse}
              >
                <IoMdRefresh className={refresh ? "animate-spin" : ""} />
              </span>
            </div>
          </div>

          {/* Tab Selection Component */}
          <DashboardTabSelection
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {/* Render content based on active tab */}
          {activeTab === "all" && (
            <DashboardCourseAllProvider
              isRefreshing={refresh}
              search={search}
              openCourse={openCourse}
            />
          )}
          {activeTab === "enrolled" && (
            <DashboardCourseEnrolled
              openCourse={openCourse}
              search={search}
              isRefreshing={refresh}
            />
          )}
          {activeTab === "saved" && <DashboardCourseSaved search={search} openCourse={openCourse} isRefreshing={refresh}/>}
          {activeTab === "done" && <DashboardCourseDone search={search} openCourse={openCourse} isRefreshing={refresh}/>}
        </div>
      )}

      {showCourse && courseId && (
        <DashboardCourseView backFunction={backFunction} courseId={courseId} />
      )}

      {isLoadingCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Loader
            height={40}
            width={40}
            border_width={3}
            full_border_color="transparent"
            small_border_color="#FFA500"
          />
        </div>
      )}
    </>
  );
}