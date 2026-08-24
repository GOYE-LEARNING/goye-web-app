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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const { organizationId, setOrganizationId } = useOrganizationContext();
  const router = useRouter();
  const params = useParams<{ org_name: string }>();

  useEffect(() => {
    const initOrgData = async () => {
      try {
        // ✅ Check if we have organizationId from context
        if (organizationId) {
          console.log("✅ Organization ID from context:", organizationId);
          
          // ✅ Get org name from localStorage or set from URL
          const storedOrgName = localStorage.getItem('org_name');
          if (storedOrgName) {
            setOrganizationName(storedOrgName);
          } else {
            setOrganizationName(params.org_name);
          }
          
          setIsLoading(false);
          return;
        }

        // ✅ Fallback: Try to get from localStorage
        const storedOrgId = localStorage.getItem('organizationId');
        const storedOrgName = localStorage.getItem('org_name');
        
        if (storedOrgId) {
          console.log("✅ Using organization ID from localStorage:", storedOrgId);
          setOrganizationId(storedOrgId);
          setOrganizationName(storedOrgName || params.org_name);
          setIsLoading(false);
          return;
        }

        // ✅ Last resort: Fetch using org name (should rarely happen)
        console.log("🔄 Fetching organization by name:", params.org_name);
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        
        // Get token from cookie
        const token = getCookie('accessToken');
        if (!token) {
          console.error("❌ No access token found");
          router.push("/auth");
          return;
        }

        // ✅ Use the correct endpoint - maybe your backend has a different endpoint
        const response = await fetch(
          `${API_URL}/api/organizations/by-name/${encodeURIComponent(params.org_name)}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Organization fetched by name:", data);
          
          const orgData = data.data || data;
          const orgId = orgData.id || orgData.organizationId;
          
          if (orgId) {
            console.log("✅ Found organization ID:", orgId);
            setOrganizationId(orgId);
            localStorage.setItem('organizationId', orgId);
            setOrganizationName(orgData.organization_name || params.org_name);
            localStorage.setItem('org_name', orgData.organization_name || params.org_name);
          } else {
            router.push("/notfoundPage");
          }
        } else {
          console.error("❌ Failed to fetch organization:", response.status);
          router.push("/notfoundPage");
        }
      } catch (error) {
        console.error("❌ Error fetching organization:", error);
        router.push("/notfoundPage");
      } finally {
        setIsLoading(false);
      }
    };

    initOrgData();
  }, [organizationId, params.org_name, router, setOrganizationId]);

  // ✅ Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
              Welcome Back <span className="capitalize">{organizationName || params.org_name}</span>
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

// ✅ Helper to get cookie
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}