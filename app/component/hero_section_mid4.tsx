"use client";
import { AnimatePresence, motion } from "framer-motion";
import { FaStar } from "react-icons/fa6";
import pic2 from "@/public/images/pic12.png";
import Image from "next/image";

export default function MidSection4() {
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
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smoother motion
      },
    },
  };
  return (
    <>
      <AnimatePresence mode="wait">
        <div className="dark:bg-secondaryColors-0 bg-white w-full py-[48px] md:px-[136px] flex justify-center items-center flex-col">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            viewport={{ once: false }}
            whileInView="visible"
            className="flex justify-center items-center md:w-full w-[300px] flex-col gap-8"
          >
            <motion.span variants={itemVariants as any} className="flex gap-2">
              <FaStar color="#FFC802" />
              <FaStar color="#FFC802" />
              <FaStar color="#FFC802" />
              <FaStar color="#FFC802" />
              <FaStar color="#E2E2E2" />
            </motion.span>
            <motion.h1
              variants={itemVariants as any}
              className="font-medium md:text-[48px] text-[30px] dark:text-textSlightDark-0 text-lightBoldText-0/80 text-center"
            >
              “As a tutor, I finally have a tool that makes discipleship
              structured yet personal.”
            </motion.h1>
            <motion.div
              variants={itemVariants as any}
              className="flex items-center gap-4"
            >
              <div className="h-[60px] w-[60px] rounded-[4px] bg-shadyColor-0 overflow-hidden">
                <Image
                  src={pic2}
                  alt="pic2"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-1 dark:text-textSlightDark-0 text-lightBoldText-0/80">
                <h1 className="font-bold text-[24px]">Ian Hunt</h1>
                <p className="text-[14px]">Director of CX at Liberty London</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </AnimatePresence>
    </>
  );
}
