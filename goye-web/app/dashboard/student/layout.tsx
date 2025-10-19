"use client";

import Sidenav from "./sidenav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="min-h-screen w-full">
        <div className=""><Sidenav /></div>
        <div className="w-[80%] h-full absolute right-0">{children}</div>
      </div>
    </>
  );
}
