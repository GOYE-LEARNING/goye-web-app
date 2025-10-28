"use client";

import { CiCircleCheck } from "react-icons/ci";
import SubHeader from "./dashboard_subheader";
import { FaBullseye } from "react-icons/fa";
import { MdCheck } from "react-icons/md";
import { HiOutlineBookOpen } from "react-icons/hi";
import { IoIosRefresh } from "react-icons/io";
interface Props {
  backFunction: () => void;
}
export default function DashboardQuizReview({ backFunction }: Props) {
  return (
    <>
      <div>
        <SubHeader header="Quiz Review" backFunction={backFunction} />
        <div className="dashboard_content_mainbox">
          <div className="bg-[#ffffff] border border-[#F1F1F4] py-[24px] px-[16px] flex flex-col  items-center">
            <CiCircleCheck color="#30A46F" size={30} />
            <div className="flex flex-col justify-center items-center gap-1 mt-5">
              <h1 className="font-[700] text-[24px] text-[#1F2130]">100%</h1>
              <p className="text-[#71748C] text-[14px]">2 out of 2 correct</p>
            </div>
            <div className="dashboard_hr my-4"></div>
            <div className="flex justify-around items-center w-full">
              <div className="flex flex-col gap-1 items-center">
                <h1 className="font-[700] text-[#1F2130] text-[18px]">2</h1>
                <p>Correct</p>
              </div>
              <div className="flex flex-col gap-1 items-center">
                <h1 className="font-[700] text-[#DA0E29] text-[18px]">0</h1>
                <p>Incorrect</p>
              </div>
              <div className="flex flex-col gap-1 items-center">
                <h1 className="font-[700] text-[#1F2130] text-[18px]">1:38</h1>
                <p>Time taken</p>
              </div>
            </div>
          </div>
          <div className="my-5 flex flex-col gap-3">
            <span className="flex items-center gap-3 text-[#41415A] text-[14px] font-[600]">
              <FaBullseye /> Performane
            </span>
            <div className="relative h-[8px] bg-[#E8E1E2]">
              <div className="h-full bg-[#30A46F] transition-all duration-500 w-[30%]"></div>
            </div>
            <div className="flex justify-between items-center text-[14px] font-[600] text-[#41415A]">
              <h1 className="">Overall score</h1>
              <p className="">75%</p>
            </div>
            <div className="border border-[#F1F1F4] h-[41px] flex items-center p-[12px] text-[#30A46F]">
              <p className="flex gap-5 items-center text-[14px]">
                <MdCheck />
                Passing grade achieved! Great understanding of the course.
              </p>
            </div>
            <div className="dashboard_hr my-4"></div>
            <div className="w-full flex flex-col gap-3">
              <span className="flex items-center gap-3 text-[#41415A] text-[14px] font-[600]">
                <HiOutlineBookOpen /> Question overview
              </span>
              <div className="grid grid-cols-5 w-full text-[#30A46F] gap-3">
                <div className="h-[56px] bg-[#30A46F0D] border border-[#30A46F] flex justify-center items-center flex-col">
                  <h1>1</h1>
                  <MdCheck />
                </div>
                <div className="h-[56px] bg-[#30A46F0D] border border-[#30A46F] flex justify-center items-center flex-col">
                  <h1>2</h1>
                  <MdCheck />
                </div>
              </div>
            </div>
            <div className="dashboard_hr my-5"></div>
            <div className="flex flex-col gap-5">
              <button className="form_more bg-primaryColors-0 text-[#ffffff] font-[600] text-[13px]">
                Review in Details
              </button>
              <button className="form_more bg-[#EBE5E7] text-primaryColors-0 font-[600] text-[13px] flex items-center">
                Retake Quiz <IoIosRefresh />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
