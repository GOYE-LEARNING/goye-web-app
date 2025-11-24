"use client";

import { BiLike } from "react-icons/bi";
import { CiClock2 } from "react-icons/ci";
import { FaPlus, FaRegCommentAlt } from "react-icons/fa";
import DashboardNewPost from "./dashboard_new_post";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
interface Props {
  openPost: () => void;
  courseId: string
}
export default function DashboardCourseForums({ openPost, courseId }: Props) {
  const [showPost, setShowPost] = useState<boolean>(false);
  return (
    <>
      <div className="dashboard_hr my-5"></div>
      <div className="dashboard_content_mainbox">
        <div className="flex justify-between">
          <h1 className="text-[#1F2130] font-bold text-[18px]">Course Form</h1>
          <span
            className="flex items-center gap-3 text-primaryColors-0 text-[13px] font-[600] cursor-pointer"
            onClick={() => setShowPost(true)}
          >
            {" "}
            <FaPlus /> New Post
          </span>
        </div>

        <div className="my-5">
          <div>
            <div className="flex gap-2 items-center my-5">
              <div className="bg-[#EFEFF1] h-[40px] w-[40px] rounded-full"></div>
              <div className="flex flex-col items-start">
                <h1 className="text-[#41415A] text-[14px] font-[600]">
                  Pst. Rhoda Rhodes
                </h1>
                <p className="flex items-center gap-2 text-[#71748C] text-[13px] font-[600]">
                  <CiClock2 /> 10 days ago
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-[14px] font-[600] text-[#1F2130]">
                Welcome to Foundations of Discipleship Forum!
              </h1>
              <p className="text-[#71748C] text-[14px]">
                Welcome everyone! This is where we can discuss course materials,
                ask questions, and support each other in our spiritual journey.
              </p>
              <p className="flex items-center gap-4 text-[#71748C] text-[14px]">
                <span className="flex items-center gap-1 ">
                  <BiLike /> 40
                </span>
                <span className="flex items-center gap-1 ">
                  <FaRegCommentAlt /> 90
                </span>
              </p>
            </div>
            <div className="dashboard_hr my-3"></div>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay and Animation */}

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 right-0 h-full bg-white w-[390px] transform transition-transform duration-300 ease-in-out
    ${showPost ? "translate-x-0" : "translate-x-full"}`}
      >
        <DashboardNewPost
          cancel={() => setShowPost(false)}
          openPosts={openPost}
          courseId={courseId}
        />
      </div>
    </>
  );
}
