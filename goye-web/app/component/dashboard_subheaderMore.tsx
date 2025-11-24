"use client";

import { useEffect, useRef, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { IoMdTrash } from "react-icons/io";
import { MdEdit, MdMoreVert } from "react-icons/md";

interface Props {
  backFunc: () => void;
  header: string;
  paragraph: React.ReactNode;
  deleteCourse: () => void; // already handles state update
}

export default function DashboardSubHeaderMore({
  backFunc,
  header,
  paragraph,
  deleteCourse
}: Props) {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const dropdownBox = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function removeDropdown(e: MouseEvent) {
      if (dropdownBox.current && !dropdownBox.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", removeDropdown);
    return () => document.removeEventListener("mousedown", removeDropdown);
  }, []);

  const iconEdit = () => setShowDropdown(true);

  const deleteCourseFunc = () => {
    deleteCourse(); // parent handles state & backend
  };

  return (
    <div>
      <button
        onClick={backFunc}
        className="h-[28px] w-[28px] bg-[#F5F5F5] text-[12px]"
      >
        <FaArrowLeft />
      </button>

      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-[24px] text-[#1F2130]">{header}</h1>
          <h2 className="text-textGrey-0">{paragraph}</h2>
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
              <span
                className="flex items-center gap-[12px] px-[16px] py-[8px] text-[#DA0E29] cursor-pointer"
                onClick={deleteCourseFunc}
              >
                <IoMdTrash /> Delete
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
