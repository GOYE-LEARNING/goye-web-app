"use client";

import DashboardStudentHeader from "@/app/component/dashboard_student_header";
import Sidenav from "./sidenav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="min-h-screen w-full">
        <div className="">
          <Sidenav />
        </div>
        <div className="w-[80%] h-full absolute right-0">
          <DashboardStudentHeader />
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
