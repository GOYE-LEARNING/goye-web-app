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
import { PiPlus } from "react-icons/pi";
import DashboardOrgAdminInviteMembers from "@/app/component/organization_component/dashboard_org_admin_invite_members";

export default function OrgAdminUsers() {
  const [activeTab, setActiveTab] = useState<"all" | "member" | "instructor">(
    "all",
  );
  const [showUserDetails, setShowUserDetails] = useState<boolean>(false);
  const handleClickTab = (tab: "all" | "member" | "instructor") => {
    setActiveTab(tab);
  };

  const [showSuspendModal, setShowSuspendUserModal] = useState<boolean>(false);
  const [showInviteMemberComponent, setShowInviteMemberComponent] =
    useState<boolean>(true);
  const [showOrganizationContainer, setShowOrganizationContainer] =
    useState<boolean>(false);
  const [suspendUser, setSuspendUser] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  const openUserDetails = (id: string) => {
    setUserId(id);
    setShowUserDetails(true);
  };

  const openInviteMemberFunc = () => {
    setShowInviteMemberComponent(true);
    setShowOrganizationContainer(false);
  };

  const backToOrg = () => {
    setShowInviteMemberComponent(false);
    setShowOrganizationContainer(true);
  };
  return (
    <>
      <AnimatePresence mode="wait">
        {showSuspendModal && (
          <SuspendUserModal
            removeUser={() => {
              setSuspendUser(true);
              setShowSuspendUserModal(false);
            }}
            cancelFunc={(e?: any) => {
              e.stopPropagation();
              setShowSuspendUserModal(false);
            }}
          />
        )}

        {showOrganizationContainer && (
          <motion.div
            key="organization-container"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.2, ease: "easeIn" }}
          >
            <h1 className="dashboard_h1">Organization</h1>
            <div className="flex items-center justify-between gap-5">
              <div className="w-[80%]">
                <DashboardSearch
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Members..."
                />
              </div>
              <button
                onClick={openInviteMemberFunc}
                className="bg-primaryColors-0 text-plainColors-0 w-[20%] py-2 rounded text-[0.9rem] hover:text-primaryColors-0 hover:bg-primaryColors-0/35 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <PiPlus color="white" size={16} />
                <p>Invite People</p>
              </button>
            </div>
            <DashboardAdminTab
              allFunc={() => handleClickTab("all")}
              studentFunc={() => handleClickTab("member")}
              tutorFunc={() => handleClickTab("instructor")}
            />
            <div className="my-5">
              {activeTab == "all" ? (
                <AdminGetRoles
                  openUserDetails={() => setShowUserDetails(!showUserDetails)}
                />
              ) : activeTab == "member" ? (
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
          </motion.div>
        )}

        {showInviteMemberComponent && (
          <motion.div
            key="invite-container"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2, ease: "easeIn" }}
            className="w-full min-h-screen"
          >
            <DashboardOrgAdminInviteMembers backFunction={backToOrg} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
