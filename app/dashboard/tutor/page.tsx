"use client";

import DashboardTutorActivities from "@/app/component/dashboard_tutor_activities";
import DashboardTutorCreateCourse from "@/app/component/dashboard_tutor_create-course";
import DashboardTutorOverview from "@/app/component/dashboard_tutor_overview";
import DashboardTutorQuickAction from "@/app/component/dashboard_tutor_quick_action";
import DashboardTutorTopStudents from "@/app/component/dashboard_tutor_top_students";
import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardTutorCourseBreakdown from "@/app/component/dashboard_tutor_course_breakdown";

export default function TutorDashboard() {
  const [showCreateCoursePage, setShowCreateCourse] = useState<boolean>(false);
  const [showTutorPage, setShowTutorPage] = useState<boolean>(true);
  const [courseId, setCourseId] = useState<string>("");
  const [showCourseBreakdown, setShowCourseBreakdown] =
    useState<boolean>(false);
  const openCreateCourse = () => {
    setShowCreateCourse(true);
    setShowTutorPage(false);
  };

  const closeCreateCourse = () => {
    setShowCreateCourse(false);
    setShowTutorPage(true);
  };

  // Animation variants for better organization
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        duration: 0.6,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smoother motion
      },
    },
  };

  const pageTransitionVariants = {
    initial: { opacity: 0, x: 20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const handleOpenViewBreakdown = useCallback(
    (id: string) => {
      setShowCourseBreakdown(true);
      setShowTutorPage(false);
      setCourseId(id);
    },
    [courseId],
  );


  const deleteCourseFromBackend = async (courseId: string): Promise<void> => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(
        `${API_URL}/api/course/delete-course/${courseId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      await response.json();

      if (!response.ok) {
        console.error("Failed to delete course from backend");
      } else {
        console.log("Course deleted successfully from backend");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };


  return (
    <div>
      <br />
      <AnimatePresence mode="wait">
        {showTutorPage && (
          <motion.div
            key="tutor-dashboard"
            variants={pageTransitionVariants as any}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            <h1 className="dashboard_h1 px-[1rem] md:px-0">Dashboard</h1>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.div variants={itemVariants as any}>
                <DashboardTutorOverview
                  viewTutorCourseBreakdown={handleOpenViewBreakdown}
                />
              </motion.div>

              <motion.div variants={itemVariants as any}>
                <DashboardTutorQuickAction createCourse={openCreateCourse} />
              </motion.div>

              <motion.div variants={itemVariants as any}>
                <DashboardTutorTopStudents />
              </motion.div>

              <motion.div variants={itemVariants as any}>
                <DashboardTutorActivities />
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {showCreateCoursePage && (
          <motion.div
            key="create-course"
            variants={pageTransitionVariants as any}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            <DashboardTutorCreateCourse
              refreshCourse={() => {}}
              backToCourse={closeCreateCourse}
            />
          </motion.div>
        )}

        {showCourseBreakdown && (
          <motion.div
            key="create-course"
            variants={pageTransitionVariants as any}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            <DashboardTutorCourseBreakdown
              onDelete={deleteCourseFromBackend} 
              refreshCourse={() => {}}
              courseId={courseId}
              backFunc={() => {
                setCourseId('')
                setShowCourseBreakdown(false);
                setShowTutorPage(true);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
