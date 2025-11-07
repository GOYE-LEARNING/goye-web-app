"use client";

import { BiSolidAlarm } from "react-icons/bi";
import { FaBookBookmark } from "react-icons/fa6";
import { IoIosPeople } from "react-icons/io";
import { MdMessage } from "react-icons/md";

export default function HeroSection2() {
  const content = [
    {
      icon: <BiSolidAlarm />,
      header: "Accessible",
      text: "Learn and teach discipleship anywhere, on your schedule",
    },
    {
      icon: <FaBookBookmark />,
      header: "Structured Pathways",
      text: "Step-by-step learning modules aligned with biblical principles.",
    },

    {
      icon: <MdMessage />,
      header: "Interactive Tools",
      text: "Quizzes and group discussions to deepen understanding.",
    },
    {
      icon: <IoIosPeople />,
      header: "Community Growth",
      text: "Foster meaningful relationships between learners and mentors.",
    },
  ];
  return (
    <>
      <div className="bg-white w-full  py-[88px] flex md:justify-center items-center flex-col gap-5">
        <h1 className="md:text-[48px] text-[32px] text-center font-medium text-textSlightDark-0">
          The Perfect Learning Experience
        </h1>
        <p className="text-center text-[20px] text-textSlightDark-0">
          Everything you need to grow in faith and guide others on <br /> their
          spiritual journey.
        </p>
        <div className="flex justify-center items-center flex-wrap w-full gap-[24px]">
          {content.map((c, i) => (
            <div className="bg-shadyColor-0 p-[24px] rounded-[4px] md:w-[272px] w-[330px]" key={i}>
              <span
                className={`w-[56px] h-[56px] bg-[#ffffff] flex justify-center items-center flex-col ${
                  i == 0
                    ? "text-[#EA4335]"
                    : i == 1
                    ? "text-[#2C7FFF] "
                    : i == 2
                    ? "text-[#34A853]"
                    : i == 3
                    ? "text-[#FBBC04]"
                    : ""
                }`}
              >
                {c.icon}
              </span>
              <h1 className="font-semibold text-textSlightDark-0 text-[18px]">
                {c.header}
              </h1>
              <p className="text-[14px] text-nearTextColors-0">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
