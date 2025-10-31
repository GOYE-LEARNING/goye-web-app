"use client";

import { BiPlus } from "react-icons/bi";
import { CiCircleQuestion, CiClock2 } from "react-icons/ci";
interface Props {
  viewQuiz: () => void;
  openAddQuiz: () => void;
}
export default function DashboardTutorTabQuiz({ viewQuiz, openAddQuiz }: Props) {
  return (
    <div className="dashboard_content_mainbox">
      <div className="w-full gap-3">
        <div className="flex justify-between items-center">
          <h1 className="text-[#1F2130] font-[700] text-[18px] my-5">
            All Quizzes
          </h1>
          <button className="text-[13px] flex items-center gap-2 font-semibold text-primaryColors-0" onClick={openAddQuiz}>
            <BiPlus /> Add Quiz
          </button>
        </div>
        <div className="flex flex-col w-full gap-3">
          <div className="flex flex-col gap-3">
            <h1 className="text-[#1F2130] text-[14px] font-[600]">
              Faith in Action
            </h1>
            <p className="text-[#71748C] text-[14px]">
              Test your understanding of practical discipleship principle
            </p>
            <p className="flex gap-4">
              <span className="flex items-center text-[14px] text-[#71748C] gap-2">
                <CiCircleQuestion size={15} /> 5 questions
              </span>
              <span className="flex items-center text-[14px] text-[#71748C] gap-2">
                <CiClock2 size={15} /> 10min
              </span>
            </p>
            <button
              className="form_more font-semibold bg-white border border-[#D9D9D9] text-primaryColors-0"
              onClick={viewQuiz}
            >
              View Quiz
            </button>
          </div>
          <div className="dashboard_hr"></div>
        </div>
      </div>
    </div>
  );
}
