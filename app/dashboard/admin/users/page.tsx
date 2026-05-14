"use client";

import DashboardSearch from "@/app/component/dashboard_search";
import AdminGetRoles from "@/app/component/admin_component/dashboard_admin_allRoles";
import AdminGetStudent from "@/app/component/admin_component/dashboard_admin_getStudents";
import AdminGetInstructor from "@/app/component/admin_component/dashboard_admin_getInstructor";
import { useEffect, useRef, useState } from "react";
import DashboardAdminTab from "@/app/component/admin_component/dashboard_admin_active_tabs";
import DashboardAdminUserDetails from "@/app/component/admin_component/dashboard_admin_user_details";
import SuspendUserModal from "@/app/component/admin_component/dashboard_admin_suspend_user";
import { AnimatePresence, motion } from "framer-motion";

export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState<"all" | "student" | "instructor">(
    "all"
  );
  const [showUserDetails, setShowUserDetails] = useState<boolean>(false);
  const handleClickTab = (tab: "all" | "student" | "instructor") => {
    setActiveTab(tab);
  };

  const [showSuspendModal, setShowSuspendUserModal] = useState<boolean>(false);
  const [suspendUser, setSuspendUser] = useState<boolean>(false)
  const [search, setSearch] = useState<string>("");
  const [userId, setUserId] = useState<string>("");


  const openUserDetails = (id: string) => {
    setUserId(id);
    setShowUserDetails(true);
  };
  return (
    <>
      <AnimatePresence mode="wait">
        {showSuspendModal && (
          <SuspendUserModal
            removeUser={() => {
                setSuspendUser(true)
                setShowSuspendUserModal(false);
            }}
            cancelFunc={(e?: any) => {
              e.stopPropagation();
              setShowSuspendUserModal(false);
            }}
          />
        )}
      </AnimatePresence>
      <div>
        <h1 className="dashboard_h1">Users</h1>
        <DashboardSearch
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Users..."
        />
        <DashboardAdminTab
          allFunc={() => handleClickTab("all")}
          studentFunc={() => handleClickTab("student")}
          tutorFunc={() => handleClickTab("instructor")}
        />
        <div className="my-5">
          {activeTab == "all" ? (
            <AdminGetRoles
              openUserDetails={() => setShowUserDetails(!showUserDetails)}
            />
          ) : activeTab == "student" ? (
            <AdminGetStudent />
          ) : activeTab == "instructor" ? (
            <AdminGetInstructor />
          ) : (
            ""
          )}
        </div>

        {/* Sidebar Panel */}

        <div
 
          className={`fixed top-0 right-0 h-full bg-white md:w-[390px] w-full transform transition-transform duration-300 ease-in-out
            ${showUserDetails ? "translate-x-0" : "translate-x-full"}`}
        >
          <DashboardAdminUserDetails
          checkSuspendedUser={suspendUser}
            suspendUserFunc={() => {
              setShowSuspendUserModal(true);

            }}
            userId={userId}
            cancel={() => setShowUserDetails(false)}
          />{" "}
        </div>
      </div>
    </>
  );
}
