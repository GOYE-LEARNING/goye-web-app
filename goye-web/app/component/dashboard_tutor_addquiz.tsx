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
function usePersistentState<T>(
  key: string,
  defaultValue: T
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
}

interface Question {
  id: number;
  quiz_question: string;
  quiz_options: string[];
  correct_answer: string;
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

export default function DashboardTutorAddQuiz({ removeReview }: Props) {
  const [quiz, setQuiz] = usePersistentState<Quiz[]>("quiz", []);
  const [formData, setFormData] = useState<Quiz[]>([]);
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
    setQuiz((prev) => prev.filter((quiz) => quiz.id !== quizId));
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
                  correct_answer: "",
                },
              ],
            }
          : quiz
      )
    );
  };

  // ✅ Delete a question
  const deleteQuestion = (quizId: number, questionId: number) => {
    setQuiz((prev) =>
      prev.map((quiz) =>
        quiz.id === quizId
          ? {
              ...quiz,
              quiz_questions: quiz.quiz_questions.filter(
                (q) => q.id !== questionId
              ),
            }
          : quiz
      )
    );
  };

  // ✅ Handle quiz input changes
  const handleChangeQuiz = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    id: number
  ) => {
    const { name, value } = e.target;
    setQuiz((prev) =>
      prev.map((quiz) => (quiz.id === id ? { ...quiz, [name]: value } : quiz))
    );
  };

  // ✅ Toggle quiz visibility
  const handleQuizShow = (quizId: number) => {
    setQuiz((prev) =>
      prev.map((quiz) =>
        quiz.id === quizId ? { ...quiz, visible: !quiz.visible } : quiz
      )
    );
  };

  // ✅ Handle question text change
  const handleChangeQuestion = (
    e: React.ChangeEvent<HTMLInputElement>,
    quizId: number,
    questionId: number
  ) => {
    const { value } = e.target;
    setQuiz((prev) =>
      prev.map((quiz) =>
        quiz.id === quizId
          ? {
              ...quiz,
              quiz_questions: quiz.quiz_questions.map((q) =>
                q.id === questionId ? { ...q, quiz_question: value } : q
              ),
            }
          : quiz
      )
    );
  };

  // ✅ Handle option change
  const handleChangeOption = (
    e: React.ChangeEvent<HTMLInputElement>,
    quizId: number,
    questionId: number,
    optionIndex: number
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
                        i === optionIndex ? value : opt
                      ),
                    }
                  : q
              ),
            }
          : quiz
      )
    );
  };

  // ✅ Mark correct answer
  const handleCorrectAnswer = (
    quizId: number,
    questionId: number,
    correct: string
  ) => {
    setQuiz((prev) =>
      prev.map((quiz) =>
        quiz.id === quizId
          ? {
              ...quiz,
              quiz_questions: quiz.quiz_questions.map((q) =>
                q.id === questionId ? { ...q, correct_answer: correct } : q
              ),
            }
          : quiz
      )
    );
  };

  return (
    <>
      <SubHeader header="Add Quiz" backFunction={removeReview} />
      <div className="dashboard_content_mainbox">
        <AnimatePresence mode="wait">
          <div key="quiz">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h1 className="text-textSlightDark-0 font-semibold text-[18px]">
                Course Quizzes
              </h1>
              <span
                className="flex items-center gap-2 cursor-pointer"
                onClick={createQuiz}
              >
                <BsPlus /> Add Quiz
              </span>
            </div>

            {/* Empty state */}
            {quiz.length === 0 ? (
              <div className="flex justify-center items-center flex-col gap-1">
                <Image src={Pic} alt="pic" height={100} width={100} />
                <h1 className="text-textSlightDark-0 font-semibold text-[18px]">
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
                        <h1>Quiz</h1>
                        <div
                          className="flex flex-col text-[0.5em] cursor-pointer"
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
                          {quizForm.map((form, i) => (
                            <div
                              key={i}
                              className="flex flex-col border border-[#D2D5DA] justify-between w-full py-[8px] px-[12px]"
                            >
                              <label className="text-textGrey-0 text-[12px]">
                                {form.label}
                              </label>
                              {form.name === "quiz_description" ? (
                                <textarea
                                  name={form.name}
                                  value={qz.quiz_description}
                                  onChange={(e) => handleChangeQuiz(e, qz.id)}
                                  className="resize-none h-[154px] outline-none border-none"
                                />
                              ) : (
                                <input
                                  type={form.type}
                                  name={form.name}
                                  value={qz[form.name as keyof Quiz] as string}
                                  onChange={(e) => handleChangeQuiz(e, qz.id)}
                                  className="border-none outline-none w-full text-textSlightDark-0 font-[500] text-[16px]"
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
                            className="p-[12px] bg-shadyColor-0 my-3 flex flex-col gap-2"
                          >
                            {/* Question Text */}
                            <div className="flex flex-col border border-[#D2D5DA] justify-between w-full py-[8px] px-[12px] bg-white">
                              <label className="text-textGrey-0 text-[12px]">
                                Question
                              </label>{" "}
                              <input
                                type="text"
                                value={q.quiz_question}
                                onChange={(e) =>
                                  handleChangeQuestion(e, qz.id, q.id)
                                }
                                className="border-none outline-none w-full text-textSlightDark-0 font-[500] text-[16px]"
                              />
                            </div>

                            {/* Options */}
                            {q.quiz_options.map((opt, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between gap-2 items-start"
                              >
                                <div className="flex flex-col border border-[#D2D5DA] justify-between w-full py-[8px] px-[12px] bg-white">
                                  <label className="text-textGrey-0 text-[12px]">
                                    {`Option ${idx + 1}`}
                                  </label>
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) =>
                                      handleChangeOption(e, qz.id, q.id, idx)
                                    }
                                    className="border-none outline-none w-full text-textSlightDark-0 font-[500] text-[16px]"
                                  />
                                </div>
                                <div className="flex items-center gap-3">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    {/* Hidden radio input for logic */}
                                    <input
                                      type="radio"
                                      name={`correct-${q.id}`}
                                      checked={q.correct_answer === opt}
                                      onChange={() =>
                                        handleCorrectAnswer(qz.id, q.id, opt)
                                      }
                                      className="hidden"
                                    />

                                    {/* Visual Indicator */}
                                    <div className="h-[59px] w-[20px] border border-[#D2D5DA] flex flex-col">
                                      {/* Top Green Check */}
                                      <div
                                        onClick={() =>
                                          handleCorrectAnswer(qz.id, q.id, opt)
                                        }
                                        className={`flex-1 flex justify-center items-center border-b border-[#D5D5DD] transition-colors ${
                                          q.correct_answer === opt
                                            ? "bg-[#30A46F]"
                                            : "bg-white"
                                        }`}
                                      >
                                        {q.correct_answer === opt && (
                                          <FaCheck
                                            className="text-white"
                                            size={10}
                                          />
                                        )}
                                      </div>

                                      {/* Bottom Red Cancel */}
                                      <div
                                        onClick={() =>
                                          handleCorrectAnswer(qz.id, q.id, "")
                                        } // Clear the answer
                                        className={`flex-1 flex justify-center items-center transition-colors ${
                                          q.correct_answer !== opt &&
                                          q.correct_answer !== ""
                                            ? "bg-[#DA0E29]"
                                            : "bg-[#6A6A6A0D]"
                                        }`}
                                      >
                                        {q.correct_answer !== opt &&
                                          q.correct_answer !== "" && (
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
                          className="h-[48px] bg-boldShadyColor-0 text-primaryColors-0 text-[15px] font-semibold flex justify-center items-center gap-2 w-full mt-2"
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
          </div>
        </AnimatePresence>
      </div>
    </>
  );
}
