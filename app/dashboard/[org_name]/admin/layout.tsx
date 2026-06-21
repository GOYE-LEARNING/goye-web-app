
"use client";

import DashboardHeader from "@/app/component/dashboard_header";
import OrgAdminSidenav from "./sidenav";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function OrganizationDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const pathname = usePathname();

  return (
    <div className="min-h-screen w-full md:bg-transparent">
      <div className="">
        <OrgAdminSidenav />
      </div>
      <div className="md:w-[80%] w-full min-w-0 max-w-full min-h-screen md:absolute right-0 dark:bg-shadyColor-0 bg-lightWhite-0 radial_gradient2">
        <DashboardHeader />
        <div
          className={`w-full flex md:justify-center md:items-center flex-col md:px-0 md:py-0 md:rounded-none rounded-tr-xl rounded-tl-xl
           h-[90%] md:h-auto md:static absolute bottom-0 left-0 overflow-y-auto scrollbar2 pb-[3.5rem] md:pb-0 md:mb-5`}>
          <div className="md:max-w-[707px] relative w-full max-w-full min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
