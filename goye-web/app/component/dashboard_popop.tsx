"use client";

import { FaCheckCircle } from "react-icons/fa";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
interface Props {
  close: () => void;
  backToCourse: () => void;
  reviewCourse: () => void;
  header: string
  paragraph: string
  buttonFunc: string

}
export default function DashboardPop({
  close,
  backToCourse,
  reviewCourse,
  header,
  paragraph,
  buttonFunc
}: Props) {
  confetti({
    particleCount: 25,
    spread: 80,
    origin: { y: 0.6 },
    colors: ["#FBB041", "#4466E4", "#DA0E29", "#00BFFF"],
  });
  return (
    <>
      <div
        className="bg-black/30 fixed top-0 left-0 z-30 h-full w-full flex justify-center items-center flex-col"
        onClick={close}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, y: '30%' }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeIn" }}
          className="w-[400px] p-[40px] rounded-[8px] flex justify-center items-center flex-col gap-5 bg-white text-center"
        >
          <FaCheckCircle size={80} color="#30A46F" />
          <h1 className="text-[40px] text-[#111827] font-[500]">
            {header}
          </h1>
          <p className="text-[16px] text-[#41415A]">
            {paragraph}
          </p>
          <div className="w-full flex justify-start items-start flex-col gap-2">
            <button
              className="form_more bg-primaryColors-0 text-white"
              onClick={reviewCourse}
            >
              {buttonFunc}
            </button>
            <button
              className="form_more bg-[#F6F3F4] text-primaryColors-0"
              onClick={backToCourse}
            >
              Back to Course
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
