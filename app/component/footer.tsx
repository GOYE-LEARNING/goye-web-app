import Image from "next/image";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";
import { AnimatePresence, motion } from "framer-motion";

import picLightMode from "@/public/images/goye_final_logo.png";
import picDarkMode from "@/public/images/goye_white.png"
import { useTheme } from "../context/theme_provider";
export default function Footer() {
  const {darkMode} = useTheme()
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
        <motion.div className="dark:bg-secondaryColors-0 bg-white py-[54px] md:px-[180px] px-[44px]">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            viewport={{ once: false }}
            whileInView="visible"
          >
            <div className="flex justify-between items-center dark:text-white text-lightBoldText-0">
              <motion.h1
                variants={itemVariants as any}
                className="text-[20px] "
              >
                Learn More
              </motion.h1>
              <div className="flex items-center gap-3 text-[25px]">
                <motion.span variants={itemVariants as any} className="cursor-pointer transition-colors hover:text-primaryColors-0">
                  <FaXTwitter />
                </motion.span>
                <motion.span variants={itemVariants as any} className="cursor-pointer transition-colors hover:text-primaryColors-0">
                  <FaFacebookF />
                </motion.span>
                <motion.span variants={itemVariants as any} className="cursor-pointer transition-colors hover:text-primaryColors-0">
                  <FaLinkedinIn />
                </motion.span>
                <motion.span variants={itemVariants as any} className="cursor-pointer transition-colors hover:text-primaryColors-0">
                  <FaInstagram />
                </motion.span>
              </div>
            </div>
            <div className="h-[1px] w-full dark:bg-[#42433E] bg-[#ccc]/10 mt-[40px] mb-[60px]"></div>
            <div className="flex md:justify-between text-center md:text-left items-center md:flex-row flex-col">
              <motion.div variants={itemVariants as any}>
                {" "}
                <Image src={darkMode ? picDarkMode : picLightMode} height={80} width={80} alt="logo" />
              </motion.div>
              <motion.p
                variants={itemVariants as any}
                className="text-[14px] dark:text-white text-lightBoldText-0"
              >
                © 2025 Disciple Training School. All Right Reserved
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
