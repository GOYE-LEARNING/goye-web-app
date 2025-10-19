"use client";

import { FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";
import { MdCheck, MdCheckCircle, MdCircle } from "react-icons/md";
import { useRouter } from "next/navigation";

export default function Finished() {
    const router = useRouter()
  return (
    <>
      <div className="form_container flex justify-center items-center flex-col gap-5">
        <div className="text-green-700"><MdCheckCircle size={150}/></div>
        <h1 className="form_h1 text-[4xl]">Awesome</h1>
        <p className="form-p">Your account has been created successfully.</p>

        <span className="form_btn" onClick={() => router.push('../loading')}>
          Go To Dashboard <FaArrowRight size={13} />
        </span>
      </div>
    </>
  );
}
