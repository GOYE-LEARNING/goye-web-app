"use client";
import DashboardCourseSubHeader from "@/app/component/dashboard_course_subhead";
import SubHeader from "@/app/component/dashboard_subheader";
import Image from "next/image";
import overviewPic from "@/public/images/overview.png";
import { useEffect, useState } from "react";
import DashboardCourseOverView from "@/app/component/dashboard_course_overview";
import DashboardCourseQuizzes from "@/app/component/dashboard_course_quizzes";
import DashboardCourseMaterials from "@/app/component/dashboard_course_materials";
import DashboardCourseForums from "@/app/component/dashboard_course_forums";
import DashboardCourseQuizzesAnswred from "./dashboard_course_quizzes_answerd";
import DashboardPostView from "./dashboard_post_view";
import Loader from "./loader";

interface Props {
  backFunction: () => void;
  courseId: string;
}

interface Course {
  id?: string;
  course_image: string | null;
  course_title: string;
  course_description: string;
  createdBy: string;
  course_duration: string;
  course_level: string;
  enrolled: string;
  module?: any[];
  objectives?: [];
}

export default function DashboardCourseView({ backFunction, courseId }: Props) {
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [courseDetails, setCourseDetails] = useState<Course | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchCourse = async () => {
    if (!courseId) {
      console.error("No courseId provided");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/course/get-course/${courseId}`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch course: ${res.status}`);
      }

      const data = await res.json();
      console.log("Fetched course details:", data);
      setCourseDetails(data.data);
    } catch (error) {
      console.error("Error fetching course:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]); // Add courseId as dependency

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

  // Calculate total lessons from modules
  const totalLessons =
    courseDetails?.module?.reduce((total, mod) => {
      return total + (mod.lessons?.length || 0);
    }, 0) || 0;

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader
            height={30}
            width={30}
            border_width={2}
            full_border_color="transparent"
            small_border_color="#3F1F22"
          />
        </div>
      ) : (
        <div>
          {showQuizContainer && courseDetails && (
            <div>
              <SubHeader
                backFunction={backFunction}
                header={courseDetails.course_title}
              />
              <DashboardCourseSubHeader
                level={courseDetails.course_level}
                video={`${totalLessons} Lessons`}
              />
              <div>
                <div className="w-full my-5 bg-[#ccc]">
                  {picRemove && (
                    <img
                      src={(courseDetails.course_image as any) || overviewPic}
                      alt="course image"
                      className="object-cover h-[300px] w-full"
                      width={800}
                      height={300}
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
                  {showOverView && (
                    <DashboardCourseOverView
                      courseId={courseId}
                      removeFunc={removeFunc}
                    />
                  )}
                  {showQuizzes && (
                    <DashboardCourseQuizzes openQuiz={openQuiz} />
                  )}
                  {showMaterials && <DashboardCourseMaterials />}
                  {showForums && <DashboardCourseForums openPost={openPosts} courseId={courseId}/>}
                </div>
              </div>
            </div>
          )}
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
