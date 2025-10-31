"use client";

import { useState } from "react";
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
  quiz_options: Options[];
}

interface Quiz {
  quiz_title: string;
  quiz_description: string;
  quiz_duration: string;
  quiz_passing_score: string;
  quiz_questions: Question[];
}

interface Course {
  course_title: string;
  course_short_description: string;
  course_description: string;
  course_level: string;
  course_image: string;
  module: Module[];
  material: Material[];
  quiz: Quiz[];
  objective: Objectives[];
}

export default function DashboardTutorCreateCourse({ backToCourse }: Props) {
  const [showError, setShowError] = useState<boolean>(false);
  const [showPop, setShowPop] = useState<boolean>(false);
  const [formData, setFormData] = useState<Course>({
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

  const [step, setStep] = useState<number>(0);
  const totalSteps = 5;

  const nextStep = () => {
    if (step < totalSteps - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  // ✅ Improved Completion Checks
  const isComplete = [
    // Step 1
    formData.course_title &&
      formData.course_description &&
      formData.course_short_description &&
      formData.course_image &&
      formData.course_level,

    // Step 2
    formData.module.length > 0 &&
      formData.module.every(
        (mod) =>
          mod.module_title &&
          mod.module_description &&
          mod.module_time &&
          mod.lessons.length > 0 &&
          mod.lessons.every((les) => les.lesson_title && les.lesson_video)
      ),

    // Step 3 (materials)
    formData.material.length > 0 &&
      formData.material.every(
        (mat) =>
          mat.material_title &&
          mat.material_description &&
          mat.material_page &&
          mat.material_document.length > 0 &&
          mat.material_document.every((doc) => doc.material_document)
      ),

    // Step 4 (quiz)
    formData.quiz.length > 0 &&
      formData.quiz.every(
        (qz) =>
          qz.quiz_title &&
          qz.quiz_description &&
          qz.quiz_duration &&
          qz.quiz_passing_score &&
          qz.quiz_questions.length > 0
      ),

    // Step 5 (objectives)
    formData.objective.length > 0 &&
      formData.objective.every(
        (obj) => obj.obj1 && obj.obj2 && obj.obj3 && obj.obj4 && obj.obj5
      ),
  ];

  const steps = [
    <CourseStep1 formData={formData} setFormData={setFormData} />,
    <CourseStep2 formData={formData} setFormData={setFormData} />,
    <CourseStep3 formData={formData} setFormData={setFormData} />,
    <CourseStep4 formData={formData} setFormData={setFormData} />,
    <CourseStep5 formData={formData} setFormData={setFormData} />,
  ];

  const clearFormData = () => {
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
  };

  const createCourse = () => {
    const isNotCompleted = isComplete.some((complete) => !complete);

    if (isNotCompleted) {
      setShowError(true);
      return;
    }

    clearFormData();
    setShowPop(true);
  };

  const close = () => {
    setShowPop(false);
  };
  const backToCourseFunc = () => {
    backToCourse()
  };
  const reviewCourseFunc = () => {};

  const courseTitle = localStorage.getItem('COURSE TITLE')
  return (
    <div>
      <AnimatePresence mode="wait">
        {showPop && (
          <DashboardPop
            header={`Awsome`}
            close={close}
            backToCourse={backToCourseFunc}
            reviewCourse={reviewCourseFunc}
            paragraph={`Your course "${courseTitle}" has been created successfully.`}
            buttonFunc="Review Answers"
          />
        )}
        <div key="create-course">
          {" "}
          {showError && (
            <motion.div
              key="error"
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              exit={{ y: 50 }}
              transition={{ duration: 0.3, ease: "easeIn" }}
              className="fixed top-2 w-full left-0 flex justify-center items-center flex-col"
            >
              <div className=" bg-[#da0e2913] py-2 px-[12px] w-[280px] border border-[#DA0E29] flex justify-between items-center">
                <span>
                  <TbCancel size={30} color="#DA0E29" />
                </span>
                <p className="text-[#DA0E29] text-[13px]">
                  Sorry all form must be filled
                </p>
                <span onClick={() => setShowError(false)}>&times;</span>
              </div>
            </motion.div>
          )}
          <SubHeader header="Create Course" backFunction={backToCourse} />
          <div className="dashboard_content_mainbox overflow-x-hidden">
            {/* Progress bar */}
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

            <motion.div
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
            </motion.div>
          </div>
          <div className="dashboard_content_mainbox">
            <div className="grid grid-cols-2 gap-3">
              <span
                className="form_more bg-secondaryColors-0 text-primaryColors-0"
                onClick={prevStep}
              >
                Back
              </span>
              {step < totalSteps - 1 ? (
                <span
                  className="form_more text-plainColors-0 bg-primaryColors-0"
                  onClick={nextStep}
                >
                  Next <FaArrowRight />
                </span>
              ) : (
                <span
                  className="form_more text-plainColors-0 bg-primaryColors-0"
                  onClick={createCourse}
                >
                  Create Course
                </span>
              )}
            </div>
          </div>
        </div>
      </AnimatePresence>
    </div>
  );
}
