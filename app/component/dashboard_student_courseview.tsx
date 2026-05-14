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
import DashboardStudentCourseList from "./dashboard_student_course_list";
import { HiChevronDoubleUp } from "react-icons/hi";
import { FaVideo } from "react-icons/fa6";
import { useQuiz } from "../context/quizContext";

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
  const [reviewQuiz, setReviewQuiz] = useState<boolean>(false);
  const [quizIdForReview, setQuizIdForReview] = useState<string>("");
  const [courseDetails, setCourseDetails] = useState<Course | null>(null);
  const [courseStatus, setCourseStatus] = useState<string>("");
  const { setQuizContext } = useQuiz();
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
  }, [courseId]);

  const removeFunc = () => {
    setPicRemove(false);
    setHeaderBtn(false);
    setShowVideo(true);
    setCourseContainer(false);
  };

  const showCourseContainer = () => {
    setCourseContainer(true);
    setShowVideo(false);
    setPicRemove(true);
    setHeaderBtn(true);
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

  const openQuiz = (quizId: string) => {
    setQuizContext(quizId);
    setReviewQuiz(false);
    setShowQuizContainer(false);
    setShowQuiz(true);
  };

  const openReviewQuiz = (quizId: string) => {
    setQuizContext(quizId);
    setReviewQuiz(true);
    setQuizIdForReview(quizId);
    setShowQuizContainer(false);
    setShowQuiz(true);
  };

  const closeQuiz = () => {
    setShowQuizContainer(true);
    setShowQuiz(false);
    setReviewQuiz(false);
    setQuizIdForReview("");
  };

  const reviewCourse = () => {};

  const openPosts = () => {
    setShowPost(true);
    setShowQuizContainer(false);
  };

  // Calculate total lessons from modules
  const totalLessons =
    courseDetails?.module?.reduce((total, mod) => {
      return total + (mod._count.lesson || 0);
    }, 0) || 0;

  return (
    <>
      {videoShow && (
        <div>
          <DashboardStudentCourseList
            courseId={courseId}
            course_title={courseDetails?.course_title as any}
            backFunction={() => {
              showCourseContainer();
            }}
          />
        </div>
      )}
      {courseContainer && (
        <div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader
                height={30}
                width={30}
                border_width={2}
                full_border_color="transparent"
                small_border_color="#FFA500"
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
                  <div className="flex items-center gap-5 text-nearTextColors-0">
                    <span className="flex items-center gap-1">
                      <HiChevronDoubleUp />
                      <p className="text-[14px]">
                        {courseDetails?.course_level}
                      </p>
                    </span>
                    <span className="flex items-center gap-2">
                      <FaVideo /> {totalLessons} Video Lessons
                    </span>
                  </div>
                  <div>
                    <div className="w-full my-5">
                      {picRemove && (
                        <img
                          src={
                            (courseDetails.course_image as any) || overviewPic
                          }
                          alt="course image"
                          className="object-cover h-[300px] w-full"
                          width={800}
                          height={300}
                        />
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
                        <DashboardCourseQuizzes
                          courseId={courseId}
                          openQuiz={openQuiz as any}
                          openViewQuiz={openReviewQuiz as any}
                        />
                      )}
                      {showMaterials && (
                        <DashboardCourseMaterials courseId={courseId} />
                      )}
                      {showForums && (
                        <DashboardCourseForums
                          openPost={openPosts}
                          courseId={courseId}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {showQuiz && (
            <DashboardCourseQuizzesAnswred
              backFunction={closeQuiz}
              courseId={courseId}
              reviewCourse={reviewCourse}
              backToCourse={closeQuiz}
              checkIfViewQuizIsActive={reviewQuiz}
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
        </div>
      )}
    </>
  );
}