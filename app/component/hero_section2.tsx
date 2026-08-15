"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BiSolidAlarm } from "react-icons/bi";
import { FaBookBookmark } from "react-icons/fa6";
import { IoIosPeople } from "react-icons/io";
import { MdMessage } from "react-icons/md";

export default function HeroSection2() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        duration: 0.5,
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
      <AnimatePresence mode="wait">
        <motion.div
          id="features"
          variants={containerVariants}
          initial="hidden"
          viewport={{once: false}}
          whileInView="visible"
          className="dark:bg-secondaryColors-0 bg-white w-full  py-[88px] flex md:justify-center items-center flex-col gap-5 scroll-mt-24"
        >
          <div className="w-[300px] md:w-full flex justify-center items-center flex-col">
            <motion.h1
              variants={itemVariants as any}
              className="md:text-[48px] text-[32px] text-center font-medium dark:text-textSlightDark-0 text-lightBoldText-0/80"
            >
              The Perfect Learning Experience
            </motion.h1>
            <motion.p
              variants={itemVariants as any}
              className="text-center text-[20px] dark:text-textSlightDark-0 text-lightBoldText-0/40"
            >
              Everything you need to grow in faith and guide others on <br />{" "}
              their spiritual journey.
            </motion.p>
          </div>
          <motion.div className="flex justify-center items-center flex-wrap w-full gap-[24px]">
            {content.map((c, i) => (
              <motion.div
                variants={itemVariants as any}
                className="dark:bg-shadyColor-0 bg-lightSecondaryColor-0 p-[24px] rounded-[8px] md:w-[272px] w-[330px] transition-transform duration-300 hover:-translate-y-1"
                key={i}
              >
                <span
                  className="w-[56px] h-[56px] dark:bg-secondaryColors-0 bg-white text-primaryColors-0 flex justify-center items-center flex-col mb-3 rounded-[8px] text-[26px]"
                >
                  {c.icon}
                </span>
                <h1 className="font-semibold dark:text-textSlightDark-0 text-lightBoldText-0/50 text-[18px]">
                  {c.header}
                </h1>
                <p className="text-[14px] dark:text-nearTextColors-0 text-lightBoldText-0">{c.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
