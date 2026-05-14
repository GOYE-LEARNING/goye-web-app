"use client";

import { FaArrowLeft } from "react-icons/fa";
interface Props {
  backFunction: () => void;
  header: string;
}
export default function SubHeader({ header, backFunction }: Props) {
  return (
    <>
      <div>
        <span onClick={backFunction} className="font-bold h-[28px] w-[28px] bg-secondaryColors-0 rounded-full text-white my-3 flex items-center justify-center cursor-pointer">
          <FaArrowLeft size={15}/>
        </span>
        <h1 className="text-[24px] text-primaryColors-0 font-[700] my-5">{header}</h1>
      </div>
    </>
  );
}
