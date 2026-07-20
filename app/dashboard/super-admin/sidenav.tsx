"use client";

import SidenavComponent from "@/app/component/sidenav_component";
import Image from "next/image";
import logo from "@/public/images/goye-removebg-preview.png";
import { MdHomeFilled, MdLogout } from "react-icons/md";
import { GoHome } from "react-icons/go";
import { HiOutlineOfficeBuilding, HiOfficeBuilding } from "react-icons/hi";
import { BsActivity } from "react-icons/bs";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/app/context/AuthContext";

export default function SuperAdminSidenav() {
  const pathname = usePathname();
  const { logout } = useAuthContext();

  return (
    <div className="sidenav">
      <Image
        src={logo}
        alt="logo"
        height={100}
        width={100}
        className="md:block hidden"
      />
      <nav className="flex md:items-start md:justify-start justify-between items-center md:flex-col md:gap-1 w-full mt-0 md:mt-[2rem]">
        <div className="md:w-full">
          <SidenavComponent
            path="/dashboard/super-admin"
            label="Overview"
            icon={
              pathname !== "/dashboard/super-admin" ? (
                <GoHome size={25} />
              ) : (
                <MdHomeFilled size={25} color="#FFA500" />
              )
            }
          />
        </div>
        <div className="md:w-full">
          <SidenavComponent
            path="/dashboard/super-admin/organizations"
            label="Organizations"
            icon={
              pathname !== "/dashboard/super-admin/organizations" ? (
                <HiOutlineOfficeBuilding size={25} />
              ) : (
                <HiOfficeBuilding size={25} color="#FFA500" />
              )
            }
          />
        </div>
        <div className="md:w-full">
          <SidenavComponent
            path="/dashboard/super-admin/activity"
            label="Activity"
            icon={
              <BsActivity
                size={25}
                color={pathname === "/dashboard/super-admin/activity" ? "#FFA500" : undefined}
              />
            }
          />
        </div>
      </nav>
      <div className="bg-[#E2E2E2]/10 h-[1px] w-full absolute left-0 my-5 md:block hidden"></div>

      <div className="mt-10 md:block hidden md:w-full" onClick={logout}>
        <SidenavComponent
          path="/"
          label="Logout"
          icon={<MdLogout size={25} />}
        />
      </div>
    </div>
  );
}
