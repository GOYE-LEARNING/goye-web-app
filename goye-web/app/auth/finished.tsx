"use client";

import { FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";
import { MdCheckCircle } from "react-icons/md";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";

export default function Finished() {
  const router = useRouter();
  confetti({
    particleCount: 25,
    spread: 80,
    origin: { y: 0.6 },
    colors: ["#FBB041", "#4466E4", "#DA0E29", "#00BFFF"],
  });
  return (
    <>
      <div className="form_container  gap-5 md:min-h-auto min-h-screen md:bg-white">
        <div className="flex justify-center items-center flex-col gap-3 w-full">
          <div className="text-green-700">
            <MdCheckCircle size={150} />
          </div>
          <h1 className="form_h1 md:text-4xl text-[40px]">Awesome</h1>
          <p className="form-p">Your account has been created successfully.</p>

          <span className="form_btn" onClick={() => router.push("../../loading")}>
            Go To Dashboard <FaArrowRight size={13} />
          </span>
        </div>
      </div>
    </>
  );
}
