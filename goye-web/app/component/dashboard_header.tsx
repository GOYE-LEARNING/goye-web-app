"use client";

import { useEffect, useRef, useState } from "react";
import { IoChevronDown } from "react-icons/io5";
import { MdNotifications } from "react-icons/md";
import DashboardNotification from "./dashboard_notification";

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
      <div className="flex justify-end items-center px-8 py-2 gap-5 bg-secondaryColors-0">
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
    </>
  );
}
