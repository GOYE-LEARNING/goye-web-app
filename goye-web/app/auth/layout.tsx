"use client";

import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex justify-center items-center flex-col">
        <div className="w-[928px] min-h-screen">{children}</div>
      </div>
    </>
  );
}
