"use client";

import React from "react";
import { MdCopyright } from "react-icons/md";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex justify-center items-center flex-col">
        <div className="w-[928px] min-h-screen">{children}</div>
            <div className="flex justify-center items-center ">
                <span className="flex gap-2 items-center text-[#7174bc] absolute bottom-[calc(1000px-985.51px)]">
                  <MdCopyright size={18} />
                  GOYE,2025
                </span>
              </div>
      </div>
    </>
  );
}
