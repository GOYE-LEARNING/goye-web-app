"use client";

import SidenavComponent from "@/app/component/sidenav_component";
import Image from "next/image";
import logo from "@/public/images/goye_final_logo.png";
import {
  MdGroups,
  MdHomeFilled,
  MdLogout,
  MdOutlineGroups,
} from "react-icons/md";
import { GoHome } from "react-icons/go";
import { IoSchoolOutline, IoSchoolSharp } from "react-icons/io5";
import { RiCompass3Line, RiCompassFill } from "react-icons/ri";
import { FaRegUser, FaUser, FaCalendarAlt } from "react-icons/fa";
import { useParams, usePathname } from "next/navigation";
import { LuPanelLeftClose, LuPanelRightClose } from "react-icons/lu";
import React, { useState } from "react";
interface Props {
  setIsCollapsedState: React.Dispatch<React.SetStateAction<boolean>>
}
export default function OrgAdminSidenav({setIsCollapsedState}: Props) {
  const params = useParams<{ org_name: string }>();
  const { org_name } = params;
  const [isCollapsed, setIsCollapsed] = useState(false);
  
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
    setIsCollapsedState(!isCollapsed)
  };

  return (
    <>
      <div className={`sidenav ${isCollapsed ? 'collapsed w-[5%]' : 'md:w-[20%]'}`}>
        <div className={`w-full flex ${isCollapsed ? 'justify-center' : 'justify-between'} items-center`}>
          <div className={`${isCollapsed ? 'hidden' : 'block'}`}>
            <Image
              src={logo}
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
              path={`/dashboard/${org_name}/admin`}
              label="Dashboard"
              icon={
                pathname !== `/dashboard/${org_name}/admin` ? (
                  <GoHome size={20} />
                ) : (
                  <MdHomeFilled size={20} color="#FFA500" />
                )
              }
              isCollapsed={isCollapsed}
            />
          </div>
          <div className="md:w-full">
            <SidenavComponent
              path={`/dashboard/${org_name}/admin/course`}
              label="Course"
              icon={
                pathname !== `/dashboard/${org_name}/admin/course` ? (
                  <IoSchoolOutline size={20} />
                ) : (
                  <IoSchoolSharp size={20} color="#FFA500" />
                )
              }
              isCollapsed={isCollapsed}
            />
          </div>

          <div className="md:w-full">
            <SidenavComponent
              path={`/dashboard/${org_name}/admin/event`}
              label="Events"
              icon={
                pathname !== `/dashboard/${org_name}/admin/event` ? (
                  <FaCalendarAlt size={20} />
                ) : (
                  <FaCalendarAlt size={20} color="#FFA500" />
                )
              }
              isCollapsed={isCollapsed}
            />
          </div>

          <div className="md:w-full">
            <SidenavComponent
              path={`/dashboard/${org_name}/admin/organization`}
              label="Organization"
              icon={
                pathname !== `/dashboard/${org_name}/admin/organizations` ? (
                  <MdOutlineGroups size={20} />
                ) : (
                  <MdGroups size={20} color="#FFA500" />
                )
              }
              isCollapsed={isCollapsed}
            />
          </div>
          <div className="md:w-full">
            <SidenavComponent
              path={`/dashboard/${org_name}/admin/community`}
              label="Community"
              icon={
                pathname !== `/dashboard/${org_name}/admin/community` ? (
                  <RiCompass3Line size={20} />
                ) : (
                  <RiCompassFill size={20} color="#FFA500" />
                )
              }
              isCollapsed={isCollapsed}
            />
          </div>
          <div className="md:w-full">
            <SidenavComponent
              path={`/dashboard/${org_name}/admin/profile`}
              label="Profile"
              icon={
                pathname !== `/dashboard/${org_name}/admin/profile` ? (
                  <FaRegUser size={20} />
                ) : (
                  <FaUser size={20} color="#FFA500" />
                )
              }
              isCollapsed={isCollapsed}
            />
          </div>
        </nav>
        <div className="bg-[#ccc]/20 h-[1px] w-full absolute left-0 my-5 md:block hidden"></div>

        <div className="mt-10 md:block hidden md:w-full" onClick={logout}>
          <SidenavComponent
            path="/"
            label="Logout"
            icon={<MdLogout size={20} />}
            isCollapsed={isCollapsed}
          />
        </div>
      </div>
    </>
  );
}