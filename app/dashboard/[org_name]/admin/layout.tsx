// app/dashboard/[org_name]/admin/layout.tsx
"use client";

import DashboardHeader from "@/app/component/dashboard_header";
import OrgAdminSidenav from "./sidenav";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SocketProvider } from "@/app/context/SocketContext";
import { useAuthContext } from "@/app/context/AuthContext";

export default function OrgAdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ org_name: string }>();
  const { authStatus } = useAuthContext();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isCollapsed, setICollapsed] = useState<boolean>(false);
  useEffect(() => {
    console.log("Sidenav is collapsing", isCollapsed);

    const fetchOrgAdminData = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;

        // For org admin, use organization profile endpoint
        console.log("📡 Fetching organization profile for admin...");
        const res = await fetch(`${API_URL}/api/organizations/profile`, {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          console.log("✅ Org Admin profile fetched:", data);

          const orgId = data.organization?.id;
          const uid = data.organization?.user?.id || authStatus?.user?.id;

          if (orgId) {
            setOrganizationId(orgId);
          }
          if (uid) {
            setUserId(uid);
          }
          setIsReady(true);
        } else {
          console.error("❌ Failed to fetch organization profile:", res.status);
          // Fallback to params and authStatus
          setOrganizationId(params.org_name);
          setUserId(authStatus?.user?.id || null);
          setIsReady(true);
        }
      } catch (error) {
        console.error("Error fetching organization profile:", error);
        setOrganizationId(params.org_name);
        setUserId(authStatus?.user?.id || null);
        setIsReady(true);
      }
    };

    // Try to get from authStatus first
    const orgFromAuth = authStatus?.user?.organizationId;
    const uidFromAuth = authStatus?.user?.id;

    if (orgFromAuth && uidFromAuth) {
      setOrganizationId(orgFromAuth);
      setUserId(uidFromAuth);
      setIsReady(true);
    } else {
      fetchOrgAdminData();
    }
  }, [params.org_name, authStatus, isCollapsed]);

  // Show loading while fetching data
  if (!isReady) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading organization data...</p>
        </div>
      </div>
    );
  }

  return (
    <SocketProvider
      userType="org_admin"
      userId={userId as any}
      organizationId={organizationId}
      autoConnect={!!organizationId && !!userId}
    >
      <div className="min-h-screen w-full md:bg-transparent">
        <OrgAdminSidenav setIsCollapsedState={setICollapsed} />

        <div className="w-full">
          <div
            className={`${isCollapsed ? "lg:w-[95%]" : "lg:w-[80%]"} org_width_animation w-full min-w-0 max-w-full min-h-screen md:absolute right-0 dark:bg-shadyColor-0 bg-lightWhite-0 radial_gradient2`}
          >
            <DashboardHeader />
            <div
              className={`w-full flex md:justify-center md:items-center flex-col md:px-0 md:py-0 md:rounded-none rounded-tr-xl rounded-tl-xl
           h-[90%] md:h-auto md:static absolute bottom-0 left-0 overflow-y-auto scrollbar2 pb-[3.5rem] md:px-0 px-[1.3rem] md:pb-0 md:mb-5`}
            >
                <div className=" flex justify-center items-center w-full">
                  <div className="md:max-w-[707px] relative w-full  max-w-full min-w-0 mt-[1.3rem] flex justify-center items-center ">
                    {children}
                  </div>
              </div>
            </div>
          </div>
         
        </div>
      </div>
    </SocketProvider>
  );
}
