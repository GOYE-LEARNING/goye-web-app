"use client";

import { motion } from "framer-motion";
import { MdCheck, MdCheckCircle, MdCircle } from "react-icons/md";
import { useRouter } from "next/navigation";
import Image from "next/image";
import gmailLOGO from "@/public/images/gmaillogo.png";
export default function LinkSent() {
  const router = useRouter();
  return (
    <>
      <div className="form_container flex justify-center items-center flex-col gap-5">
        <div className="text-green-700">
          <MdCheckCircle size={150} />
        </div>
        <h1 className="form_h1 text-[4xl]">Password Recovery link sent</h1>
        <p className="form-p text-center">
          If your address provided is associated with an account, you <br /> should
          receive a link to create a new account.
        </p>

        <span
          className="form_more bg-secondaryColors-0"
          onClick={() => router.push("../loading")}
        >
          Open Gmail{" "}
          <Image src={gmailLOGO} alt="gmail_logo" height={18} width={18} />
        </span>
      </div>
    </>
  );
}
