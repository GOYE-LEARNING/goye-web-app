"use client";

import DashboardCourseAllProvider from "@/app/component/dashboard_course_all";
import DashboardCourseDone from "@/app/component/dashboard_course_done";
import DashboardCourseEnrolled from "@/app/component/dashboard_course_enroll";
import DashboardCourseSaved from "@/app/component/dashboard_course_saved";
import DashboardSearch from "@/app/component/dashboard_search";
import DashboardCourseView from "@/app/component/dashboard_student_courseview";
import DashboardTabSelection from "@/app/component/dashboard_tab_selection";
import Loader from "@/app/component/loader";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

  const previousTabRef = useRef<TabType>("all");
  const router = useRouter();
  const searchParams = useSearchParams();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // ✅ Memoize fetchCourseById
  const fetchCourseById = useCallback(async (selectedCourseId: string) => {
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
  }, [API_URL]);

  // ✅ Memoize openCourse
  const openCourse = useCallback(async (selectedCourseId: string) => {
    // ✅ Prevent re-opening the same course
    if (courseId === selectedCourseId && showCourse) {
      console.log('⏭️ Same course, skipping');
      return;
    }
    
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
  }, [activeTab, courseId, showCourse, fetchCourseById]);

  // Always-current ref to openCourse. Its own identity changes every time
  // a course opens (it depends on courseId/showCourse), which was making
  // the deep-link effect below re-run mid-navigation and race against
  // router.replace(). Reading through a ref decouples the effect from
  // that changing identity entirely.
  const openCourseRef = useRef(openCourse);
  useEffect(() => {
    openCourseRef.current = openCourse;
  }, [openCourse]);

  // Tracks which linked courseId (from ?courseId=... deep links) has
  // already been opened, so this can only ever fire once per link —
  // independent of searchParams/router timing.
  const openedFromLinkRef = useRef<string | null>(null);

  // ✅ Memoize backFunction
  const backFunction = useCallback(() => {
    setActiveTab(previousTabRef.current);
    setShowCourse(false);
    setShowCoursePage(true);
    setCourseId("");
  }, []);

  // ✅ Memoize refreshCourse
  const refreshCourse = useCallback(() => {
    setRefresh(true);

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
  }, [API_URL]);

  // ✅ Memoize search handler
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  // ✅ Memoize tab change handler
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  // ✅ Deep-link effect — now only depends on searchParams/router, never
  // on openCourse, so it can't re-fire just because opening a course
  // changed openCourse's identity. The ref guard also makes it a
  // one-shot per linked ID regardless of how fast the URL actually updates.
  useEffect(() => {
    const linkedCourseId = searchParams.get("courseId");
    if (!linkedCourseId || openedFromLinkRef.current === linkedCourseId) return;
    openedFromLinkRef.current = linkedCourseId;
    openCourseRef.current(linkedCourseId);
    router.replace("/dashboard/student/course");
  }, [searchParams, router]);

  // ✅ Memoize refresh button
  const RefreshButton = useMemo(() => (
    <span
      className="text-white h-[35px] w-[35px] bg-primaryColors-0 rounded-full font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-primaryColors-0/90 transition-colors"
      onClick={refreshCourse}
    >
      <IoMdRefresh className={refresh ? "animate-spin" : ""} />
    </span>
  ), [refreshCourse, refresh]);

  // ✅ Memoize props for child components to prevent unnecessary re-renders
  const allProviderProps = useMemo(() => ({
    isRefreshing: refresh,
    search,
    openCourse,
  }), [refresh, search, openCourse]);

  const enrolledProps = useMemo(() => ({
    openCourse,
    search,
    isRefreshing: refresh,
  }), [openCourse, search, refresh]);

  const savedProps = useMemo(() => ({
    search,
    openCourse,
    isRefreshing: refresh,
  }), [search, openCourse, refresh]);

  const doneProps = useMemo(() => ({
    search,
    openCourse,
    isRefreshing: refresh,
  }), [search, openCourse, refresh]);

  return (
    <>
      <br />
      {showCoursePage && (
        <div>
          <div className="flex justify-between items-center">
            <h1 className="dashboard_h1">Course</h1>
          </div>
          <div className="flex justify-between items-center gap-4">
            <div className="md:w-[75%] w-full">
              <DashboardSearch
                value={search}
                onChange={handleSearchChange}
                placeholder="Search courses..."
              />
            </div>
            <div className="flex items-center gap-2">
              {RefreshButton}
            </div>
          </div>

          <DashboardTabSelection
            activeTab={activeTab}
            setActiveTab={handleTabChange as any}
          />

          {activeTab === "all" && (
            <DashboardCourseAllProvider {...allProviderProps} />
          )}
          {activeTab === "enrolled" && (
            <DashboardCourseEnrolled {...enrolledProps} />
          )}
          {activeTab === "saved" && (
            <DashboardCourseSaved {...savedProps} />
          )}
          {activeTab === "done" && (
            <DashboardCourseDone {...doneProps} />
          )}
        </div>
      )}

      {showCourse && courseId && (
        <DashboardCourseView 
          backFunction={backFunction} 
          courseId={courseId} 
        />
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