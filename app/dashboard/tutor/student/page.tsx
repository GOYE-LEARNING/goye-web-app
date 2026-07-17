"use client";

import DashboardSearch from "@/app/component/dashboard_search";
import DashboardTutorActive from "@/app/component/dashboard_tutor_active";
import DashboardTutorInActive from "@/app/component/dashboard_tutor_activeinactive";
import DashboardTutorActiveTab from "@/app/component/dashboard_tutor_selection";
import DashboardTutorAllTab from "@/app/component/dashboard_tutor_alltab";
import { useState } from "react";
import DashboardTutorStudentDetails from "@/app/component/dashboard_tutor_student_details";

export default function TutorStudent() {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive">(
    "all"
  );
  const [showStudentDetails, setShowStudentDetails] = useState<boolean>(false);
  const handleClickTab = (tab: "all" | "active" | "inactive") => {
    setActiveTab(tab);
  };

  const [search, setSearch] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const openStudentDetails = (id: string) => {
    setStudentId(id);
    setShowStudentDetails(true);
  };
  return (
    <>
      <div>
        <h1 className="dashboard_h1">Student</h1>
        <DashboardSearch
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students..."
        />
        <DashboardTutorActiveTab
          allFunc={() => handleClickTab("all")}
          activeFunc={() => handleClickTab("active")}
          inActiveFunc={() => handleClickTab("inactive")}
        />
        <div className="my-5">
          {activeTab == "all" ? (
            <DashboardTutorAllTab
              search={search}
              openStudent={openStudentDetails}
            />
          ) : activeTab == "active" ? (
            <DashboardTutorActive openStudent={openStudentDetails} />
          ) : activeTab == "inactive" ? (
            <DashboardTutorInActive openStudent={openStudentDetails} />
          ) : (
            ""
          )}
        </div>

        {/* Sidebar Panel - Portal overlay */}
        {showStudentDetails && studentId && (
          <>
            {/* Overlay backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => {
                setShowStudentDetails(false)
                setStudentId("")
              }}
            />
            {/* Sidebar */}
            <div
              className={`fixed top-0 right-0 h-full md:w-[390px] w-full bg-white dark:bg-secondaryColors-0 transform transition-transform duration-300 ease-in-out z-50
              ${showStudentDetails ? "translate-x-0" : "translate-x-full"}`}
            >
              <DashboardTutorStudentDetails
                studentId={studentId}
                cancel={() => {
                  setShowStudentDetails(false)
                  setStudentId("")
                }}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
