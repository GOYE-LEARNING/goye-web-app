"use client";
import { useState, useEffect, useRef } from "react";
import { GoVideo } from "react-icons/go";
import { AnimatePresence, motion } from "framer-motion";
import { MdChevronRight } from "react-icons/md";
import { FaTrophy } from "react-icons/fa";
import confetti from "canvas-confetti";
import SubHeader from "./dashboard_subheader";
import Loader from "./loader";
import VideoHelper from "../hook/videoHelper";

interface Lesson {
  id: string;
  lesson_title: string;
  lesson_video: string;
  duration?: number;
}

interface Module {
  id: string;
  module_title: string;
  module_description: string;
  module_duration: string;
  lesson?: Lesson[];
}

interface Props {
  courseId: string;
  backFunction: () => void;
  course_title: string;
}

export default function DashboardStudentCourseList({
  courseId,
  backFunction,
  course_title,
}: Props) {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [videoTrackerIds, setVideoTrackerIds] = useState<Map<string, string>>(new Map());
  const [lastSavedTime, setLastSavedTime] = useState<Map<string, number>>(new Map());
  const [finishedLessons, setFinishedLessons] = useState<Set<string>>(new Set());
  const [lessonProgress, setLessonProgress] = useState<Map<string, number>>(new Map());
  const [loadingLesson, setLoadingLesson] = useState<boolean>(false);
  const [videoDurations, setVideoDurations] = useState<Map<string, number>>(new Map());
  const [initialSeekTime, setInitialSeekTime] = useState<number | undefined>(undefined);
  const [completionCelebration, setCompletionCelebration] = useState<{
    pointsEarned?: number;
    leveledUp?: boolean;
    newLevel?: string | number;
    certificateUrl?: string | null;
  } | null>(null);

  // ─── Race-condition guard ──────────────────────────────────────────────────
  // Prevents concurrent POST /track-video calls for the same lesson,
  // which caused the P2002 unique constraint violation on (lessonId, progressId).
  const trackingInFlight = useRef<Set<string>>(new Set());
  // ──────────────────────────────────────────────────────────────────────────

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Helper: get tracker ID for a lesson
  const getTrackerId = async (lessonId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/video/get-tracker-id/${lessonId}`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) throw new Error(`Failed to get tracker ID: ${response.status}`);
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error("Error getting tracker ID:", error);
      return null;
    }
  };

  // The moment a course actually finishes (last lesson watched to completion),
  // the backend awards XP, possibly levels the student up, and issues a
  // certificate — none of which had any visible UI before this. Confetti +
  // a modal makes that moment feel earned instead of a silent state update.
  const celebrateCourseCompletion = (data: any) => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ["#FBB041", "#4466E4", "#DA0E29", "#00BFFF", "#30A46F"],
    });
    setCompletionCelebration({
      pointsEarned: data.gamification?.pointsEarned,
      leveledUp: data.gamification?.leveledUp,
      newLevel: data.gamification?.newLevel,
      certificateUrl: data.certificateUrl,
    });
  };

  // Core tracking function (create or update)
  const trackVideoProgress = async (
    lessonId: string,
    currentTime: number,
    videoFinished: boolean
  ) => {
    try {
      if (!lessonId || typeof currentTime !== "number" || isNaN(currentTime)) return;

      // ─── In-flight guard ───────────────────────────────────────────────────
      // If a request for this lesson is already in-flight, skip to prevent the
      // race condition that caused the P2002 unique constraint violation.
      if (trackingInFlight.current.has(lessonId)) return;
      trackingInFlight.current.add(lessonId);
      // ──────────────────────────────────────────────────────────────────────

      const trackerId = videoTrackerIds.get(lessonId);
      if (finishedLessons.has(lessonId) && !videoFinished) {
        trackingInFlight.current.delete(lessonId);
        return;
      }

      const roundedTime = Math.round(currentTime * 100) / 100;
      setLessonProgress((prev) => new Map(prev).set(lessonId, roundedTime));

      if (trackerId) {
        const response = await fetch(
          `${API_URL}/api/video/update-track-video/${trackerId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ videoTrackTime: roundedTime, videoFinished }),
          }
        );
        if (!response.ok) throw new Error("Failed to update tracking");
        const data = await response.json();
        if (data.data?.videoFinished && !finishedLessons.has(lessonId)) {
          setFinishedLessons((prev) => new Set(prev).add(lessonId));
          setCompletedLessons((prev) => new Set(prev).add(lessonId));
        }
        if (data.courseCompleted) {
          celebrateCourseCompletion(data);
        }
      } else {
        const response = await fetch(`${API_URL}/api/video/track-video`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            videoTrackTime: roundedTime,
            videoFinished,
            lessonId,
            courseId,
          }),
        });
        if (!response.ok) throw new Error("Failed to create tracking");
        const data = await response.json();
        if (data.data?.id) {
          setVideoTrackerIds((prev) => new Map(prev).set(lessonId, data.data.id));
        }
        if (data.data?.videoFinished) {
          setFinishedLessons((prev) => new Set(prev).add(lessonId));
          setCompletedLessons((prev) => new Set(prev).add(lessonId));
        }
        if (data.courseCompleted) {
          celebrateCourseCompletion(data);
        }
      }

      setLastSavedTime((prev) => new Map(prev).set(lessonId, roundedTime));
    } catch (error) {
      console.error("Error in trackVideoProgress:", error);
    } finally {
      // ─── Always release the lock ─────────────────────────────────────────
      trackingInFlight.current.delete(lessonId);
      // ─────────────────────────────────────────────────────────────────────
    }
  };

  // Called when video reaches completion threshold (95%) or ends
  const handleVideoComplete = async () => {
    const lessonId = selectedLessonId || expandedLesson;
    if (!lessonId) return;
    const duration = videoDurations.get(lessonId);
    if (duration && !finishedLessons.has(lessonId)) {
      await trackVideoProgress(lessonId, duration, true);
    }
  };

  // Auto‑save every 30 seconds
  const handleTimeUpdate = (currentTime: number, duration: number) => {
    const lessonId = selectedLessonId || expandedLesson;
    if (!lessonId || finishedLessons.has(lessonId)) return;

    setLessonProgress((prev) => new Map(prev).set(lessonId, currentTime));
    const lastSaved = lastSavedTime.get(lessonId) || 0;
    if (
      Math.floor(currentTime) % 30 === 0 &&
      Math.abs(currentTime - lastSaved) >= 30
    ) {
      trackVideoProgress(lessonId, currentTime, false);
    }
  };

  // Save on pause
  const handleVideoPause = (currentTime: number, duration: number) => {
    const lessonId = selectedLessonId || expandedLesson;
    if (lessonId) {
      const finished =
        currentTime >= duration * 0.95 || currentTime === duration;
      trackVideoProgress(lessonId, currentTime, finished);
    }
  };

  // Load lesson: fetch tracking data and set initial seek time
  const handleLessonSelect = async (lessonId: string, videoUrl: string) => {
    setLoadingLesson(true);
    setSelectedLessonId(lessonId);
    setSelectedVideo(videoUrl);
    setExpandedLesson(lessonId);
    setInitialSeekTime(undefined); // reset first

    try {
      // Check if we already have a tracker ID
      if (!videoTrackerIds.has(lessonId)) {
        const trackerData = await getTrackerId(lessonId);
        if (trackerData) {
          setVideoTrackerIds((prev) => new Map(prev).set(lessonId, trackerData.id));
          setLessonProgress((prev) =>
            new Map(prev).set(lessonId, trackerData.videoTrackTime)
          );
          if (trackerData.videoFinished) {
            setFinishedLessons((prev) => new Set(prev).add(lessonId));
            setCompletedLessons((prev) => new Set(prev).add(lessonId));
          } else if (trackerData.videoTrackTime > 0) {
            setInitialSeekTime(trackerData.videoTrackTime);
          }
        } else {
          setLessonProgress((prev) => new Map(prev).set(lessonId, 0));
        }
      } else {
        const existingProgress = lessonProgress.get(lessonId);
        if (
          existingProgress &&
          existingProgress > 0 &&
          !finishedLessons.has(lessonId)
        ) {
          setInitialSeekTime(existingProgress);
        }
      }
    } catch (error) {
      console.error("Error selecting lesson:", error);
    } finally {
      setLoadingLesson(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    if (expandedModule === moduleId) {
      setExpandedModule(null);
      setExpandedLesson(null);
      setSelectedVideo(null);
      setSelectedLessonId(null);
    } else {
      setExpandedModule(moduleId);
      const module = modules.find((m) => m.id === moduleId);
      const firstLesson = module?.lesson?.[0];
      if (firstLesson)
        handleLessonSelect(firstLesson.id, firstLesson.lesson_video);
    }
  };

  const toggleLesson = (lessonId: string, videoUrl: string) => {
    if (expandedLesson === lessonId) {
      setExpandedLesson(null);
      setSelectedVideo(null);
      setSelectedLessonId(null);
    } else {
      handleLessonSelect(lessonId, videoUrl);
    }
  };

  const handleRadioChange = (
    lessonId: string,
    videoUrl: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    e.stopPropagation();
    if (e.target.checked) handleLessonSelect(lessonId, videoUrl);
    else if (selectedLessonId === lessonId) {
      setSelectedLessonId(null);
      setSelectedVideo(null);
      setExpandedLesson(null);
    }
  };

  // Fetch modules
  useEffect(() => {
    const fetchCourseModules = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_URL}/api/course/get-course/${courseId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error(`Failed to fetch course: ${res.status}`);
        const data = await res.json();
        setModules(data.data.module || []);
      } catch (error) {
        console.error("Error fetching course modules:", error);
      } finally {
        setLoading(false);
      }
    };
    if (courseId) fetchCourseModules();
  }, [courseId, API_URL]);

  // Store video duration when metadata loads
  const handleLoadedMetadata = (duration: number) => {
    const lessonId = selectedLessonId || expandedLesson;
    if (lessonId)
      setVideoDurations((prev) => new Map(prev).set(lessonId, duration));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader
          height={40}
          width={40}
          border_width={3}
          full_border_color="transparent"
          small_border_color="#FFA500"
        />
      </div>
    );
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        <div key="dashboard-content">
          <SubHeader backFunction={backFunction} header={course_title} />
          <motion.div
            key="video_animation"
            initial={{ height: 0 }}
            animate={{ height: 374 }}
            exit={{ height: 0 }}
            transition={{ duration: 0.5 }}
          >
            {!selectedVideo ? (
              <div className="dashboard_content_mainbox flex justify-center items-center border-2 border-dashed border-nearTextColors-0/20 h-[374px]">
                <h1 className="text-nearTextColors-0 text-center w-[300px] text-[20px] font-semibold uppercase">
                  Select a module to start watching your first lesson.
                </h1>
              </div>
            ) : (
              <motion.div className="relative">
                {loadingLesson && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                    <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                      <Loader
                        height={24}
                        width={24}
                        border_width={2}
                        full_border_color="transparent"
                        small_border_color="#FFA500"
                      />
                      <span className="text-gray-700">Loading lesson...</span>
                    </div>
                  </div>
                )}
                <VideoHelper
                  src={selectedVideo}
                  initialTime={initialSeekTime}
                  completionThreshold={95}
                  onComplete={handleVideoComplete}
                  onTimeUpdate={handleTimeUpdate}
                  onPause={handleVideoPause}
                  onLoadedMetadata={handleLoadedMetadata}
                  className="w-full h-[374px] object-cover rounded-lg shadow-md"
                  controls={true}
                  autoPlay={false}
                />
              </motion.div>
            )}
          </motion.div>

          <div key="Multiple-videos" className="w-full dashboard_content_mainbox">
            {modules.length === 0 ? (
              <div className="p-4">No modules found for this course.</div>
            ) : (
              modules.map((module) => (
                <div
                  key={module.id}
                  className="mb-4 border-b border-gray-200/20"
                >
                  <div
                    className="flex justify-between items-center p-3 cursor-pointer hover:bg-lightWhite-0 dark:hover:bg-shadyColor-0 duration-200 transition-all mb-4"
                    onClick={() => toggleModule(module.id)}
                  >
                    <div>
                      <h3 className="font-medium capitalize">
                        {module.module_title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {module.lesson?.length || 0} lessons •{" "}
                        {module.module_duration}
                      </p>
                    </div>
                    <MdChevronRight
                      className={`transform transition-transform ${
                        expandedModule === module.id ? "rotate-90" : ""
                      }`}
                    />
                  </div>

                  {expandedModule === module.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="ml-4"
                    >
                      <p className="text-[14px] text-nearTextColors-0 pb-3">
                        {module.module_description}
                      </p>
                      {module.lesson?.map((lesson) => {
                        const isFinished = finishedLessons.has(lesson.id);
                        const progress = lessonProgress.get(lesson.id) || 0;
                        const duration =
                          videoDurations.get(lesson.id) ||
                          (lesson.duration ? lesson.duration * 60 : 300);
                        const progressPercentage =
                          duration > 0 ? (progress / duration) * 100 : 0;

                        return (
                          <div
                            key={lesson.id}
                            className="border-t border-[#ccc]/20"
                          >
                            <div
                              className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-lightWhite-0 dark:hover:bg-shadyColor-0 ${
                                selectedLessonId === lesson.id
                                  ? "dark:bg-shadyColor-0 bg-lightWhite-0"
                                  : ""
                              } ${
                                isFinished
                                  ? "bg-green-50 dark:bg-green-900/20"
                                  : ""
                              }`}
                              onClick={() =>
                                toggleLesson(lesson.id, lesson.lesson_video)
                              }
                            >
                              <input
                                type="radio"
                                name="selectedLesson"
                                checked={selectedLessonId === lesson.id}
                                onChange={(e) =>
                                  handleRadioChange(
                                    lesson.id,
                                    lesson.lesson_video,
                                    e
                                  )
                                }
                                onClick={(e) => e.stopPropagation()}
                                className="w-4 h-4 text-blue-600"
                                disabled={isFinished}
                              />
                              <MdChevronRight
                                className={`transform transition-transform ${
                                  expandedLesson === lesson.id
                                    ? "rotate-90"
                                    : ""
                                }`}
                              />
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <span
                                    className={`font-medium uppercase ${
                                      isFinished
                                        ? "text-green-600 line-through"
                                        : ""
                                    }`}
                                  >
                                    {lesson.lesson_title}
                                  </span>
                                  {isFinished && (
                                    <span className="ml-2 text-xs text-green-600 font-normal">
                                      ✓ Completed
                                    </span>
                                  )}
                                </div>
                                {!isFinished && progress > 0 && (
                                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden">
                                    <div
                                      className="bg-primaryColors-0 h-1.5 rounded-full transition-all duration-300"
                                      style={{
                                        width: `${Math.min(
                                          progressPercentage,
                                          100
                                        )}%`,
                                      }}
                                    />
                                  </div>
                                )}
                                {process.env.NODE_ENV === "development" &&
                                  !isFinished &&
                                  progress > 0 && (
                                    <div className="text-xs text-gray-400 mt-1">
                                      {Math.round(progress)}s /{" "}
                                      {Math.round(duration)}s (
                                      {Math.round(progressPercentage)}%)
                                    </div>
                                  )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <GoVideo />
                                <span>
                                  {lesson.duration
                                    ? `${lesson.duration}min`
                                    : "5min"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </AnimatePresence>

      <AnimatePresence>
        {completionCelebration && (
          <motion.div
            key="course-completion"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
            onClick={() => setCompletionCelebration(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: "20%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "20%" }}
              transition={{ duration: 0.3, ease: "easeIn" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[400px] p-[40px] rounded-[16px] flex flex-col items-center gap-3 bg-secondaryColors-0 text-center"
            >
              <FaTrophy size={64} color="#FBB041" />
              <h1 className="text-[32px] text-white font-[600]">
                Course Completed!
              </h1>
              <p className="text-[15px] text-white/90">
                You finished &ldquo;{course_title}&rdquo; — well done.
              </p>

              {typeof completionCelebration.pointsEarned === "number" && (
                <p className="text-primaryColors-0 text-[15px] font-[600]">
                  +{completionCelebration.pointsEarned} XP earned
                </p>
              )}

              {completionCelebration.leveledUp && (
                <p className="text-boldGreen-0 text-[15px] font-[600]">
                  🎉 You leveled up{completionCelebration.newLevel ? ` to ${completionCelebration.newLevel}` : ""}!
                </p>
              )}

              {completionCelebration.certificateUrl ? (
                <p className="text-white/80 text-[13px]">
                  Your certificate is ready — find it in your Growth tab.
                </p>
              ) : (
                <p className="text-white/60 text-[12px]">
                  Your certificate is on its way — check your Growth tab shortly.
                </p>
              )}

              <button
                className="form_more bg-primaryColors-0 text-white w-full mt-2"
                onClick={() => setCompletionCelebration(null)}
              >
                Keep Going
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}