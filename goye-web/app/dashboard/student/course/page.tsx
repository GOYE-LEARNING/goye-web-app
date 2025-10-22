"use client";

import DashboardCourseAll from "@/app/component/dashboard_course_all";
import DashboardCourseDone from "@/app/component/dashboard_course_done";
import DashboardCourseEnrolled from "@/app/component/dashboard_course_enroll";
import DashboardCourseSaved from "@/app/component/dashboard_course_saved";
import SearchCourse from "@/app/component/dashboard_search_course";
import DashboardTabSelection from "@/app/component/dashboard_tab_selection";
import { useState } from "react";

export default function MainContainer() {
  const [all, setAll] = useState<boolean>(true);
  const [enrolled, setEnrolled] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [done, setDone] = useState<boolean>(false);

  const allFunc = () => {
    setAll(true);
    setEnrolled(false);
    setSaved(false);
    setDone(false);
  };

  const enrolledFunc = () => {
    setAll(false);
    setEnrolled(true);
    setSaved(false);
    setDone(false);
  };

  const savedFunc = () => {
    setAll(false);
    setEnrolled(false);
    setSaved(true);
    setDone(false);
  };

  const doneFunc = () => {
    setAll(false);
    setEnrolled(false);
    setSaved(false);
    setDone(true);
  };
  return (
    <>
      <div>
        <h1 className="dashboard_h1">Courses</h1>
        <SearchCourse placeholder="Search courses"/>
        <DashboardTabSelection
          allFunc={allFunc}
          enrolledFunc={enrolledFunc}
          savedFunc={savedFunc}
          doneFunc={doneFunc}
        />
        {all && <DashboardCourseAll />}
        {enrolled && <DashboardCourseEnrolled />}
        {saved && <DashboardCourseSaved />}
        {done && <DashboardCourseDone />}
      </div>
    </>
  );
}
