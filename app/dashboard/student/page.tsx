"use client";
import DashboardStudentAnnouncement from "@/app/component/dashboard_student_announcement";
import DashboardStudentCourse from "@/app/component/dashboard_student_course";
import DashboardStudentEvent from "@/app/component/dashboard_student_event";
import DashboardStudentGrowth from "@/app/component/dashboard_student_growth_milestone";
import { useEffect, useState } from "react";
import StudentGrowth from "../../component/dashboard_students__growth";
import UpcomingEvents from "../../component/dashboard_student_upcoming_event";
import { AnimatePresence, motion } from "framer-motion";
import DashboardCourseView from "@/app/component/dashboard_student_courseview";
import { useI18n } from "@/app/context/I18nContext";
export default function Dashboard() {
  const { t } = useI18n();
  const [showGrowth, setShowGrowth] = useState<boolean>(false);
  const [courseId, setCourseId] = useState<string>("")
  const [showDashboard, setShowDashboard] = useState<boolean>(true);
  const [showCourseDetails, setShowCourseDetails] = useState<boolean>(false);
  const [showEvents, setShowEvent] = useState<boolean>(false);
  const [showAnnounement, setShowAnnouncement] = useState<boolean>(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const openGrowth = () => {
    setShowGrowth(true);
    setShowDashboard(false);
    setShowEvent(false);
  };

  const openDashboard = () => {
    setShowGrowth(false);
    setShowDashboard(true);
    setShowEvent(false);
    setShowCourseDetails(false)
  };

  const openEvents = () => {
    setShowGrowth(false);
    setShowDashboard(false);
    setShowEvent(true);
  };

  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        duration: 0.6,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
    },
  };

  const itemVariant = {
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

  const openCourse = (id: string) => {
    setCourseId(id)
    setShowCourseDetails(true);
    setShowDashboard(false)
  };
  useEffect(() => {
    const progress = async () => {
      const res = await fetch(`${API_URL}/api/user/debug-progress`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      console.log("Progress", data);
    };

    progress();
  }, []);
  return (
    <>
      <div className="w-full">
        <br />
        <AnimatePresence mode="wait">
          {showDashboard && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.h1 variants={itemVariant as any} className="dashboard_h1">
                {t("Dashboard")}
              </motion.h1>

              {showAnnounement && (
                <motion.div variants={itemVariant as any}>
                  <DashboardStudentAnnouncement
                    backFunc={() => setShowAnnouncement(false)}
                  />
                </motion.div>
              )}

              <motion.div variants={itemVariant as any}>
                {" "}
                <DashboardStudentCourse openCourse={openCourse} />
              </motion.div>
              <motion.div variants={itemVariant as any}>
                <DashboardStudentGrowth openGrowth={openGrowth} />
              </motion.div>
              <motion.div variants={itemVariant as any}>
                <DashboardStudentEvent openEvent={openEvents} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {showGrowth && <StudentGrowth backFunc={openDashboard} />}
        {showEvents && <UpcomingEvents backFunc={openDashboard} />}
        {showCourseDetails && <DashboardCourseView backFunction={openDashboard} courseId={courseId}/>}
      </div>
    </>
  );
}
