"use client";

import { FaAngleDoubleUp, FaVideo } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { IoMdTrash } from "react-icons/io";
import DashboardSubHeaderMore from "./dashboard_subheaderMore";
import pic from "@/public/images/overview.png";
import { useCallback, useEffect, useState } from "react";
import DashboardTutorTabOverview from "./dashboard_tutor_tab_overview";
import DashboardCourseMaterials from "./dashboard_course_materials";
import DashboardTutorTabQuiz from "./dashboard_tutor_tab_quiz";
import DashboardTutorTabForum from "./dashboard_tutor_tab_forum";
import DashboardTutorQuizView from "./dashboard_tutor_quiz_view";
import DashboardTutorAddQuiz from "./dashboard_tutor_addquiz";
import DashboardTutorCreateModule from "./dashboard_tutor_createmodule";
import Loader from "./loader";
import DashboardTutorCreateCourse from "./dashboard_tutor_create-course";
import DashboardCourseViewContent from "./dashboard_course_view_content";
import DashboardTutorMoreCourseActivities from "./dashboard_tutor_more_course_activites";
import { useI18n } from "@/app/context/I18nContext";

interface Props {
  backFunc: () => void;
  courseId: string;
  onDelete: (deleteCourse?: any) => void;
  refreshCourse?: () => void;
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
  totalDurationSeconds?: number;
  totalLessons?: number;
  quiz?: {
    title?: string;
    description?: string;
    duration?: string;
  };
}

// Total runtime comes from the videos themselves, not a number a tutor
// typed in, so this only ever formats what was actually uploaded.
function formatCourseDuration(
  t: (text: string) => string,
  totalSeconds?: number,
  totalLessons?: number,
): string {
  const lessons = totalLessons ?? 0;
  const lessonLabel = `${lessons} ${lessons === 1 ? t("Lesson") : t("Lessons")}`;

  if (!totalSeconds) return lessonLabel;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  const timeLabel =
    hours > 0
      ? `${hours}${t("hr")} ${minutes}${t("min")}`
      : `${minutes}${t("min")}`;

  return `${timeLabel} - ${lessonLabel}`;
}

export default function DashboardTutorCourseBreakdown({
  backFunc,
  courseId,
  onDelete,
}: Props) {
  const { t } = useI18n();
  const [hideQuiz, setHideQuiz] = useState<boolean>(true);
  const [openActivities, setOpenActivities] = useState<boolean>(false);
  const [showQuizReview, setShowReviewQuiz] = useState<boolean>(false);
  const [showAddQuiz, setShowAddQuiz] = useState<boolean>(false);
  const [showModule, setShowModule] = useState<boolean>(false);
  const [showPost, setShowPost] = useState<boolean>(false);
  const [viewCourse, setviewCourse] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showBackArrowFromActivity, setShowBackArrowFromActivity] =
    useState<boolean>(false);
  const [courseDetails, setCourseDetails] = useState<Course[]>([]);
  const [showCreateCourse, setShowCreateCourse] = useState<boolean>(false);
  const [coursesId, setCourseId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "quiz" | "materials" | "forums"
  >("overview");
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const backFunction = () => {
    // Close all modals before going back
    setShowReviewQuiz(false);
    setShowAddQuiz(false);
    setShowModule(false);
    setShowPost(false);
    setShowCreateCourse(false);
    setOpenActivities(false);
    setviewCourse(false);
    setHideQuiz(true);
    backFunc();
    fetchCourse();
  };

  const viewCourseFunc = () => {
    setHideQuiz(false);
    setviewCourse(true);
  };

  const handleTab = (tab: "overview" | "quiz" | "materials" | "forums") => {
    setActiveTab(tab);
  };
  const handleStyle = (tab: string) =>
    `${
      activeTab == tab
        ? "bg-primaryColors-0 text-white"
        : "dark:bg-secondaryColors-0 bg-white text-primaryColors-0 dark:text-primaryColors-0"
    }`;

  const openActivitiesFunc = useCallback(() => {
    setOpenActivities(true);
    setHideQuiz(false);
    setShowBackArrowFromActivity(true);
  }, []);

  const closeActivitiesFunc = useCallback(() => {
    setOpenActivities(false);
    setHideQuiz(true);
    setShowBackArrowFromActivity(false);
  }, []);

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/course/get-course/${courseId}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data?.data) {
        console.log("An error occurred while fetching the course");
        return;
      }
      setCourseDetails([data.data]);
    } catch (error) {
      console.error("Error fetching course:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const editCourse = () => {
    // Close all other modals before opening edit
    setShowReviewQuiz(false);
    setShowAddQuiz(false);
    setShowModule(false);
    setShowPost(false);
    setOpenActivities(false);
    // Then open edit course
    setviewCourse(false);
    setShowCreateCourse(true);
    setHideQuiz(false);
    setCourseId(courseId);
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
          },
        );

        const data = await res.json();

        if (!res.ok) {
          console.log("An error occured while deleting");
          return;
        }

        backFunc();
        setviewCourse(false);
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
              small_border_color="#FFA500"
            />
          </div>
        </div>
      ) : (
        <div>
          {" "}
          {hideQuiz && (
            <div className="px-[1rem] md:px-0">
              {courseDetails.map((c, i) => (
                <div key={i}>
                  {" "}
                  <DashboardSubHeaderMore
                    deleteCourse={() => deleteCourse(c.id as string)}
                    editCourse={editCourse}
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
                          <span>
                            {formatCourseDuration(t, c.totalDurationSeconds, c.totalLessons)}
                          </span>
                        </span>
                      </div>
                    }
                  />
                  <div className="w-full">
                    <div className="w-full my-5">
                      {" "}
                      <img
                        src={c.course_image || pic}
                        alt={t("Course image")}
                        className="w-full h-[228px] object-cover"
                      />
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                        <button
                          className={`${handleStyle(
                            "overview",
                          )} h-[34px] w-[170.75px] shrink-0 text-[#41415A] text-[14px] font-[500]`}
                          onClick={() => handleTab("overview")}
                        >
                          {t("Overview")}
                        </button>
                        <button
                          className={`${handleStyle(
                            "quiz",
                          )} h-[34px] w-[170.75px] shrink-0 text-[#41415A] text-[14px] font-[500]`}
                          onClick={() => handleTab("quiz")}
                        >
                          {t("Quizzes")}
                        </button>
                        <button
                          className={`${handleStyle(
                            "materials",
                          )} h-[34px] w-[170.75px] shrink-0 text-[#41415A] text-[14px] font-[500]`}
                          onClick={() => handleTab("materials")}
                        >
                          {t("Materials")}
                        </button>
                        <button
                          className={`${handleStyle(
                            "forums",
                          )} h-[34px] w-[170.75px] shrink-0 text-[#41415A] text-[14px] font-[500]`}
                          onClick={() => handleTab("forums")}
                        >
                          {t("Forums")}
                        </button>
                      </div>

                      {/* Edit/delete used to live only in the header's "⋮"
                          menu at the very top of the page — easy to lose
                          track of once you've scrolled down into a tab's
                          content. Mirroring them here, next to the tab
                          selector itself, keeps them reachable no matter
                          which tab is open or how far down the page is. */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={editCourse}
                          title={t("Edit")}
                          aria-label={t("Edit course")}
                          className="h-[34px] w-[34px] flex items-center justify-center rounded-md text-primaryColors-0 hover:bg-primaryColors-0/10 transition-colors"
                        >
                          <MdEdit size={18} />
                        </button>
                        <button
                          onClick={() => deleteCourse(c.id as string)}
                          title={t("Delete")}
                          aria-label={t("Delete course")}
                          className="h-[34px] w-[34px] flex items-center justify-center rounded-md text-[#DA0E29] hover:bg-[#DA0E29]/10 transition-colors"
                        >
                          <IoMdTrash size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="dashboard_hr my-5"></div>
                    {activeTab == "overview" ? (
                      <DashboardTutorTabOverview
                        openActivities={openActivitiesFunc}
                        openViewContent={viewCourseFunc}
                        courseId={courseId}
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
                        courseId={courseId}
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
                      <DashboardCourseMaterials courseId={courseId} />
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
          courseId={courseId}
          removeReview={() => {
            setHideQuiz(true);
            setShowReviewQuiz(false);
          }}
        />
      )}
      {showAddQuiz && (
        <DashboardTutorAddQuiz
        courseId={courseId}
          removeReview={() => {
            setHideQuiz(true);
            setShowAddQuiz(false);
          }}
        />
      )}
      {showModule && (
        <DashboardTutorCreateModule
          courseId={courseId}
          removeModule={() => {
            setHideQuiz(true);
            setShowModule(false);
          }}
        />
      )}
      {showCreateCourse && (
        <DashboardTutorCreateCourse
          refreshCourse={fetchCourse}
          courseId={coursesId}
          backToCourse={() => {
            setShowCreateCourse(false);
            setHideQuiz(true);
            fetchCourse();
          }}
        />
      )}
      {viewCourse && (
        <DashboardCourseViewContent
          courseId={courseId}
          backFunc={() => {
            backFunc();
            setviewCourse(false);
          }}
          editCourse={editCourse}
          onDelete={() => deleteCourse(courseId as string)}
        />
      )}
      {openActivities && (
        <DashboardTutorMoreCourseActivities
          courseId={courseId}
          backFunc={closeActivitiesFunc}
          isAlone={showBackArrowFromActivity}
        />
      )}
    </>
  );
}
