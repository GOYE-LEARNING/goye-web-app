// app/dashboard/[org_name]/admin/layout.tsx
"use client";

import DashboardHeader from "@/app/component/dashboard_header";
import OrgAdminSidenav from "./sidenav";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SocketProvider } from "@/app/context/SocketContext";
import { useAuthContext } from "@/app/context/AuthContext";
import { useOrganizationContext } from "@/app/component/organization_component/organanization_context";

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

// ✅ Helper to decode JWT
function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

export default function OrgAdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ org_name: string }>();
  const { authStatus } = useAuthContext();
  const { setOrganizationId, organizationId } = useOrganizationContext();
  const [userId, setUserId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [orgName, setOrgName] = useState<string>(params.org_name || '');

  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        console.log("🔍 Fetching organization data...");
        console.log("📌 Org name from URL:", params.org_name);

        // ✅ First, try to get from localStorage
        const storedOrgId = localStorage.getItem('organizationId');
        const storedOrgName = localStorage.getItem('org_name');
        const storedUserId = localStorage.getItem('userId');

        console.log("📦 Stored Org ID:", storedOrgId);
        console.log("📦 Stored Org Name:", storedOrgName);

        // ✅ If we have stored org ID, use it
        if (storedOrgId) {
          console.log("✅ Using stored organization ID:", storedOrgId);
          setOrganizationId(storedOrgId);
          if (storedUserId) setUserId(storedUserId);
          setIsReady(true);
          return;
        }

        // ✅ Try to get from authStatus
        if (authStatus?.user?.organizationId) {
          const orgId = authStatus.user.organizationId;
          console.log("✅ Using organization ID from authStatus:", orgId);
          setOrganizationId(orgId);
          localStorage.setItem('organizationId', orgId);
          
          if (authStatus.user.id) {
            setUserId(authStatus.user.id);
            localStorage.setItem('userId', authStatus.user.id);
          }
          
          setIsReady(true);
          return;
        }

        // ✅ Try to get from JWT token
        const accessToken = getCookie('accessToken');
        if (accessToken) {
          const decoded = decodeJWT(accessToken);
          console.log("🔓 Decoded JWT:", decoded);
          
          if (decoded?.organizationId) {
            const orgId = decoded.organizationId;
            console.log("✅ Using organization ID from JWT:", orgId);
            setOrganizationId(orgId);
            localStorage.setItem('organizationId', orgId);
            
            if (decoded.userId || decoded.id) {
              const uid = decoded.userId || decoded.id;
              setUserId(uid);
              localStorage.setItem('userId', uid);
            }
            
            setIsReady(true);
            return;
          }
        }

        // ✅ If all else fails, fetch from API using org name
        console.log("🔄 Fetching organization by name:", params.org_name);
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const token = getCookie('accessToken');
        
        if (!token) {
          console.error("❌ No access token found");
          setIsReady(true);
          return;
        }

        // Try to get org by name
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
          
          // Handle different response structures
          const orgData = data.data || data;
          const orgId = orgData.id || orgData.organizationId;
          
          if (orgId) {
            console.log("✅ Found organization ID:", orgId);
            setOrganizationId(orgId);
            localStorage.setItem('organizationId', orgId);
            localStorage.setItem('org_name', params.org_name);
            
            if (orgData.userId || orgData.user?.id) {
              const uid = orgData.userId || orgData.user?.id;
              setUserId(uid);
              localStorage.setItem('userId', uid);
            }
            
            setIsReady(true);
            return;
          }
        }

        // ✅ Last resort: try the profile endpoint
        console.log("🔄 Trying profile endpoint...");
        const profileRes = await fetch(`${API_URL}/api/organizations/profile`, {
          method: "GET",
          credentials: "include",
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          console.log("✅ Profile data:", profileData);
          
          const orgData = profileData.data || profileData;
          const org = orgData.organization || orgData;
          const orgId = org.id || orgData.organizationId;
          
          if (orgId) {
            console.log("✅ Found organization ID from profile:", orgId);
            setOrganizationId(orgId);
            localStorage.setItem('organizationId', orgId);
            localStorage.setItem('org_name', org.organization_name || params.org_name);
            setIsReady(true);
            return;
          }
        }

        console.error("❌ Could not find organization ID anywhere");
        setIsReady(true);

      } catch (error) {
        console.error("❌ Error fetching organization data:", error);
        setIsReady(true);
      }
    };

    fetchOrgData();
  }, [params.org_name, authStatus, setOrganizationId]);

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

  // ✅ Log the final state
  console.log("🎯 Final state - Organization ID:", organizationId);
  console.log("🎯 Final state - User ID:", userId);
  console.log("🎯 Final state - Org Name:", orgName);

  return (
    <SocketProvider
      userType="org_admin"
      userId={userId as any}
      organizationId={organizationId}
      autoConnect={!!organizationId && !!userId}
    >
      <div className="min-h-screen w-full md:bg-transparent">
        <OrgAdminSidenav setIsCollapsedState={setIsCollapsed} />

        <div className="w-full">
          <div
            className={`${isCollapsed ? "lg:w-[95%]" : "lg:w-[80%]"} org_width_animation w-full min-w-0 max-w-full min-h-screen md:absolute right-0 dark:bg-shadyColor-0 bg-lightWhite-0 radial_gradient2`}
          >
            <DashboardHeader />
            <div
              className={`w-full flex md:justify-center md:items-center flex-col md:px-0 md:py-0 md:rounded-none rounded-tr-xl rounded-tl-xl
           h-[90%] md:h-auto md:static absolute bottom-0 left-0 overflow-y-auto scrollbar2 pb-[3.5rem] md:px-0 px-[1.3rem] md:pb-0 md:mb-5`}
            >
              <div className="flex justify-center items-center w-full">
                <div className="md:max-w-[707px] relative w-full max-w-full min-w-0 mt-[1.3rem] flex justify-center items-center">
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