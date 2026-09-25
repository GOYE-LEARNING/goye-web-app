"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BsPlus } from "react-icons/bs";
import Image from "next/image";
import Pic from "@/public/images/notfound.png";
import { FaCheck, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { IoTrashOutline } from "react-icons/io5";
import { MdCancel } from "react-icons/md";
import SubHeader from "./dashboard_subheader";
import { useModal } from "@/app/context/SimpleModalContext";

function usePersistentState<T>(
  key: string,
  defaultValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    }
    return defaultValue;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(state));
    }
  }, [key, state]);

  return [state, setState];
}

interface Props {
  removeReview: () => void;
  courseId: string;
}

interface Question {
  id: number;
  quiz_question: string;
  quiz_options: string[];
  correctAnswer: string;
}

interface Quiz {
  id: number;
  quiz_title: string;
  quiz_description: string;
  quiz_duration: string;
  quiz_passing_score: string;
  quiz_questions: Question[];
  visible: boolean;
}

export default function DashboardTutorAddQuiz({
  removeReview,
  courseId,
}: Props) {
  const [quiz, setQuiz] = usePersistentState<Quiz[]>("quiz", []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showModal } = useModal();

  const quizForm = [
    { label: "Quiz title", type: "text", name: "quiz_title" },
    { label: "Description", type: "text", name: "quiz_description" },
    { label: "Duration (min)", type: "number", name: "quiz_duration" },
    { label: "Passing Score (%)", type: "number", name: "quiz_passing_score" },
  ];

  // ✅ Create new quiz
  const createQuiz = () => {
    setQuiz((prev) => [
      ...prev,
      {
        id: Date.now(),
        quiz_title: "",
        quiz_description: "",
        quiz_duration: "",
        quiz_passing_score: "",
        quiz_questions: [],
        visible: true,
      },
    ]);
  };

  // ✅ Delete quiz
  const deleteQuiz = (quizId: number) => {
    showModal(
      "Delete Quiz",
      "Are you sure you want to delete this quiz? This action cannot be undone.",
      "confirm",
      () => {
        setQuiz((prev) => prev.filter((q) => q.id !== quizId));
        showModal("Deleted", "Quiz has been removed.", "success");
      },
    );
  };

  // ✅ Create new question
  const createQuestion = (quizId: number) => {
    setQuiz((prev) =>
      prev.map((quiz) =>
        quiz.id === quizId
          ? {
              ...quiz,
              quiz_questions: [
                ...quiz.quiz_questions,
                {
                  id: Date.now(),
                  quiz_question: "",
                  quiz_options: ["", "", "", ""],
                  correctAnswer: "",
                },
              ],
            }
          : quiz,
      ),
    );
  };

  // ✅ Delete a question
  const deleteQuestion = (quizId: number, questionId: number) => {
    showModal(
      "Delete Question",
      "Are you sure you want to delete this question?",
      "confirm",
      () => {
        setQuiz((prev) =>
          prev.map((quiz) =>
            quiz.id === quizId
              ? {
                  ...quiz,
                  quiz_questions: quiz.quiz_questions.filter(
                    (q) => q.id !== questionId,
                  ),
                }
              : quiz,
          ),
        );
        showModal("Deleted", "Question removed successfully.", "success");
      },
    );
  };

  // ✅ Handle quiz input changes
  const handleChangeQuiz = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    id: number,
  ) => {
    const { name, value } = e.target;
    setQuiz((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [name]: value } : q)),
    );
  };

  // ✅ Toggle quiz visibility
  const handleQuizShow = (quizId: number) => {
    setQuiz((prev) =>
      prev.map((q) => (q.id === quizId ? { ...q, visible: !q.visible } : q)),
    );
  };

  // ✅ Handle question text change
  const handleChangeQuestion = (
    e: React.ChangeEvent<HTMLInputElement>,
    quizId: number,
    questionId: number,
  ) => {
    const { value } = e.target;
    setQuiz((prev) =>
      prev.map((quiz) =>
        quiz.id === quizId
          ? {
              ...quiz,
              quiz_questions: quiz.quiz_questions.map((q) =>
                q.id === questionId ? { ...q, quiz_question: value } : q,
              ),
            }
          : quiz,
      ),
    );
  };

  // ✅ Handle option change
  const handleChangeOption = (
    e: React.ChangeEvent<HTMLInputElement>,
    quizId: number,
    questionId: number,
    optionIndex: number,
  ) => {
    const { value } = e.target;
    setQuiz((prev) =>
      prev.map((quiz) =>
        quiz.id === quizId
          ? {
              ...quiz,
              quiz_questions: quiz.quiz_questions.map((q) =>
                q.id === questionId
                  ? {
                      ...q,
                      quiz_options: q.quiz_options.map((opt, i) =>
                        i === optionIndex ? value : opt,
                      ),
                    }
                  : q,
              ),
            }
          : quiz,
      ),
    );
  };

  // ✅ Mark correct answer
  const handleCorrectAnswer = (
    quizId: number,
    questionId: number,
    correct: string,
  ) => {
    setQuiz((prev) =>
      prev.map((quiz) =>
        quiz.id === quizId
          ? {
              ...quiz,
              quiz_questions: quiz.quiz_questions.map((q) =>
                q.id === questionId ? { ...q, correctAnswer: correct } : q,
              ),
            }
          : quiz,
      ),
    );
  };

  // ✅ SUBMIT QUIZZES TO API
  const handleSubmit = async () => {
    // Validation
    if (quiz.length === 0) {
      showModal(
        "No Quizzes",
        "Please add at least one quiz before submitting.",
        "error",
      );
      return;
    }

    for (let i = 0; i < quiz.length; i++) {
      const qz = quiz[i];

      if (!qz.quiz_title.trim()) {
        showModal(
          "Missing Field",
          `Quiz ${i + 1} is missing a title.`,
          "error",
        );
        return;
      }
      if (!qz.quiz_description.trim()) {
        showModal(
          "Missing Field",
          `Quiz ${i + 1} is missing a description.`,
          "error",
        );
        return;
      }
      if (!qz.quiz_duration.trim()) {
        showModal(
          "Missing Field",
          `Quiz ${i + 1} is missing a duration.`,
          "error",
        );
        return;
      }
      if (!qz.quiz_passing_score.trim()) {
        showModal(
          "Missing Field",
          `Quiz ${i + 1} is missing a passing score.`,
          "error",
        );
        return;
      }
      if (qz.quiz_questions.length === 0) {
        showModal(
          "Missing Questions",
          `Quiz ${i + 1} has no questions. Add at least one question.`,
          "error",
        );
        return;
      }

      for (let j = 0; j < qz.quiz_questions.length; j++) {
        const q = qz.quiz_questions[j];
        if (!q.quiz_question.trim()) {
          showModal(
            "Missing Field",
            `Quiz ${i + 1}, Question ${j + 1} is missing the question text.`,
            "error",
          );
          return;
        }

        const filledOptions = q.quiz_options.filter((o) => o.trim() !== "");
        if (filledOptions.length < 2) {
          showModal(
            "Incomplete Options",
            `Quiz ${i + 1}, Question ${j + 1} needs at least 2 options.`,
            "error",
          );
          return;
        }

        if (!q.correctAnswer.trim()) {
          showModal(
            "Missing Correct Answer",
            `Quiz ${i + 1}, Question ${j + 1} has no correct answer selected.`,
            "error",
          );
          return;
        }

        if (!q.quiz_options.includes(q.correctAnswer)) {
          showModal(
            "Invalid Correct Answer",
            `Quiz ${i + 1}, Question ${j + 1}: the correct answer must match one of the filled options.`,
            "error",
          );
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      const results = await Promise.all(
        quiz.map(async (qz) => {
          const body = {
            title: qz.quiz_title,
            description: qz.quiz_description,
            courseId,
            duration: Number(qz.quiz_duration) || undefined,
            passingScore: Number(qz.quiz_passing_score) || undefined,
            questions: qz.quiz_questions.map((q, idx) => ({
              question: q.quiz_question,
              options: q.quiz_options.filter((o) => o.trim() !== ""),
              correctAnswer: q.correctAnswer,
              order: idx + 1,
            })),
          };

          const res = await fetch(
            `${API_URL}/api/course/create-quiz/${courseId}`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(body),
            },
          );

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(
              errData.message || `Failed to create quiz "${qz.quiz_title}"`,
            );
          }

          return res.json();
        }),
      );

      showModal(
        "Success",
        `${results.length} quiz${results.length > 1 ? "zes" : ""} created successfully!`,
        "success",
      );

      setQuiz([]);
      if (typeof window !== "undefined") {
        localStorage.removeItem("quiz");
      }

      setTimeout(() => {
        removeReview();
      }, 1200);
    } catch (err: any) {
      showModal(
        "Error",
        err.message || "Something went wrong. Please try again.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SubHeader header="Add Quiz" backFunction={removeReview} />
      <div className="dashboard_content_mainbox">
        <AnimatePresence mode="wait">
          <div key="quiz">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0 font-semibold text-[18px]">
                Course Quizzes
              </h1>
              <span
                className="flex items-center gap-2 cursor-pointer dark:text-textSlightDark-0 text-lightBoldText-0"
                onClick={createQuiz}
              >
                <BsPlus /> Add Quiz
              </span>
            </div>

            {/* Empty state */}
            {quiz.length === 0 ? (
              <div className="flex justify-center items-center flex-col gap-1">
                <Image src={Pic} alt="pic" height={100} width={100} />
                <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0 font-semibold text-[18px]">
                  No Quiz Found
                </h1>
                <p className="text-textGrey-0">Create a quiz</p>
              </div>
            ) : (
              <div className="my-5">
                {quiz.map((qz, i) => (
                  <div key={qz.id}>
                    {/* Quiz Header */}
                    <div className="w-full flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="h-[20px] w-[20px] bg-boldGreen-0 text-white flex justify-center items-center rounded-[2px]">
                          {i + 1}
                        </span>
                        <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0">
                          Quiz
                        </h1>
                        <div
                          className="flex flex-col text-[0.5em] cursor-pointer dark:text-textSlightDark-0 text-lightBoldText-0"
                          onClick={() => handleQuizShow(qz.id)}
                        >
                          <FaChevronUp />
                          <FaChevronDown />
                        </div>
                      </div>

                      <button
                        onClick={() => deleteQuiz(qz.id)}
                        className="text-red-500"
                      >
                        <IoTrashOutline />
                      </button>
                    </div>

                    {/* Quiz Form */}
                    {qz.visible && (
                      <motion.div
                        key="quiz"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="my-3 flex flex-col gap-3">
                          {quizForm.map((form, idx) => (
                            <div
                              key={idx}
                              className="flex flex-col border border-[#D2D5DA]/20 justify-between w-full py-[8px] px-[12px]"
                            >
                              <label className="text-textGrey-0 text-[12px]">
                                {form.label}
                              </label>
                              {form.name === "quiz_description" ? (
                                <textarea
                                  name={form.name}
                                  value={qz.quiz_description}
                                  onChange={(e) => handleChangeQuiz(e, qz.id)}
                                  className="resize-none h-[154px] outline-none border-none bg-transparent dark:text-textSlightDark-0 text-lightBoldText-0 font-[500] text-[16px]"
                                />
                              ) : (
                                <input
                                  type={form.type}
                                  name={form.name}
                                  value={qz[form.name as keyof Quiz] as string}
                                  onChange={(e) => handleChangeQuiz(e, qz.id)}
                                  className="border-none outline-none w-full dark:text-textSlightDark-0 text-lightBoldText-0 bg-transparent font-[500] text-[16px]"
                                />
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Questions */}
                        <div className="dashboard_hr my-3"></div>

                        {qz.quiz_questions.map((q) => (
                          <div
                            key={q.id}
                            className="p-[12px] dark:bg-shadyColor-0 bg-lightWhite-0 flex flex-col gap-2 my-3"
                          >
                            {/* Question Text */}
                            <div className="flex flex-col border border-[#D2D5DA]/20 justify-between w-full py-[8px] px-[12px] dark:bg-transparent bg-transparent">
                              <label className="text-textGrey-0 text-[12px]">
                                Question
                              </label>{" "}
                              <input
                                type="text"
                                value={q.quiz_question}
                                onChange={(e) =>
                                  handleChangeQuestion(e, qz.id, q.id)
                                }
                                className="border-none outline-none w-full dark:text-textSlightDark-0 text-lightBoldText-0 bg-transparent font-[500] text-[16px]"
                              />
                            </div>

                            {/* Options */}
                            {q.quiz_options.map((opt, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between gap-2 items-start"
                              >
                                <div className="flex flex-col border border-[#D2D5DA]/20 justify-between w-full py-[8px] px-[12px] dark:bg-transparent bg-transparent">
                                  <label className="text-textGrey-0 text-[12px]">
                                    {`Option ${idx + 1}`}
                                  </label>
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) =>
                                      handleChangeOption(e, qz.id, q.id, idx)
                                    }
                                    className="border-none outline-none w-full dark:text-textSlightDark-0 text-lightBoldText-0 bg-transparent font-[500] text-[16px]"
                                  />
                                </div>
                                <div className="flex items-center gap-3">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`correct-${q.id}`}
                                      checked={
                                        q.correctAnswer === opt && opt !== ""
                                      }
                                      onChange={() =>
                                        handleCorrectAnswer(qz.id, q.id, opt)
                                      }
                                      className="hidden"
                                    />

                                    <div className="h-[59px] w-[20px] border border-[#D2D5DA]/20 flex flex-col">
                                      <div
                                        onClick={() =>
                                          opt !== "" &&
                                          handleCorrectAnswer(qz.id, q.id, opt)
                                        }
                                        className={`flex-1 flex justify-center items-center border-b border-[#D2D5DA]/20 transition-colors ${
                                          q.correctAnswer === opt && opt !== ""
                                            ? "bg-[#30A46F]"
                                            : "dark:bg-transparent bg-white"
                                        }`}
                                      >
                                        {q.correctAnswer === opt &&
                                          opt !== "" && (
                                            <FaCheck
                                              className="text-white"
                                              size={10}
                                            />
                                          )}
                                      </div>

                                      <div
                                        onClick={() =>
                                          handleCorrectAnswer(qz.id, q.id, "")
                                        }
                                        className={`flex-1 flex justify-center items-center transition-colors ${
                                          q.correctAnswer !== opt &&
                                          q.correctAnswer !== ""
                                            ? "bg-[#DA0E29]"
                                            : "bg-[#6A6A6A0D]"
                                        }`}
                                      >
                                        {q.correctAnswer !== opt &&
                                          q.correctAnswer !== "" && (
                                            <MdCancel
                                              className="text-white"
                                              size={10}
                                            />
                                          )}
                                      </div>
                                    </div>
                                  </label>
                                </div>
                              </div>
                            ))}

                            {/* Delete Question */}
                            <button
                              onClick={() => deleteQuestion(qz.id, q.id)}
                              className="form_more bg-[#DA0E290D] text-[#DA0E29] text-[15px] font-[600] w-full flex items-center justify-center gap-2 mt-3"
                            >
                              <IoTrashOutline /> Delete Question
                            </button>
                          </div>
                        ))}

                        {/* Add Question Button */}
                        <button
                          onClick={() => createQuestion(qz.id)}
                          className="h-[48px] dark:bg-boldShadyColor-0 bg-lightWhite-0 text-primaryColors-0 text-[15px] font-semibold flex justify-center items-center gap-2 w-full mt-2"
                        >
                          <BsPlus /> Add Question
                        </button>
                      </motion.div>
                    )}
                    <div className="dashboard_hr my-5"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Submit Button */}
            <button
              className="form_btn disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={isSubmitting || quiz.length === 0}
            >
              {isSubmitting ? "Creating..." : "Create Quiz"}
            </button>
          </div>
        </AnimatePresence>
      </div>
    </>
  );
}
