"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { PiHandWavingDuotone } from "react-icons/pi";
import DashboardOrgAdminOverview from "@/app/component/organization_component/dashboard_org_admin_overview";
import DashboardAdminOrgBreakdown from "@/app/component/organization_component/dashboard_org_admin_breakdown";
import DashboardOrgAdminQuickActions from "@/app/component/organization_component/dashboard_org_quickactions";
import DashboardOrgAdminActivities from "@/app/component/organization_component/dashboard_org_admin_activities";
import { useOrganizationContext } from "@/app/component/organization_component/organanization_context";
export default function OrgAdminDashboard() {
  const [showDashboard, setShowDashboard] = useState<boolean>(true);
  const { organizationId, setOrganizationId } = useOrganizationContext();
  const router = useRouter();
  const [organizationName, setOrganizationName] = useState<string>("");
  const [annoucementModal, setAnnouncementModal] = useState<boolean>(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [subPages, setSubPages] = useState<
    "m-members" | "r-courses" | "m-event" | null
  >(null);

  const params = useParams<{ org_name: string }>();
  const { org_name } = params;

  useEffect(() => {
    if (
      organizationId == "" ||
      organizationId == null ||
      organizationId == undefined
    ) {
      router.push("../../../auth");
    }
    const fetchOrganization = async () => {
      const res = await fetch(
        `${API_URL}/api/organizations/fetch-specific-organization/${org_name}`,
        {
          method: "GET",
        },
      );

      const data = await res.json();

      if (data.status === 404) {
        router.push("../../../notfoundPage");
        return false;
      }
      console.log(data);
      setOrganizationId(data.data.id);
      setOrganizationName(data.data.organization_name);
    };

    fetchOrganization();
  }, [organizationId]);
  const subPagesFunc = (pages: "m-members" | "r-courses" | "m-event") => {
    if (pages == "m-members") {
      setShowDashboard(false);
      setSubPages("m-members");
    } else if (pages == "r-courses") {
      setShowDashboard(false);
      setSubPages("r-courses");
    } else if (pages == "m-event") {
      setShowDashboard(false);
      setSubPages("m-event");
    }
  };

  const backFunc = () => {
    setSubPages(null);
    setShowDashboard(true);
  };

  const closeAnnoucementPage = () => {
    setAnnouncementModal(false);
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
            <h1 className="dashboard_h1 line-clamp-1">
              Welcome Back &#128075;{" "}
              <span className="capitalize">{organizationName}.</span>
            </h1>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.div variants={itemVariants as any}>
                <DashboardOrgAdminOverview />
              </motion.div>
              <motion.div variants={itemVariants as any}>
                <DashboardAdminOrgBreakdown />
              </motion.div>

              <motion.div variants={itemVariants as any}>
                <DashboardOrgAdminQuickActions
                  manageEvents={() => {
                    subPagesFunc("m-event");
                  }}
                  reviewCourses={() => {
                    subPagesFunc("r-courses");
                  }}
                  manageMembers={() => {
                    subPagesFunc("m-members");
                  }}
                  makeAnnoucement={() => {}}
                />
              </motion.div>
              <motion.div variants={itemVariants as any}>
                <DashboardOrgAdminActivities />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
        {subPages == "m-members" ? (
          <motion.div
            key="users"
            variants={pageTransitionVariants as any}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          ></motion.div>
        ) : subPages == "r-courses" ? (
          <motion.div
            key="courses"
            variants={pageTransitionVariants as any}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          ></motion.div>
        ) : subPages == "m-event" ? (
          <motion.div
            key="event"
            variants={pageTransitionVariants as any}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          ></motion.div>
        ) : (
          ""
        )}

        <div
          className={`w-full transition-all duration-250 fixed top-0 right-0 ${
            !annoucementModal == false ? "translate-x-0" : "translate-x-full"
          }`}
        ></div>
      </AnimatePresence>
    </div>
  );
}
