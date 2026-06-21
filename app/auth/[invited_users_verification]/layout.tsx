import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="background fixed top-0 left-0 w-full min-h-screen overflow-y-auto flex justify-center items-center">
   {children}
  </div>;
}
