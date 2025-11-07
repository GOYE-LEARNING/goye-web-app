"use client";

import { useEffect, useRef, useState } from "react";
import { IoChevronDown } from "react-icons/io5";
import { MdNotifications } from "react-icons/md";
import DashboardNotification from "./dashboard_notification";
import pic from "@/public/images/pic2.png";
import Image from "next/image";
import { FaBell } from "react-icons/fa";
export default function DashboardHeader() {
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setShowNotification(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <>
      <div className=" md:px-8 md:py-2 md:bg-secondaryColors-0 py-[25px] px-[16px] md:h-auto bg-primaryColors-0 md:static absolute top-0 left-0 h-[10%] w-full flex md:block justify-between md:justify-end items-center">
        <div className="md:flex justify-end items-center gap-5 hidden">
          <div className="text-[#71748C]/20 relative">
            <div onClick={() => setShowNotification(!showNotification)}>
              <MdNotifications color="" size={23} />
            </div>
            {showNotification && (
              <div ref={boxRef}>
                <DashboardNotification />
              </div>
            )}
          </div>
          <div className="h-[40px] w-[1px] bg-[#71748C]/10"></div>
          <div className="h-[45px] w-[45px] bg-[#71748C]/10 rounded-full"></div>
          <IoChevronDown />
        </div>
        <div className="md:hidden flex items-center justify-between text-white w-full">
          <div className="flex items-center gap-4">
            <span className="w-[50px] h-[50px] rounded-full border-2 border-white overflow-hidden">
              <Image src={pic} alt="pic" className="object-cover w-full h-full"/>
            </span>
            <div className="flex flex-col gap-1">
              <h1 className="text-[12px]">Good Evening</h1>
              <p className="font-semibold text-[22px]">Pst Rhoda</p>
            </div>
          </div>
          <div>
            <FaBell />
          </div>
        </div>
      </div>
    </>
  );
}
