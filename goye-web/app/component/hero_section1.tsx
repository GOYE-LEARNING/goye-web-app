"use client";

import Image from "next/image";
import pic1 from "@/public/images/pic8.jpg";
import pic2 from '@/public/images/pic9.jpg'
import pic3 from '@/public/images/pic10.jpg'
import pic4 from '@/public/images/pic11.jpg'
import pic5 from '@/public/images/bigframe.png'
export default function HeroSection1() {
  return (
    <div className="px-[160px] md:pt-[100px] pt-[60px] flex justify-center items-center flex-col">
      <div className="flex justify-center items-center md:gap-5 gap-9 flex-col">
        <h1 className="font-medium text-[56px] text-center">Grow. Teach. Multiply</h1>
        <p className="md:w-[70%] w-[100%] text-center text-textSlightDark-0 md:text-[20px] text-[23px]">
          A self-learning discipleship platform built for both students seeking
          growth and tutors guiding transformation.
        </p>
        <div className="flex items-center gap-3">
          <button className="nav_btn text-primaryColors-0 bg-boldShadyColor-0 md:w-[171px] w-[190px] md:text-[14px] text-[18px]">
            Start Teaching
          </button>
          <button className="nav_btn md:w-[171px] w-[190px] bg-primaryColors-0 text-white md:text-[14px] text-[18px]">
            Start Learning
          </button>
        </div>
      </div>

      <div className="py-[80px]">
        <div className="flex items-center">
          <div className="bg-gray-100 h-[312.88px] w-[235.08999633789062px] rounded-[8px] mr-[-130px] overflow-hidden pr-[5rem]">
            <Image src={pic1} alt="pic1" className="w-full h-full object-cover" />
          </div>
          <div className="bg-gray-200 h-[373.5959777832031px] w-[280.7200012207031px] rounded-[8px] mr-[-120px] z-10 overflow-hidden">
            <Image src={pic2} alt="pic2" className="min-w-[100%] min-h-full object-cover object-left transform scale-x-[-1] " />
          </div>
          <div className="bg-white drop-shadow-sm h-[428px] w-[585px] rounded-[8px] z-20 p-[32px]">
            <h1 className="font-bold text-[30px] my-2">Dashboard</h1>
            <Image src={pic5} alt="sharp"/>
          </div>
          <div className="bg-gray-200 h-[373.5959777832031px] w-[280.7200012207031px] rounded-[8px] ml-[-120px] z-10 overflow-hidden">
            <Image src={pic3} alt="pic3" className="w-full h-full object-cover transform scale-x-[-1]" />
          </div>
          <div className="bg-gray-100 h-[312.88px] w-[235.08999633789062px] rounded-[8px]  ml-[-130px] overflow-hidden pl-[8rem]">
            <Image src={pic4} alt="pic4" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
}
