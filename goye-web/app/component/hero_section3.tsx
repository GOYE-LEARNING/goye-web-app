"use client";
import pic1 from "@/public/images/bigframe2.png";
import pic2 from "@/public/images/bigframe3.png";
import pic3 from "@/public/images/bigframe4.png";
import pic4 from "@/public/images/bigframe5.png";
import Image from "next/image";
export default function HeroSection3() {
  const content = [
    {
      image: <Image src={pic1} alt="pic1" />,
      header: "Interactive Learning",
      text: "Bite-sized lessons and quizzes that make learning engaging and memorable.",
    },
    {
      image: <Image src={pic2} alt="pic2" />,
      header: "Smart Tracking",
      text: "Progress dashboards for students and tutors to visualize spiritual growth.",
    },

    {
      image: <Image src={pic3} alt="pic3" />,
      header: "Collaboration",
      text: "Discussion boards, group reflections, and shared notes for community learning.",
    },
    {
      image: <Image src={pic4} alt="pic4" />,
      header: "Scalable Mentorship",
      text: "One-to-one or group discipleship programs that grow with your community.",
    },
  ];
  return (
    <>
      <div className="md:w-full bg-primaryColors-0 py-[88px] flex justify-between items-center flex-col gap-[35px]">
        <div className="w-[300px] md:w-full flex justify-center items-center flex-col">
          <h1 className="text-white font-medium md:text-[48px] text-[35px] text-center md:">
            Everything you need to grow together.
          </h1>
          <p className="text-white text-center text-[20px] md:mt-0 mt-[1rem]">
            Designed for meaningful discipleship in today's world.
          </p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-[24px] md:w-full w-[300px]">
          {content.map((c, i) => (
            <div
              key={i}
              className="bg-white rounded-[4px] p-[32px] md:w-[524px] w-full h-[389px]"
            >
              <div className="h-[226px] w-full bg-shadyColor-0 flex items-center justify-center">
                {c.image}
              </div>
              <h1 className="text-textSlightDark-0 font-semibold text-[18px] my-2">
                {c.header}
              </h1>
              <p className="text-nearTextColors-0 text-[14px]">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
