"use client";

import React, { useState } from "react";
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

interface Props {
  backToCourse: () => void;
}

interface Objectives {
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

interface Options {
  option1: string;
  option2: string;
  option3: string;
  option4: string;
}

interface Question {
  quiz_question: string;
  quiz_options: Options;
  correctAnswer?: string;
}

interface Quiz {
  quiz_title: string;
  quiz_description: string;
  quiz_duration: string;
  quiz_passing_score: string;
  quiz_questions: Question[];
}

interface Course {
  courseId?: string;
  course_title: string;
  course_short_description: string;
  course_description: string;
  course_level: string;
  course_image: string;
  courseImageFile?: File;
  module: Module[];
  material: Material[];
  quiz: Quiz[];
  objective: Objectives[];
}

export default function DashboardTutorCreateCourse({ backToCourse }: Props) {
  const [showError, setShowError] = useState<boolean>(false);
  const [showPop, setShowPop] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [createdCourseId, setCreatedCourseId] = useState<string>("");

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

  // Fixed file upload function that matches backend format
  const uploadFile = async (file: File, endpoint: string): Promise<string> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64String = btoa(
        String.fromCharCode(...new Uint8Array(arrayBuffer))
      );
      const payload = {
        file: base64String,
        fileName: file.name,
        mimeType: file.type,
      };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.data?.imageUrl) return data.data.imageUrl;
      if (data.data?.lesson_video) return data.data.lesson_video;
      if (data.data?.material_document) return data.data.material_document;

      return data.url || data.fileUrl || "";
    } catch (error) {
      throw error;
    }
  };

  const uploadCourseImage = async (
    file: File,
    courseId: string
  ): Promise<string> => {
    return await uploadFile(
      file,
      `/api/course/upload-course-image/${courseId}`
    );
  };

  const uploadLessonVideo = async (
    file: File,
    courseId: string,
    moduleId: string
  ): Promise<string> => {
    return await uploadFile(
      file,
      `/api/course/upload-lesson-video/${courseId}/${moduleId}`
    );
  };

  const uploadCourseMaterial = async (
    file: File,
    courseId: string
  ): Promise<string> => {
    return await uploadFile(
      file,
      `/api/course/upload-course-material/${courseId}`
    );
  };

  const handleCreateCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadProgress(0);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    try {
      // Convert quiz options properly
      const quizPayload = formData.quiz.map((qz) => {
        const questions = qz.quiz_questions.map((q, qIndex) => {
          const options = q.quiz_options;
          const optionsArray: string[] = [];

          if (options.option1?.trim())
            optionsArray.push(options.option1.trim());
          if (options.option2?.trim())
            optionsArray.push(options.option2.trim());
          if (options.option3?.trim())
            optionsArray.push(options.option3.trim());
          if (options.option4?.trim())
            optionsArray.push(options.option4.trim());

          if (optionsArray.length < 2) {
            const defaultOptions = ["True", "False"];
            optionsArray.push(
              ...defaultOptions.slice(0, 2 - optionsArray.length)
            );
          }

          return {
            question: q.quiz_question?.trim() || `Question ${qIndex + 1}`,
            options: optionsArray,
            correctAnswer: q.correctAnswer?.trim() || optionsArray[0] || "",
            explanation: "",
            points: 1,
            order: qIndex,
          };
        });

        return {
          title: qz.quiz_title?.trim() || "Untitled Quiz",
          description: qz.quiz_description?.trim() || "",
          duration: parseInt(qz.quiz_duration) || 30,
          passingScore: parseInt(qz.quiz_passing_score) || 70,
          maxAttempts: 3,
          questions: questions,
        };
      });

      const requestPayload = {
        course_title: formData.course_title,
        course_short_description: formData.course_short_description,
        course_description: formData.course_description,
        course_level: formData.course_level,
        course_image: "temp",
        module: formData.module.map((m, index) => ({
          module_title: m.module_title,
          module_description: m.module_description,
          module_duration: m.module_time,
          order: index,
          lessons: m.lessons.map((l, lessonIndex) => ({
            lesson_title: l.lesson_title,
            lesson_video: "temp",
            order: lessonIndex,
            duration: 0,
          })),
        })),
        material: formData.material.map((mt) => ({
          material_title: mt.material_title,
          material_description: mt.material_description,
          material_pages: mt.material_page,
          material_document: "temp",
        })),
        quiz: quizPayload,
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
      };

      // Step 1: Create the course first
      const courseResponse = await fetch(
        `${API_URL}/api/course/create-course`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(requestPayload),
        }
      );

      if (!courseResponse.ok) {
        throw new Error("Failed to create course");
      }

      const courseData = await courseResponse.json();

      if (!courseData.data || !courseData.data.id) {
        throw new Error("No course ID returned");
      }

      const courseId = courseData.data.id;
      setCreatedCourseId(courseId);
      setUploadProgress(20);

      // Step 2: Upload course image
      let courseImageUrl = "";
      if (formData.courseImageFile) {
        try {
          courseImageUrl = await uploadCourseImage(
            formData.courseImageFile,
            courseId
          );
          setUploadProgress(40);
        } catch (error) {
          // Continue with other uploads even if image fails
        }
      }

      // Step 3: Upload lesson videos
      const moduleUploadPromises = formData.module.map(async (module) => {
        const lessonUploadPromises = module.lessons.map(async (lesson) => {
          if (lesson.videoFile) {
            try {
              const videoUrl = await uploadLessonVideo(
                lesson.videoFile,
                courseId,
                module.id.toString()
              );
              return { videoUrl };
            } catch (error) {
              return null;
            }
          }
          return null;
        });

        const results = await Promise.all(lessonUploadPromises);
        return results.filter((result) => result !== null);
      });

      await Promise.all(moduleUploadPromises);
      setUploadProgress(60);

      // Step 4: Upload course materials
      const materialUploadPromises = formData.material.map(async (material) => {
        const documentUploadPromises = material.material_document.map(
          async (doc) => {
            if (doc.documentFile) {
              try {
                const documentUrl = await uploadCourseMaterial(
                  doc.documentFile,
                  courseId
                );
                return { documentUrl };
              } catch (error) {
                return null;
              }
            }
            return null;
          }
        );

        const results = await Promise.all(documentUploadPromises);
        return results.filter((result) => result !== null);
      });

      await Promise.all(materialUploadPromises);
      setUploadProgress(80);

      // Step 5: Update course with actual image URL if uploaded
      if (courseImageUrl) {
        try {
          await fetch(`${API_URL}/api/course/update-course/${courseId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              course_image: courseImageUrl,
            }),
          });
        } catch (error) {
          // Continue even if update fails
        }
      }

      setUploadProgress(100);
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
    } catch (error) {
      setShowError(true);
    } finally {
      setIsUploading(false);
    }
  };

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
      !!formData.courseImageFile &&
      !!formData.course_level?.trim(),

    formData.module.length > 0 &&
      formData.module.every(
        (mod) =>
          !!mod.module_title?.trim() &&
          !!mod.module_description?.trim() &&
          !!mod.module_time?.trim() &&
          mod.lessons.length > 0 &&
          mod.lessons.every(
            (les) => !!les.lesson_title?.trim() && !!les.videoFile
          )
      ),

    true,

    true,

    formData.objective.length > 0 &&
      !!formData.objective[0]?.obj1?.trim() &&
      !!formData.objective[0]?.obj2?.trim() &&
      !!formData.objective[0]?.obj3?.trim() &&
      !!formData.objective[0]?.obj4?.trim() &&
      !!formData.objective[0]?.obj5?.trim(),
  ];

  const steps = [
    <CourseStep1 formData={formData} setFormData={setFormData} />,
    <CourseStep2 formData={formData} setFormData={setFormData} />,
    <CourseStep3 formData={formData} setFormData={setFormData} />,
    <CourseStep4 formData={formData} setFormData={setFormData} />,
    <CourseStep5 formData={formData} setFormData={setFormData} />,
  ];

  const createCourse = () => {
    const isNotCompleted = isComplete.some((complete) => !complete);

    if (isNotCompleted) {
      setShowError(true);
      return;
    }
  };

  const close = () => {
    setShowPop(false);
  };

  const backToCourseFunc = () => {
    backToCourse();
  };

  const reviewCourseFunc = () => {
    if (createdCourseId) {
      window.location.href = `/course/${createdCourseId}`;
    }
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {showPop && (
          <DashboardPop
            header={`Awesome`}
            close={close}
            backToCourse={backToCourseFunc}
            reviewCourse={reviewCourseFunc}
            paragraph={`Your course "${formData.course_title}" has been created successfully.`}
            buttonFunc="Review Course"
          />
        )}

        <div key="create-course">
          {showError && (
            <motion.div
              key="error"
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              exit={{ y: 50 }}
              transition={{ duration: 0.3, ease: "easeIn" }}
              className="fixed md:top-2 top-[9rem] w-full left-0 flex justify-center items-center flex-col"
            >
              <div className="bg-[#da0e2913] py-2 px-[12px] w-[280px] border border-[#DA0E29] flex justify-between items-center">
                <span>
                  <TbCancel size={30} color="#DA0E29" />
                </span>
                <p className="text-[#DA0E29] text-[13px]">
                  Sorry, all forms must be filled and files uploaded
                </p>
                <span onClick={() => setShowError(false)}>&times;</span>
              </div>
            </motion.div>
          )}

          {isUploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">
                  Uploading Course...
                </h3>
                <div className="w-64 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-primaryColors-0 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {uploadProgress}% Complete
                </p>
              </div>
            </motion.div>
          )}

          <SubHeader header="Create Course" backFunction={backToCourse} />
          <div className="dashboard_content_mainbox overflow-x-hidden">
            <div className="flex gap-3">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setStep(index)}
                  className={`h-[3px] w-[74.8px] rounded-full ${
                    isComplete[index]
                      ? "bg-primaryColors-0"
                      : step === index
                      ? "bg-primaryColors-0/10"
                      : "bg-[#D9D9D9]"
                  }`}
                ></button>
              ))}
            </div>

            <motion.form
              onSubmit={handleCreateCourse}
              key={step}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
              className="my-5"
            >
              {steps[step]}

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="form_more bg-secondaryColors-0 text-primaryColors-0"
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
                    {isUploading ? "Creating Course..." : "Create Course"}
                  </button>
                )}
              </div>
            </motion.form>
          </div>
        </div>
      </AnimatePresence>
    </div>
  );
}
