import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className=" scrollbar2 w-full min-h-screen overflow-y-auto flex justify-center items-center">
   {children}
  </div>;
}
