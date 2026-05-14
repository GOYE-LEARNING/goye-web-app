"use client";

import SidenavComponent from "@/app/component/sidenav_component";
import Image from "next/image";
import lightLogo from "@/public/images/goye_final_logo.png";
import { MdHomeFilled, MdLeaderboard, MdLogout, MdOutlineChatBubble, MdOutlineChatBubbleOutline, MdOutlineLeaderboard } from "react-icons/md";
import { GoHome } from "react-icons/go";
import { IoSchoolOutline, IoSchoolSharp } from "react-icons/io5";
import { RiCompass3Line, RiCompassFill } from "react-icons/ri";
import { FaRegUser, FaUser } from "react-icons/fa";
import { usePathname } from "next/navigation";
export default function Sidenav() {
  const pathname = usePathname();
    const logout = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    try {
      const res = await fetch(`${API_URL}/api/user/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        return;
      }

      const data = await res.json();
      console.log(data)
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <>
      <div className="sidenav">
        <Image src={lightLogo} alt="logo" height={100} width={100} className="md:block hidden"/>
        <nav className="flex md:items-start md:justify-start justify-between items-center md:flex-col gap-1 w-full mt-0 md:mt-[2rem]">
          <div className="w-full">
            <SidenavComponent
              path="/dashboard/student"
              label="Dashboard"
              icon={
                pathname !== "/dashboard/student" ? (
                  <GoHome size={25} />
                ) : (
                  <MdHomeFilled size={25} color="#FFA500" />
                )
              }
            />
          </div>
          <div className="w-full">
            <SidenavComponent
              path="/dashboard/student/course"
              label="Course"
              icon={
                pathname !== "/dashboard/student/course" ? (
                  <IoSchoolOutline size={25} />
                ) : (
                  <IoSchoolSharp size={25} color="#FFA500"/>
                )
              }
            />
          </div>

          <div className="w-full">
            <SidenavComponent
              path="/dashboard/student/community"
              label="Community"
              icon={
                pathname !== "/dashboard/student/community" ? (
                  <RiCompass3Line size={25} />
                ) : (
                  <RiCompassFill size={25} color="#FFA500"/>
                )
              }
            />
          </div>
             <div className="w-full">
            <SidenavComponent
              path="/dashboard/student/leaderboard"
              label="Leaderboard"
              icon={
                pathname !== "/dashboard/student/leaderboard" ? (
                  <MdOutlineLeaderboard size={25} />
                ) : (
                  <MdLeaderboard size={25} color="#FFA500"/>
                )
              }
            />
          </div>
          <div className="w-full">
            <SidenavComponent
              path="/dashboard/student/profile"
              label="Profile"
              icon={
                pathname !== "/dashboard/student/profile" ? (
                  <FaRegUser size={25} />
                ) : (
                  <FaUser size={25} color="#FFA500"/>
                )
              }
            />
          </div>
        </nav>
        <div className="bg-[#E2E2E2]/10 h-[1px] w-full absolute left-0 my-5 md:block hidden"></div>

        <div className="mt-10 md:block hidden w-full" onClick={logout}>
          {" "}
          <SidenavComponent
            path="/auth"
            label="Logout"
            icon={<MdLogout size={25} />}
          />
        </div>
      </div>
    </>
  );
}
