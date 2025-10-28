"use client";

import DashboardHeader from "@/app/component/dashboard_header";
import TutorSidenav from "./sidenav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="min-h-screen w-full">
        <div className="">
          <TutorSidenav />
        </div>
        <div className="w-[80%] h-full absolute right-0">
          <DashboardHeader />
          <div className="flex justify-center items-center flex-col">
            <div className=" w-[707px] ">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
