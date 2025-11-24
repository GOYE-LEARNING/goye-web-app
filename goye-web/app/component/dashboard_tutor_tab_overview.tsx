"use client";

import { CiClock1 } from "react-icons/ci";
import { HiOutlineBookOpen } from "react-icons/hi";
import { IoMdGlobe } from "react-icons/io";
import { MdOutlineQuiz, MdPeople } from "react-icons/md";
interface Props {
  createQuiz: () => void;
  createModule: () => void;
  course_description: string;
}
export default function DashboardTutorTabOverview({
  createQuiz,
  createModule,
  course_description,
}: Props) {
  return (
    <div>
      <div className="dashboard_content_mainbox">
        <p className="text-[14px] text-textGrey-0">{course_description}</p>

        <div className="flex items-center gap-5 text-textGrey-0 my-3">
          <span className="flex items-center gap-2 text-[14px]">
            <IoMdGlobe />
            <span>English</span>
          </span>
          <span className="flex items-center gap-2 text-[14px]">
            <MdPeople />
            <span>124 Student</span>
          </span>
        </div>

        <div className="bg-[#FAF8F8] p-[16px]">
          <h1 className="font-semibold text-[14px] text-textSlightDark-0">
            Quick Action
          </h1>
          <div className="grid grid-cols-2 gap-[10px] my-4">
            <div
              className="h-[72px] bg-white flex justify-center items-center flex-col gap-1 cursor-pointer"
              onClick={createModule}
            >
              <HiOutlineBookOpen color="#71748C" />
              <span className="text-textSlightDark-0 font-semibold text-[12px]">
                Add Module
              </span>
            </div>
            <div
              className="h-[72px] bg-white flex justify-center items-center flex-col gap-1 cursor-pointer"
              onClick={createQuiz}
            >
              <MdOutlineQuiz color="#71748C" />
              <span className="text-textSlightDark-0 font-semibold text-[12px]">
                Create Quiz
              </span>
            </div>
          </div>
          <div className="dashboard_hr"></div>
          <div className="grid grid-cols-3 justify-around bg-white my-4 p-[12px]">
            <div className="flex justify-center items-center flex-col gap-1">
              <span className="text-textSlightDark-0 font-bold text-[18px]">
                24
              </span>
              <p className="text-textGrey-0 text-[12px]">Enrolled</p>
            </div>
            <div className="flex justify-center items-center flex-col gap-1">
              <span className="text-textSlightDark-0 font-bold text-[18px]">
                12
              </span>
              <p className="text-textGrey-0 text-[12px]">Discussion</p>
            </div>
            <div className="flex justify-center items-center flex-col gap-1">
              <span className="text-textSlightDark-0 font-bold text-[18px]">
                65%
              </span>
              <p className="text-textGrey-0 text-[12px]">Avg. Completion</p>
            </div>
          </div>
          <button className="h-[36px] bg-boldShadyColor-0 text-primaryColors-0 w-full text-[12px]">
            View Content
          </button>
        </div>
        <button className="bg-primaryColors-0 text-white text-[14px] w-full h-[48px] my-5">
          Start Course
        </button>
        <div className="dashboard_hr"></div>
        <div className="my-5">
          <h1 className="font-semibold text-textSlightDark-0 text-[14px] mb-3">
            Activities
          </h1>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-[32px] w-[32px] bg-[#2C7FFF0D] text-[#2C7FFF] flex justify-center items-center">
                <HiOutlineBookOpen />
              </div>
              <p className="font-semibold text-textSlightDark-0 text-[13px]">
                3 students completed “Biblical Foundation” quiz
              </p>
            </div>
            <span className="flex items-center gap-1 text-textGrey-0 text-[13px]">
              <CiClock1 /> 12h ago
            </span>
          </div>
          <div className="dashboard_hr my-4"></div>
        </div>
      </div>
    </div>
  );
}
