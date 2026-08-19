"use client";

import SidenavComponent from "@/app/component/sidenav_component";
import Image from "next/image";
import logo from "@/public/images/goye_final_logo.png";
import { MdHomeFilled, MdLogout } from "react-icons/md";
import { GoHome } from "react-icons/go";
import { IoSchoolOutline, IoSchoolSharp } from "react-icons/io5";
import { RiCompass3Line, RiCompassFill } from "react-icons/ri";
import { FaRegUser, FaUser } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { BsPeople, BsPeopleFill } from "react-icons/bs";
import { LuPanelLeftClose, LuPanelRightClose } from "react-icons/lu";
import { useState } from "react";
import { useAuthContext } from "@/app/context/AuthContext";

interface Props {
  setIsCollapsedState: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AdminSidenav({ setIsCollapsedState }: Props) {
  // Was a hand-rolled fetch to `${API_URL}` with no path at all — it POSTed
  // to the API root, ignored the result, and never cleared the session.
  // Uses the same context logout every other sidenav does now.
  const { logout } = useAuthContext();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    setIsCollapsedState(!isCollapsed);
  };

  return (
    <>
      {/* `.sidenav` is `w-full` by default and every sidenav is expected to
          supply its own desktop width — this one didn't, so on /dashboard/admin
          it stayed full-bleed and covered the entire page. */}
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
          <div className="md:w-full">
            <SidenavComponent
              path="/dashboard/admin"
              label="Dashboard"
              icon={
                pathname !== "/dashboard/admin" ? (
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
              path="/dashboard/admin/course"
              label="Course"
              icon={
                pathname !== "/dashboard/admin/course" ? (
                  <IoSchoolOutline size={25} />
                ) : (
                  <IoSchoolSharp size={25} color="#FFA500" />
                )
              }
              isCollapsed={isCollapsed}
            />
          </div>
          <div className="md:w-full hidden md:block">
            <SidenavComponent
              path="/dashboard/admin/users"
              label="Users"
              icon={
                pathname !== "/dashboard/admin/users" ? (
                  <BsPeople size={25} />
                ) : (
                  <BsPeopleFill size={25} />
                )
              }
              isCollapsed={isCollapsed}
            />
          </div>
          <div className="md:w-full">
            <SidenavComponent
              path="/dashboard/admin/community"
              label="Community"
              icon={
                pathname !== "/dashboard/admin/community" ? (
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
              path="/dashboard/admin/profile"
              label="Profile"
              icon={
                pathname !== "/dashboard/admin/profile" ? (
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
