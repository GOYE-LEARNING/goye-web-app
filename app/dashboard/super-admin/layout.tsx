"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/app/component/dashboard_header";
import SuperAdminSidenav from "./sidenav";
import Loader from "@/app/component/loader";
import { SocketProvider } from "@/app/context/SocketContext";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const verifyAccess = async () => {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_URL) {
        console.error("NEXT_PUBLIC_API_URL is not defined");
        setChecking(false);
        return;
      }

      try {
        // The overview endpoint itself enforces super_admin-only access —
        // reusing it here means there's a single source of truth for the
        // permission check instead of duplicating role logic client-side.
        const res = await fetch(`${API_URL}/api/super-admin/overview`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        if (res.ok && data.success) {
          setAuthorized(true);
        } else {
          router.replace("/unauthorized");
        }
      } catch (error) {
        console.error("Error verifying super admin access:", error);
        router.replace("/unauthorized");
      } finally {
        setChecking(false);
      }
    };

    verifyAccess();
  }, [router]);

  if (checking) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader
          height={40}
          width={40}
          border_width={4}
          full_border_color="transparent"
          small_border_color="#FFA500"
        />
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <SocketProvider>
      <div className="min-h-screen w-full md:bg-transparent bg-primaryColors-0">
        <SuperAdminSidenav setIsCollapsedState={setIsCollapsed} />
        <div
          className={`${isCollapsed ? "lg:w-[95%]" : "lg:w-[80%]"} org_width_animation w-full min-w-0 max-w-full h-full md:absolute right-0`}
        >
          <DashboardHeader />
          <div className="w-full flex md:justify-center md:items-center flex-col md:px-0 md:py-0 p-[clamp(12px,4vw,20px)] md:rounded-none rounded-tr-xl rounded-tl-xl md:bg-transparent bg-secondaryColors-0 h-[90%] md:h-auto md:static absolute bottom-0 left-0 overflow-y-auto scrollbar2 pb-[3.5rem] md:pb-0 md:mb-5">
            <div className="md:max-w-[707px] w-full max-w-full min-w-0"><br/> {children}</div>
          </div>
        </div>
      </div>
    </SocketProvider>
  );
}
