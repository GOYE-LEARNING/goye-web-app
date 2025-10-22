"use client";

import Image from "next/image";
import pic from "@/public/images/overview.png";
import { CiBookmark } from "react-icons/ci";
import { useState } from "react";
import { IoBookmark } from "react-icons/io5";
import { LuUser } from "react-icons/lu";
import { FaAngleDoubleUp } from "react-icons/fa";
export default function DashboardCourseAll() {
  const [fill, setFill] = useState<boolean>(false);
  return (
    <>
      <div className="bg-[#ffffff] drop-shadow-sm w-full p-[24px] my-5 flex flex-col gap-2">
        <div className="flex justify-start w-full gap-3">
          <div className="relative">
            <Image src={pic} alt="pic" className="h-[89.16px] w-[130px]" />
            <span
              className="absolute top-1 right-1"
              onClick={() => setFill(!fill)}
            >
              {fill == false ? (
                <CiBookmark color="#B1B1B6" size={23} />
              ) : (
                <IoBookmark color="#ffffff" size={23} />
              )}
            </span>
          </div>
          <div className="w-full flex flex-col  gap-2">
            <div className="flex justify-between items-center w-full">
              <h1 className="text-[14px] font-[700] text-[#41415A]">Foundation of Discipleship</h1>
              <span className="text-[10px] text-[#41415A] bg-[#F1F1F4] px-[4px]">Enrolled</span>
            </div>
            <p className="text-[#71748C] text-[13px] font-[600]">
              Discover what it means to truly follow Jesus in your daily life.
              This foundational course helps you build strong spiritual habits,
              understand key biblical principles, and live as a disciple in your
              community.
            </p>
            <p className="flex items-center gap-6">
              <span className="flex items-center gap-3 text-[#71748C] text-[13px]">
                <LuUser /> Pst. Rhonda Rhodes
              </span>
              <span className="flex items-center gap-3 text-[#30A46F] text-[13px]">
                <FaAngleDoubleUp />
                Begineer
              </span>
            </p>
          </div>
        </div>
        <button className="h-[36px] text-[14px] bg-primaryColors-0 text-[#ffffff] my-3">Continue Course</button>
        <div className="h-[1px] w-full bg-[#EFEFF2]"></div>
      </div>
    </>
  );
}
