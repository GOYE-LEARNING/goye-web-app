"use client";

import { useEffect, useState } from "react";
import DashboardSubHeaderMore from "./dashboard_subheaderMore";
import { FaAngleDown, FaAngleRight, FaVideo } from "react-icons/fa6";
import { FaAngleDoubleUp, FaEdit, FaPlay, FaTrash } from "react-icons/fa";
import { HiOutlineBookOpen } from "react-icons/hi";
import VideoHelper from "../hook/videoHelper";
import Portal from "./Portal";
import { useI18n } from "@/app/context/I18nContext";

interface Props {
  courseId: string;
  backFunc: () => void;
  editCourse: () => void;
  onDelete: (deleteCourse?: any) => void;
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
  objectives: Obj[];
  module: Module[];
}

// Total runtime comes from the videos themselves, not a number a tutor
// typed in, so this only ever formats what was actually uploaded.
function formatCourseDuration(totalSeconds?: number): string | null {
  if (!totalSeconds) return null;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  return hours > 0 ? `${hours}hr ${minutes}min to complete` : `${minutes}min to complete`;
}

interface Obj {
  objective_title1: string;
  objective_title2: string;
  objective_title3: string;
  objective_title4: string;
  objective_title5: string;
}

interface Module {
  id: string;
  module_title: string;
  module_duration: string;
  module_description: string;
  lesson: Lesson[];
}

interface Lesson {
  id: string;
  lesson_title: string;
  lesson_video: string;
  duration?: number;
}

export default function DashboardCourseViewContent({
  courseId,
  backFunc,
  editCourse,
  onDelete,
}: Props) {
  const [courseDetails, setCourseDetails] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [watchingLesson, setWatchingLesson] = useState<Lesson | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editVideoFile, setEditVideoFile] = useState<File | null>(null);
  const [detectedDuration, setDetectedDuration] = useState<number | null>(null);
  const [isDetectingDuration, setIsDetectingDuration] = useState<boolean>(false);
  const [editModuleId, setEditModuleId] = useState<string>("");
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const { t } = useI18n();

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/course/get-course/${courseId}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log("An error occurred while fetching courses");
      }
      console.log(data.data);
      setCourseDetails(data.data);
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
          console.log("An error occurred while deleting");
          return;
        }

        backFunc();

        console.log(
          `Course deleted successfully ID: ${courseId}, data: ${data}`
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(
      (prev) =>
        prev.includes(moduleId)
          ? prev.filter((id) => id !== moduleId) // Remove if already expanded
          : [...prev, moduleId] // Add if not expanded
    );
  };

  const toggleAllModules = () => {
    if (!courseDetails?.module) return;

    if (expandedModules.length === courseDetails.module.length) {
      // If all are expanded, collapse all
      setExpandedModules([]);
    } else {
      // Expand all modules
      const allModuleIds = courseDetails.module.map((module) => module.id);
      setExpandedModules(allModuleIds);
    }
  };

  const isModuleExpanded = (moduleId: string) => {
    return expandedModules.includes(moduleId);
  };

  // Reads the video's own metadata rather than asking the tutor to guess a
  // number — matches how duration is captured at course-creation time.
  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      const url = URL.createObjectURL(file);
      video.src = url;

      const timeout = setTimeout(() => {
        URL.revokeObjectURL(url);
        reject(new Error("Video metadata loading timed out"));
      }, 10000);

      video.onloadedmetadata = () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(url);
        const durationInSeconds = Math.round(video.duration);
        if (durationInSeconds > 0 && durationInSeconds < 86400) {
          resolve(durationInSeconds);
        } else {
          reject(new Error("Invalid video duration"));
        }
      };

      video.onerror = () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(url);
        reject(new Error("Failed to read video file"));
      };
    });
  };

  const handleEditVideoChange = async (file: File | null) => {
    setEditVideoFile(file);
    setDetectedDuration(null);
    if (!file) return;

    setIsDetectingDuration(true);
    try {
      const seconds = await getVideoDuration(file);
      setDetectedDuration(seconds);
    } catch (error) {
      console.error("Could not read video duration:", error);
      // Not fatal — the backend keeps the previous duration if none is sent.
    } finally {
      setIsDetectingDuration(false);
    }
  };

  const openEditLesson = (moduleId: string, lesson: Lesson) => {
    setEditModuleId(moduleId);
    setEditingLesson(lesson);
    setEditTitle(lesson.lesson_title || "");
    setEditVideoFile(null);
    setDetectedDuration(null);
    setEditError(null);
  };

  const closeEditLesson = () => {
    setEditingLesson(null);
    setEditVideoFile(null);
    setDetectedDuration(null);
    setEditError(null);
    setIsSavingEdit(false);
  };

  const saveEditLesson = async () => {
    if (!editingLesson) return;

    setIsSavingEdit(true);
    setEditError(null);

    try {
      let videoUrl = editingLesson.lesson_video;

      // Only re-upload when a replacement file was actually chosen — the
      // update endpoint requires lesson_video on every call, so the
      // existing URL is sent back unchanged otherwise.
      if (editVideoFile) {
        const formData = new FormData();
        formData.append("file", editVideoFile);

        const uploadRes = await fetch(
          `${API_URL}/api/course/upload-lesson-video/${courseId}/${editModuleId}`,
          { method: "POST", credentials: "include", body: formData },
        );
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData?.data?.url) {
          throw new Error(uploadData?.message || t("Video upload failed"));
        }
        videoUrl = uploadData.data.url;
      }

      const res = await fetch(
        `${API_URL}/api/course/update-lesson/${editingLesson.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lesson_video: videoUrl,
            lesson_title: editTitle,
            // Only sent when a new video was actually detected — omitting it
            // leaves the lesson's existing (already-correct) duration alone
            // rather than overwriting it with a guess.
            duration: detectedDuration ?? undefined,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || t("Failed to update lesson"));
      }

      closeEditLesson();
      await fetchCourse();
    } catch (error: any) {
      console.error("Error updating lesson:", error);
      setEditError(error.message || t("Failed to update lesson"));
      setIsSavingEdit(false);
    }
  };

  const removeLesson = async (lessonId: string) => {
    if (!window.confirm(t("Remove this video? This cannot be undone."))) return;

    setDeletingLessonId(lessonId);
    try {
      const res = await fetch(
        `${API_URL}/api/course/delete-lesson/${lessonId}`,
        { method: "DELETE", credentials: "include" },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || t("Failed to remove video"));
      }
      await fetchCourse();
    } catch (error: any) {
      console.error("Error deleting lesson:", error);
      alert(error.message || t("Failed to remove video"));
    } finally {
      setDeletingLessonId(null);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  return (
    <div>
      <DashboardSubHeaderMore
        deleteCourse={() => deleteCourse(courseDetails?.id as string)}
        editCourse={editCourse}
        backFunc={backFunc}
        header={courseDetails?.course_title as string}
        paragraph={
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-2 text-[14px]">
              <FaAngleDoubleUp color="#22c55e"/>
              <span className='text-green-500'>{courseDetails?.course_level}</span>
            </span>
            <span className="flex items-center gap-2 text-[14px] dark:text-lightWhite-0 text-lightBoldText-0/80">
              <FaVideo />
              <span>
                {formatCourseDuration(courseDetails?.totalDurationSeconds) ||
                  t("No videos uploaded yet")}
              </span>
            </span>
          </div>
        }
      />

      <div className="dashboard_content_mainbox">
        <h1 className="font-bold dark:text-textSlightDark-0 text-lightBoldText-0 text-[16px]">
          {t("Learning Objectives")}
        </h1>
        <ul className="px-[17px] my-3">
          {courseDetails?.objectives.map((obj, i) => (
            <div key={i}>
              <li className="cr_list">{obj.objective_title1}</li>
              <li className="cr_list">{obj.objective_title2}</li>
              <li className="cr_list">{obj.objective_title3}</li>
              <li className="cr_list">{obj.objective_title4}</li>
              <li className="cr_list">{obj.objective_title5}</li>
            </div>
          ))}
        </ul>
      </div>

      <div className="dashboard_content_mainbox">
        <div className="flex justify-between items-center mb-4">
          <h1 className="font-bold dark:text-textSlightDark-0 text-lightBoldText-0 text-[16px]">{t("Modules")}</h1>
          {courseDetails?.module && courseDetails.module.length > 0 && (
            <button
              onClick={toggleAllModules}
              className="text-sm text-primaryColors-0 hover:text-secondaryColors-0 transition-colors"
            >
              {expandedModules.length === courseDetails.module.length
                ? t("Collapse All")
                : t("Expand All")}
            </button>
          )}
        </div>

        <div>
          {isLoading ? (
            <div className="text-center py-4">{t("Loading modules...")}</div>
          ) : courseDetails?.module && courseDetails.module.length > 0 ? (
            courseDetails.module.map((module, index) => {
              const isExpanded = isModuleExpanded(module.id);

              return (
                <div
                  key={module.id}
                  className="border-b border-[#ccc]/20 mb-3 overflow-hidden"
                >
                  {/* Module Header - Clickable Area */}
                  <div
                    className="flex justify-between items-center p-4 cursor-pointer dark:hover:bg-shadyColor-0 hover:bg-lightWhite-0 transition-colors"
                    onClick={() => toggleModule(module.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="font-semibold dark:text-textSlightDark-0 text-lightBoldText-0/80 text-[14px]">
                          {module.module_title}
                        </div>
                      </div>
                    </div>

                    {/* Chevron Button */}
                    <button
                      className="ml-2 p-1 rounded-full hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent double trigger
                        toggleModule(module.id);
                      }}
                      aria-label={
                        isExpanded ? "Collapse module" : "Expand module"
                      }
                    >
                      {isExpanded ? (
                        <FaAngleDown className="text-gray-600" />
                      ) : (
                        <FaAngleRight className="text-gray-600" />
                      )}
                    </button>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 animate-fadeIn">
                      {/* Module Description */}
                      <p className="text-textGrey-0 text-[14px] mb-4">
                        {module.module_description}
                      </p>

                      {/* Lessons List */}
                      {module.lesson && module.lesson.length > 0 && (
                        <div className="space-y-2">
                          <span className="flex items-center gap-2 text-textGrey-0 text-[14px] mb-2">
                            <HiOutlineBookOpen />{" "}
                            <div>{module.lesson.length} {t("Videos")}</div>
                          </span>

                          {module.lesson.map((lesson, li) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between gap-2 p-3 rounded-lg dark:bg-shadyColor-0 bg-lightWhite-0"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <FaVideo className="text-primaryColors-0 shrink-0" />
                                <div className="min-w-0">
                                  <div className="font-medium dark:text-textSlightDark-0 text-lightBoldText-0 text-[13px] truncate">
                                    {lesson.lesson_title || `${t("Lesson")} ${li + 1}`}
                                  </div>
                                  {!lesson.lesson_video && (
                                    <div className="text-amber-500 text-[11px]">
                                      {t("No video uploaded yet")}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() =>
                                    lesson.lesson_video &&
                                    setWatchingLesson(lesson)
                                  }
                                  disabled={!lesson.lesson_video}
                                  className="p-2 rounded-full hover:bg-primaryColors-0/10 text-primaryColors-0 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                  aria-label={t("Watch video")}
                                  title={t("Watch video")}
                                >
                                  <FaPlay size={12} />
                                </button>
                                <button
                                  onClick={() => openEditLesson(module.id, lesson)}
                                  className="p-2 rounded-full hover:bg-primaryColors-0/10 dark:text-textSlightDark-0 text-lightBoldText-0/70 transition-colors"
                                  aria-label={t("Edit lesson")}
                                  title={t("Edit")}
                                >
                                  <FaEdit size={12} />
                                </button>
                                <button
                                  onClick={() => removeLesson(lesson.id)}
                                  disabled={deletingLessonId === lesson.id}
                                  className="p-2 rounded-full hover:bg-red-500/10 text-red-500 disabled:opacity-40 transition-colors"
                                  aria-label={t("Remove lesson")}
                                  title={t("Remove")}
                                >
                                  <FaTrash size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* If no lessons */}
                      {(!module.lesson || module.lesson.length === 0) && (
                        <div className="text-sm text-gray-500 italic">
                          {t("No lessons added to this module yet.")}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t("No modules have been added to this course yet.")}
            </div>
          )}
        </div>
      </div>

      {/* Watch video — a full centered modal rather than a side panel, since
          a slide-over is too narrow to watch a video comfortably. Rendered
          through a Portal so it isn't clipped by an ancestor's overflow or
          stacking context. */}
      {watchingLesson && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4">
            <div className="bg-white dark:bg-secondaryColors-0 rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl">
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold dark:text-textSlightDark-0 text-lightBoldText-0 truncate pr-4">
                  {watchingLesson.lesson_title || t("Lesson video")}
                </h2>
                <button
                  onClick={() => setWatchingLesson(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl transition-colors shrink-0"
                  aria-label={t("Close")}
                >
                  ×
                </button>
              </div>
              <div className="p-4">
                {watchingLesson.lesson_video && (
                  <VideoHelper
                    src={watchingLesson.lesson_video}
                    controls
                    autoPlay
                    className="w-full max-h-[70vh] rounded-lg"
                  />
                )}
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Edit lesson — same full-modal treatment as Watch, for consistency,
          also rendered through a Portal. */}
      {editingLesson && (
        <Portal>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4">
          <div className="bg-white dark:bg-secondaryColors-0 rounded-lg w-full max-w-lg max-h-[90vh] flex flex-col shadow-xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold dark:text-textSlightDark-0 text-lightBoldText-0">
                {t("Edit Lesson")}
              </h2>
              <button
                onClick={closeEditLesson}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl transition-colors"
                aria-label={t("Close")}
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-[13px] font-medium dark:text-textSlightDark-0 text-lightBoldText-0/80 mb-1">
                  {t("Title")}
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full h-[40px] px-3 rounded-lg border border-[#ccc]/30 bg-transparent outline-none dark:text-textSlightDark-0 text-lightBoldText-0"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium dark:text-textSlightDark-0 text-lightBoldText-0/80 mb-1">
                  {t("Replace video (optional)")}
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleEditVideoChange(e.target.files?.[0] || null)}
                  className="w-full text-[13px] dark:text-textSlightDark-0 text-lightBoldText-0"
                />
                {/* Duration is read from the video itself — never typed in —
                    so it's only shown once a replacement file is picked. */}
                {isDetectingDuration && (
                  <p className="text-[12px] text-textGrey-0 mt-1">
                    {t("Reading video length...")}
                  </p>
                )}
                {detectedDuration !== null && (
                  <p className="text-[12px] text-nearTextColors-0 dark:text-textGrey-0 mt-1">
                    {t("Detected length:")} {Math.floor(detectedDuration / 60)}m{" "}
                    {detectedDuration % 60}s
                  </p>
                )}
              </div>

              {editError && (
                <p className="text-red-500 text-[13px]">{editError}</p>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={saveEditLesson}
                disabled={isSavingEdit}
                className="flex-1 h-[40px] rounded-lg bg-primaryColors-0 text-white font-semibold disabled:opacity-60"
              >
                {isSavingEdit ? t("Saving...") : t("Save Changes")}
              </button>
              <button
                onClick={closeEditLesson}
                disabled={isSavingEdit}
                className="flex-1 h-[40px] rounded-lg border border-[#ccc]/30 dark:text-textSlightDark-0 text-lightBoldText-0"
              >
                {t("Cancel")}
              </button>
            </div>
          </div>
        </div>
        </Portal>
      )}
    </div>
  );
}
