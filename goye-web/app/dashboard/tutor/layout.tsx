"use client";

import DashboardHeader from "@/app/component/dashboard_header";
import TutorSidenav from "./sidenav";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = [
    "/dashboard/tutor/course",
    "/dashboard/tutor/community",
  ];

  const pathname = usePathname();
  const checkPath = path.some(p => pathname == p)

  return (
    <>
      <div className="min-h-screen w-full md:bg-transparent bg-primaryColors-0 ">
        <div className="">
          <TutorSidenav />
        </div>
        <div className="md:w-[80%] w-full h-full md:absolute right-0">
          <DashboardHeader />
          <div
            className={`w-full flex md:justify-center md:items-center flex-col md:px-0 md:py-0 p-[20px] md:rounded-none rounded-tr-xl rounded-tl-xl md:bg-transparent ${
              checkPath ? "bg-white" : "bg-[#FAFAFA]"
            } h-[90%] md:h-auto md:static absolute bottom-0 left-0 overflow-y-auto scrollbar2 mb-0 md:mb-5`}
          >
            <div className=" md:w-[707px] w-full">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}
