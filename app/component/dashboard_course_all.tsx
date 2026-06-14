// components/DashboardCourseAllProvider.tsx
"use client";

import { useEffect, useState } from "react";
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
  const [isToggling, setIsToggling] = useState<string | null>(null); // Track which course is being toggled
  const { showModal } = useModal();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      setInitialLoading(true);
      const res = await fetch(`${API_URL}/api/course/get-all-courses-level`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch courses");
      setCourseDetails(data.data.getAllCourses || []);
    } catch (error) {
      console.error(error);
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
      
      // ✅ Safely extract saved IDs with null check
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
  }, []);

  // Refresh when isRefreshing changes
  useEffect(() => {
    if (isRefreshing) {
      fetchCourses();
      fetchSavedCourseIds();
    }
  }, [isRefreshing]);

  // ✅ FIX: Toggle bookmark with proper check first
  const toggleBookmark = async (id: string) => {
    // Prevent multiple clicks on the same course
    if (isToggling === id) return;
    
    setIsToggling(id);
    
    // Check current saved status from state (which should be synced with backend)
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

      // Update local state after successful API call
      setBookmarkedIds((prev) =>
        isCurrentlySaved ? prev.filter((i) => i !== id) : [...prev, id]
      );
      
      showModal("Success", isCurrentlySaved ? "Course removed from saved" : "Course saved", "success");
    } catch (error) {
      console.error(error);
      showModal("Error", `Could not ${isCurrentlySaved ? "unsave" : "save"} course`, "error");
      // Refresh saved IDs to ensure consistency
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
      emptyMessage="No Course Found"
      isToggling={isToggling} // Pass down to disable bookmark button while toggling
    />
  );
}