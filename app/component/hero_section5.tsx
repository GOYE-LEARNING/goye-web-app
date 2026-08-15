"use client";
import { AnimatePresence, motion } from "framer-motion";

import Image from "next/image";
import { BiLogoPlayStore } from "react-icons/bi";
import { FaApple } from "react-icons/fa";
import pic1 from "@/public/images/bigframe8.png";
export default function HeroSecton5() {
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
        <motion.div
          id="app"
          variants={containerVariants}
          initial="hidden"
          viewport={{ once: false }}
          whileInView="visible"
          className="dark:bg-shadyColor-0 bg-lightSecondaryColor-0 w-full py-[48px] md:px-[136px] px-[45px] flex justify-center items-center flex-col scroll-mt-24"
        >
          
          <motion.div
            variants={itemVariants as any}
            className=" md:w-full dark:bg-boldShadyColor-0 bg-white md:py-[80px]  md:px-[48px] px-[20px] rounded-[9px] grid md:grid-cols-[60%,_40%] grid-cols-1 md:relative overflow-hidden static"
          >
            <div>
              <motion.p
                variants={itemVariants as any}
                className="uppercase font-bold mt-[40px] text-[13px] tracking-wide dark:text-textSlightDark-0 text-lightBoldText-0/60"
              >
                Available on Mobile
              </motion.p>
              <motion.h1
                variants={itemVariants as any}
                className="font-medium md:text-[48px] text-[30px] text-primaryColors-0"
              >
                Stay connected with your discipleship journey anytime, anywhere
              </motion.h1>
              <div className="flex items-center gap-3 mb-9">
                <motion.button
                  variants={itemVariants as any}
                  className="nav_btn flex items-center justify-center gap-2 md:w-[169px] md:px-0 px-1 dark:bg-secondaryColors-0 bg-white border border-[#B7BAD2]/10 rounded-[6px]"
                >
                  <FaApple />
                  Get on iPhone
                </motion.button>
                <motion.button
                  variants={itemVariants as any}
                  className="nav_btn flex items-center justify-center gap-2 md:w-[169px] md:px-0 px-2 dark:bg-secondaryColors-0 bg-white border border-[#B7BAD2]/10 rounded-[6px]"
                >
                  <BiLogoPlayStore />
                  Get on Android
                </motion.button>
              </div>
            </div>
            <motion.div
              variants={itemVariants as any}
              className="md:w-[35%] w-full  h-full md:absolute bottom-0 md:right-0 right-[20px] flex justify-end items-end flex-col"
            >
              <Image src={pic1} alt="GOYE mobile app preview" className="h-auto w-full" />
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
