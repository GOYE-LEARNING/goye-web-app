import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FaAngleDoubleUp } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import DashboardTutorStudentDetailsCourse from "./dashboard_tutor_student_details_course";
import DashboardTutorStudentDetailsGroup from "./dashboard_tutor_student_details_groups";
interface Props {
  cancel: () => void;
}
export default function DashboardTutorStudentDetails({ cancel }: Props) {
  const [showCourse, setShowCourse] = useState<boolean>(true);
  const [showGroups, setShowGroups] = useState<boolean>(false);
  return (
    <>
      <div className="w-[390px] fixed top-0 right-0 h-full bg-white drop-shadow-2xl p-[32px] border border-[#E3E3E833] transition-all duration-300 ease-in-out">
        <div className="flex justify-between items-center">
          <h1 className="text-[#1F2130] font-bold text-[24px]">
            Student Details
          </h1>
          <span onClick={cancel} className="cursor-pointer">
            <MdOutlineCancel size={20} className="text-[18px]" />
          </span>
        </div>

        <div className="dashboard_hr mt-[32px]"></div>
        <div className="flex justify-center items-center flex-col gap-2 my-5">
          <div className="h-[64px] w-[64px] rounded-full bg-textGrey-0"></div>
          <h1 className="font-semibold text-[22px] text-textSlightDark-0">
            Kurl Bates
          </h1>
          <p className="text-[14px] text-textGrey-0">alex_hamilton@gmail.com</p>
          <span className="text-[13px] flex items-center gap-2 text-boldGreen-0">
            <FaAngleDoubleUp /> Beginner
          </span>
        </div>

        <div className="bg-[#F1F1F4CC] grid grid-cols-2 h-[32px] p-[4px] text-[12px] gap-2">
          <button
            onClick={() => {
              setShowCourse(true);
              setShowGroups(false);
            }}
            className={` ${showCourse && "bg-[#ffffff] drop-shadow-sm"}`}
          >
            Courses
          </button>
          <button
            onClick={() => {
              setShowCourse(false);
              setShowGroups(true);
            }}
            className={` ${showGroups && "bg-[#ffffff] drop-shadow-sm"}`}
          >
            Group
          </button>
        </div>

        <AnimatePresence mode="wait">
          {showCourse && (
            <motion.div
              key="course"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: "easeIn" }}
            >
              <DashboardTutorStudentDetailsCourse />
            </motion.div>
          )}
          {showGroups && (
            <motion.div
              key="group"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: "easeIn" }}
            >
              <DashboardTutorStudentDetailsGroup />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
