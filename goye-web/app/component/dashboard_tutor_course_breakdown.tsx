"use client";

import { FaAngleDoubleUp, FaVideo } from "react-icons/fa";
import DashboardSubHeaderMore from "./dashboard_subheaderMore";
import Image from "next/image";
import pic from "@/public/images/overview.png";
import { useState } from "react";
import DashboardTutorTabOverview from "./dashboard_tutor_tab_overview";
import DashboardTutorTabMaterial from "./dashboard_tutor_tab_material";
import DashboardTutorTabQuiz from "./dashboard_tutor_tab_quiz";
import DashboardTutorTabForum from "./dashboard_tutor_tab_forum";
import DashboardTutorQuizView from "./dashboard_tutor_quiz_view";
import DashboardTutorAddQuiz from "./dashboard_tutor_addquiz";
import DashboardTutorCreateModule from "./dashboard_tutor_createmodule";

interface Props {
  backFunc: () => void;
}

export default function DashboardTutorCourseBreakdown({ backFunc }: Props) {
  const [hideQuiz, setHideQuiz] = useState<boolean>(true);
  const [showQuizReview, setShowReviewQuiz] = useState<boolean>(false);
  const [showAddQuiz, setShowAddQuiz] = useState<boolean>(false);
  const [showModule, setShowModule] = useState<boolean>(false);
  const [showPost, setShowPost] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "quiz" | "materials" | "forums"
  >("overview");

  const backFunction = () => {
    backFunc();
    setHideQuiz(false);
  };

  const handleTab = (tab: "overview" | "quiz" | "materials" | "forums") => {
    setActiveTab(tab);
  };
  const handleStyle = (tab: string) =>
    `${
      activeTab == tab ? "bg-[#49151B1A] text-primaryColors-0" : "bg-[#EFEFF1]"
    }`;

  return (
    <>
      {hideQuiz && (
        <div>
          {" "}
          <DashboardSubHeaderMore
            backFunc={backFunction}
            header="Foundation of Displeship"
            paragraph={
              <div className="flex items-center gap-5">
                <span className="flex items-center gap-2 text-[14px]">
                  <FaAngleDoubleUp />
                  <span>Beginner</span>
                </span>
                <span className="flex items-center gap-2 text-[14px]">
                  <FaVideo />
                  <span>1hr 15min - 12 Lessons</span>
                </span>
              </div>
            }
          />
          <div className="w-full">
            <div className="w-full my-5">
              {" "}
              <Image
                src={pic}
                alt="pic"
                className="w-full h-[228px] object-cover"
              />
            </div>
            <div className="flex justify-between items-center gap-1">
              <button
                className={`${handleStyle(
                  "overview"
                )} h-[34px] w-[170.75px]  text-[#41415A] text-[14px] font-[500]`}
                onClick={() => handleTab("overview")}
              >
                Overview
              </button>
              <button
                className={`${handleStyle(
                  "quiz"
                )} h-[34px] w-[170.75px]  text-[#41415A] text-[14px] font-[500]`}
                onClick={() => handleTab("quiz")}
              >
                Quizzes
              </button>
              <button
                className={`${handleStyle(
                  "materials"
                )} h-[34px] w-[170.75px]  text-[#41415A] text-[14px] font-[500]`}
                onClick={() => handleTab("materials")}
              >
                Materials
              </button>
              <button
                className={`${handleStyle(
                  "forums"
                )} h-[34px] w-[170.75px]  text-[#41415A] text-[14px] font-[500]`}
                onClick={() => handleTab("forums")}
              >
                Forums
              </button>
            </div>
            <div className="dashboard_hr my-5"></div>
            {activeTab == "overview" ? (
              <DashboardTutorTabOverview
                createQuiz={() => {
                  setHideQuiz(false);
                  setShowAddQuiz(true);
                }}
                createModule={() => {
                  setHideQuiz(false);
                  setShowModule(true);
                }}
              />
            ) : activeTab == "quiz" ? (
              <DashboardTutorTabQuiz
                viewQuiz={() => {
                  setHideQuiz(false);
                  setShowReviewQuiz(true);
                }}
                openAddQuiz={() => {
                  setHideQuiz(false);
                  setShowAddQuiz(true);
                }}
              />
            ) : activeTab == "materials" ? (
              <DashboardTutorTabMaterial />
            ) : activeTab == "forums" ? (
              <DashboardTutorTabForum
                openPost={() => {
                  setShowPost(true);
                }}
              />
            ) : (
              ""
            )}
          </div>
        </div>
      )}
      {showQuizReview && (
        <DashboardTutorQuizView
          removeReview={() => {
            setHideQuiz(true);
            setShowReviewQuiz(false);
          }}
        />
      )}
      {showAddQuiz && (
        <DashboardTutorAddQuiz
          removeReview={() => {
            setHideQuiz(true);
            setShowAddQuiz(false);
          }}
        />
      )}
      {showModule && (
        <DashboardTutorCreateModule
          removeModule={() => {
            setHideQuiz(true);
            setShowModule(false);
          }}
        />
      )}
    </>
  );
}
