"use client";
import DashboardCourseSubHeader from "@/app/component/dashboard_course_subhead";
import SubHeader from "@/app/component/dashboard_subheader";
import Image from "next/image";
import overviewPic from "@/public/images/overview.png";
import { useState } from "react";
export default function Course() {
  const [showOverView, setShowOverView] = useState<boolean>(true);
  const [showQuizzes, setShowQuizzes] = useState<boolean>(false);
  const [showMaterials, setShowMaterials] = useState<boolean>(false);
  const [showForums, setShowForums] = useState<boolean>(false);
  
  const backFunction = () => {};
  const overview = () => {};
  const quizzes = () => {};
  const materials = () => {};
  const forums = () => {};
  return (
    <>
      {" "}
      <SubHeader
        backFunction={backFunction}
        header="Foundation Of Discipleship"
      />
      <DashboardCourseSubHeader
        level="Beginner"
        video="1hr 30min - 12 lessons"
      />
      <div>
        <div className="w-full my-5 bg-[#ccc]">
          <Image
            src={overviewPic}
            alt="pic"
            className="object-conver h-[300px] w-full"
          />
        </div>
        <div className="w-full flex items-start gap-3">
          <button className="dashboard_course_btns">Overview</button>
          <button className="dashboard_course_btns">Quizzes</button>
          <button className="dashboard_course_btns">Materials</button>
          <button className="dashboard_course_btns">Forums</button>
        </div>
      </div>
    </>
  );
}
