// components/dashboard_course_all.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useModal } from "../context/SimpleModalContext";
import CourseList from "./dashboard_courselist_component";
import Loader from "./loader";

interface Props {
  openCourse: (id: string) => void;
  search: string;
  isRefreshing: boolean;
}

export default function DashboardCourseAllProvider({ openCourse, search, isRefreshing }: Props) {
  const [courses, setCourses] = useState<any[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const { showModal } = useModal();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();

  const fetchCourses = async () => {
    try {
      setInitialLoading(true);
      
      const res = await fetch(`${API_URL}/api/course/get-all-courses-level`, {
        method: "GET",
        credentials: "include",
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch courses");
      }
      
      console.log("Courses data:", data);
      
      const coursesData = data.data?.getAllCourses || [];
      
      // Transform the data to match the CourseCard interface
      const transformedCourses = coursesData.map((course: any) => {
        const rawProgress = course.progress || null;
        const enrollmentStatus = course.enrollmentStatus || "NOT_ENROLLED";

        // Trust enrollmentStatus as the source of truth for "is this user
        // actually enrolled" — both signals must agree. Prevents a stray
        // isEnrolled flag from ever driving a progress bar / "Continue
        // Learning" on a course the user hasn't joined.
        const isEnrolled = Boolean(course.isEnrolled) && enrollmentStatus !== "NOT_ENROLLED";
        
        return {
          id: course.id,
          course_title: course.course_title,
          course_description: course.course_description,
          course_short_description: course.course_short_description,
          course_image: course.course_image,
          course_level: course.course_level,
          createdBy: course.createdBy,
          organizationName: course.organizationName,
          enrollmentStatus,
          isEnrolled,
          enrollment: course.enrollment || [],
          progress: (isEnrolled && rawProgress) ? {
            percentage: rawProgress.percentage || 0,
            completedLessons: rawProgress.completed_lessons || 0,
            totalLessons: rawProgress.total_lessons || 0,
            totalDurationMinutes: rawProgress.total_duration_minutes || 0,
            watchedDurationMinutes: rawProgress.watched_duration_minutes || 0,
            isCompleted: rawProgress.is_completed || false,
          } : null,
          totalDuration: course.totalDuration || 0,
          lessonCount: course.totalLessons || 0,
          module: course.module || [],
          moduleCount: course.moduleCount || 0,
          createdByDetails: course.createdByDetails || null,
          enrollmentCount: course.enrollmentCount || 0,
        };
      });
      
      console.log("Transformed courses:", transformedCourses);
      
      setCourses(transformedCourses);
      
      // Fetch bookmarked IDs
      await fetchSavedIds();
      
    } catch (error) {
      console.error(error);
      showModal("Error", "Could not load courses", "error");
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchSavedIds = async () => {
    try {
      const res = await fetch(`${API_URL}/api/course/fetch-saved-courses`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error("Failed to fetch saved courses");
      
      const savedItems = data.data || [];

      // FIX: the previous filter (`item.courses !== null`) only excluded
      // explicit nulls — if item.courses was ever undefined instead, it
      // slipped through and crashed on `.id`. Using optional chaining and
      // filtering on the resolved id itself is safe against null,
      // undefined, or a missing id, regardless of the cause upstream.
      const savedIds: string[] = savedItems
        .map((item: any) => item?.courses?.id)
        .filter((id: unknown): id is string => typeof id === "string" && id.length > 0);
      
      setBookmarkedIds(savedIds);
    } catch (error) {
      console.error("Could not load saved courses", error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (isRefreshing) {
      fetchCourses();
    }
  }, [isRefreshing]);

  const toggleBookmark = async (id: string) => {
    try {
      const isBookmarked = bookmarkedIds.includes(id);
      
      if (isBookmarked) {
        const res = await fetch(`${API_URL}/api/course/unsave-course/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to unsave course");
        setBookmarkedIds((prev) => prev.filter((i) => i !== id));
        showModal("Success", "Course removed from saved", "success");
      } else {
        const res = await fetch(`${API_URL}/api/course/save-course/${id}`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to save course");
        setBookmarkedIds((prev) => [...prev, id]);
        showModal("Success", "Course saved successfully", "success");
      }
    } catch (error) {
      console.error(error);
      showModal("Error", "Could not update saved status", "error");
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

  const filteredCourses = courses.filter(
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
      emptyMessage="No courses found"
    />
  );
}