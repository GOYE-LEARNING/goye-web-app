"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useModal } from "../context/SimpleModalContext";
import CourseList from "./dashboard_courselist_component";

interface Props {
  openCourse: (id: string) => void;
  search: string;
  isRefreshing: boolean;
}

export default function DashboardCourseAllProvider({
  openCourse,
  search,
  isRefreshing,
}: Props) {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [courseDetails, setCourseDetails] = useState<any[]>([]);
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const { showModal } = useModal();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const pathname = usePathname();

  // ✅ Check if we're in an organization route
  const isOrganizationRoute = pathname?.includes('/organization/');

  // Fetch all courses - uses different endpoint based on route
  const fetchCourses = async () => {
    try {
      setInitialLoading(true);
      
      // ✅ Use organization-specific endpoint if in organization route
      const endpoint = isOrganizationRoute
        ? `${API_URL}/api/organizations/get-courses-by-organization`
        : `${API_URL}/api/course/get-all-courses-level`;
      
      console.log(`📡 Fetching courses from: ${endpoint}`);
      
      const res = await fetch(endpoint, {
        method: "GET",
        credentials: "include",
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Failed to fetch courses");
      
      // ✅ Handle different response structures
      let courses = [];
      if (isOrganizationRoute) {
        // Organization endpoint returns { data: { courses: [...] } }
        courses = data.data?.courses || [];
        console.log(`🏢 Organization courses found: ${courses.length}`);
      } else {
        // Global endpoint returns { data: { getAllCourses: [...] } }
        courses = data.data?.getAllCourses || [];
        console.log(`🌐 Global courses found: ${courses.length}`);
      }
      
      setCourseDetails(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      showModal("Error", "Could not load courses", "error");
    } finally {
      setInitialLoading(false);
    }
  };

  // Fetch saved course IDs for the user
  const fetchSavedCourseIds = async () => {
    try {
      const res = await fetch(`${API_URL}/api/course/fetch-saved-courses`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch saved courses");
      
      const savedItems = data.data || [];
      const savedIds = savedItems
        .filter((item: any) => item.courses !== null)
        .map((item: any) => item.courses.id);
      
      setBookmarkedIds(savedIds);
    } catch (error) {
      console.error("Could not load saved courses", error);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchCourses();
      await fetchSavedCourseIds();
    };
    load();
  }, [isOrganizationRoute]); // ✅ Re-fetch when route changes

  // Refresh when isRefreshing changes
  useEffect(() => {
    if (isRefreshing) {
      fetchCourses();
      fetchSavedCourseIds();
    }
  }, [isRefreshing]);

  const toggleBookmark = async (id: string) => {
    if (isToggling === id) return;
    
    setIsToggling(id);
    const isCurrentlySaved = bookmarkedIds.includes(id);
    
    try {
      const endpoint = isCurrentlySaved
        ? `${API_URL}/api/course/unsave-course/${id}`
        : `${API_URL}/api/course/save-course/${id}`;
      const method = isCurrentlySaved ? "DELETE" : "POST";

      const res = await fetch(endpoint, {
        method,
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to ${isCurrentlySaved ? "unsave" : "save"} course`);
      }

      setBookmarkedIds((prev) =>
        isCurrentlySaved ? prev.filter((i) => i !== id) : [...prev, id]
      );
      
      showModal("Success", isCurrentlySaved ? "Course removed from saved" : "Course saved", "success");
    } catch (error) {
      console.error(error);
      showModal("Error", `Could not ${isCurrentlySaved ? "unsave" : "save"} course`, "error");
      await fetchSavedCourseIds();
    } finally {
      setIsToggling(null);
    }
  };

  const handleViewCourse = async (id: string) => {
    if (loadingCourseId) return;
    setLoadingCourseId(id);
    try {
      await openCourse(id);
    } finally {
      setLoadingCourseId(null);
    }
  };

  const filteredCourses = courseDetails.filter(
    (course) =>
      course.course_title?.toLowerCase().includes(search.toLowerCase()) ||
      course.course_description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CourseList
      courses={filteredCourses}
      bookmarkedIds={bookmarkedIds}
      onBookmarkToggle={toggleBookmark}
      onViewCourse={handleViewCourse}
      loadingCourseId={loadingCourseId}
      isLoading={initialLoading || isRefreshing}
      emptyMessage={isOrganizationRoute ? "No courses found in this organization" : "No Course Found"}
      isToggling={isToggling}
    />
  );
}