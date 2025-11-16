"use client";

import AuthWelcomeHeader from "@/app/component/auth_welcome_header";
import React from "react";

export default function WelcomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex justify-center items-center flex-col">
        <div className="md:w-[928px] w-[450px] min-h-screen">
          {" "}
          <AuthWelcomeHeader />
          {children}
        </div>
      </div>
    </>
  );
}
