// components/CourseList.tsx
"use client";

import Loader from "./loader";
import CourseCard from "./dashboard_course_card_component";
import { FiBookOpen, FiSearch, FiCompass } from "react-icons/fi";

// ✅ Updated Course interface to match CourseCard expectations
interface Course {
  id: string;
  course_image: string | null;
  course_title: string;
  course_description: string;
  course_short_description?: string;
  course_level: string;
  createdBy?: string;
  organizationName?: string;
  enrollmentStatus: string;
  isEnrolled: boolean;
  totalEnrollments: number;
  progress: {
    percentage: number;
    completedLessons: number;
    totalLessons: number;
    totalDurationMinutes: number;
    watchedDurationMinutes: number;
    isCompleted: boolean;
  };
  totalDuration: number;
  lessonCount: number;
  moduleCount: number;
  lastAccessed?: string | null;
  completedAt?: string | null;
}

interface CourseListProps {
  courses: Course[];
  bookmarkedIds: string[];
  onBookmarkToggle: (id: string) => void;
  onViewCourse: (id: string) => void;
  loadingCourseId?: string | null;
  isLoading?: boolean;
  emptyMessage?: string;
  emptySubMessage?: string;
  isToggling?: string | null;
}

export default function CourseList({
  courses,
  bookmarkedIds,
  onBookmarkToggle,
  onViewCourse,
  loadingCourseId = null,
  isLoading = false,
  emptyMessage = "No courses available",
  emptySubMessage = "Check back later for new courses or explore other categories",
  isToggling = null,
}: CourseListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader height={40} width={40} border_width={3} full_border_color="transparent" small_border_color="#30A46F"/>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-16">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primaryColors-0/10 to-green-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
          
          <div className="relative">
            <div className="w-28 h-28 mx-auto bg-gradient-to-br from-primaryColors-0/20 to-green-500/20 rounded-3xl flex items-center justify-center">
              <FiCompass className="w-14 h-14 text-primaryColors-0 animate-pulse" />
            </div>
            <div className="absolute -top-3 -right-3 w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center animate-bounce">
              <FiSearch className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-3 -left-3 w-10 h-10 bg-primaryColors-0 rounded-xl flex items-center justify-center animate-bounce delay-150">
              <FiBookOpen className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="text-center mt-8 space-y-3">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primaryColors-0 to-green-500 bg-clip-text text-transparent">
            {emptyMessage}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {emptySubMessage}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <span className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-400">
            🔍 Try different keywords
          </span>
          <span className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-400">
            📚 Check your enrolled courses
          </span>
          <span className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-400">
            ⭐ Browse saved courses
          </span>
        </div>

        <div className="mt-12 flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full bg-primaryColors-0/40 animate-pulse`}
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          isBookmarked={bookmarkedIds.includes(course.id)}
          onBookmarkToggle={onBookmarkToggle}
          onViewCourse={onViewCourse}
          isViewLoading={loadingCourseId === course.id}
          isToggling={isToggling === course.id}
        />
      ))}
    </div>
  );
}