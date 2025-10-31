"use client";

import { FaRegFileAlt } from "react-icons/fa";
import { GoDownload } from "react-icons/go";
import { HiOutlineBookOpen } from "react-icons/hi";

export default function DashboardTutorTabMaterial() {
  return (
    <div>
      <div className="dashboard_content_mainbox">
        <h1 className="text-[#1F2130] text-[18px] font-bold">All Materials</h1>
        <div className="flex flex-col gap-2 my-5">
          <h1 className="text-[16px] text-[#1F2130] font-[600]">
            Discipleship Foundation Guide
          </h1>
          <p className="text-[#71748C] text-[14px]">
            Comprehensive guide covering the basics of Christian discipleship
            and spiritual growth
          </p>
          <p className="flex gap-4 text-[#71748C] text-[14px]">
            <span className="flex items-center gap-2">
              <FaRegFileAlt />
              3.1 MB{" "}
            </span>
            <span className="flex items-center gap-2">
              <HiOutlineBookOpen /> 12 pages
            </span>
          </p>
          <button className="form_more bg-white text-primaryColors-0 border border-[#D9D9D9] font-semibold flex justify-center items-center">
            <GoDownload /> Download
          </button>
          <div className="dashboard_hr my-5"></div>
        </div>
      </div>
    </div>
  );
}
