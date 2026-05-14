"use client";

import { SlBadge } from "react-icons/sl";

export default function DashboardGrowthAchievement() {
  return (
    <div className="my-5">
      <div className="bg-[#ffffff] flex justify-between items-start p-[16px]">
        <div className="flex items-start gap-5">
          <span className="h-[32px] w-[32px] flex justify-center items-center bg-[#2C7FFF0D]">
            <SlBadge color="#2C7FFF"/>
          </span>{" "}
          <div className="flex flex-col gap-1">
            <h1 className="font-[600] text-[14px] text-[#41415A]">First Prayer</h1>
            <h2 className="text-[#71748C] text-[12px]">Completed your first guilded prayer session</h2>
            <p className="text-[#30A46F] text-[12px] font-[600]">Earned Jan 15, 2025</p>
          </div>
        </div>
        <span className="w-[31px] h-[16px] flex justify-center items-center bg-[#30A46F] text-[#ffffff] rounded-[2px] text-[12px]">10+</span>
      </div>
    </div>
  );
}
