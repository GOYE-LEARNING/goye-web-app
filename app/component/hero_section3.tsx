"use client";
import { AnimatePresence, motion } from "framer-motion";
import pic1 from "@/public/images/bigframe2.png";
import pic2 from "@/public/images/bigframe3.png";
import pic3 from "@/public/images/bigframe4.png";
import pic4 from "@/public/images/bigframe5.png";
import Image from "next/image";

export default function HeroSection3() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        duration: 0.6,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smoother motion
      },
    },
  };
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
      <AnimatePresence mode="wait">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          viewport={{ once: false }}
          whileInView="visible"
          className="md:w-full radial-gradient py-[88px] flex justify-between items-center flex-col gap-[35px] dark:bg-secondaryColors-0 bg-lightSecondaryColor-0"
        >
          <div className="px-[45px] md:px-0 md:w-full flex justify-center items-center flex-col relative z-20">
            <motion.h1
              variants={itemVariants as any}
              className="dark:text-white text-lightBoldText-0/80 font-medium md:text-[48px] text-[35px] text-center md:"
            >
              Everything you need to grow together.
            </motion.h1>
            <motion.p
              variants={itemVariants as any}
              className="dark:text-white text-lightBoldText-0/40 text-center text-[20px] md:mt-0 mt-[1rem]"
            >
              Designed for meaningful discipleship in today's world.
            </motion.p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-[24px] md:w-full px-[45px] md:px-0">
            {content.map((c, i) => (
              <motion.div
                variants={itemVariants as any}
                key={i}
                className="dark:bg-secondaryColors-0 bg-white border border-[#ccc]/10 drop-shadow-2xl rounded-[20px] p-[32px] md:w-[524px] w-full h-[389px] "
              >
                <div className={`h-[226px] w-full dark:bg-shadyColor-0 bg-lightSecondaryColor-0 flex  overflow-hidden ${i == 0 ? 'justify-end items-end' : 'flex items-center justify-center'}`}>
                  {c.image}
                </div>
                <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0 font-semibold text-[18px] my-2">
                  {c.header}
                </h1>
                <p className="dark:text-white text-lightBoldText-0/50 text-[14px]">{c.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
