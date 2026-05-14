"use client";

import AdminUsers from "@/app/dashboard/admin/users/page";
import { FaChevronLeft } from "react-icons/fa6";

interface Props {
  backFunc: () => void;
}
export default function DashboardAdminManageUsers({ backFunc }: Props) {
  return (
    <div>
      <div
        className=" flex justify-center items-center h-[30px] w-[30px] bg-[#EFEFF1] rounded-[4px] text-textSlightDark-0"
        onClick={backFunc}
      >
        <span onClick={backFunc}>
          <FaChevronLeft size={15} />
        </span>
      </div>
      <div className="my-5">
        <AdminUsers />
      </div>
    </div>
  );
}
