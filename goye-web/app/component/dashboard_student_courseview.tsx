"use client";
import DashboardCourseSubHeader from "@/app/component/dashboard_course_subhead";
import SubHeader from "@/app/component/dashboard_subheader";
import Image from "next/image";
import overviewPic from "@/public/images/overview.png";
import { useState } from "react";
import DashboardCourseOverView from "@/app/component/dashboard_course_overview";
import DashboardCourseQuizzes from "@/app/component/dashboard_course_quizzes";
import DashboardCourseMaterials from "@/app/component/dashboard_course_materials";
import DashboardCourseForums from "@/app/component/dashboard_course_forums";
import DashboardCourseQuizzesAnswred from "./dashboard_course_quizzes_answerd";
import DashboardPostView from "./dashboard_post_view";
interface Props {
  backFunction: () => void;
}
export default function DashboardCourseView({ backFunction }: Props) {
  const [showOverView, setShowOverView] = useState<boolean>(true);
  const [showQuizzes, setShowQuizzes] = useState<boolean>(false);
  const [showMaterials, setShowMaterials] = useState<boolean>(false);
  const [showForums, setShowForums] = useState<boolean>(false);
  const [picRemove, setPicRemove] = useState<boolean>(true);
  const [videoShow, setShowVideo] = useState<boolean>(false);
  const [headerBtn, setHeaderBtn] = useState<boolean>(true);
  const [showQuizContainer, setShowQuizContainer] = useState<boolean>(true);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [courseContainer, setCourseContainer] = useState<boolean>(true);
  const [showPost, setShowPost] = useState<boolean>(false);

  const removeFunc = () => {
    setPicRemove(false);
    setHeaderBtn(false);
    setShowVideo(true);
    setCourseContainer(false);
  };

  const overview = () => {
    setShowOverView(true);
    setShowQuizzes(false);
    setShowMaterials(false);
    setShowForums(false);
  };

  const quizzes = () => {
    setShowOverView(false);
    setShowQuizzes(true);
    setShowMaterials(false);
    setShowForums(false);
  };

  const materials = () => {
    setShowOverView(false);
    setShowQuizzes(false);
    setShowMaterials(true);
    setShowForums(false);
  };

  const forums = () => {
    setShowOverView(false);
    setShowQuizzes(false);
    setShowMaterials(false);
    setShowForums(true);
  };

  const openQuiz = () => {
    setShowQuizContainer(false);
    setShowQuiz(true);
  };

  const closeQuiz = () => {
    setShowQuizContainer(true);
    setShowQuiz(false);
  };

  const reviewCourse = () => {};

  const openPosts = () => {
    setShowPost(true);
    setShowQuizContainer(false);
  };

  return (
    <>
      {" "}
      {showQuizContainer && (
        <div>
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
              {picRemove && (
                <Image
                  src={overviewPic}
                  alt="pic"
                  className="object-conver h-[300px] w-full"
                />
              )}
              {videoShow && (
                <video
                  src="/"
                  className="object-cover w-full h-[374px]"
                  controls
                ></video>
              )}
            </div>

            {headerBtn && (
              <div className="w-full flex items-start gap-3">
                <button
                  className={`${
                    showOverView
                      ? "bg-[#49151B1A] text-primaryColors-0"
                      : "bg-[#EFEFF1]"
                  } dashboard_course_btns`}
                  onClick={overview}
                >
                  Overview
                </button>
                <button
                  className={`${
                    showQuizzes
                      ? "bg-[#49151B1A] text-primaryColors-0"
                      : "bg-[#EFEFF1]"
                  } dashboard_course_btns`}
                  onClick={quizzes}
                >
                  Quizzes
                </button>
                <button
                  className={`${
                    showMaterials
                      ? "bg-[#49151B1A] text-primaryColors-0"
                      : "bg-[#EFEFF1]"
                  } dashboard_course_btns`}
                  onClick={materials}
                >
                  Materials
                </button>
                <button
                  className={`${
                    showForums
                      ? "bg-[#49151B1A] text-primaryColors-0"
                      : "bg-[#EFEFF1]"
                  } dashboard_course_btns`}
                  onClick={forums}
                >
                  Forums
                </button>
              </div>
            )}

            <div>
              {" "}
              {showOverView && (
                <div>
                  <DashboardCourseOverView removeFunc={removeFunc} />
                </div>
              )}
              {showQuizzes && (
                <div>
                  <DashboardCourseQuizzes openQuiz={openQuiz} />
                </div>
              )}
              {showMaterials && (
                <div>
                  <DashboardCourseMaterials />
                </div>
              )}
              {showForums && (
                <div>
                  <DashboardCourseForums openPost={openPosts} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showQuiz && (
        <DashboardCourseQuizzesAnswred
          backFunction={closeQuiz}
          reviewCourse={reviewCourse}
          backToCourse={closeQuiz}
        />
      )}
      {showPost && (
        <DashboardPostView
          backToForum={() => {
            setShowPost(false);
            setShowForums(true);
            setShowMaterials(false);
            setShowOverView(false);
            setShowQuizzes(false);
            setShowQuizContainer(true);
          }}
        />
      )}
    </>
  );
}
