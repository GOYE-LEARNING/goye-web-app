"use client";

import DashboardHeader from "@/app/component/dashboard_header";
import AdminSidenav from "./sidenav";
import { usePathname } from "next/navigation";
import { SocketProvider } from "@/app/context/SocketContext";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = [
    "/dashboard/admin/course",
    "/dashboard/admin/community",
  ];

  const pathname = usePathname();
  const checkPath = path.some(p => pathname == p)
  // Content width now tracks the sidenav's collapsed state, matching the
  // student/tutor/super-admin layouts; this was hardcoded to md:w-[80%].
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SocketProvider>
      <div className="min-h-screen w-full md:bg-transparent bg-primaryColors-0 ">
        <AdminSidenav setIsCollapsedState={setIsCollapsed} />
        <div className={`${isCollapsed ? "lg:w-[95%]" : "lg:w-[80%]"} org_width_animation w-full min-w-0 max-w-full h-full md:absolute right-0`}>
          <DashboardHeader />
          <div
            className={`w-full flex md:justify-center md:items-center flex-col md:px-0 md:py-0 p-[clamp(12px,4vw,20px)] md:rounded-none rounded-tr-xl rounded-tl-xl md:bg-transparent ${
              checkPath ? "bg-shadyColor-0" : "bg-secondaryColors-0"
            } h-[90%] md:h-auto md:static absolute bottom-0 left-0 overflow-y-auto scrollbar2 pb-[3.5rem] md:pb-0 md:mb-5`}
          >
            <div className="md:max-w-[707px] w-full max-w-full min-w-0">{children}</div>
          </div>
        </div>
      </div>
    </SocketProvider>
  );
}
