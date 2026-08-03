"use client";

import SidenavComponent from "@/app/component/sidenav_component";
import Image from "next/image";
import logo from "@/public/images/goye-removebg-preview.png";
import lightLogo from "@/public/images/goye_final_logo.png";
import { MdHomeFilled, MdLogout } from "react-icons/md";
import { GoHome } from "react-icons/go";
import { IoSchoolOutline, IoSchoolSharp } from "react-icons/io5";
import { RiCompass3Line, RiCompassFill } from "react-icons/ri";
import { FaRegUser, FaUser } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { BsPeople, BsPeopleFill } from "react-icons/bs";
import { LuPanelLeftClose, LuPanelRightClose } from "react-icons/lu";
import React, { useEffect, useState } from "react";

interface Props {
  setIsCollapsedState: React.Dispatch<React.SetStateAction<boolean>>;
  // Bump this (any change in value) to force the sidenav closed — used so
  // opening the AI panel collapses the sidenav rather than the two
  // fighting for the same horizontal space.
  forceCollapseSignal?: number;
}

export default function TutorSidenav({ setIsCollapsedState, forceCollapseSignal }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (forceCollapseSignal === undefined) return;
    setIsCollapsed(true);
    setIsCollapsedState(true);
    // Only the signal should retrigger this — setIsCollapsedState is a
    // stable setState reference from the parent, not a dependency that
    // should force a re-run of its own effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceCollapseSignal]);

  const logout = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    try {
      const res = await fetch(`${API_URL}`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        return;
      }

      await res.json();
    } catch (error) {
      console.error(error);
    }
  };
  
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    setIsCollapsedState(!isCollapsed);
  };

  return (
    <>
      <div className={`sidenav ${isCollapsed ? 'collapsed w-[5%]' : 'md:w-[20%]'}`}>
        <div className={`w-full flex ${isCollapsed ? 'justify-center' : 'justify-between'} items-center`}>
          <div className={`${isCollapsed ? 'hidden' : 'block'}`}>
            <Image
              src={lightLogo}
              alt="logo"
              height={100}
              width={100}
              className="md:block hidden"
            />
          </div>
          <span 
            className="text-[#ccc] md:block hidden cursor-pointer hover:text-white transition-colors"
            onClick={toggleSidebar}
          >
            {isCollapsed ? <LuPanelRightClose size={24} /> : <LuPanelLeftClose size={24} />}
          </span>
        </div>
        
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
              isCollapsed={isCollapsed}
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
              isCollapsed={isCollapsed}
            />
          </div>
          
          <div className="md:w-full">
            <SidenavComponent
              path="/dashboard/tutor/student"
              label="Student"
              icon={
                pathname !== "/dashboard/tutor/student" ? (
                  <BsPeople size={25} />
                ) : (
                  <BsPeopleFill size={25} color="#FFA500" />
                )
              }
              isCollapsed={isCollapsed}
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
              isCollapsed={isCollapsed}
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
              isCollapsed={isCollapsed}
            />
          </div>
        </nav>
        
        <div className="bg-[#E2E2E2]/10 h-[1px] w-full absolute left-0 my-5 md:block hidden"></div>

        <div className="mt-10 md:block hidden md:w-full" onClick={logout}>
          <SidenavComponent
            path="/auth"
            label="Logout"
            icon={<MdLogout size={25} />}
            isCollapsed={isCollapsed}
          />
        </div>
      </div>
    </>
  );
}