// components/DashboardCourseSaved.tsx
"use client";

import { useEffect, useState } from "react";
import { useModal } from "../context/SimpleModalContext";
import CourseList from "./dashboard_courselist_component";

interface Props {
  openCourse: (id: string) => void;
  search: string;
  isRefreshing: boolean;
}

export default function DashboardCourseSaved({ openCourse, search, isRefreshing }: Props) {
  const [savedCourses, setSavedCourses] = useState<any[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const { showModal } = useModal();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchSavedCourses = async () => {
    try {
      setInitialLoading(true);
      const res = await fetch(`${API_URL}/api/course/fetch-saved-courses`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Failed to fetch saved courses");
      
      // ✅ FIX: Add null check for data.data and filter out null courses
      const savedItems = data.data || [];
      const courses = savedItems
        .filter((item: any) => item.courses !== null) // Filter out null courses
        .map((item: any) => item.courses);
      
      setSavedCourses(courses);
      setBookmarkedIds(courses.map((c: any) => c.id));
    } catch (error) {
      console.error(error);
      showModal("Error", "Could not load saved courses", "error");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedCourses();
  }, []);

  const toggleBookmark = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/course/unsave-course/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to unsave course");

      setSavedCourses((prev) => prev.filter((course) => course.id !== id));
      setBookmarkedIds((prev) => prev.filter((i) => i !== id));
      showModal("Success", "Course removed from saved", "success");
    } catch (error) {
      console.error(error);
      showModal("Error", "Could not unsave course", "error");
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

  const filteredCourses = savedCourses.filter(
    (course) =>
      course?.course_title?.toLowerCase().includes(search.toLowerCase()) ||
      course?.course_description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CourseList
      courses={filteredCourses}
      bookmarkedIds={bookmarkedIds}
      onBookmarkToggle={toggleBookmark}
      onViewCourse={handleViewCourse}
      loadingCourseId={loadingCourseId}
      isLoading={initialLoading || isRefreshing}
      emptyMessage="You have no saved courses yet"
    />
  );
}