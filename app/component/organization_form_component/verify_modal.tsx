"use client";

import React from "react";
import { IoIosWarning } from "react-icons/io";
interface Props {
    icon: React.ReactNode
    header: string
    text: React.ReactElement
    cancel: () => void
}
export default function VerifyModal({icon, header, text, cancel} : Props) {
  return (
    <div className="fixed h-full w-full top-0 left-0 md:rounded-[30px] bg-white/35 backdrop-blur-md flex justify-center items-center flex-col z-40" onClick={cancel}>
      <div className="md:w-[400px] w-[340px] bg-white p-[20px] rounded-[20px] drop-shadow-2xl flex justify-center items-center flex-col gap-3">
        {icon}
        <h1 className="text-[24px] text-center font-bold text-textSlightDark-0">{header}</h1>
        <div className="text-nearTextColors-0 text-[14px]">{text}</div>
      </div>
    </div>
  );
}
