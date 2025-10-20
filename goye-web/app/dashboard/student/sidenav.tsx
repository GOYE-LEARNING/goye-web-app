"use client";

import SidenavComponent from "@/app/component/sidenav_conponent";
import Image from "next/image";
import logo from "@/public/images/goye-removebg-preview.png";
import { MdHomeFilled, MdLogout } from "react-icons/md";
import { GoHome } from "react-icons/go";
import { IoSchoolOutline, IoSchoolSharp } from "react-icons/io5";
import { RiCompass3Line, RiCompassFill } from "react-icons/ri";
import { FaRegUser, FaUser } from "react-icons/fa";
import { usePathname } from "next/navigation";
export default function Sidenav() {
  const pathname = usePathname();
  return (
    <>
      <div className="sidenav">
        <Image src={logo} alt="logo" height={100} width={100} />
        <nav className="flex flex-col gap-1">
          <div>
            <SidenavComponent
              path="/dashboard/student"
              label="Dashboard"
              icon={
                pathname !== "/dashboard/student" ? (
                  <GoHome size={25} />
                ) : (
                  <MdHomeFilled size={25} color="#3F1F22" />
                )
              }
            />
          </div>
          <div>
            <SidenavComponent
              path="/dashboard/student/course"
              label="Course"
              icon={
                pathname !== "/dashboard/student/course" ? (
                  <IoSchoolOutline size={25} />
                ) : (
                  <IoSchoolSharp size={25} color="#3F1F22"/>
                )
              }
            />
          </div>
          <div>
            <SidenavComponent
              path="/dashboard/student/community"
              label="Community"
              icon={
                pathname !== "/dashboard/student/community" ? (
                  <RiCompass3Line size={25} />
                ) : (
                  <RiCompassFill size={25} color="#3F1F22"/>
                )
              }
            />
          </div>
          <div>
            <SidenavComponent
              path="/dashboard/student/profile"
              label="Profile"
              icon={
                pathname !== "/dashboard/student/profile" ? (
                  <FaRegUser size={25} />
                ) : (
                  <FaUser size={25} color="#3F1F22"/>
                )
              }
            />
          </div>
        </nav>
        <div className="bg-[#E2E2E2] h-[1px] w-full absolute left-0 my-5"></div>

        <div className="mt-10">
          {" "}
          <SidenavComponent
            path="/"
            label="Logout"
            icon={<MdLogout size={25} />}
          />
        </div>
      </div>
    </>
  );
}
