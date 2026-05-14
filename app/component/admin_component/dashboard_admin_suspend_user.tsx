"use client";
interface Props {
  cancelFunc: () => void;
  removeUser: () => void
}

import { AnimatePresence, motion } from "framer-motion";
export default function SuspendUserModal({ cancelFunc, removeUser }: Props) {
  return (
    <>
      <div className="fixed top-0 left-0 min-h-[100vh] min-w-[100vw] z-50 bg-[#00000033] flex justify-center items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key="modal"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: "easeIn" }}
            className="bg-[#FFFFFF] md:w-[500px] w-[auto] p-[40px] rounded-[8px] relative"
          >
            <div
              className="h-[28px] w-[28px] bg-[#F5F5F5] flex justify-center items-center rounded-[4px] text-[#41415A] font-bold absolute top-[40px] right-[40px]"
              onClick={cancelFunc}
            >
              &times;
            </div>
            <div className="mt-[40px] flex items-start flex-col gap-[5px]">
              <h1 className="text-[24px] text-textSlightDark-0 font-bold">
                Remove User
              </h1>
              <p className="text-[#41415A] text-[14px]">
                Are you sure you want to switch to remove Alex Buckmaster?
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 mt-[30px]">
              <button className="form_more bg-[#DA0E29] text-white" onClick={removeUser}>
                Remove
              </button>
              <button className="form_more bg-[#F5F5F5] text-[#41415A] ">
                Cancel
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
