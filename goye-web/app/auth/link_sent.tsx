"use client";

import { motion } from "framer-motion";
import Pic from '@/public/images/mailbox.png'
import { useRouter } from "next/navigation";
import Image from "next/image";
import gmailLOGO from "@/public/images/gmaillogo.png";
export default function LinkSent() {
  const router = useRouter();
  return (
    <>
      <div className="form_container">
        <div className="flex justify-center items-center  gap-5 flex-col w-full">
          <div className="h-[100px] w-[100px] rounded-full bg-[#49151B0D] flex justify-center items-center">
           <Image src={Pic} alt="pic" height={45} width={45}/>
          </div>
          <h1 className="form_h1 text-center text-[4xl]">Password Recovery link sent</h1>
          <p className="form-p text-center">
            If your address provided is associated with an account, you <br />{" "}
            should receive a link to create a new account.
          </p>

          <span
            className="form_more bg-secondaryColors-0 cursor-pointer"
            onClick={() => router.push("https://mail.google.com")}
          >
            Open Gmail{" "}
            <Image src={gmailLOGO} alt="gmail_logo" height={18} width={18} />
          </span>
        </div>
      </div>
    </>
  );
}
