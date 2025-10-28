"use client";

import { FaCrown } from "react-icons/fa";

export default function DashboardTutorOverview() {
  return (
    <>
      <div className="cr_box">
        <h1 className="text-textSlightDark-0 text-[14px] font-[600]">
          Overview
        </h1>
        <div className="bg-shadyColor-0 p-[16px] mt-[20px] flex flex-col gap-1">
          <span className="flex items-center gap-1">
            <FaCrown className="text-primaryYellow-0"/> <h1 className="text-[13px] text-textSlightDark-0">Top Performing Course</h1>
          </span>

          <h1 className="font-bold text-[15px] text-textSlightDark-0">Empowering Children to Lead</h1>
          <p className="text-textGrey-0 text-[14px]">
            This introduces the meaning of discipleship, exploring its biblical
            foundation and the call to follow Jesus.
          </p>
          <div className="dashboard_hr my-3"></div>
          <div className="flex justify-around items-center w-full my-2">
            <div className="flex flex-col gap-1 items-center text-textSlightDark-0">
              <h1 className="font-[700]  text-[18px]">101</h1>
              <p className="text-textGrey-0 text-[13px]">Total Student</p>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <h1 className="font-[700]  text-[18px]">6</h1>
              <p className="text-textGrey-0 text-[13px]">Published Courses</p>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <h1 className="font-[700]  text-[18px]">65%</h1>
              <p className="text-textGrey-0 tedxt-[13px]">Avg Completion</p>
            </div>
          </div>
          <button className="form_more bg-boldShadyColor-0 text-primaryColors-0 font-semibold text-[14px]">View Course</button>
        </div>
      </div>
    </>
  );
}
