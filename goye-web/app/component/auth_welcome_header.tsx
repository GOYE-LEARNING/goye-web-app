"use client";
import Image from "next/image";
import logo from "@/public/images/goye-removebg-preview.png";
export default function AuthWelcomeHeader() {
  return (
    <>
      <div className="px-[48px] flex justify-center items-center font-[400]">
                <Image src={logo} alt="logo" height={100} width={100} />
        
      </div>
    </>
  );
}
