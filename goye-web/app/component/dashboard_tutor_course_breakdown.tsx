"use client";

import { FaAngleDoubleUp, FaVideo } from "react-icons/fa";
import DashboardSubHeaderMore from "./dashboard_subheaderMore";
import pic from "@/public/images/overview.png";
import { useEffect, useState } from "react";
import DashboardTutorTabOverview from "./dashboard_tutor_tab_overview";
import DashboardTutorTabMaterial from "./dashboard_tutor_tab_material";
import DashboardTutorTabQuiz from "./dashboard_tutor_tab_quiz";
import DashboardTutorTabForum from "./dashboard_tutor_tab_forum";
import DashboardTutorQuizView from "./dashboard_tutor_quiz_view";
import DashboardTutorAddQuiz from "./dashboard_tutor_addquiz";
import DashboardTutorCreateModule from "./dashboard_tutor_createmodule";
import Loader from "./loader";

interface Props {
  backFunc: () => void;
  courseId: string;
  onDelete: (deleteCourse?: any) => void;
  refreshCourse: () => void;
}

interface Course {
  id?: string;
  course_image: any;
  course_title: string;
  course_description: string;
  createdBy: string;
  course_duration: string;
  course_level: string;
  enrolled: string;
}

export default function DashboardTutorCourseBreakdown({
  backFunc,
  courseId,
  onDelete,
  refreshCourse,
}: Props) {
  const [hideQuiz, setHideQuiz] = useState<boolean>(true);
  const [showQuizReview, setShowReviewQuiz] = useState<boolean>(false);
  const [showAddQuiz, setShowAddQuiz] = useState<boolean>(false);
  const [showModule, setShowModule] = useState<boolean>(false);
  const [showPost, setShowPost] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [courseDetails, setCourseDetails] = useState<Course[]>([]);

  const [activeTab, setActiveTab] = useState<
    "overview" | "quiz" | "materials" | "forums"
  >("overview");

  const backFunction = () => {
    backFunc();
    setHideQuiz(true);
  };

  const handleTab = (tab: "overview" | "quiz" | "materials" | "forums") => {
    setActiveTab(tab);
  };
  const handleStyle = (tab: string) =>
    `${
      activeTab == tab ? "bg-[#49151B1A] text-primaryColors-0" : "bg-[#EFEFF1]"
    }`;

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/course/get-course/${courseId}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log("An error occured while fetching courses");
      }
      console.log(data.data)
      setIsLoading(false);
      setCourseDetails([data.data]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      if (onDelete) {
        await onDelete(courseId);
      } else {
        const res = await fetch(
          `${API_URL}/api/course/delete-course/${courseId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          console.log("An error occured while deleting");
          return;
        }

        backFunc();

        console.log(
          `Course deleted succesfully ID: ${courseId}, data: ${data}`
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);
  return (
    <>
      {isLoading ? (
        <div>
          <div className="mt-[6rem]">
            <Loader
              height={30}
              width={30}
              border_width={2}
              full_border_color="transparent"
              small_border_color="#3F1F22"
            />
          </div>
        </div>
      ) : (
        <div>
          {" "}
          {hideQuiz && (
            <div>
              {courseDetails.map((c, i) => (
                <div key={i}>
                  {" "}
                  <DashboardSubHeaderMore
                    deleteCourse={() => deleteCourse(c.id as string)}
                    backFunc={backFunction}
                    header={c.course_title}
                    paragraph={
                      <div className="flex items-center gap-5">
                        <span className="flex items-center gap-2 text-[14px]">
                          <FaAngleDoubleUp />
                          <span>{c.course_level}</span>
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
                      <img
                        src={c.course_image || pic}
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
                        course_description={c.course_description}
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
                        courseId={courseId}
                        openPost={() => {
                          setShowPost(true);
                        }}
                      />
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
