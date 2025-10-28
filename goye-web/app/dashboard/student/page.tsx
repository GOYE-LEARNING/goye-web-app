"use client";
import DashboardStudentAnnouncement from "@/app/component/dashboard_student_announcement";
import DashboardStudentCourse from "@/app/component/dashboard_student_course";
import DashboardStudentEvent from "@/app/component/dashboard_student_event";
import DashboardStudentGrowth from "@/app/component/dashboard_student_growth";
import { useState } from "react";
import StudentGrowth from "./student-growth/student_growth";
import UpcomingEvents from "./upcoming-events/upcoming_event";

export default function Dashboard() {
  const [showGrowth, setShowGrowth] = useState<boolean>(false);
  const [showDashboard, setShowDashboard] = useState<boolean>(true);
  const [showEvents, setShowEvent] = useState<boolean>(false)
  const openGrowth = () => {
    setShowGrowth(true);
    setShowDashboard(false);
    setShowEvent(false)
  };

  const openDashboard = () => {
    setShowGrowth(false);
    setShowDashboard(true);
    setShowEvent(false)
  };

  const openEvents = () => {
    setShowGrowth(false);
    setShowDashboard(false);
    setShowEvent(true)
  }

  const openCourse = () => {}
  return (
    <>
      <div>
        {" "}
        {showDashboard && (
          <>
            {" "}
            <h1 className="dashboard_h1">Dashboard</h1>
            <DashboardStudentAnnouncement />
            <DashboardStudentCourse openCourse={openCourse}/>
            <DashboardStudentGrowth openGrowth={openGrowth} />
            <DashboardStudentEvent openEvent={openEvents}/>
          </>
        )}
        {showGrowth && <StudentGrowth backFunc={openDashboard} />}
        {showEvents && <UpcomingEvents backFunc={openDashboard}/>}
      </div>
    </>
  );
}
