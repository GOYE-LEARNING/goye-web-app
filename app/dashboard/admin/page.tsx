"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardAdminOverview from "@/app/component/admin_component/dashboard_admin_overview";
import DashboardAdminUserBreakdown from "@/app/component/admin_component/dashboard_admin_usersbreakdown";
import DashboardAdminQuickActions from "@/app/component/admin_component/dashboard_admin_quickactions";
import DashboardAdminActivities from "@/app/component/admin_component/dashboard_admin_activities";
import DashboardAdminManageUsers from "@/app/component/admin_component/dashboard_admin_manage_users";
import DashboardAdminReviewCourses from "@/app/component/admin_component/dashboard_admin_review_courses";
import DashboardAdminManageGroups from "@/app/component/admin_component/dashboard_admin_manage_groups";
import DashboardAdminMakeAnnouncement from "@/app/component/admin_component/dashboard_admin_make_announcement";

export default function TutorDashboard() {
  const [showDashboard, setShowDashboard] = useState<boolean>(true);
  const [annoucementModal, setAnnouncementModal] = useState<boolean>(false);
  const [subPages, setSubPages] = useState<
    "m-users" | "r-courses" | "m-groups" | null
  >(null);

  const subPagesFunc = (pages: "m-users" | "r-courses" | "m-groups") => {
    if (pages == "m-users") {
      setShowDashboard(false);
      setSubPages("m-users");
    } else if (pages == "r-courses") {
      setShowDashboard(false);
      setSubPages("r-courses");
    } else if (pages == "m-groups") {
      setShowDashboard(false);
      setSubPages("m-groups");
    }
  };

  const backFunc = () => {
    setSubPages(null);
    setShowDashboard(true);
  };

  const closeAnnoucementPage = () => {
    setAnnouncementModal(false)
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

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {showDashboard && (
          <motion.div
            key="admin-dashboard"
            variants={pageTransitionVariants as any}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            <h1 className="dashboard_h1">Dashboard</h1>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.div variants={itemVariants as any}>
                <DashboardAdminOverview />
              </motion.div>
              <motion.div variants={itemVariants as any}>
                <DashboardAdminUserBreakdown />
              </motion.div>

              <motion.div variants={itemVariants as any}>
                <DashboardAdminQuickActions
                  manageUsers={() => {
                    subPagesFunc("m-users");
                  }}
                  reviewCourses={() => {
                    subPagesFunc("r-courses");
                  }}
                  manageGroups={() => {
                    subPagesFunc("m-groups");
                  }}
                  makeAnnoucement={() => {
                    setAnnouncementModal(true);
                  }}
                />
              </motion.div>
              <motion.div variants={itemVariants as any}>
                <DashboardAdminActivities />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
        {subPages == "m-users" ? (
          <motion.div
            key="users"
            variants={pageTransitionVariants as any}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            <DashboardAdminManageUsers backFunc={backFunc} />
          </motion.div>
        ) : subPages == "r-courses" ? (
          <motion.div
            key="courses"
            variants={pageTransitionVariants as any}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            <DashboardAdminReviewCourses backFunc={backFunc} />
          </motion.div>
        ) : subPages == "m-groups" ? (
          <motion.div
            key="groups"
            variants={pageTransitionVariants as any}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            <DashboardAdminManageGroups backFunc={backFunc} />
          </motion.div>
        ) : (
          ""
        )}

        <div
          className={`w-full transition-all duration-250 fixed top-0 right-0 ${
            !annoucementModal == false ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <DashboardAdminMakeAnnouncement backFunc={closeAnnoucementPage} />
        </div>
      </AnimatePresence>
    </div>
  );
}
