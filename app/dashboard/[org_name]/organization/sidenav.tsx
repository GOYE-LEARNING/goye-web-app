"use client";

import SidenavComponent from "@/app/component/sidenav_component";
import Image from "next/image";
import logo from "@/public/images/goye_final_logo.png";
import {
  MdGroup,
  MdGroups,
  MdHomeFilled,
  MdLogout,
  MdOutlineGroup,
  MdOutlineGroups,
} from "react-icons/md";
import { GoHome } from "react-icons/go";
import { IoSchoolOutline, IoSchoolSharp } from "react-icons/io5";
import { RiCompass3Line, RiCompassFill } from "react-icons/ri";
import { FaRegUser, FaUser } from "react-icons/fa";
import { useParams, usePathname } from "next/navigation";
import { LuPanelLeftClose, LuPanelRightClose } from "react-icons/lu";
import { useState } from "react";
import { useAuthContext } from "@/app/context/AuthContext";

interface Props {
  setIsCollapsedState: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function OrgSidenav({ setIsCollapsedState }: Props) {
  const params = useParams<{ org_name: string }>();
  const { org_name } = params;
  // Hand-rolled logout replaced with the shared context one, so the local
  // session/localStorage is actually cleared rather than just pinging the API.
  const { logout } = useAuthContext();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    setIsCollapsedState(!isCollapsed);
  };

  return (
    <>
      {/* Same missing-width bug as /dashboard/admin: `.sidenav` defaults to
          w-full, so without md:w-[20%] this covered the whole page. */}
      <div className={`sidenav ${isCollapsed ? "collapsed w-[5%]" : "md:w-[20%]"}`}>
        <div className={`w-full flex ${isCollapsed ? "justify-center" : "justify-between"} items-center`}>
          <div className={`${isCollapsed ? "hidden" : "block"}`}>
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
          <div className="w-full">
            <SidenavComponent
              path={`/dashboard/${org_name}/organization`}
              label="Dashboard"
              icon={
                pathname !== `/dashboard/${org_name}/organization` ? (
                  <GoHome size={25} />
                ) : (
                  <MdHomeFilled size={25} color="#FFA500" />
                )
              }
            isCollapsed={isCollapsed}
            />
          </div>
          <div className="w-full">
            <SidenavComponent
              path={`/dashboard/${org_name}/organization/course`}
              label="Course"
              icon={
                pathname !== `/dashboard/${org_name}/organization/course` ? (
                  <IoSchoolOutline size={25} />
                ) : (
                  <IoSchoolSharp size={25} color="#FFA500" />
                )
              }
            isCollapsed={isCollapsed}
            />
          </div>

          <div className="w-full">
            <SidenavComponent
              path={`/dashboard/${org_name}/organization/community`}
              label="Community"
              icon={
                pathname !== `/dashboard/${org_name}/organization/community` ? (
                  <RiCompass3Line size={25} />
                ) : (
                  <RiCompassFill size={25} color="#FFA500" />
                )
              }
            isCollapsed={isCollapsed}
            />
          </div>
          <div className="w-full">
            <SidenavComponent
              path={`/dashboard/${org_name}/organization/profile`}
              label="Profile"
              icon={
                pathname !== `/dashboard/${org_name}/organization/profile` ? (
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
          {" "}
          <SidenavComponent
            path="/"
            label="Logout"
            icon={<MdLogout size={25} />}
            isCollapsed={isCollapsed}
          />
        </div>
      </div>
    </>
  );
}
