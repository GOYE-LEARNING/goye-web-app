"use client";

import { BiLike } from "react-icons/bi";
import SubHeader from "./dashboard_subheader";
import { FaRegCommentAlt, FaReply } from "react-icons/fa";
import { CiClock2 } from "react-icons/ci";
import { MdDelete, MdMoreVert } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import DashboardNewReply from "./dashboard_reply";
interface Props {
  backToForum: () => void;
}
export default function DashboardPostView({ backToForum }: Props) {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showReply, setShowReply] = useState<boolean>(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <>
      <div>
        <SubHeader header="Post" backFunction={backToForum} />
        <div className="dashboard_content_mainbox">
          <div>
            <div className="flex justify-between items-center">
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
              <div className="relative">
                <span
                  className="h-[32px] w-[32px] bg-[#F9F9FB] flex justify-center items-center"
                  onClick={() => setShowDropdown(true)}
                >
                  <MdMoreVert />
                </span>
                {showDropdown && (
                  <div
                    ref={boxRef}
                    className="absolute right-0 my-2 bg-white drop-shadow-2xl h-[44px] w-[102px] flex justify-center items-center"
                  >
                    <span className="flex justify-center items-center gap-1 text-[#DA0E29] font-[500] text-[14px]">
                      <MdDelete /> Delete
                    </span>
                  </div>
                )}
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
              <p className="flex items-center gap-4  text-[14px]">
                <span className="flex items-center gap-1 text-[#71748C]">
                  <BiLike /> 40
                </span>
                <span className="flex items-center gap-1 text-primaryColors-0" onClick={() => setShowReply(true)}>
                  <FaReply /> Reply
                </span>
              </p>
            </div>
            <div className="dashboard_thick_hr my-3"></div>
          </div>
        </div>
      </div>
      <div
        className={`fixed top-0 right-0 h-full bg-white w-[390px] transform transition-transform duration-300 ease-in-out
          ${showReply ? "translate-x-0" : "translate-x-full"}`}
      >
        <DashboardNewReply cancel={() => setShowReply(false)} />
      </div>
    </>
  );
}
