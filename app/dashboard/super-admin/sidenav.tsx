"use client";

import SidenavComponent from "@/app/component/sidenav_component";
import Image from "next/image";
import logo from "@/public/images/goye_final_logo.png";
import { MdHomeFilled, MdLogout, MdCampaign } from "react-icons/md";
import { GoHome } from "react-icons/go";
import { HiOutlineOfficeBuilding, HiOfficeBuilding } from "react-icons/hi";
import { IoSchoolOutline, IoSchoolSharp } from "react-icons/io5";
import { BsActivity, BsPeople, BsPeopleFill, BsCalendarEvent, BsCalendarEventFill } from "react-icons/bs";
import { HiOutlineChatAlt2, HiChatAlt2 } from "react-icons/hi";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/app/context/AuthContext";
import { LuPanelLeftClose, LuPanelRightClose } from "react-icons/lu";
import React, { useState } from "react";
import { useI18n } from "@/app/context/I18nContext";

interface Props {
  setIsCollapsedState: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SuperAdminSidenav({ setIsCollapsedState }: Props) {
  const pathname = usePathname();
  const { logout } = useAuthContext();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useI18n();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    setIsCollapsedState(!isCollapsed);
  };

  return (
    <div className={`sidenav ${isCollapsed ? 'collapsed w-[5%]' : 'md:w-[20%]'}`}>
      <div className={`w-full flex ${isCollapsed ? 'justify-center' : 'justify-between'} items-center`}>
        <div className={`${isCollapsed ? 'hidden' : 'block'}`}>
          <Image
            src={logo}
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

      <nav className="flex md:items-start md:justify-start justify-between items-center md:flex-col md:gap-1 w-full mt-0 md:mt-[2rem]">
        <div className="ml-3 md:ml-0 md:w-full">
          <SidenavComponent
            path="/dashboard/super-admin"
            label={t("Overview")}
            icon={
              pathname !== "/dashboard/super-admin" ? (
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
            path="/dashboard/super-admin/organizations"
            label={t("Organizations")}
            icon={
              pathname !== "/dashboard/super-admin/organizations" ? (
                <HiOutlineOfficeBuilding size={25} />
              ) : (
                <HiOfficeBuilding size={25} color="#FFA500" />
              )
            }
            isCollapsed={isCollapsed}
          />
        </div>
        <div className="md:w-full">
          <SidenavComponent
            path="/dashboard/super-admin/users"
            label={t("Users")}
            icon={
              pathname !== "/dashboard/super-admin/users" ? (
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
            path="/dashboard/super-admin/courses"
            label={t("Courses")}
            icon={
              pathname !== "/dashboard/super-admin/courses" ? (
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
            path="/dashboard/super-admin/events"
            label={t("Events")}
            icon={
              pathname !== "/dashboard/super-admin/events" ? (
                <BsCalendarEvent size={22} />
              ) : (
                <BsCalendarEventFill size={22} color="#FFA500" />
              )
            }
            isCollapsed={isCollapsed}
          />
        </div>
        <div className="md:w-full">
          <SidenavComponent
            path="/dashboard/super-admin/announcements"
            label={t("Announce")}
            icon={
              <MdCampaign
                size={26}
                color={pathname === "/dashboard/super-admin/announcements" ? "#FFA500" : undefined}
              />
            }
            isCollapsed={isCollapsed}
          />
        </div>
        <div className="md:w-full">
          <SidenavComponent
            path="/dashboard/super-admin/activity"
            label={t("Activity")}
            icon={
              <BsActivity
                size={25}
                color={pathname === "/dashboard/super-admin/activity" ? "#FFA500" : undefined}
              />
            }
            isCollapsed={isCollapsed}
          />
        </div>
        <div className="md:w-full">
          <SidenavComponent
            path="/dashboard/super-admin/feedback"
            label={t("Feedback")}
            icon={
              pathname !== "/dashboard/super-admin/feedback" ? (
                <HiOutlineChatAlt2 size={25} />
              ) : (
                <HiChatAlt2 size={25} color="#FFA500" />
              )
            }
            isCollapsed={isCollapsed}
          />
        </div>
      </nav>
      <div className="bg-[#E2E2E2]/10 h-[1px] w-full absolute left-0 my-5 md:block hidden"></div>

      <div className="mt-10 md:block hidden md:w-full" onClick={logout}>
        <SidenavComponent
          path="/"
          label={t("Logout")}
          icon={<MdLogout size={25} />}
          isCollapsed={isCollapsed}
        />
      </div>
    </div>
  );
}
