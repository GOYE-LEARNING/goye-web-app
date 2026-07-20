"use client";

import React, { useEffect, useState } from "react";
import SubHeader from "./dashboard_subheader";
import CourseStep1 from "./create-course/step1";
import CourseStep2 from "./create-course/step2";
import CourseStep3 from "./create-course/step3";
import CourseStep4 from "./create-course/step4";
import CourseStep5 from "./create-course/step5";
import { FaArrowRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { TbCancel } from "react-icons/tb";
import DashboardPop from "./dashboard_popop";
import DashboardTutorCourseBreakdown from "./dashboard_tutor_course_breakdown";

interface Props {
  courseId?: string;
  backToCourse: () => void;
  refreshCourse: () => void;
  onCourseUpdate?: (newCourse: any) => void;
}

interface Objectives {
  id?: string;
  obj1: string;
  obj2: string;
  obj3: string;
  obj4: string;
  obj5: string;
}

interface Lesson {
  id: number;
  lesson_title: string;
  lesson_video: string;
  videoFile?: File;
  duration?: number;
}

interface Module {
  id: number;
  module_title: string;
  module_description: string;
  module_time: string;
  lessons: Lesson[];
}

interface Document {
  id: number;
  material_document: string;
  video_preview?: string | null;
  documentFile?: File;
}

interface Material {
  id: number;
  material_title: string;
  material_description: string;
  material_page: number;
  material_document: Document[];
  visible: boolean;
}

interface Question {
  id: number;
  quiz_question: string;
  quiz_options: string[];
  correctAnswer?: string;
}

interface Quiz {
  id: number;
  quiz_title: string;
  quiz_description: string;
  quiz_duration: string;
  quiz_passing_score: string;
  quiz_questions: Question[];
}

interface Course {
  id?: string;
  courseId?: string;
  course_title?: string;
  course_short_description: string;
  course_description: string;
  course_level: string;
  course_image: string;
  courseImageFile?: File;
  module?: Module[];
  material?: Material[];
  quiz?: Quiz[];
  objective: Objectives[];
}

interface IdMapping {
  [key: number]: string;
}

export default function DashboardTutorCreateCourse({
  backToCourse,
  onCourseUpdate,
  courseId,
  refreshCourse,
}: Props) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [showError, setShowError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [uploadWarnings, setUploadWarnings] = useState<string[]>([]);
  const [showPop, setShowPop] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [createdCourseId, setCreatedCourseId] = useState<string>("");
  const [createdCourseTitle, setCreatedCourseTitle] = useState<string>("");
  const [course, setCourse] = useState<Course[]>([]);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showBreakdownCourse, setShowBreakdownCourse] =
    useState<boolean>(false);
  const [showCourse, setShowCourse] = useState<boolean>(true);
  const [materialIdMap, setMaterialIdMap] = useState<IdMapping>({});
  const [moduleIdMap, setModuleIdMap] = useState<IdMapping>({});
  const [formData, setFormData] = useState<Course>({
    courseId: "",
    course_title: "",
    course_short_description: "",
    course_description: "",
    course_level: "",
    course_image: "",
    module: [],
    material: [],
    quiz: [],
    objective: [],
  });

  const validateFileObject = (file: any): file is File => {
    return (
      file instanceof File &&
      typeof file.name === "string" &&
      typeof file.size === "number" &&
      typeof file.type === "string"
    );
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      const timeout = setTimeout(() => {
        URL.revokeObjectURL(video.src);
        reject(new Error("Video metadata loading timed out"));
      }, 10000);

      const url = URL.createObjectURL(file);
      video.src = url;

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
        reject(new Error("Failed to load video metadata"));
      };
    });
  };

  const uploadLessonVideo = async (
    file: File,
    courseId: string,
    moduleId: string,
  ): Promise<{ url: string; moduleId: string; courseId: string }> => {
    if (!file || !(file instanceof File)) {
      throw new Error("Invalid file object provided");
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/api/course/upload-lesson-video/${courseId}/${moduleId}`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      const videoUrl =
        data.data?.url ||
        data.url ||
        data.data?.lesson_video ||
        data.lesson_video;

      if (!videoUrl) {
        throw new Error("No video URL returned from server");
      }

      return {
        url: videoUrl,
        moduleId: data.data?.moduleId || moduleId,
        courseId: data.data?.courseId || courseId,
      };
    } catch (error: any) {
      console.error(`Upload error for lesson video:`, error);
      throw error;
    }
  };

  const uploadCourseMaterial = async (
    file: File,
    courseId: string,
    materialId: string,
  ): Promise<string> => {
    if (!file || !(file instanceof File)) {
      throw new Error("Invalid file object provided");
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/api/course/upload-course-material/${courseId}/${materialId}`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      const documentUrl =
        data.data?.material_document || data.data?.url || data.url;

      if (!documentUrl) {
        throw new Error("No document URL returned from server");
      }

      return documentUrl;
    } catch (error: any) {
      console.error(`Upload error for material:`, error);
      throw error;
    }
  };

  const uploadCourseImage = async (
    file: File,
    courseId: string,
  ): Promise<string> => {
    if (!file || !(file instanceof File)) {
      throw new Error("Invalid file object provided");
    }

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64String = result.split(",")[1] || result;
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await fetch(
        `${API_URL}/api/course/upload-course-image/${courseId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            file: base64,
            fileName: file.name,
            mimeType: file.type,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Image upload failed: ${response.status} - ${errorText}`,
        );
      }

      const data = await response.json();
      const imageUrl =
        data.data?.imageUrl || data.data?.url || data.imageUrl || data.url;

      if (!imageUrl) {
        throw new Error("No valid image URL returned from server");
      }

      return imageUrl;
    } catch (error: any) {
      console.error("Image upload error:", error);
      throw error;
    }
  };

  // Turns a raw thrown error (a network TypeError, a "Failed to create
  // course: 500 - {...}" string, etc.) into a calm, honest message —
  // never the raw error text, but never a lie about what happened either.
  // Nothing the tutor entered is lost on failure, since formData is only
  // cleared after a confirmed success.
  const describeCreateCourseError = (error: any): string => {
    const raw = String(error?.message || "");

    if (raw.includes("Failed to fetch") || raw.includes("NetworkError") || raw.includes("network")) {
      return "We couldn't reach the server just now. Please check your connection and try again — nothing you've entered has been lost.";
    }
    if (raw.includes(": 401") || raw.includes(": 403")) {
      return "Your session needs a refresh. Please log in again, then try creating your course once more.";
    }
    if (raw.includes(": 500") || raw.includes(": 502") || raw.includes(": 503")) {
      return "Something didn't go through on our end. Please try again in a moment — your course details are still here, ready to go.";
    }
    return "We hit a snag creating your course. Please try again — your details are still here, ready to go.";
  };

  // Checks the fields the backend actually requires before we ever hit the
  // network, so a tutor sees a specific, friendly message ("add a level")
  // instead of the course silently 500-ing after a long upload wait.
  const validateCourseBeforeSubmit = (): string | null => {
    if (!formData.course_title?.trim()) {
      return "Please give your course a title before continuing.";
    }
    if (!formData.course_description?.trim()) {
      return "Please add a course description before continuing.";
    }
    if (!formData.course_level?.trim()) {
      return "Please choose a course level before continuing.";
    }
    if (!formData.module || formData.module.length === 0) {
      return "Please add at least one module before continuing.";
    }
    const hasLesson = formData.module.some((m) => (m.lessons || []).length > 0);
    if (!hasLesson) {
      return "Please add at least one lesson to a module before continuing.";
    }
    return null;
  };

  const handleCreateCourse = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();

    const validationMessage = validateCourseBeforeSubmit();
    if (validationMessage) {
      setErrorMessage(validationMessage);
      setShowError(true);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadWarnings([]);
    setUploadStatus("Starting course creation...");

    try {
      setUploadStatus("Calculating video durations...");

      const modulesWithDuration = await Promise.all(
        (formData.module || []).map(async (m, index) => {
          const lessonsWithDuration = await Promise.all(
            m.lessons.map(async (lesson, lessonIndex) => {
              let duration = lesson.duration || 300;

              if (lesson.videoFile && validateFileObject(lesson.videoFile)) {
                try {
                  duration = await getVideoDuration(lesson.videoFile);
                } catch (error) {
                  console.warn(
                    `Could not get duration for ${lesson.lesson_title}:`,
                    error,
                  );
                }
              }

              return {
                lesson_title: lesson.lesson_title,
                lesson_video: "",
                order: lessonIndex + 1,
                duration: duration,
              };
            }),
          );

          return {
            module_title: m.module_title,
            module_description: m.module_description,
            module_duration: m.module_time,
            order: index + 1,
            lessons: lessonsWithDuration,
          };
        }),
      );

      const requestPayload = {
        course_title: formData.course_title || "",
        course_short_description: formData.course_short_description || "",
        course_description: formData.course_description || "",
        course_level: formData.course_level || "",
        course_image: "",
        module: modulesWithDuration,
        material: (formData.material || []).map((mt) => ({
          material_title: mt.material_title,
          material_description: mt.material_description,
          material_pages: mt.material_page,
          material_document: "",
        })),
        objectives:
          formData.objective.length > 0
            ? [
                {
                  objective_title1: formData.objective[0]?.obj1 || "",
                  objective_title2: formData.objective[0]?.obj2 || "",
                  objective_title3: formData.objective[0]?.obj3 || "",
                  objective_title4: formData.objective[0]?.obj4 || "",
                  objective_title5: formData.objective[0]?.obj5 || "",
                },
              ]
            : [],
        quiz: (formData.quiz || []).map((qz) => ({
          title: qz.quiz_title?.trim() || "Untitled Quiz",
          description: qz.quiz_description?.trim() || "",
          duration: parseInt(qz.quiz_duration) || 30,
          passingScore: parseInt(qz.quiz_passing_score) || 70,
          maxAttempts: 3,
          questions: qz.quiz_questions.map((q, qIndex) => ({
            question: q.quiz_question?.trim() || `Question ${qIndex + 1}`,
            options: q.quiz_options || [],
            correctAnswer: q.correctAnswer || "",
            explanation: "",
            points: 1,
            order: qIndex + 1,
          })),
        })),
      };

      setUploadStatus("Creating course structure...");
      setUploadProgress(10);

      const courseResponse = await fetch(
        `${API_URL}/api/course/create-course`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(requestPayload),
        },
      );

      if (!courseResponse.ok) {
        const errorText = await courseResponse.text();
        throw new Error(
          `Failed to create course: ${courseResponse.status} - ${errorText}`,
        );
      }

      const courseData = await courseResponse.json();

      if (!courseData.data || !courseData.data.id) {
        throw new Error("No course ID returned from course creation");
      }

      const newCourseId = courseData.data.id;
      setCreatedCourseId(newCourseId);
      setUploadProgress(20);

      if (
        formData.courseImageFile &&
        validateFileObject(formData.courseImageFile)
      ) {
        try {
          setUploadStatus("Uploading course image...");
          const uploadedImageUrl = await uploadCourseImage(
            formData.courseImageFile,
            newCourseId,
          );
          setUploadProgress(30);

          await fetch(`${API_URL}/api/course/update-course/${newCourseId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ course_image: uploadedImageUrl }),
          });
        } catch (error) {
          console.error("Failed to upload course image:", error);
          setUploadWarnings((prev) => [
            ...prev,
            "Your course image didn't upload — you can add it from Edit Course.",
          ]);
        }
      }

      const modulesFromResponse = courseData.data.module || [];
      let videoUploadCount = 0;
      let totalVideos = 0;

      for (const module of formData.module || []) {
        totalVideos += module.lessons.filter((l) => l.videoFile).length;
      }

      if (totalVideos > 0) {
        setUploadStatus(`Uploading ${totalVideos} video(s)...`);

        for (
          let moduleIndex = 0;
          moduleIndex < (formData.module as [] || []).length;
          moduleIndex++
        ) {
          const tempModule = (formData.module || [])[moduleIndex];
          const dbModule = modulesFromResponse[moduleIndex];

          if (!dbModule || !dbModule.id) {
            console.error(`No DB module found for index ${moduleIndex}`);
            continue;
          }

          for (
            let lessonIndex = 0;
            lessonIndex < tempModule.lessons.length;
            lessonIndex++
          ) {
            const lesson = tempModule.lessons[lessonIndex];
            const dbLesson = dbModule.lesson?.[lessonIndex];

            if (
              lesson.videoFile &&
              validateFileObject(lesson.videoFile) &&
              dbLesson?.id
            ) {
              try {
                setUploadStatus(`Uploading video: ${lesson.lesson_title}...`);

                const uploadResult = await uploadLessonVideo(
                  lesson.videoFile,
                  newCourseId,
                  dbModule.id,
                );

                let duration = lesson.duration;
                if (!duration) {
                  try {
                    duration = await getVideoDuration(lesson.videoFile);
                  } catch (error) {
                    duration = 300;
                  }
                }

                await fetch(
                  `${API_URL}/api/course/update-lesson/${dbLesson.id}`,
                  {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                      lesson_video: uploadResult.url,
                      lesson_title: lesson.lesson_title,
                      duration: duration,
                    }),
                  },
                );

                videoUploadCount++;
                const videoProgress =
                  30 + Math.round((videoUploadCount / totalVideos) * 30);
                setUploadProgress(videoProgress);
              } catch (error) {
                console.error(
                  `Failed to upload video for ${lesson.lesson_title}:`,
                  error,
                );
                setUploadWarnings((prev) => [
                  ...prev,
                  `The video for "${lesson.lesson_title}" didn't upload — you can add it from Edit Course.`,
                ]);
              }
            }
          }
        }
      }

      setUploadProgress(65);

      const materialsFromResponse = courseData.data.material || [];
      let materialUploadCount = 0;
      let totalMaterials = 0;

      for (const material of formData.material || []) {
        if (material.material_document?.[0]?.documentFile) {
          totalMaterials++;
        }
      }

      if (totalMaterials > 0) {
        setUploadStatus(`Uploading ${totalMaterials} document(s)...`);

        for (
          let materialIndex = 0;
          materialIndex < (formData.material || []).length;
          materialIndex++
        ) {
          const tempMaterial = (formData.material || [])[materialIndex];
          const dbMaterial = materialsFromResponse[materialIndex];

          if (
            dbMaterial?.id &&
            tempMaterial.material_document?.[0]?.documentFile
          ) {
            try {
              setUploadStatus(
                `Uploading document: ${tempMaterial.material_title}...`,
              );

              const documentUrl = await uploadCourseMaterial(
                tempMaterial.material_document[0].documentFile,
                newCourseId,
                dbMaterial.id,
              );

              materialUploadCount++;
              const materialProgress =
                65 + Math.round((materialUploadCount / totalMaterials) * 25);
              setUploadProgress(materialProgress);
            } catch (error) {
              console.error(
                `Failed to upload document for ${tempMaterial.material_title}:`,
                error,
              );
              setUploadWarnings((prev) => [
                ...prev,
                `The document for "${tempMaterial.material_title}" didn't upload — you can add it from Edit Course.`,
              ]);
            }
          }
        }
      }

      setUploadProgress(95);
      setUploadStatus("Finalizing course...");

      const finalResponse = await fetch(
        `${API_URL}/api/course/get-course/${newCourseId}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (finalResponse.ok) {
        const finalCourseData = await finalResponse.json();
        if (onCourseUpdate && finalCourseData.data) {
          onCourseUpdate(finalCourseData.data);
        }
      }

      setUploadProgress(100);
      setUploadStatus("Course created successfully!");
      // Snapshot the title before formData is cleared below — the success
      // popup renders after this reset, so it can't safely read
      // formData.course_title live without showing it blank.
      setCreatedCourseTitle(formData.course_title || "");
      setShowPop(true);

      setFormData({
        course_title: "",
        course_short_description: "",
        course_description: "",
        course_level: "",
        course_image: "",
        module: [],
        material: [],
        quiz: [],
        objective: [],
      });

      localStorage.removeItem("module");
      localStorage.removeItem("COURSE TITLE");
      localStorage.removeItem("quiz");
      localStorage.removeItem("course_materials");
    } catch (error: any) {
      console.error("❌ Course creation failed:", error);
      setUploadStatus("Course creation failed!");
      setErrorMessage(describeCreateCourseError(error));
      setShowError(true);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateCourse = async (e?: React.FormEvent<HTMLFormElement>) => {
  e?.preventDefault();
  if (!courseId) return;

  setIsUploading(true);
  setUploadProgress(0);
  setUploadStatus("Starting course update...");

  try {
    let updatedImageUrl = formData.course_image;
    if (
      formData.courseImageFile &&
      validateFileObject(formData.courseImageFile)
    ) {
      try {
        setUploadStatus("Uploading new course image...");
        updatedImageUrl = await uploadCourseImage(
          formData.courseImageFile,
          courseId,
        );
      } catch (error) {
        console.error("Failed to upload course image:", error);
      }
    }

    // Helper to check if an ID is a real database ID
    const isRealDbId = (id: any): boolean => {
      if (!id) return false;
      return (
        typeof id === "string" &&
        (id.startsWith("cm") || id.length > 20)
      );
    };

    // Separate existing modules from new modules
    const existingModules = (formData.module || []).filter(mod => isRealDbId(mod.id));
    const newModules = (formData.module || []).filter(mod => !isRealDbId(mod.id));

    // Prepare payload with ALL modules (existing + new)
    const modulesPayload = (formData.module || []).map((mod, index) => {
      const isExisting = isRealDbId(mod.id);
      
      // For new modules, we need to include their lessons but with empty video URLs
      // The videos will be uploaded after the modules are created
      const lessonsPayload = (mod.lessons || []).map((lesson, lessonIndex) => {
        const lessonPayload: any = {
          lesson_title: lesson.lesson_title || "",
          // For existing lessons, keep the video URL
          // For new lessons, use empty string - we'll upload videos after
          lesson_video: isExisting ? (lesson.lesson_video || "") : "",
          order: lessonIndex + 1,
          duration: lesson.duration || 300,
        };
        if (isExisting && isRealDbId(lesson.id)) {
          lessonPayload.id = lesson.id.toString();
        }
        return lessonPayload;
      });

      const modulePayload: any = {
        module_title: mod.module_title || "",
        module_description: mod.module_description || "",
        module_duration: mod.module_time || "0",
        order: index + 1,
        lessons: lessonsPayload,
      };

      if (isExisting) {
        modulePayload.id = mod.id.toString();
      }

      return modulePayload;
    });

    const materialsPayload = (formData.material || []).map((mat) => {
      const materialPayload: any = {
        material_title: mat.material_title || "",
        material_description: mat.material_description || "",
        material_pages: mat.material_page || 0,
        material_document: isRealDbId(mat.id) 
          ? (mat.material_document[0]?.material_document || "")
          : "",
      };
      if (isRealDbId(mat.id)) {
        materialPayload.id = mat.id.toString();
      }
      return materialPayload;
    });

    const objectivesPayload =
      formData.objective.length > 0
        ? [
            {
              ...(isRealDbId(formData.objective[0]?.id) && {
                id: formData.objective[0]?.id?.toString(),
              }),
              objective_title1: formData.objective[0]?.obj1 || "",
              objective_title2: formData.objective[0]?.obj2 || "",
              objective_title3: formData.objective[0]?.obj3 || "",
              objective_title4: formData.objective[0]?.obj4 || "",
              objective_title5: formData.objective[0]?.obj5 || "",
            },
          ]
        : [];

    const quizPayload = (formData.quiz || []).map((qz) => {
      const quizPayload: any = {
        quiz_title: qz.quiz_title || "",
        quiz_description: qz.quiz_description || "",
        quiz_duration: parseInt(qz.quiz_duration) || 30,
        quiz_score: parseInt(qz.quiz_passing_score) || 70,
        questions: (qz.quiz_questions || []).map((q) => {
          const questionPayload: any = {
            question_name: q.quiz_question || "",
            options: q.quiz_options || [],
            correctAnswer: q.correctAnswer || "",
          };
          if (isRealDbId(q.id)) {
            questionPayload.id = q.id.toString();
          }
          return questionPayload;
        }),
      };
      if (isRealDbId(qz.id)) {
        quizPayload.id = qz.id.toString();
      }
      return quizPayload;
    });

    const updatePayload = {
      course_title: formData.course_title || "",
      course_short_description: formData.course_short_description || "",
      course_description: formData.course_description || "",
      course_level: formData.course_level || "",
      course_image: updatedImageUrl || formData.course_image || "",
      modules: modulesPayload,
      materials: materialsPayload,
      objectives: objectivesPayload,
      quiz: quizPayload,
    };

    setUploadProgress(20);
    setUploadStatus("Updating course structure...");

    // Step 1: Update the course (this creates new modules in the database)
    const updateResponse = await fetch(
      `${API_URL}/api/course/update-course/${courseId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatePayload),
      },
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(
        `Update failed: ${updateResponse.status} - ${errorText}`,
      );
    }

    setUploadProgress(50);
    setUploadStatus("Fetching updated course data...");

    // Step 2: Fetch the updated course to get the new module/lesson IDs
    const updatedCourseResponse = await fetch(
      `${API_URL}/api/course/get-course/${courseId}`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    if (!updatedCourseResponse.ok) {
      throw new Error("Failed to fetch updated course");
    }

    const updatedCourseData = await updatedCourseResponse.json();
    const updatedModules = updatedCourseData.data?.module || [];

    setUploadProgress(60);
    setUploadStatus("Uploading lesson videos...");

    // Step 3: Upload any newly-selected videos, for BOTH new and existing modules/lessons.
    // A lesson gets a video upload+save whenever the tutor picked a new videoFile in this
    // session — not just when its parent module was newly created. Previously, existing
    // modules were skipped entirely, so replacing a video on an existing lesson never
    // reached storage or the database (the tutor's preview looked fine locally, but
    // students never saw the update).
    const moduleIdMap = new Map<number, string>();
    updatedModules.forEach((dbModule: any, index: number) => {
      const tempModule = formData.module?.[index];
      if (tempModule && !isRealDbId(tempModule.id)) {
        moduleIdMap.set(index, dbModule.id);
      }
    });

    const totalNewVideos = (formData.module || []).reduce(
      (acc, m) => acc + (m.lessons || []).filter((l) => l.videoFile).length,
      0,
    );
    let uploadedVideoCount = 0;

    for (let moduleIndex = 0; moduleIndex < (formData.module || []).length; moduleIndex++) {
      const tempModule = (formData.module || [])[moduleIndex];

      // Resolve the real database module ID whether this module is new or existing
      const dbModuleId = isRealDbId(tempModule.id)
        ? tempModule.id.toString()
        : moduleIdMap.get(moduleIndex);

      if (!dbModuleId) {
        console.warn(`No DB module found for module at index ${moduleIndex}`);
        continue;
      }

      // Get the corresponding database module (for resolving newly-created lesson IDs)
      const dbModule = updatedModules[moduleIndex];
      const dbLessons = dbModule?.lesson || [];

      for (let lessonIndex = 0; lessonIndex < tempModule.lessons.length; lessonIndex++) {
        const lesson = tempModule.lessons[lessonIndex];

        if (!lesson.videoFile || !validateFileObject(lesson.videoFile)) {
          continue;
        }

        // Resolve the real database lesson ID whether this lesson is new or existing
        const dbLessonId = isRealDbId(lesson.id)
          ? lesson.id
          : dbLessons[lessonIndex]?.id;

        if (!dbLessonId) {
          console.warn(`No DB lesson found for lesson at index ${lessonIndex} in module ${moduleIndex}`);
          continue;
        }

        try {
          setUploadStatus(`Uploading video: ${lesson.lesson_title}...`);

          // Get duration
          let duration = lesson.duration;
          if (!duration) {
            try {
              duration = await getVideoDuration(lesson.videoFile);
            } catch (error) {
              duration = 300;
            }
          }

          // Upload the video using the resolved database module ID
          const uploadResult = await uploadLessonVideo(
            lesson.videoFile,
            courseId,
            dbModuleId,
          );

          // Persist the video URL against the resolved database lesson ID
          await fetch(
            `${API_URL}/api/course/update-lesson/${dbLessonId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                lesson_video: uploadResult.url,
                lesson_title: lesson.lesson_title,
                duration: duration,
              }),
            },
          );

          uploadedVideoCount++;
          setUploadProgress(60 + Math.round((uploadedVideoCount / Math.max(totalNewVideos, 1)) * 30));
        } catch (error) {
          console.error(
            `Failed to upload video for ${lesson.lesson_title}:`,
            error,
          );
        }
      }
    }

    setUploadProgress(90);
    setUploadStatus("Uploading course materials...");

    // Step 4: Upload any newly-selected documents, for BOTH new and existing materials.
    // Same fix as the video loop above — a material gets a document upload whenever the
    // tutor picked a new documentFile in this session, not just when the material itself
    // was newly created.
    const updatedMaterials = updatedCourseData.data?.material || [];
    const materialIdMap = new Map<number, string>();

    updatedMaterials.forEach((dbMaterial: any, index: number) => {
      const tempMaterial = formData.material?.[index];
      if (tempMaterial && !isRealDbId(tempMaterial.id)) {
        materialIdMap.set(index, dbMaterial.id);
      }
    });

    const totalNewDocuments = (formData.material || []).filter(
      (m) => m.material_document?.[0]?.documentFile,
    ).length;
    let uploadedDocumentCount = 0;

    for (let materialIndex = 0; materialIndex < (formData.material || []).length; materialIndex++) {
      const tempMaterial = (formData.material || [])[materialIndex];

      // Resolve the real database material ID whether this material is new or existing
      const dbMaterialId = isRealDbId(tempMaterial.id)
        ? tempMaterial.id.toString()
        : materialIdMap.get(materialIndex);

      const doc = tempMaterial.material_document?.[0];
      if (
        doc?.documentFile &&
        validateFileObject(doc.documentFile) &&
        dbMaterialId
      ) {
        try {
          setUploadStatus(`Uploading document: ${tempMaterial.material_title}...`);

          await uploadCourseMaterial(
            doc.documentFile,
            courseId,
            dbMaterialId,
          );

          uploadedDocumentCount++;
          setUploadProgress(90 + Math.round((uploadedDocumentCount / Math.max(totalNewDocuments, 1)) * 10));
        } catch (error) {
          console.error(
            `Failed to upload document for ${tempMaterial.material_title}:`,
            error,
          );
        }
      }
    }

    setUploadProgress(100);
    setUploadStatus("Course updated successfully!");
    setShowPop(true);
    refreshCourse();

  } catch (error: any) {
    console.error("❌ Course update failed:", error);
    setUploadStatus("Course update failed!");
    setShowError(true);
  } finally {
    setIsUploading(false);
  }
};
  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (isEditMode && courseId) {
      await handleUpdateCourse(e);
    } else {
      await handleCreateCourse(e);
    }
  };

  const fetchCourseDetails = async () => {
    if (!courseId) return;

    try {
      const res = await fetch(`${API_URL}/api/course/get-course/${courseId}`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        console.log("An error occurred while fetching course");
        return;
      }

      const data = await res.json();

      if (data.data) {
        setIsEditMode(true);

        const backendObjectives =
          data.data.objectives || data.data.objective || [];
        let objectiveArray: Objectives[] = [];

        if (backendObjectives.length > 0) {
          const firstObjective = backendObjectives[0];
          objectiveArray = [
            {
              id: firstObjective.id,
              obj1: firstObjective.objective_title1 || "",
              obj2: firstObjective.objective_title2 || "",
              obj3: firstObjective.objective_title3 || "",
              obj4: firstObjective.objective_title4 || "",
              obj5: firstObjective.objective_title5 || "",
            },
          ];
        } else {
          objectiveArray = [
            { obj1: "", obj2: "", obj3: "", obj4: "", obj5: "" },
          ];
        }

        const backendModules = data.data.modules || data.data.module || [];
        const modules: Module[] = backendModules.map((mod: any) => ({
          id: mod.id,
          module_title: mod.module_title || "",
          module_description: mod.module_description || "",
          module_time: mod.module_duration || "0",
          lessons: (mod.lesson || []).map((les: any) => ({
            id: les.id,
            lesson_title: les.lesson_title || "",
            lesson_video: les.lesson_video || "",
            duration: les.duration || 0,
            videoFile: undefined,
          })),
        }));

        const backendMaterials =
          data.data.materials || data.data.material || [];
        const materials: Material[] = backendMaterials.map((mat: any) => ({
          id: mat.id,
          material_title: mat.material_title || "",
          material_description: mat.material_description || "",
          material_page: mat.material_pages || 0,
          material_document: [
            {
              id: 1,
              material_document: mat.material_document || "",
              video_preview: null,
              documentFile: undefined,
            },
          ],
          visible: true,
        }));

        const backendQuizzes = data.data.quiz || [];
        const quizzes: Quiz[] = backendQuizzes.map((qz: any) => ({
          id: qz.id,
          quiz_title: qz.quiz_title || qz.title || "",
          quiz_description: qz.quiz_description || qz.description || "",
          quiz_duration: qz.quiz_duration || qz.duration || "30",
          quiz_passing_score: qz.quiz_score || qz.passingScore || "70",
          quiz_questions: (qz.questions || []).map((q: any) => ({
            id: q.id,
            quiz_question: q.question_name || q.question || "",
            quiz_options: q.options || [],
            correctAnswer: q.correctAnswer || "",
          })),
        }));

        setFormData({
          courseId: data.data.id,
          course_title: data.data.course_title || "",
          course_short_description: data.data.course_short_description || "",
          course_description: data.data.course_description || "",
          course_level: data.data.course_level || "",
          course_image: data.data.course_image || "",
          module: modules,
          material: materials,
          quiz: quizzes,
          objective: objectiveArray,
        });

        if (modules.length > 0)
          localStorage.setItem("module", JSON.stringify(modules));
        if (quizzes.length > 0)
          localStorage.setItem("quiz", JSON.stringify(quizzes));
        if (materials.length > 0)
          localStorage.setItem("course_materials", JSON.stringify(materials));
        if (data.data.course_title)
          localStorage.setItem("COURSE TITLE", data.data.course_title);
      }
    } catch (error) {
      console.error("Error fetching course details:", error);
    } finally {
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    } else {
      setInitialLoad(false);
    }
  }, [courseId]);

  const [step, setStep] = useState<number>(0);
  const totalSteps = 5;

  const nextStep = () => {
    if (step < totalSteps - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const isComplete = [
    !!formData.course_title?.trim() &&
      !!formData.course_description?.trim() &&
      !!formData.course_short_description?.trim() &&
      (formData.courseImageFile || formData.course_image) &&
      !!formData.course_level?.trim(),
    formData.module &&
      formData.module.length > 0 &&
      formData.module.every(
        (mod) =>
          !!mod.module_title?.trim() &&
          !!mod.module_description?.trim() &&
          !!mod.module_time?.trim() &&
          mod.lessons.length > 0 &&
          mod.lessons.every((les) => !!les.lesson_title?.trim()),
      ),
    formData.material &&
      formData.material.length > 0 &&
      formData.material.every(
        (mat) =>
          !!mat.material_title &&
          mat.material_document.length > 0 &&
          !!mat.material_page &&
          !!mat.material_description,
      ),
    formData.quiz &&
      formData.quiz.length > 0 &&
      formData.quiz.every(
        (qz) =>
          !!qz.quiz_title &&
          !!qz.quiz_description &&
          !!qz.quiz_duration &&
          !!qz.quiz_passing_score &&
          qz.quiz_questions.length > 0 &&
          qz.quiz_questions.every(
            (qzo) =>
              Array.isArray(qzo.quiz_options) &&
              qzo.quiz_options.filter((opt) => opt?.trim()).length >= 2,
          ),
      ),
    formData.objective.length > 0 &&
      !!formData.objective[0]?.obj1?.trim() &&
      !!formData.objective[0]?.obj2?.trim() &&
      !!formData.objective[0]?.obj3?.trim() &&
      !!formData.objective[0]?.obj4?.trim() &&
      !!formData.objective[0]?.obj5?.trim(),
  ];

  const steps = [
    <CourseStep1
      key="step1"
      formData={formData}
      setFormData={setFormData}
      uploadCourseImage={uploadCourseImage}
      isEditMode={isEditMode}
    />,
    <CourseStep2
      key="step2"
      formData={formData}
      setFormData={setFormData}
      isEditMode={isEditMode}
    />,
    <CourseStep3
      key="step3"
      formData={formData}
      setFormData={setFormData}
      isEditMode={isEditMode}
    />,
    <CourseStep4
      key="step4"
      formData={formData}
      setFormData={setFormData}
      isEditMode={isEditMode}
    />,
    <CourseStep5
      key="step5"
      formData={formData}
      setFormData={setFormData}
      isEditMode={isEditMode}
    />,
  ];

  const close = () => setShowPop(false);

  const backToCourseFunc = () => {
    setShowCourse(true);
    setShowBreakdownCourse(false);
    // Only re-enter edit mode if this instance was already editing an
    // existing course (courseId prop present from the start). After a
    // fresh creation, courseId stays undefined — forcing edit mode here
    // would mislabel the form as "Edit Course" while still routing
    // submits through handleCreateCourse, silently creating a duplicate.
    setIsEditMode(!!courseId);
  };

  const reviewCourseFunc = () => {
    setShowCourse(false);
    setShowBreakdownCourse(true);
    setShowPop(false);
  };

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/course/get-courses-by-tutor`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data?.data?.[0]?.Courses) {
        console.log("An error occurred while fetching courses");
        return;
      }
      setCourse(data.data[0].Courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (courseId?: string) => {
    if (!courseId) return;
    try {
      setCourse((prev) => prev.filter((c) => c.id !== courseId));
      await deleteCourseFromBackend(courseId);
      backToCourseFunc();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteCourseFromBackend = async (courseId: string): Promise<void> => {
    try {
      const response = await fetch(
        `${API_URL}/api/course/delete-course/${courseId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      await response.json();
      if (!response.ok) console.error("Failed to delete course from backend");
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  if (initialLoad && courseId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryColors-0"></div>
        <p className="ml-3">Loading course details...</p>
      </div>
    );
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        {showBreakdownCourse && (
          <DashboardTutorCourseBreakdown
            backFunc={backToCourse}
            courseId={(courseId || createdCourseId) as any}
            onDelete={handleDelete}
            refreshCourse={fetchCourse}
          />
        )}
        <div>
          {showPop && (
            <DashboardPop
              header={isEditMode ? "Course Updated!" : "Awesome!"}
              close={close}
              backToCourse={backToCourseFunc}
              reviewCourse={reviewCourseFunc}
              paragraph={
                isEditMode
                  ? `Your course "${formData.course_title}" has been updated successfully.`
                  : `Your course "${createdCourseTitle}" has been created successfully.${
                      uploadWarnings.length > 0
                        ? " A couple of files need another try — you'll see them below."
                        : ""
                    }`
              }
              buttonFunc="Review Course"
            />
          )}
          {showPop && !isEditMode && uploadWarnings.length > 0 && (
            <motion.div
              key="upload-warnings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] w-full max-w-[380px] px-4"
            >
              <div className="bg-primaryYellow-0/10 border border-primaryYellow-0 rounded-lg p-4">
                <p className="text-primaryYellow-0 text-[13px] font-[600] mb-2">
                  Your course is live! A few files just need another try:
                </p>
                <ul className="text-textSlightDark-0 text-[12px] list-disc pl-4 space-y-1">
                  {uploadWarnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
          <div key="create-course">
            {showError && (
              <motion.div
                key="error"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeIn" }}
                className="fixed md:top-2 top-[9rem] w-full left-0 flex justify-center items-center flex-col z-[60] px-4"
              >
                <div className="bg-[#da0e2913] py-3 px-[16px] max-w-[380px] w-full rounded-lg border border-[#DA0E29] flex gap-3 items-start">
                  <span className="flex-shrink-0 mt-0.5">
                    <TbCancel size={24} color="#DA0E29" />
                  </span>
                  <p className="text-[#DA0E29] text-[13px] flex-1">
                    {errorMessage || "We hit a snag. Please try again — your details are still here, ready to go."}
                  </p>
                  <span
                    onClick={() => setShowError(false)}
                    className="text-[#DA0E29] cursor-pointer flex-shrink-0 text-lg leading-none"
                  >
                    &times;
                  </span>
                </div>
              </motion.div>
            )}

            {isUploading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50"
              >
                <div className="bg-secondaryColors-0 p-6 rounded-lg max-w-md w-full">
                  <h3 className="text-lg font-semibold mb-2">
                    {isEditMode ? "Updating Course..." : "Uploading Course..."}
                  </h3>
                  <div className="w-full h-2 bg-secondaryColors-0 rounded-full mb-2">
                    <div
                      className="h-full bg-primaryColors-0 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {uploadProgress}% Complete
                  </p>
                  {uploadStatus && (
                    <p className="text-xs text-gray-500 truncate">
                      {uploadStatus}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {showCourse && (
              <>
                <SubHeader
                  header={isEditMode ? "Edit Course" : "Create Course"}
                  backFunction={backToCourse}
                />
                <div className="dashboard_content_mainbox overflow-x-hidden">
                  <div className="flex gap-3">
                    {Array.from({ length: totalSteps }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setStep(index)}
                        className={`h-[3px] w-[74.8px] rounded-full ${isComplete[index] ? "bg-primaryColors-0" : step === index ? "bg-primaryColors-0/50" : "bg-[#D9D9D9]/10"}`}
                      ></button>
                    ))}
                  </div>

                  <motion.form
                    onSubmit={handleSubmit}
                    key={step}
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    className="my-5"
                  >
                    {steps[step]}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        className="form_more dark:bg-shadyColor-0 bg-lightWhite-0 text-primaryColors-0"
                        onClick={prevStep}
                        disabled={isUploading}
                      >
                        Back
                      </button>
                      {step < totalSteps - 1 ? (
                        <button
                          type="button"
                          className="form_more text-plainColors-0 bg-primaryColors-0"
                          onClick={nextStep}
                          disabled={isUploading}
                        >
                          Next <FaArrowRight />
                        </button>
                      ) : (
                        <button
                          className="form_more text-plainColors-0 bg-primaryColors-0"
                          type="submit"
                          disabled={isUploading}
                        >
                          {isUploading
                            ? isEditMode
                              ? "Updating Course..."
                              : "Creating Course..."
                            : isEditMode
                              ? "Update Course"
                              : "Create Course"}
                        </button>
                      )}
                    </div>
                  </motion.form>
                </div>
              </>
            )}
          </div>
        </div>
      </AnimatePresence>
    </div>
  );
}
