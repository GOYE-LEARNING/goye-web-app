"use client";

import DashboardSearch from "@/app/component/dashboard_search";
import DashboardTutorActive from "@/app/component/dashboard_tutor_active";
import DashboardTutorInActive from "@/app/component/dashboard_tutor_activeinactive";
import DashboardTutorActiveTab from "@/app/component/dashboard_tutor_selection";
import DashboardTutorAllTab from "@/app/component/dashboard_tutor_alltab";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DashboardTutorStudentDetails from "@/app/component/dashboard_tutor_student_details";
import Portal from "@/app/component/Portal";
import { useI18n } from "@/app/context/I18nContext";

export default function TutorStudent() {
  const { t } = useI18n();
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
        <h1 className="dashboard_h1">{t("Student")}</h1>
        <DashboardSearch
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("Search students...")}
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
        <Portal>
          <AnimatePresence onExitComplete={() => setStudentId("")}>
            {showStudentDetails && studentId && (
              <motion.div key="student-details-wrap">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="fixed inset-0 bg-black/50 z-40"
                  onClick={() => setShowStudentDetails(false)}
                />
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="fixed top-0 right-0 h-full md:w-[390px] w-full z-50 drop-shadow-2xl"
                >
                  <DashboardTutorStudentDetails
                    studentId={studentId}
                    cancel={() => setShowStudentDetails(false)}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </Portal>
      </div>
    </>
  );
}
