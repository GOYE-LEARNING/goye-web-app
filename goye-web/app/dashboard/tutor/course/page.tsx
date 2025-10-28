"use client";

import DashboardSearch from "@/app/component/dashboard_search";
import Image from "next/image";
import { CiBookmark } from "react-icons/ci";
import { FaAngleDoubleUp } from "react-icons/fa";
import { IoBookmark } from "react-icons/io5";
import { LuUser } from "react-icons/lu";
import { MdAdd } from "react-icons/md";
import pic from "@/public/images/overview.png";
import { useState } from "react";
import DashboardTutorCreateCourse from "@/app/component/dashboard_tutor_create-course";

export default function TutorCourse() {
  const [fill, setFill] = useState<boolean>(false);
  const [showCourse, setShowCourse] = useState<boolean>(true);
  const [showCreateCourse, setShowCreateCourse] = useState<boolean>(false);

  const showCourseFunc = () => {
    setShowCreateCourse(false);
    setShowCourse(true);
  };

  const showCreateCourseFunc = () => {
    setShowCourse(false);
    setShowCreateCourse(true);
  };

  return (
    <>
      {showCourse && (
        <div>
          <h1 className="dashboard_h1">Course</h1>
          <div className="flex justify-between items-center gap-4">
            <div className="w-[78%]">
              <DashboardSearch placeholder="Search courses..." />
            </div>
            <button
              className="flex items-center justify-center gap-2 border border-[#D9D9D9] bg-white h-[36px] w-[131px] text-primaryColors-0"
              onClick={showCreateCourseFunc}
            >
              <MdAdd /> New course
            </button>
          </div>

          <div className="dashboard_content_mainbox">
            <div className="flex justify-start items-start w-full gap-3">
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
                  <h1 className="text-[14px] font-[700] text-[#41415A]">
                    Foundation of Discipleship
                  </h1>
                  <span className="text-[10px] text-[#41415A] bg-[#F1F1F4] px-[4px]">
                    Enrolled
                  </span>
                </div>
                <p className="text-[#71748C] text-[13px] font-[600]">
                  Discover what it means to truly follow Jesus in your daily
                  life. This foundational course helps you build strong
                  spiritual habits, understand key biblical principles, and live
                  as a disciple in your community.
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
            <button className="h-[36px] text-[14px] bg-shadyColor-0 text-primaryColors-0 my-3 w-full">
              View Course
            </button>
            <div className="h-[1px] w-full bg-[#EFEFF2]"></div>
          </div>
        </div>
      )}
      {showCreateCourse && (
        <DashboardTutorCreateCourse backToCourse={showCourseFunc}/>
      )}
    </>
  );
}
