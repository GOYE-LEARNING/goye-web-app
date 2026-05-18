"use client";

import { useParams, usePathname } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
interface Props {
  backFunction: () => void;
  header: string;
}
export default function SubHeader({ header, backFunction }: Props) {
  const pathname = usePathname();
  const params = useParams<{ org_name: string }>();
  const path = [
    "dashboard/student/profile",
    "dashboard/tutor/profile",
    "dashboard/student/profile",
    `dashboard/${params.org_name}/admin`,
    `dashboard/${params.org_name}/organization`,
  ];
  return (
    <>
      <div>
        {path.includes(pathname) ? (
          ""
        ) : (
          <span
            onClick={backFunction}
            className="font-bold h-[28px] w-[28px] dark:bg-secondaryColors-0 bg-white rounded-full dark:text-white text-lightBoldText-0 my-3 flex items-center justify-center cursor-pointer"
          >
            <FaArrowLeft size={15} />
          </span>
        )}
        <h1 className="text-[24px] text-primaryColors-0 font-[700] my-5">
          {header}
        </h1>
      </div>
    </>
  );
}
