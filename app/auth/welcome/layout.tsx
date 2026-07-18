"use client";

import AuthWelcomeHeader from "@/app/component/auth_welcome_header";
import { useLanguage } from "@/app/context/LanguageContext";
import React from "react";

export default function WelcomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { openLanguageSelector } = useLanguage();

  return (
    <>
      <div className="flex justify-center items-center flex-col">
        <div className="md:w-[928px] w-[450px] min-h-screen py-[20px]">
          {" "}
          <AuthWelcomeHeader openLanguage={openLanguageSelector} hasLanguage={false} />
          {children}
        </div>
      </div>
    </>
  );
}
