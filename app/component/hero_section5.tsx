"use client";
import { AnimatePresence, motion } from "framer-motion";

import Image from "next/image";
import pic1 from "@/public/images/bigframe8.png";
import { useI18n } from "@/app/context/I18nContext";
import InstallPwaPrompt from "@/app/component/InstallPwaPrompt";
export default function HeroSecton5() {
  const { t } = useI18n();
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
                {t("Available on Mobile")}
              </motion.p>
              <motion.h1
                variants={itemVariants as any}
                className="font-medium md:text-[48px] text-[30px] text-primaryColors-0"
              >
                {t("Stay connected with your discipleship journey anytime, anywhere")}
              </motion.h1>
              {/* These used to be two dead "Get on iPhone" / "Get on Android"
                  buttons with no link and no store listing behind them —
                  there is no native app, so they never did anything. GOYE is
                  a PWA instead: this is the real, working install action. */}
              <motion.div variants={itemVariants as any} className="mb-9">
                <InstallPwaPrompt />
              </motion.div>
            </div>
            <motion.div
              variants={itemVariants as any}
              className="md:w-[35%] w-full  h-full md:absolute bottom-0 md:right-0 right-[20px] flex justify-end items-end flex-col"
            >
              <Image src={pic1} alt={t("GOYE mobile app preview")} className="h-auto w-full" />
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
