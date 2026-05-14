"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import pic1 from "@/public/images/pic8.jpg";
import pic2 from "@/public/images/pic9.jpg";
import pic3 from "@/public/images/pic10.jpg";
import pic4 from "@/public/images/pic11.jpg";
import picDarkMode from "@/public/images/bigframe.png";
import picLightMode from "@/public/images/bigframe7.png";
import { useEffect, useState } from "react";
import useWindowWidth from "../hook/UseWindowWidth";
import dynamic from "next/dynamic";
import LoadingPage from "../loading";
import { useTheme } from "../context/theme_provider";

const ImageSlider = dynamic(() => import("./slider_image"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-200 animate-pulse rounded-lg" />
  ),
});

export default function HeroSection1() {
  const width = useWindowWidth();
  const [isClient, setIsClient] = useState(false);
  const { darkMode, setDarkMode } = useTheme();
  const images = [pic1, pic2, pic3, pic4];

  // Handle hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

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
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  // Return null or loading state on server
  if (!isClient) {
    return <LoadingPage />;
  }

  return (
    <AnimatePresence mode="wait">
      <div className="px-[45px] relative md:pt-[100px] pt-[60px] flex justify-center radial_gradient2 items-center flex-col z-20 dark:bg-secondaryColors-0 bg-lightSecondaryColor-0 backdrop-blur-md">
        <motion.div
          key="hero_section1"
          variants={containerVariants}
          initial="hidden"
          viewport={{ once: false }}
          whileInView="visible"
          className="flex justify-center items-center md:gap-5 gap-9 flex-col md:w-full w-[300px] relative z-30"
        >
          <motion.h1
            variants={itemVariants as any}
            className="font-medium text-[56px] text-center text-primaryColors-0"
          >
            Grow. Teach. Multiply
          </motion.h1>
          <motion.p
            variants={itemVariants as any}
            className="md:w-[70%] w-[100%] text-center dark:text-textSlightDark-0 text-lightBoldText-0/50 md:text-[24px] text-[23px]"
          >
            A self-learning discipleship platform built for both students
            seeking growth and tutors guiding transformation.
          </motion.p>
          <motion.div
            variants={itemVariants as any}
            className="flex items-center gap-3 md:mb-0 mb-5"
          >
            <button className="nav_btn transition-all duration-200 hover:opacity-30 text-primaryColors-0 bg-boldShadyColor-0 md:w-[171px] w-[130px] md:text-[14px] text-[18px]">
              Start Teaching
            </button>
            <button className="nav_btn transition-all duration-200 hover:opacity-30 md:w-[171px] w-[130px] bg-primaryColors-0 text-white md:text-[14px] text-[18px]">
              Start Learning
            </button>
          </motion.div>
        </motion.div>

        {/* Desktop Layout - Remove AnimatePresence wrapper */}
        <div className="py-[80px] hidden md:block">
          <motion.div
            key="landing-page-animation2"
            variants={containerVariants}
            initial="hidden"
            viewport={{ once: true }}
            whileInView="visible"
            className="flex items-center"
          >
            <motion.div
              variants={itemVariants as any}
              className="bg-gray-100 h-[312.88px] w-[235.08999633789062px] rounded-[8px] mr-[-130px] overflow-hidden pr-[5rem]"
            >
              <Image
                src={pic1}
                alt="pic1"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              variants={itemVariants as any}
              className="bg-gray-200 h-[373.5959777832031px] w-[280.7200012207031px] rounded-[8px] mr-[-120px] z-10 overflow-hidden"
            >
              <Image
                src={pic2}
                alt="pic2"
                className="min-w-[100%] min-h-full object-cover object-left transform scale-x-[-1]"
              />
            </motion.div>
            <motion.div
              variants={itemVariants as any}
              className="dark:bg-secondaryColors-0 bg-white drop-shadow-sm h-[428px] w-[585px] rounded-[8px] z-20 p-[32px]"
            >
              <h1 className="font-bold text-[30px] my-2 dark:text-white text-lightBoldText-0">
                Dashboard
              </h1>
              <Image src={picDarkMode} alt="sharp" />
            </motion.div>
            <motion.div
              variants={itemVariants as any}
              className="bg-gray-200 h-[373.5959777832031px] w-[280.7200012207031px] rounded-[8px] ml-[-120px] z-10 overflow-hidden"
            >
              <Image
                src={pic3}
                alt="pic3"
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            </motion.div>
            <motion.div
              variants={itemVariants as any}
              className="bg-gray-100 h-[312.88px] w-[235.08999633789062px] rounded-[8px] ml-[-130px] overflow-hidden pl-[8rem]"
            >
              <Image
                src={pic4}
                alt="pic4"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Mobile Slider - Only show when width is available and <= 800 */}
        {width !== undefined && width <= 800 && (
          <div className="block md:hidden w-full mt-8">
            <ImageSlider images={images} />
          </div>
        )}
      </div>
    </AnimatePresence>
  );
}
