"use client";
import SubHeader from "@/app/component/dashboard_subheader";
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
import { BiLock } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState<boolean>(true);
  const [enrollmentProgress, setEnrollmentProgress] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
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

  const checkEnrollmentStatus = async () => {
    if (!courseId) return;
    
    setCheckingEnrollment(true);
    try {
      const res = await fetch(`${API_URL}/api/enroll/check-if-enrolled/${courseId}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("Error checking enrollment:", data);
        setIsEnrolled(false);
        return;
      }

      console.log("Enrollment status:", data);
      setIsEnrolled(data.data.is_enrolled);
      setEnrollmentProgress(data.data.progress);
      
      if (data.data.is_enrolled && data.data.progress) {
        console.log(`Course progress: ${data.data.progress.percentage}%`);
      }
    } catch (error) {
      console.error("Error checking enrollment:", error);
      setIsEnrolled(false);
    } finally {
      setCheckingEnrollment(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      checkEnrollmentStatus();
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

  // Tab click handlers with enrollment check
  const handleTabClick = (tab: string, action: () => void) => {
    if (!isEnrolled) {
      setShowTooltip(tab);
      setTimeout(() => setShowTooltip(null), 2000);
      return;
    }
    setActiveTab(tab);
    action();
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

  const totalLessons =
    courseDetails?.module?.reduce((total, mod) => {
      return total + (mod._count?.lesson || mod.lesson?.length || 0);
    }, 0) || 0;

  // Tooltip component
  const Tooltip = ({ message, show, children }: { message: string; show: boolean; children: React.ReactNode }) => (
    <div className="relative inline-block">
      {children}
      {show && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg py-1.5 px-3 whitespace-nowrap z-50 shadow-lg">
          {message}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}
    </div>
  );

  // Slide animation variants
  const slideInFromRight = {
    hidden: { x: "100%", opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
        duration: 0.5
      }
    },
    exit: { 
      x: "100%", 
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {videoShow && (
        <motion.div
          key="video-list"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={slideInFromRight as any}
        >
          <DashboardStudentCourseList
            courseId={courseId}
            course_title={courseDetails?.course_title as any}
            backFunction={() => {
              showCourseContainer();
            }}
          />
        </motion.div>
      )}
      
      {courseContainer && (
        <motion.div
          key="course-container"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={slideInFromRight as any}
        >
          {isLoading || checkingEnrollment ? (
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
            <div className="overflow-x-hidden scrollbar2">
              {showQuizContainer && courseDetails && (
                <div>
                  <SubHeader
                    backFunction={backFunction}
                    header={courseDetails.course_title}
                  />
                  
                  {/* Enrollment Banner */}
                  {!isEnrolled && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 p-4 my-4 rounded-r-lg">
                      <div className="flex items-center gap-3">
                        <BiLock className="text-amber-500 text-xl" />
                        <div>
                          <p className="text-amber-700 dark:text-amber-400 font-medium">
                            Course not enrolled
                          </p>
                          <p className="text-amber-600 dark:text-amber-500 text-sm">
                            Please start the course to access quizzes, materials, and forums
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Course Info Banner */}
                  {isEnrolled && enrollmentProgress && (
                    <div className="bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500 p-4 my-4 rounded-r-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                            <span className="text-green-600 dark:text-green-400 font-bold">
                              {Math.round(enrollmentProgress.percentage)}%
                            </span>
                          </div>
                          <div>
                            <p className="text-green-700 dark:text-green-400 font-medium">
                              Course Progress
                            </p>
                            <p className="text-green-600 dark:text-green-500 text-sm">
                              {enrollmentProgress.completed_lessons} of {enrollmentProgress.total_lessons} lessons completed
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-5 text-nearTextColors-0 my-3">
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
                        <motion.img
                          src={(courseDetails.course_image as any) || overviewPic}
                          alt="course image"
                          className="object-cover h-[300px] w-full"
                          width={800}
                          height={300}
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2, duration: 0.4 }}
                        />
                      )}
                    </div>

                    {headerBtn && (
                      <div className="w-full flex items-start gap-3 relative">
                        {/* Overview Tab */}
                        <Tooltip 
                          message="Enroll to access course overview" 
                          show={showTooltip === "overview" && !isEnrolled}
                        >
                          <button
                            className={`${
                              showOverView
                                ? "bg-primaryColors-0 text-white"
                                : "bg-white text-primaryColors-0 dark:bg-secondaryColors-0 dark:text-white"
                            } dashboard_course_btns ${!isEnrolled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            onClick={() => handleTabClick("overview", overview)}
                            disabled={!isEnrolled}
                          >
                            {!isEnrolled && <BiLock className="inline mr-1" />}
                            Overview
                          </button>
                        </Tooltip>

                        {/* Quizzes Tab */}
                        <Tooltip 
                          message="Enroll to access quizzes" 
                          show={showTooltip === "quizzes" && !isEnrolled}
                        >
                          <button
                            className={`${
                              showQuizzes
                                ? "bg-primaryColors-0 text-white"
                                : "bg-white text-primaryColors-0 dark:bg-secondaryColors-0 dark:text-white"
                            } dashboard_course_btns ${!isEnrolled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            onClick={() => handleTabClick("quizzes", quizzes)}
                            disabled={!isEnrolled}
                          >
                            {!isEnrolled && <BiLock className="inline mr-1" />}
                            Quizzes
                          </button>
                        </Tooltip>

                        {/* Materials Tab */}
                        <Tooltip 
                          message="Enroll to access course materials" 
                          show={showTooltip === "materials" && !isEnrolled}
                        >
                          <button
                            className={`${
                              showMaterials
                                ? "bg-primaryColors-0 text-white"
                                : "bg-white text-primaryColors-0 dark:bg-secondaryColors-0 dark:text-white"
                            } dashboard_course_btns ${!isEnrolled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            onClick={() => handleTabClick("materials", materials)}
                            disabled={!isEnrolled}
                          >
                            {!isEnrolled && <BiLock className="inline mr-1" />}
                            Materials
                          </button>
                        </Tooltip>

                        {/* Forums Tab */}
                        <Tooltip 
                          message="Enroll to participate in forums" 
                          show={showTooltip === "forums" && !isEnrolled}
                        >
                          <button
                            className={`${
                              showForums
                                ? "bg-primaryColors-0 text-white"
                                : "bg-white text-primaryColors-0 dark:bg-secondaryColors-0 dark:text-white"
                            } dashboard_course_btns ${!isEnrolled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            onClick={() => handleTabClick("forums", forums)}
                            disabled={!isEnrolled}
                          >
                            {!isEnrolled && <BiLock className="inline mr-1" />}
                            Forums
                          </button>
                        </Tooltip>
                      </div>
                    )}

                    <AnimatePresence mode="wait">
                      {showOverView && (
                        <motion.div
                          key="overview"
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: -20, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <DashboardCourseOverView
                            courseId={courseId}
                            removeFunc={removeFunc}
                            setCheckIfEnrolled={setIsEnrolled}
                          />
                        </motion.div>
                      )}
                      
                      {showQuizzes && (
                        <motion.div
                          key="quizzes"
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: -20, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <DashboardCourseQuizzes
                            courseId={courseId}
                            openQuiz={openQuiz as any}
                            openViewQuiz={openReviewQuiz as any}
                          />
                        </motion.div>
                      )}
                      
                      {showMaterials && (
                        <motion.div
                          key="materials"
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: -20, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <DashboardCourseMaterials courseId={courseId} />
                        </motion.div>
                      )}
                      
                      {showForums && (
                        <motion.div
                          key="forums"
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: -20, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <DashboardCourseForums
                            openPost={openPosts}
                            courseId={courseId}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          )}

          <AnimatePresence mode="wait">
            {showQuiz && (
              <motion.div
                key="quiz"
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
              >
                <DashboardCourseQuizzesAnswred
                  backFunction={closeQuiz}
                  courseId={courseId}
                  reviewCourse={reviewCourse}
                  backToCourse={closeQuiz}
                  checkIfViewQuizIsActive={reviewQuiz}
                />
              </motion.div>
            )}

            {showPost && (
              <motion.div
                key="post"
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}