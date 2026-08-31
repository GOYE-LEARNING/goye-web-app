// components/DashboardCourseSaved.tsx
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

export default function DashboardCourseSaved({ openCourse, search, isRefreshing }: Props) {
  const [savedCourses, setSavedCourses] = useState<any[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const { showModal } = useModal();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const pathname = usePathname();

  const isOrganizationRoute = pathname?.includes('/organization/');

  const fetchSavedCourses = async () => {
    try {
      setInitialLoading(true);
      
      if (isOrganizationRoute) {
        const res = await fetch(`${API_URL}/api/organizations/get-courses-by-organization`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message || "Failed to fetch organization courses");
        
        const courses = data.data?.courses || [];
        
        // ✅ Transform organization courses to include required fields
        const transformedCourses = courses.map((course: any) => ({
          id: course.id,
          course_title: course.course_title,
          course_description: course.course_description,
          course_short_description: course.course_short_description,
          course_image: course.course_image,
          course_level: course.course_level,
          createdBy: course.createdBy,
          organizationName: course.organizationName,
          isEnrolled: false,
          enrollmentStatus: "NOT_ENROLLED",
          enrollment: [],
          enrollmentCount: course.enrollment?.length || 0,
          progress: null,
          totalDuration: course.totalDuration || 0,
          totalDurationMinutes: course.totalDuration || 0,
          lessonCount: course.lessonCount || 0,
          totalLessons: course.lessonCount || 0,
          module: course.module || [],
          moduleCount: course.module?.length || 0,
          createdByDetails: course.createdByDetails || null,
        }));
        
        setSavedCourses(transformedCourses);
        await fetchSavedIds();
      } else {
        // ✅ For regular route - fetch saved courses with the new endpoint
        const res = await fetch(`${API_URL}/api/course/fetch-saved-courses`, {
          method: "GET",
          credentials: "include",
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message || "Failed to fetch saved courses");
        
        // ✅ The data is already transformed with enrollment status and total minutes
        const courses = data.data || [];
        
        setSavedCourses(courses);
        setBookmarkedIds(courses.map((c: any) => c.id));
      }
    } catch (error) {
      console.error(error);
      showModal("Error", isOrganizationRoute ? "Could not load organization courses" : "Could not load saved courses", "error");
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
      const savedIds = savedItems.map((item: any) => item.id);
      
      setBookmarkedIds(savedIds);
    } catch (error) {
      console.error("Could not load saved courses", error);
    }
  };

  useEffect(() => {
    fetchSavedCourses();
  }, [isOrganizationRoute]);

  useEffect(() => {
    if (isRefreshing) {
      fetchSavedCourses();
    }
  }, [isRefreshing]);

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
      emptyMessage={isOrganizationRoute ? "No courses found in this organization" : "You have no saved courses yet"}
    />
  );
}