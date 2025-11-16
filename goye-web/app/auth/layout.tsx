"use client";

import React from "react";
import { SignupProvider } from "./SignupContext";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SignupProvider>
      <div className="flex md:justify-center md:items-center flex-col">
        <div className="md:w-[928px] w-full min-h-screen md:py-8">
          {children}
        </div>
      </div>
    </SignupProvider> 
  );
}
