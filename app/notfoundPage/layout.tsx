'use client';
import React from "react";

export default function DashboardPageNotFoundLayout({children} : {children: React.ReactNode}) {
  return (
    <div className="w-full h-full fixed top-0 left-0 bg-white z-50 flex justify-center items-center flex-col">
      {children}
    </div>
  )
}