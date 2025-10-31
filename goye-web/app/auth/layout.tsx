"use client";

import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex md:justify-center md:items-center flex-col">
        <div className="md:w-[928px] w-full min-h-screen">{children}</div>
      </div>
    </>
  );
}
