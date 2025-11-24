"use client";

import { FaCheck } from "react-icons/fa6";
import pic1 from "@/public/images/bigframe6.png";
import pic2 from "@/public/images/bigframe7.png";
import Image from "next/image";
export default function HeroSection4() {
  const content = [
    {
      pic: {
        image: (
          <Image src={pic1} alt="pic1" className="mt-[4.5rem] w-[80%] h-auto" />
        ),
      },
      header: "Multiply your impact, effortlessly.",
      p: "Empower others with structured mentorship tools that make discipleship scalable and personal.",
      list: {
        l1: "Create or adapt structured lesson plans",
        l2: "Assign modules, monitor student progress",
        l3: "Provide feedback and mentorship online",
        l4: "Access reports to see spiritual growth over time",
      },
      button: "Become an Instructor",
    },
    {
      pic: {
        image: (
          <Image src={pic2} alt="pic2" className="mt-[4.5rem] md:w-[80%] w-full h-auto" />
        ),
      },
      header: "Your journey of faith, made simple.",
      p: "Experience structured spiritual growth with tools designed to help you learn, reflect, and connect.",
      list: {
        l1: "Follow a clear discipleship roadmap",
        l2: "Engage with lessons and guided exercises",
        l3: "Track your growth through progress dashboards",
        l4: "Connect with tutors for deeper mentorship",
      },
      button: "Start Discipleship Journey",
    },
  ];
  return (
    <>
      <div className="bg-shadyColor-0 py-[88px] md:px-[136px] flex justify-center items-center flex-col gap-[35px] w-full">
        <div className="md:w-full w-[300px]">
          {content.map((c, i) => (
            <div
              key={i}
              className={` flex flex-wrap flex-col-reverse md:flex-row  justify-between md:items-center w-full md:mb-[50px] mb-[100px] md:gap-0 gap-5 ${
                i % 2 !== 0
                  ? "md:flex-row-reverse"
                  : ''
              }`}
            >
              <div className="flex flex-col gap-3 md:w-[456.66px] w-full">
                <h1 className="text-[48px] font-medium">{c.header}</h1>
                <p className="text-textSlightDark-0 text-[16px] md:w-[75%] w-full">
                  {c.p}
                </p>
                <ul>
                  <li className="flex items-center gap-2 text-[14px] text-textSlightDark-0">
                    <div>
                      <div className="h-[15px] w-[15px] bg-primaryColors-0 rounded-full flex justify-center items-center text-white text-[10px]">
                        {" "}
                        <FaCheck />
                      </div>
                    </div>
                    {c.list.l1}
                  </li>
                  <li className="flex items-center gap-2 text-[14px] text-textSlightDark-0">
                    <div>
                      <div className="h-[15px] w-[15px] bg-primaryColors-0 rounded-full flex justify-center items-center text-white text-[10px]">
                        {" "}
                        <FaCheck />
                      </div>
                    </div>
                    {c.list.l2}
                  </li>
                  <li className="flex items-center gap-2 text-[14px] text-textSlightDark-0">
                    <div>
                      <div className="h-[15px] w-[15px] bg-primaryColors-0 rounded-full flex justify-center items-center text-white text-[10px]">
                        {" "}
                        <FaCheck />
                      </div>
                    </div>
                    {c.list.l3}
                  </li>
                  <li className="flex items-center gap-2 text-[14px] text-textSlightDark-0">
                    <div>
                      <div className="h-[15px] w-[15px] bg-primaryColors-0 rounded-full flex justify-center items-center text-white text-[10px]">
                        {" "}
                        <FaCheck />
                      </div>
                    </div>
                    {c.list.l4}
                  </li>
                </ul>
                <button className="bg-primaryColors-0 md:w-[50%] w-[75%] text-white h-[40px]  text-[14px]">
                  {c.button}
                </button>
              </div>
              <div className="h-[283px] md:w-[400px] w-full bg-boldShadyColor-0 rounded-[8px] overflow-hidden flex justify-center items-center">
                {c.pic.image}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
