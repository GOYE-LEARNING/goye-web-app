"use client";

import React from "react";
import { SignupProvider } from "../context/SignupContext";
import AuthProvider from "../context/AuthContext";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SignupProvider>
        <div className="flex md:justify-center md:items-center flex-col ">
          <div className="md:w-[928px] w-full overflow-hidden radial_gradient2 h-full">
            {children}
          </div>
        </div>
      </SignupProvider>
    </AuthProvider>
  );
}
