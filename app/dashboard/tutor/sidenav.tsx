"use client";

import SidenavComponent from "@/app/component/sidenav_component";
import Image from "next/image";
import logo from "@/public/images/goye-removebg-preview.png";
import lightLogo from "@/public/images/goye_final_logo.png"
import { MdHomeFilled, MdLogout } from "react-icons/md";
import { GoHome } from "react-icons/go";
import { IoSchoolOutline, IoSchoolSharp } from "react-icons/io5";
import { RiCompass3Line, RiCompassFill } from "react-icons/ri";
import { FaRegUser, FaUser } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { BsPeople, BsPeopleFill } from "react-icons/bs";
export default function TutorSidenav() {
  const logout = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    try {
      const res = await fetch(`${API_URL}`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        return 
      }

      await res.json()
    } catch (error) {
      console.error(error);
    }
  };
  const pathname = usePathname();
  return (
    <>
      <div className="sidenav">
        <Image
          src={lightLogo}
          alt="logo"
          height={100}
          width={100}
          className="md:block hidden"
        />
        <nav className="flex md:items-start md:justify-start justify-between items-center md:flex-col md:gap-1 w-full mt-0 md:mt-[2rem]">
          <div className="md:w-full">
            <SidenavComponent
              path="/dashboard/tutor"
              label="Dashboard"
              icon={
                pathname !== "/dashboard/tutor" ? (
                  <GoHome size={25} />
                ) : (
                  <MdHomeFilled size={25} color="#FFA500" />
                )
              }
            />
          </div>
          <div className="md:w-full">
            <SidenavComponent
              path="/dashboard/tutor/course"
              label="Course"
              icon={
                pathname !== "/dashboard/tutor/course" ? (
                  <IoSchoolOutline size={25} />
                ) : (
                  <IoSchoolSharp size={25} color="#FFA500" />
                )
              }
            />
          </div>
          <div className="md:w-full hidden md:block">
            <SidenavComponent
              path="/dashboard/tutor/student"
              label="Student"
              icon={
                pathname !== "/dashboard/tutor/student" ? (
                  <BsPeople size={25} />
                ) : (
                  <BsPeopleFill size={25} />
                )
              }
            />
          </div>
          <div className="md:w-full">
            <SidenavComponent
              path="/dashboard/tutor/community"
              label="Community"
              icon={
                pathname !== "/dashboard/tutor/community" ? (
                  <RiCompass3Line size={25} />
                ) : (
                  <RiCompassFill size={25} color="#FFA500" />
                )
              }
            />
          </div>
          <div className="md:w-full">
            <SidenavComponent
              path="/dashboard/tutor/profile"
              label="Profile"
              icon={
                pathname !== "/dashboard/tutor/profile" ? (
                  <FaRegUser size={25} />
                ) : (
                  <FaUser size={25} color="#FFA500" />
                )
              }
            />
          </div>
        </nav>
        <div className="bg-[#E2E2E2]/10 h-[1px] w-full absolute left-0 my-5 md:block hidden"></div>

        <div className="mt-10 md:block hidden md:w-full" onClick={logout}>
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
