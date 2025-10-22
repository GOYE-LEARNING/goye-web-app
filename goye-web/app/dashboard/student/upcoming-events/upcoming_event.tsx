"use client";

import SubHeader from "@/app/component/dashboard_subheader";
import React from "react";
import { CiCalendar } from "react-icons/ci";
import { FaExternalLinkAlt } from "react-icons/fa";
import { GoVideo } from "react-icons/go";

interface event {
  header: string;
  action: string;
  paragraph: string;
  date: string;
  time: string;
  tutor: React.ReactElement;
  tutorParagraph: string;
}

interface Props {
  backFunc: () => void
}

export default function UpcomingEvents({backFunc} : Props) {
  const backFunction = () => {
    backFunc()
  };
  const event: event[] = [
    {
      header: "Introduction to Discipleship",
      action: "session",
      paragraph:
        "Deep dive into James Chapter 2: Faith in Action. Come prepared with your Bible and notebook!",
      date: "Sat, Aug 30",
      time: "7:00 - 8:30 PM",
      tutor: <div></div>,
      tutorParagraph: "Pst. Rhonda Rhodes",
    },
  ];
  return (
    <>
      <div>
        <SubHeader header="Upcoming Events" backFunction={backFunction} />
        <div className="bg-[#ffffff] drop-shadow-sm w-full p-[24px] my-5 flex flex-col gap-2">
          {event.map((data, i) => (
            <div key={i} className="w-full flex flex-col gap-1">
              <div className="w-full flex items-center justify-between">
                <h1 className="text-[14px] font-[600] text-[#1F2130]">
                  {data.header}
                </h1>
                <span className="bg-[#FF6B30] text-[#ffffff] px-[4px] text-[12px] rounded-[2px]">
                  {data.action}
                </span>
              </div>
              <p className="text-[14px] text-[#71748C] font-[400]">
                Deep dive into James Chapter 2: Faith in Action. Come prepared
                with your Bible and notebook!
              </p>
              <div className="flex gap-3 items-center text-[14px] font-[400] text-[#71748C] my-2">
                <span className="flex items-center gap-1">
                  <CiCalendar className="mb-1" /> {data.date}
                </span>
                <span className="flex items-center gap-1">
                  <GoVideo className="mb-1" /> {data.time}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-[35px] w-[35px] bg-secondaryColors-0 rounded-full">
                  {data.tutor}
                </span>
                <p className="text-[#71748C] text-[14px] font-[400]">
                  {data.tutorParagraph}
                </p>
              </div>
              <button className="h-[40px] bg-[#EBE5E7] text-primaryColors-0 my-3 flex items-center justify-center gap-2 text-[13px] font-[600]">
                <p className="mt-1">Event Link </p>
                <FaExternalLinkAlt />
              </button>

              <div className="h-[1px] w-full bg-[#EFEFF2]"></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
