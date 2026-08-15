"use client";

import { motion } from "framer-motion";
import { useTheme } from "../context/theme_provider";
import GlobeHero from "./globe/GlobeHero";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export default function HeroSection1() {
  const { darkMode } = useTheme();

  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden flex items-center justify-center radial_gradient2 dark:bg-secondaryColors-0 bg-lightSecondaryColor-0 backdrop-blur-md scroll-mt-24"
    >
      {/* 3D rotating world — real coastline data (world-atlas / Natural
          Earth), brand-colored dot field, deliberately oversized and pushed
          down so it never shows completely. */}
      <GlobeHero dark={darkMode} />

      {/* fade so the globe settles into the section below rather than
          hard-cutting at the edge */}
      <div className="absolute inset-x-0 bottom-0 h-[220px] bg-gradient-to-t dark:from-secondaryColors-0 from-lightSecondaryColor-0 to-transparent" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center justify-center text-center px-[24px] md:px-[45px] py-[120px]"
      >
        <motion.h1
          variants={item as any}
          className="font-medium text-[40px] md:text-[64px] leading-[1.05] text-center text-primaryColors-0"
        >
          Grow. Teach. Multiply
        </motion.h1>
        <motion.p
          variants={item as any}
          className="mt-[16px] max-w-[46ch] text-center dark:text-textSlightDark-0 text-lightBoldText-0/50 text-[18px] md:text-[24px]"
        >
          A self-learning discipleship platform built for both students
          seeking growth and tutors guiding transformation.
        </motion.p>
        <motion.div variants={item as any} className="flex items-center gap-3 mt-[32px]">
          <button className="nav_btn transition-all duration-200 hover:opacity-30 text-primaryColors-0 dark:bg-secondaryColors-0 bg-white md:w-[171px] w-[130px] md:text-[14px] text-[18px]">
            Start Teaching
          </button>
          <button className="nav_btn transition-all duration-200 hover:opacity-30 md:w-[171px] w-[130px] bg-primaryColors-0 text-white md:text-[14px] text-[18px]">
            Start Learning
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
