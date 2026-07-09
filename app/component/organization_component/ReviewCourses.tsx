// components/org-admin/ReviewCourses.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  HiOutlineBookOpen,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineChevronDown,
  HiOutlinePlus,
  HiOutlineViewGrid,
  HiOutlineViewList,
} from "react-icons/hi";
import { FaSpinner } from "react-icons/fa";
import { PiStudent } from "react-icons/pi";
import DashboardTutorCourseBreakdown from "../dashboard_tutor_course_breakdown";
import DashboardTutorCreateCourse from "../dashboard_tutor_create-course";

interface Course {
  id: string;
  course_title: string;
  course_description: string;
  course_level: string;
  course_image?: string;
  createdBy: string;
  user_pic: string;
  enrollmentCount: number;
  completionRate: number;
  averageRating: number;
  status: "published" | "draft" | "archived";
  createdAt: string;
  updatedAt: string;
  moduleCount: number;
  lessonCount: number;
  totalEnrollments: number;
  organizationName?: string;
  stats: {
    averageProgress: number;
    lessonCount: number;
    moduleCount: number;
    totalStudents: number;
  };
}

interface ReviewCoursesProps {
  onBack: () => void;
}

export default function ReviewCourses({ onBack }: ReviewCoursesProps) {
  const params = useParams<{ org_name: string }>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | undefined>(undefined);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const organizationId = params.org_name;

  useEffect(() => {
    fetchCourses();
  }, [organizationId]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}/api/organizations/courses-with-stats/${organizationId}`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (data.data?.courses) {
        setCourses(data.data.courses);
        console.log("Fetched courses:", data.data.courses);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setShowBreakdown(true);
    setShowCreateCourse(false);
  };

  const handleBackToCourses = () => {
    setShowBreakdown(false);
    setShowCreateCourse(false);
    setSelectedCourseId(null);
    setEditingCourseId(undefined);
    fetchCourses(); // Refresh courses in case of changes
  };

  const handleCreateCourse = () => {
    setShowCreateCourse(true);
    setShowBreakdown(false);
    setSelectedCourseId(null);
    setEditingCourseId(undefined);
  };

  const handleEditCourse = (courseId: string) => {
    setEditingCourseId(courseId);
    setShowCreateCourse(true);
    setShowBreakdown(false);
    setSelectedCourseId(null);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    
    try {
      const res = await fetch(
        `${API_URL}/api/course/delete-course/${courseId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete course");
      }

      // Refresh the course list
      await fetchCourses();
      setShowBreakdown(false);
      setSelectedCourseId(null);
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.course_title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || course.status === filterStatus;
    const matchesLevel =
      filterLevel === "all" ||
      course.course_level.toLowerCase() === filterLevel.toLowerCase();
    return matchesSearch && matchesStatus && matchesLevel;
  });

  const getLevelBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "intermediate":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "advanced":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Render course card based on view mode
  const renderCourseCard = (course: Course) => {
    if (viewMode === "list") {
      // List View
      return (
        <div
          key={course.id}
          className="bg-white dark:bg-secondaryColors-0 border border-[#ccc]/15 rounded-[10px] p-4 my-2 grid md:grid-cols-[35%,64%] gap-4"
        >
          <div>
            <div className="h-[150px] w-full rounded-[15px] overflow-hidden relative">
              <img
                src={course.course_image || "/images/default-course.jpg"}
                alt={course.course_title}
                className="w-full h-full object-cover hover:scale-125 transition-all duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/default-course.jpg";
                }}
              />
              <div className={`absolute bottom-2 left-2 text-[0.8rem] text-white px-4 py-1 rounded-[10px] flex justify-center items-center ${getLevelBadgeColor(course.course_level)}`}>
                {course.course_level}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 items-start">
            <h1 className="text-[1.4rem] font-semibold capitalize">
              {course.course_title}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-[0.8rem] line-clamp-2">
              {course.course_description}
            </p>
            <div className="flex items-center justify-between w-full gap-3">
              <div className="flex flex-col gap-3 w-full">
                <div className="flex justify-between">
                  <span>
                    Progress:{" "}
                    <i className="not-italic font-bold">
                      {Math.round(course.stats.averageProgress)}%
                    </i>
                  </span>
                  <span className="flex items-center gap-1">
                    <PiStudent />
                    {course.stats.totalStudents} Students
                  </span>
                </div>
                <div className="w-full bg-lightWhite-0 dark:bg-shadyColor-0 rounded-full h-2.5 mt-1">
                  <div
                    className="bg-primaryColors-0 h-2.5 rounded-full"
                    style={{
                      width: `${course.stats.averageProgress}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleViewCourse(course.id)}
                  className="bg-primaryColors-0 text-white px-4 py-2 rounded-[10px] hover:bg-primaryColors-1 transition-colors duration-300 text-sm"
                >
                  View
                </button>
                <button 
                  onClick={() => handleEditCourse(course.id)}
                  className="bg-gray-200 dark:bg-shadyColor-0 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-[10px] hover:bg-gray-300 dark:hover:bg-shadyColor-100 transition-colors duration-300 text-sm"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Grid View
    return (
      <div
        key={course.id}
        className="bg-white dark:bg-secondaryColors-0 border border-[#ccc]/15 rounded-[10px] p-4 my-2"
      >
        <div className="h-[150px] w-full rounded-[15px] overflow-hidden relative">
          <img
            src={course.course_image || "/images/default-course.jpg"}
            alt={course.course_title}
            className="w-full h-full object-cover hover:scale-125 transition-all duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/default-course.jpg";
            }}
          />
          <div className={`absolute bottom-2 right-2 text-[0.8rem] text-white px-4 py-1 rounded-[10px] flex justify-center items-center ${getLevelBadgeColor(course.course_level)}`}>
            {course.course_level}
          </div>
        </div>
        <div className="mt-5">
          <h1 className="text-[1.4rem] font-semibold capitalize line-clamp-1">
            {course.course_title}
          </h1>
          <div className="flex items-center mt-2">
            <div className="w-8 h-8 rounded-full overflow-hidden mr-2 bg-primaryColors-0 flex justify-center items-center">
              {course.user_pic ? (
                <img
                  src={course.user_pic}
                  alt={course.createdBy}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-lg">
                  {course.createdBy?.charAt(0) || "?"}
                </span>
              )}
            </div>
            <span>{course.createdBy}</span>
          </div>
          <div>
            <div className="flex items-center justify-between my-4 text-sm text-gray-500 dark:text-gray-400">
              <h1>Progress</h1>
              <span>{Math.round(course.stats.averageProgress)}%</span>
            </div>
            <div className="w-full bg-lightWhite-0 dark:bg-shadyColor-0 rounded-full h-2.5 mt-1">
              <div
                className="bg-primaryColors-0 h-2.5 rounded-full"
                style={{
                  width: `${course.stats.averageProgress}%`,
                }}
              ></div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 mt-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <PiStudent />
              {course.stats.totalStudents} Students
            </span>
            <span className="flex items-center gap-1">
              {course.stats.moduleCount} modules, {course.stats.lessonCount} lessons
            </span>
          </div>
          <div className="flex gap-2 mt-4">
            <button 
              onClick={() => handleViewCourse(course.id)}
              className="bg-primaryColors-0 text-white py-2 px-4 rounded-md hover:bg-primaryColors-1 transition-colors duration-300 flex-1"
            >
              View
            </button>
            <button 
              onClick={() => handleEditCourse(course.id)}
              className="bg-gray-200 dark:bg-shadyColor-0 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-shadyColor-100 transition-colors duration-300"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    );
  };

  // If showing breakdown, render DashboardTutorCourseBreakdown
  if (showBreakdown && selectedCourseId) {
    return (
      <DashboardTutorCourseBreakdown 
        backFunc={handleBackToCourses}
        courseId={selectedCourseId}
        onDelete={() => handleDeleteCourse(selectedCourseId)}
        refreshCourse={fetchCourses}
      />
    );
  }

  // If creating/editing course, render DashboardTutorCreateCourse
  if (showCreateCourse) {
    return (
      <DashboardTutorCreateCourse
        courseId={editingCourseId}
        backToCourse={handleBackToCourses}
        refreshCourse={fetchCourses}
        onCourseUpdate={() => {
          fetchCourses();
          handleBackToCourses();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-lightWhite-0/80 backdrop-blur-md dark:bg-secondaryColors-0/60 backdrop-blur-sm rounded-[10px]">
      {/* Header */}
      <div className="bg-white dark:bg-secondaryColors-0 border-b border-[#ccc]/10 dark:border-[#ccc]/10 p-4 rounded-tl-[20px] rounded-tr-[20px]">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-shadyColor-0 rounded-lg transition-colors"
            >
              <HiOutlineChevronDown className="w-5 h-5 rotate-90 text-gray-600 dark:text-gray-300" />
            </button>
            <h1 className="text-xl font-semibold dark:text-white">
              Review Courses
            </h1>
            <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
              ({filteredCourses.length} courses)
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* View Toggle Buttons */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-shadyColor-0 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-primaryColors-0 text-white shadow-md"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
                title="Grid View"
              >
                <HiOutlineViewGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-primaryColors-0 text-white shadow-md"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
                title="List View"
              >
                <HiOutlineViewList className="w-4 h-4" />
              </button>
            </div>
            <button 
              onClick={handleCreateCourse}
              className="flex items-center gap-2 px-4 py-2 bg-primaryColors-0 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
            >
              <HiOutlinePlus className="w-5 h-5" />
              <span>Create Course</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="p-4 dark:bg-secondaryColors-0 bg-white border-b border-[#ccc]/10 dark:border-[#ccc]/10">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#ccc]/10 rounded-lg bg-lightWhite-0 dark:bg-shadyColor-0 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <HiOutlineFilter className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-[#ccc]/10 rounded-lg bg-lightWhite-0 dark:bg-shadyColor-0 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-3 py-2 border border-[#ccc]/10 rounded-lg bg-lightWhite-0 dark:bg-shadyColor-0 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Course Grid/List */}
      <div className="p-4 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <FaSpinner className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <HiOutlineBookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              No courses found
            </p>
            <button 
              onClick={handleCreateCourse}
              className="mt-4 px-6 py-2 bg-primaryColors-0 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create Your First Course
            </button>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <div className={viewMode === "grid" ? "grid md:grid-cols-2 gap-5" : "flex flex-col gap-2"}>
              {filteredCourses.map((course) => renderCourseCard(course))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}