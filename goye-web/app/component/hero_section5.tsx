"use client";

import Image from "next/image";
import { BiLogoPlayStore } from "react-icons/bi";
import { FaApple } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";
import pic1 from "@/public/images/bigframe8.png";
import pic2 from "@/public/images/pic12.png";
export default function HeroSecton5() {
  return (
    <>
      <div className="bg-white w-full py-[48px] md:px-[136px] flex justify-center items-center flex-col gap-[32px]">
        <div className="flex justify-center items-center md:w-full w-[300px] flex-col gap-8">
          <span className="flex gap-2">
            <FaStar color="#FFC802" />
            <FaStar color="#FFC802" />
            <FaStar color="#FFC802" />
            <FaStar color="#FFC802" />
            <FaStar color="#E2E2E2" />
          </span>
          <h1 className="font-medium md:text-[48px] text-[30px] text-textSlightDark-0 text-center">
            “As a tutor, I finally have a tool that makes discipleship
            structured yet personal.”
          </h1>
          <div className="flex items-center gap-4">
            <div className="h-[60px] w-[60px] rounded-[4px] bg-shadyColor-0 overflow-hidden">
              <Image
                src={pic2}
                alt="pic2"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-1 text-textSlightDark-0">
              <h1 className="font-bold text-[24px]">Ian Hunt</h1>
              <p className="text-[14px]">Director of CX at Liberty London</p>
            </div>
          </div>
        </div>
        <div className="mt-[88px] md:w-full w-[300px] bg-boldShadyColor-0 md:py-[80px] py-[40px] md:px-[48px] px-[20px] rounded-[9px] grid md:grid-cols-[60%,_40%] grid-cols-1 md:relative overflow-hidden static">
          <div>
            <p className="uppercase font-bold">Available on Mobile</p>
            <h1 className="font-medium md:text-[48px] text-[30px] text-primaryColors-0">
              Stay connected with your discipleship journey anytime, anywhere
            </h1>
            <div className="flex items-center gap-3 mb-9">
              <button className="nav_btn flex items-center justify-center gap-2 md:w-[169px] md:px-0 px-1 bg-white border border-[#B7BAD2] rounded-[6px]">
                <FaApple />
                Get on iPhone
              </button>
              <button className="nav_btn flex items-center justify-center gap-2 md:w-[169px] md:px-0 px-2 bg-white border border-[#B7BAD2] rounded-[6px]">
                <BiLogoPlayStore />
                Get on Android
              </button>
            </div>
          </div>
          <div>
            <Image
              src={pic1}
              alt="pic1"
              className="h-auto md:w-[35%] w-full md:absolute bottom-0 md:right-[38px] right-[20px] mb-[-80px]"
            />
          </div>
        </div>
      </div>
    </>
  );
}
