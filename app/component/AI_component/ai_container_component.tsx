"use client";

import Image from "next/image";
import img from '@/public/images/ShekiAI.png'
import { GiPeaceDove } from "react-icons/gi";
import { BsFillSendFill } from "react-icons/bs";
export default function AIContainerComponent() {
  return (
    <div className=" h-full md:absolute px-5 py-4 top-0 w-full md:left-0">
      <div className="flex justify-between items-center w-full">
        <Image src={img} alt="Logo" height={30} width={30}/>
        <div>
            <span className="h-[30px] w-[30px] bg-shadyColor-0 rounded-full flex justify-center items-center text-[0.9rem] text-white">&times;</span>
        </div>
      </div>

      {/*Chat content */}
      <div></div>

      {/*Input content */}
      <div className="h-[100px] flex justify-center items-center w-full bg-red-500 absolute bottom-0 dark:bg-secondaryColors-0">
        <div>
            <div>
                <span>
                    <GiPeaceDove />
                    Prompt
                </span>
                <input type="text" placeholder="Call an action"/>
                <BsFillSendFill />
            </div>
        </div>
      </div>
    </div>
  );
}
