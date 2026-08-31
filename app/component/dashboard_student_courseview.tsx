"use client";
import SubHeader from "@/app/component/dashboard_subheader";
import overviewPic from "@/public/images/overview.png";
import { useEffect, useState, useCallback, useRef, memo, useMemo } from "react";
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

// ✅ Tooltip component - moved outside
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

// ✅ Animation variants - moved outside
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

export default memo(function DashboardCourseView({ backFunction, courseId }: Props) {
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
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState<boolean>(true);
  const [enrollmentProgress, setEnrollmentProgress] = useState<any>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const { setQuizContext } = useQuiz();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
  const isMounted = useRef<boolean>(true);
  const initialFetchDone = useRef<boolean>(false);

  // ✅ Fetch course details - only once
  const fetchCourse = useCallback(async () => {
    if (!courseId) return;

    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/course/get-course/${courseId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch course: ${res.status}`);
      }

      const data = await res.json();
      
      if (isMounted.current) {
        setCourseDetails(data.data);
      }
    } catch (error) {
      console.error("Error fetching course:", error);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [courseId, API_URL]);

  // ✅ Check enrollment status - only once
  const checkEnrollmentStatus = useCallback(async () => {
    if (!courseId) return;
    
    setCheckingEnrollment(true);
    try {
      const res = await fetch(`${API_URL}/api/enroll/check-if-enrolled/${courseId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });

      const data = await res.json();

      if (!res.ok) {
        if (isMounted.current) {
          setIsEnrolled(false);
          setEnrollmentProgress(null);
        }
        return;
      }
      
      if (isMounted.current) {
        setIsEnrolled(data.data.is_enrolled);
        setEnrollmentProgress(data.data.progress);
      }
    } catch (error) {
      console.error("Error checking enrollment:", error);
      if (isMounted.current) {
        setIsEnrolled(false);
        setEnrollmentProgress(null);
      }
    } finally {
      if (isMounted.current) {
        setCheckingEnrollment(false);
      }
    }
  }, [courseId, API_URL]);

  // ✅ Only fetch on initial mount or when courseId changes
  useEffect(() => {
    isMounted.current = true;
    initialFetchDone.current = false;
    
    const fetchData = async () => {
      if (initialFetchDone.current || !courseId) return;
      initialFetchDone.current = true;
      
      await Promise.all([fetchCourse(), checkEnrollmentStatus()]);
    };
    
    fetchData();

    return () => {
      isMounted.current = false;
    };
  }, [courseId, fetchCourse, checkEnrollmentStatus]);

  // ✅ Handle enrollment changes from child - just update state, don't refetch
  const handleEnrollmentChange = useCallback((value: boolean) => {
    setIsEnrolled(value);
  }, []);

  // ✅ Navigation functions
  const overview = useCallback(() => {
    setShowOverView(true);
    setShowQuizzes(false);
    setShowMaterials(false);
    setShowForums(false);
  }, []);

  const quizzes = useCallback(() => {
    setShowOverView(false);
    setShowQuizzes(true);
    setShowMaterials(false);
    setShowForums(false);
  }, []);

  const materials = useCallback(() => {
    setShowOverView(false);
    setShowQuizzes(false);
    setShowMaterials(true);
    setShowForums(false);
  }, []);

  const forums = useCallback(() => {
    setShowOverView(false);
    setShowQuizzes(false);
    setShowMaterials(false);
    setShowForums(true);
  }, []);

  // ✅ Handlers
  const removeFunc = useCallback(() => {
    setPicRemove(false);
    setHeaderBtn(false);
    setShowVideo(true);
    setCourseContainer(false);
  }, []);

  const showCourseContainer = useCallback(() => {
    setCourseContainer(true);
    setShowVideo(false);
    setPicRemove(true);
    setHeaderBtn(true);
  }, []);

  const handleTabClick = useCallback((tab: string, action: () => void) => {
    if (!isEnrolled && tab !== "overview") {
      setShowTooltip(tab);
      setTimeout(() => setShowTooltip(null), 2000);
      return;
    }
    action();
  }, [isEnrolled]);

  // ✅ Quiz handlers
  const openQuiz = useCallback((quizId?: string) => {
    if (!quizId) return;
    setQuizContext(quizId);
    setReviewQuiz(false);
    setShowQuizContainer(false);
    setShowQuiz(true);
  }, [setQuizContext]);

  const openReviewQuiz = useCallback((quizId?: string) => {
    if (!quizId) return;
    setQuizContext(quizId);
    setReviewQuiz(true);
    setQuizIdForReview(quizId);
    setShowQuizContainer(false);
    setShowQuiz(true);
  }, [setQuizContext]);

  const closeQuiz = useCallback(() => {
    setShowQuizContainer(true);
    setShowQuiz(false);
    setReviewQuiz(false);
    setQuizIdForReview("");
  }, []);

  const openPosts = useCallback(() => {
    setShowPost(true);
    setShowQuizContainer(false);
  }, []);

  const backToForum = useCallback(() => {
    setShowPost(false);
    setShowForums(true);
    setShowMaterials(false);
    setShowOverView(false);
    setShowQuizzes(false);
    setShowQuizContainer(true);
  }, []);

  // ✅ Derived values
  const totalLessons = useMemo(() => 
    courseDetails?.module?.reduce((total, mod) => {
      return total + (mod._count?.lesson || mod.lesson?.length || 0);
    }, 0) || 0,
    [courseDetails]
  );

  // ✅ Child props - stable references
  const overviewProps = useMemo(() => ({
    courseId,
    removeFunc,
    setCheckIfEnrolled: handleEnrollmentChange,
  }), [courseId, removeFunc, handleEnrollmentChange]);

  const quizzesProps = useMemo(() => ({
    courseId,
    openQuiz,
    openViewQuiz: openReviewQuiz,
  }), [courseId, openQuiz, openReviewQuiz]);

  // ✅ Video list content
  const videoListContent = useMemo(() => (
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
        backFunction={showCourseContainer}
      />
    </motion.div>
  ), [courseId, courseDetails?.course_title, showCourseContainer]);

  // ✅ Quiz content
  const quizContent = useMemo(() => {
    if (!showQuiz) return null;
    
    return (
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
          reviewCourse={() => {}}
          backToCourse={closeQuiz}
          checkIfViewQuizIsActive={reviewQuiz}
        />
      </motion.div>
    );
  }, [showQuiz, courseId, reviewQuiz, closeQuiz]);

  // ✅ Post content
  const postContent = useMemo(() => {
    if (!showPost) return null;
    
    return (
      <motion.div
        key="post"
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
      >
        <DashboardPostView
          backToForum={backToForum}
        />
      </motion.div>
    );
  }, [showPost, backToForum]);

  // ✅ Main content
  const courseContent = useMemo(() => {
    if (isLoading || checkingEnrollment) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader
            height={30}
            width={30}
            border_width={2}
            full_border_color="transparent"
            small_border_color="#FFA500"
          />
        </div>
      );
    }

    return (
      <div className="overflow-x-hidden scrollbar2">
        {showQuizContainer && courseDetails && (
          <div>
            <SubHeader
              backFunction={backFunction}
              header={courseDetails.course_title}
            />
            
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
                        Your Progress
                      </p>
                      <p className="text-green-600 dark:text-green-500 text-sm">
                        {enrollmentProgress.completed_lessons} of {enrollmentProgress.total_lessons} lessons
                        {typeof enrollmentProgress.total_quizzes === "number" &&
                          enrollmentProgress.total_quizzes > 0 && (
                            <>
                              {" "}• {enrollmentProgress.completed_quizzes} of{" "}
                              {enrollmentProgress.total_quizzes} quizzes
                            </>
                          )}
                        {" "}completed
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
                <div className="w-full grid grid-cols-4 gap-2 lg:gap-3 relative">
                  <button
                    className={`${
                      showOverView
                        ? "bg-primaryColors-0 text-white"
                        : "bg-white text-primaryColors-0 dark:bg-secondaryColors-0 dark:text-white"
                    } dashboard_course_btns cursor-pointer`}
                    onClick={() => {
                      overview();
                    }}
                  >
                    Overview
                  </button>

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
                    <DashboardCourseOverView {...overviewProps} />
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
                    <DashboardCourseQuizzes {...quizzesProps} />
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
    );
  }, [
    isLoading,
    checkingEnrollment,
    showQuizContainer,
    courseDetails,
    backFunction,
    isEnrolled,
    enrollmentProgress,
    totalLessons,
    picRemove,
    headerBtn,
    showOverView,
    showQuizzes,
    showMaterials,
    showForums,
    showTooltip,
    overviewProps,
    quizzesProps,
    courseId,
    openPosts,
    overview,
    quizzes,
    materials,
    forums,
    handleTabClick,
  ]);

  return (
    <AnimatePresence mode="wait">
      {videoShow && videoListContent}
      
      {courseContainer && (
        <motion.div
          key="course-container"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={slideInFromRight as any}
        >
          {courseContent}
          
          <AnimatePresence mode="wait">
            {quizContent}
            {postContent}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}, (prevProps, nextProps) => {
  return prevProps.courseId === nextProps.courseId && 
         prevProps.backFunction === nextProps.backFunction;
});