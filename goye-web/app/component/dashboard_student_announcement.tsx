"use client";

import { MdOutlineCancel } from "react-icons/md";
import { PiSpeakerSimpleNoneFill } from "react-icons/pi";

export default function DashboardStudentAnnouncement() {
  return (
    <>
      <div className="bg-[#30A46F1A]/10 p-[16px]">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center">
            <PiSpeakerSimpleNoneFill color="#30A46F" />{" "}
            <h1 className="text-[12px]">Announcement</h1>
          </div>
          <span>
            <MdOutlineCancel size={19} />
          </span>
        </div>
        <div>
          <h1 className="font-[700] mt-3">Foundations of Discipleship</h1>
          <p className="text-[#41415A]">
            A vibrant community of young adults (18-30) growing together in
            faith through weekly Bible studies
          </p>
        </div>
      </div>
    </>
  );
}
