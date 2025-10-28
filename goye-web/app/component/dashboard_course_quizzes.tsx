"use client";

import { useState } from "react";
import { CiCircleQuestion, CiClock2 } from "react-icons/ci";
interface Props {
  openQuiz: () => void;
}
export default function DashboardCourseQuizzes({ openQuiz }: Props) {
  const showQuizFunc = () => {
    openQuiz();
  };

  return (
    <>
      <div className="dashboard_content_mainbox">
        <div className="bg-[#FAF8F8] p-[16px]">
          <div className="flex justify-between items-center ">
            <h1 className="text-[#41415A] text-[12px] font-[600]">
              Quiz Progress
            </h1>
            <span className="text-[#71748C] text-[12px] font-[500]">
              0/3 completed
            </span>
          </div>
          <div className="relative bg-[#E8E1E2] h-[8px] my-2">
            <div className="bg-[#30A46F] h-full w-[30%]"></div>
          </div>
        </div>

        <div className="w-full gap-3">
          <h1 className="text-[#1F2130] font-[700] text-[18px] my-5">
            All Quizzes
          </h1>
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
                className="form_more text-[#ffffff] bg-primaryColors-0"
                onClick={showQuizFunc}
              >
                Start Quiz
              </button>
            </div>
            <div className="dashboard_hr"></div>
          </div>
        </div>
      </div>
    </>
  );
}
