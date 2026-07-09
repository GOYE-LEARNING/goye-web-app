// app/dashboard/invited/layout.tsx
"use client";

import DashboardHeader from "@/app/component/dashboard_header";
import OrgSidenav from "./sidenav";
import { useEffect, useState } from "react";
import { SocketProvider } from "@/app/context/SocketContext";
import { useAuthContext } from "@/app/context/AuthContext";
import ProgressProvider from "@/app/context/progressContext";
import QuizProvider from "@/app/context/quizContext";

export default function InvitedUserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authStatus } = useAuthContext();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const fetchInvitedUserData = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        
        // For invited user, use user profile endpoint
        console.log("📡 Fetching user profile for invited user...");
        const res = await fetch(`${API_URL}/api/organizations/profile`, {
          method: "GET",
          credentials: "include",
        });
        
        if (res.ok) {
          const data = await res.json();
          console.log("✅ Invited user profile fetched:", data);
          
          const uid = data.organization?.user?.id;
          // Get organization ID from memberships
          const orgId = data.user?.organizationMemberships?.[0]?.organizationId;
          
          if (uid) {
            setUserId(uid);
          }
          if (orgId) {
            setOrganizationId(orgId);
          }
          setIsReady(true);
        } else {
          console.error("❌ Failed to fetch user profile:", res.status);
          // Fallback to authStatus
          setUserId(authStatus?.user?.id || null);
          setOrganizationId(authStatus?.user?.organizationId || null);
          setIsReady(true);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUserId(authStatus?.user?.id || null);
        setOrganizationId(authStatus?.user?.organizationId || null);
        setIsReady(true);
      }
    };

    // Try to get from authStatus first
    const uidFromAuth = authStatus?.user?.id
    const orgFromAuth = authStatus?.user?.organizationId || 
                       authStatus?.user?.organizationMemberships?.[0]?.organizationId;
    
    if (uidFromAuth && orgFromAuth) {
      setUserId(uidFromAuth);
      setOrganizationId(orgFromAuth);
      setIsReady(true);
    } else if (uidFromAuth) {
      // We have user ID but need to fetch organization ID
      fetchInvitedUserData();
    } else {
      // No user data, try fetching from API
      fetchInvitedUserData();
    }
  }, [authStatus]);

  // Show loading if no userId
  if (!isReady) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Unable to load user data. Please try logging in again.</p>
        </div>
      </div>
    );
  }

  return (
    <SocketProvider
      userType="invited_user"
      userId={userId}
      organizationId={organizationId}
      autoConnect={!!userId && !!organizationId}
    >
      <ProgressProvider>
        <QuizProvider>
          <div className="min-h-screen w-full md:bg-transparent bg-primaryColors-0">
            <div className="">
              <OrgSidenav />
            </div>
            <div className="md:w-[80%] w-full min-w-0 max-w-full min-h-screen md:absolute right-0 dark:bg-shadyColor-0 bg-lightWhite-0 radial_gradient2">
              <DashboardHeader />
              <div
                className={`w-full flex md:justify-center md:items-center flex-col md:px-0 md:py-0 md:rounded-none rounded-tr-xl rounded-tl-xl
           h-[90%] md:h-auto md:static absolute bottom-0 left-0 overflow-y-auto scrollbar2 pb-[3.5rem] md:pb-0 md:mb-5`}
              >
                <div className="md:max-w-[707px] relative w-full max-w-full min-w-0">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </QuizProvider>
      </ProgressProvider>
    </SocketProvider>
  );
}