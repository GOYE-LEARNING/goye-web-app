"use client";

import { RiGroupLine } from "react-icons/ri";
import SubHeader from "./dashboard_subheader";
import { FaExternalLinkAlt } from "react-icons/fa";
import Image from "next/image";
import picInfo from "@/public/images/overview.png";
import { CiCalendar, CiLock } from "react-icons/ci";
import { GoVideo } from "react-icons/go";
import { useEffect, useRef, useState } from "react";
import { MdEdit, MdLogout, MdMoreVert } from "react-icons/md";
import { IoMdTrash } from "react-icons/io";
import DashboardTutorCreateEvent from "./dashboard_tutor_create_events";
interface Props {
  backToMainPage: () => void;
}
export default function TutorCommunityGroup({ backToMainPage }: Props) {
  const [createEvent, setCreateEvent] = useState<boolean>(false);
  const backFunc = () => {
    backToMainPage();
  };
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const dropdownBox = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function removeDropdown(e: MouseEvent) {
      if (
        dropdownBox.current &&
        !dropdownBox.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", removeDropdown);
    return () => document.removeEventListener("mousedown", removeDropdown);
  }, []);
  const iconEdit = () => {
    setShowDropdown(true);
  };
  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <SubHeader header="Young Adult Fellowship" backFunction={backFunc} />
          <p className="flex items-center gap-5 text-[#71748C] text-[14px]">
            <span className="flex items-center gap-2">
              <RiGroupLine />
              289 members
            </span>
            <span className="flex items-center gap-2">
              <CiCalendar />5 hours ago
            </span>
          </p>
          <div className="flex items-center gap-3 my-3">
            <span className="h-[35px] w-[35px] bg-plainColors-0 rounded-full"></span>
            <p className="text-[#71748C] text-[14px] font-[400]">
              Imayi Osifo Sean
            </p>
          </div>
        </div>
        <div className="relative">
          <button onClick={iconEdit} className="text-[#41415A] text-[16px]">
            <MdMoreVert />
          </button>
          {showDropdown && (
            <div
              ref={dropdownBox}
              className="bg-white drop-shadow-2xl w-[152px] text-[14px] absolute right-0"
            >
              <span className="flex items-center gap-[12px] px-[16px] py-[8px]">
                <MdEdit /> Edit
              </span>
              <div className="dashboard_hr"></div>
              <span className="flex items-center gap-[12px] px-[16px] py-[8px] text-[#DA0E29]">
                <IoMdTrash /> Delete
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="bg-[#ffffff] p-[24px] drop-shadow-sm">
        <div className="w-full h-[220px] relative ">
          <Image
            src={picInfo}
            alt="pic_info"
            className="h-full w-full object-cover"
          />
        </div>
        <p className="text-[14px] text-[#71748C] font-[400] my-4">
          A vibrant community of young adults (18-30) growing together in faith
          through weekly Bible studies, prayer, fellowship, and community
          service. We meet every Sunday at 6 PM for worship and discussion.
        </p>

        <button
          className="h-[40px] w-full text-[#ffffff] bg-primaryColors-0 flex items-center justify-center gap-2"
          onClick={() => setCreateEvent(true)}
        >
          + Create Event
        </button>

        <section className="grid grid-cols-3 my-5 bg-[#FAF8F8] p-[16px]">
          <div className="flex justify-center items-center flex-col">
            <span className="text-[#1F2130] text-[18px] font-bold">44</span>
            <p className="text-[#71748C] text-[14px] font-[400]">
              Posts the Week
            </p>
          </div>
          <div className="flex justify-center items-center flex-col">
            <span className="text-[#1F2130] text-[18px] font-bold">54</span>
            <p className="text-[#71748C] text-[14px] font-[400]">Members</p>
          </div>
          <div className="flex justify-center items-center flex-col">
            <span className="text-[#1F2130] text-[18px] font-bold">4</span>
            <p className="text-[#71748C] text-[14px] font-[400]">
              Upccoming Events
            </p>
          </div>
        </section>
      </div>
      <div className="w-full flex flex-col gap-1 my-5 dashboard_content_mainbox">
        <h1 className="text-textSlightDark-0 font-bold text-[16px]">
          Upcoming Events
        </h1>
        <div className="w-full flex items-center justify-between">
          <h1 className="text-[14px] font-[600] text-[#1F2130]">
            Weekly Bible Study
          </h1>
          <span className="bg-[#FF6B30] text-[#ffffff] px-[4px] text-[12px] rounded-[2px]">
            Meeting
          </span>
        </div>
        <p className="text-[14px] text-[#71748C] font-[400]">
          Deep dive into James Chapter 2: Faith in Action. Come prepared with
          your Bible and notebook!
        </p>
        <div className="flex gap-3 items-center text-[14px] font-[400] text-[#71748C] my-2">
          <span className="flex items-center gap-1">
            <CiCalendar className="mb-1" /> Sat, Aug 30
          </span>
          <span className="flex items-center gap-1">
            <GoVideo className="mb-1" /> 7:00 - 8:80PM
          </span>
        </div>

        <div className="w-full flex justify-between items-center gap-3">
          <button className="h-[40px] bg-[#EBE5E7] text-primaryColors-0 my-3 flex items-center justify-center gap-2 text-[13px] font-[600] w-full">
            <p className="mt-1">Event Link </p>
            <FaExternalLinkAlt />
          </button>
          <button className="h-[40px] w-[40px] bg-[#ffffff] border border-[#D9D9D9] flex justify-center items-center">
            <MdMoreVert color="#41415A" />
          </button>
        </div>

        <div className="h-[1px] w-full bg-[#EFEFF2]"></div>
      </div>

      {/* Sidebar Overlay and Animation */}

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 right-0 h-full bg-white w-[390px] transform transition-transform duration-300 ease-in-out
          ${createEvent ? "translate-x-0" : "translate-x-full"}`}
      >
        <DashboardTutorCreateEvent cancel={() => setCreateEvent(false)} />
      </div>
    </>
  );
}
