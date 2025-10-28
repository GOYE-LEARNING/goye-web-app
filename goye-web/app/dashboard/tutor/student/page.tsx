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

  const openStudentDetails = () => {
    setShowStudentDetails(true);
  };
  return (
    <>
      <div>
        <h1 className="dashboard_h1">Student</h1>
        <DashboardSearch placeholder="Search students..." />
        <DashboardTutorActiveTab
          allFunc={() => handleClickTab("all")}
          activeFunc={() => handleClickTab("active")}
          inActiveFunc={() => handleClickTab("inactive")}
        />
        <div className="my-5">
          {activeTab == "all" ? (
            <DashboardTutorAllTab openStudent={openStudentDetails} />
          ) : activeTab == "active" ? (
            <DashboardTutorActive />
          ) : activeTab == "inactive" ? (
            <DashboardTutorInActive />
          ) : (
            ""
          )}
        </div>

        {/* Sidebar Panel */}
        <div
          className={`fixed top-0 right-0 h-full bg-white w-[390px] transform transition-transform duration-300 ease-in-out
            ${showStudentDetails ? "translate-x-0" : "translate-x-full"}`}
        >
          <DashboardTutorStudentDetails
            cancel={() => setShowStudentDetails(false)}
          />{" "}
        </div>
      </div>
    </>
  );
}
