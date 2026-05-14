"use client";

import { FaAngleDoubleUp } from "react-icons/fa";
import { GoVideo } from "react-icons/go";

interface Props {
  level: string;
  video: string;
}
export default function DashboardCourseSubHeader({ level, video }: Props) {
  return (
    <>
      <div className="flex items-center gap-5 text-[#71748C]">
        <span className="flex items-center gap-3 ">
          <FaAngleDoubleUp />
          {level}
        </span>
        <span className="flex items-center gap-3">
          <GoVideo />
          {video}
        </span>
      </div>
    </>
  );
}
