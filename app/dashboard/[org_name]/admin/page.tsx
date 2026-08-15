// app/dashboard/[org_name]/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useOrganizationContext } from "@/app/component/organization_component/organanization_context";
import DashboardOrgAdminOverview from "@/app/component/organization_component/dashboard_org_admin_overview";
import DashboardAdminOrgBreakdown from "@/app/component/organization_component/dashboard_org_admin_breakdown";
import DashboardOrgAdminAnalytics from "@/app/component/organization_component/dashboard_org_admin_analytics";
import DashboardOrgAdminQuickActions from "@/app/component/organization_component/dashboard_org_quickactions";
import DashboardOrgAdminActivities from "@/app/component/organization_component/dashboard_org_admin_activities";
import ManageMembers from "@/app/component/organization_component/ManageMembers";
import ReviewCourses from "@/app/component/organization_component/ReviewCourses";
import ManageEvents from "@/app/component/organization_component/ManageEvents";
import MakeAnnouncementModal from "@/app/component/organization_component/MakeAnnoucementModal";


type SubPage = "m-members" | "r-courses" | "m-event" | null;

const pageTransitionVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeInOut" } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.3, ease: "easeOut" } },
};

export default function OrgAdminDashboard() {
  const [showDashboard, setShowDashboard] = useState<boolean>(true);
  const [subPage, setSubPage] = useState<SubPage>(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState<boolean>(false);
  const [organizationName, setOrganizationName] = useState<string>("");
  
  const { organizationId, setOrganizationId } = useOrganizationContext();
  const router = useRouter();
  const params = useParams<{ org_name: string }>();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!organizationId) {
      router.push("../../../auth");
      return;
    }

    const fetchOrganization = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/organizations/fetch-specific-organization/${params.org_name}`,
          { method: "GET" }
        );
        const data = await res.json();
        if (data.status === 404) {
          router.push("../../../notfoundPage");
          return;
        }
        setOrganizationId(data.data.id);
        setOrganizationName(data.data.organization_name);
      } catch (error) {
        console.error("Error fetching organization:", error);
      }
    };

    fetchOrganization();
  }, [organizationId, params.org_name]);

  const handleSubPage = (page: SubPage) => {
    setShowDashboard(false);
    setSubPage(page);
  };

  const handleBack = () => {
    setSubPage(null);
    setShowDashboard(true);
  };

  const renderSubPage = () => {
    switch (subPage) {
      case "m-members":
        return <ManageMembers onBack={handleBack} />;
      case "r-courses":
        return <ReviewCourses onBack={handleBack} />;
      case "m-event":
        return <ManageEvents onBack={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {showDashboard ? (
          <motion.div
            key="dashboard"
            variants={pageTransitionVariants as any}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            <h1 className="dashboard_h1 line-clamp-1">
              Welcome Back <span className="capitalize">{organizationName}</span>
            </h1>

            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
              }}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <DashboardOrgAdminOverview />
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <DashboardAdminOrgBreakdown />
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <DashboardOrgAdminAnalytics />
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <DashboardOrgAdminQuickActions
                  manageMembers={() => handleSubPage("m-members")}
                  reviewCourses={() => handleSubPage("r-courses")}
                  manageEvents={() => handleSubPage("m-event")}
                  makeAnnoucement={() => setShowAnnouncementModal(true)}
                />
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <DashboardOrgAdminActivities />
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="subpage"
            variants={pageTransitionVariants as any}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            {renderSubPage()}
          </motion.div>
        )}
      </AnimatePresence>

      <MakeAnnouncementModal
        isOpen={showAnnouncementModal}
        onClose={() => setShowAnnouncementModal(false)}
        organizationName={organizationName}
      />
    </div>
  );
}