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
import { LuPanelLeftClose, LuPanelRightClose } from "react-icons/lu";
import React, { useEffect, useState } from "react";
import { useI18n } from "@/app/context/I18nContext";
import { useAuthContext } from "@/app/context/AuthContext";

interface Props {
  setIsCollapsedState: React.Dispatch<React.SetStateAction<boolean>>
  // Bump this (any change in value) to force the sidenav closed — used so
  // opening the AI panel collapses the sidenav rather than the two
  // fighting for the same horizontal space.
  forceCollapseSignal?: number;
}

export default function Sidenav({ setIsCollapsedState, forceCollapseSignal }: Props) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useI18n();
  const { logout } = useAuthContext();

  useEffect(() => {
    if (forceCollapseSignal === undefined) return;
    setIsCollapsed(true);
    setIsCollapsedState(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceCollapseSignal]);

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
              alt={t("logo")}
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
        
        <nav className="flex flex-nowrap md:items-start md:justify-start justify-center items-center md:flex-col gap-1 w-full mt-0 md:mt-[2rem] overflow-x-auto md:overflow-visible no-scrollbar">
          <div className="ml-3 md:ml-0 md:w-full">
            <SidenavComponent
              path="/dashboard/student"
              label={t("Dashboard")}
              icon={
                pathname !== "/dashboard/student" ? (
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
              path="/dashboard/student/course"
              label={t("Course")}
              icon={
                pathname !== "/dashboard/student/course" ? (
                  <IoSchoolOutline size={25} />
                ) : (
                  <IoSchoolSharp size={25} color="#FFA500"/>
                )
              }
              isCollapsed={isCollapsed}
            />
          </div>

          <div className="md:w-full">
            <SidenavComponent
              path="/dashboard/student/community"
              label={t("Community")}
              icon={
                pathname !== "/dashboard/student/community" ? (
                  <RiCompass3Line size={25} />
                ) : (
                  <RiCompassFill size={25} color="#FFA500"/>
                )
              }
              isCollapsed={isCollapsed}
            />
          </div>
          
          <div className="md:w-full">
            <SidenavComponent
              path="/dashboard/student/leaderboard"
              label={t("Leaderboard")}
              icon={
                pathname !== "/dashboard/student/leaderboard" ? (
                  <MdOutlineLeaderboard size={25} />
                ) : (
                  <MdLeaderboard size={25} color="#FFA500"/>
                )
              }
              isCollapsed={isCollapsed}
            />
          </div>
          
          <div className="md:w-full">
            <SidenavComponent
              path="/dashboard/student/profile"
              label={t("Profile")}
              icon={
                pathname !== "/dashboard/student/profile" ? (
                  <FaRegUser size={25} />
                ) : (
                  <FaUser size={25} color="#FFA500"/>
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
            label={t("Logout")}
            icon={<MdLogout size={25} />}
            isCollapsed={isCollapsed}
          />
        </div>
      </div>
    </>
  );
}