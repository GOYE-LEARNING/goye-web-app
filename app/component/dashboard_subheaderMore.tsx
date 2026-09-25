"use client";

import { useEffect, useRef, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { IoMdTrash } from "react-icons/io";
import { MdEdit, MdMoreVert } from "react-icons/md";
import { useI18n } from "@/app/context/I18nContext";

interface Props {
  backFunc: () => void;
  header: string;
  paragraph: React.ReactNode;
  editCourse?: () => void
  deleteCourse: () => void; // already handles state update
}

export default function DashboardSubHeaderMore({
  backFunc,
  header,
  paragraph,
  editCourse,
  deleteCourse
}: Props) {
  const { t } = useI18n();
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
    <div className="my-3">
      <button
        onClick={backFunc}
        className="h-[28px] w-[28px] rounded-full dark:bg-shadyColor-0 bg-white flex justify-center items-center text-[12px] dark:text-white text-primaryColors-0"
      >
        <FaArrowLeft />
      </button>

      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-[24px] dark:text-textSlightDark-0 text-primaryColors-0">{header}</h1>
          <h2 className="text-textGrey-0">{paragraph}</h2>
        </div>

        <div className="relative z-10">
          <button onClick={iconEdit} className="dark:text-white text-lightBoldText-0 text-[16px]">
            <MdMoreVert />
          </button>

          {showDropdown && (
            <div
              ref={dropdownBox}
              className="bg-white dark:bg-secondaryColors-0 drop-shadow-2xl w-[152px] text-[14px] absolute right-0 z-50"
            >
              <span className="flex items-center gap-[12px] px-[16px] py-[8px]" onClick={editCourse}>
                <MdEdit /> {t("Edit")}
              </span>
              <div className="dashboard_hr"></div>
              <span
                className="flex items-center gap-[12px] px-[16px] py-[8px] text-[#DA0E29] cursor-pointer"
                onClick={deleteCourseFunc}
              >
                <IoMdTrash /> {t("Delete")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
