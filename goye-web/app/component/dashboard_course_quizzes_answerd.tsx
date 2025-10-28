"use client";

import { CiClock1 } from "react-icons/ci";
import SubHeader from "./dashboard_subheader";
import { useState, useEffect } from "react";
import { FaCheck } from "react-icons/fa";
import DashboardPop from "./dashboard_popop";
import DashboardQuizReview from "./dashboard_quiz_review";

interface Props {
  backFunction: () => void;
  reviewCourse: () => void;
  backToCourse: () => void;
}

interface Quiz {
  id: number;
  question: string;
  options: {
    option1: { label: string };
    option2: { label: string };
    option3: { label: string };
    option4: { label: string };
  };
}

export default function DashboardCourseQuizzesAnswered({
  backFunction,
  backToCourse,
}: Props) {
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [timeLeft, setTimeLeft] = useState(200); // Example: 200s
  const [popup, setPopup] = useState<boolean>(false);
  const [showQuiz, setShowQuiz] = useState<boolean>(true);
  const [showQuizReview, setShowQuizReview] = useState<boolean>(false);
  const totalTime = 200;

  const backToCourseFor = () => {
    backFunction()
  };

  const reviewCourse = () => {
    setShowQuiz(false);
    setShowQuizReview(true);
  };
  // 🕒 Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // 📊 Progress percentage
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  // 🧠 Quiz data
  const quiz: Quiz[] = [
    {
      id: 1,
      question:
        "According to the course material, which of these is NOT a key element of a disciple?",
      options: {
        option1: { label: "Honest communication with God" },
        option2: { label: "Regular thanksgiving" },
        option3: { label: "Listening to gospel music" },
        option4: { label: "Using only formal prayers" },
      },
    },
    {
      id: 2,
      question: "Who gave the Great Commission to disciples of all nations?",
      options: {
        option1: { label: "Peter" },
        option2: { label: "Paul" },
        option3: { label: "Jesus" },
        option4: { label: "John" },
      },
    },
  ];

  // 🎯 Handle selecting options
  const handleOptionSelect = (quizId: number, label: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [quizId]: label }));
  };

  // ✅ Handle submit with validation
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const totalQuestions = quiz.length;
    const answeredCount = Object.keys(selectedAnswers).length;

    // Check if user skipped a question
    if (totalQuestions == answeredCount) {
      setPopup(true);
    }
  };

  const answeredCount = Object.keys(selectedAnswers).length;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {showQuiz && (
        <div>
          {" "}
          <div>
            <SubHeader header="Faith in Action" backFunction={backFunction} />

            <div className="dashboard_content_mainbox">
              {/* 🟩 Progress bar */}
              <div className="relative h-[8px] bg-[#E8E1E2]">
                <div
                  className="h-full bg-primaryColors-0 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              {/* 🧾 Quiz Info */}
              <div className="flex justify-between items-center my-3">
                <span className="font-[600] text-[12px]">
                  {answeredCount}/{quiz.length} answered
                </span>
                <span className="flex items-center gap-2 font-[500] text-[#71748C] text-[13px]">
                  <CiClock1 /> {formatTime(timeLeft)}
                </span>
              </div>

              <div className="dashboard_hr"></div>

              {/* 🧩 Quiz Questions */}
              <form onSubmit={handleSubmit} noValidate>
                {quiz.map((quizItem) => (
                  <div key={quizItem.id} className="flex flex-col gap-3 my-5">
                    <div className="flex gap-[16px] items-center">
                      <span className="h-[20px] w-[20px] bg-[#30A46F] flex justify-center items-center text-[#ffffff] text-[12px] font-[600] rounded-[2px]">
                        {quizItem.id}
                      </span>
                      <h1 className="text-[#1F2130] text-[14px] font-[600]">
                        {quizItem.question}
                      </h1>
                    </div>

                    <div className="flex flex-col gap-3">
                      {Object.entries(quizItem.options).map(([key, option]) => (
                        <label
                          key={key}
                          onClick={() =>
                            handleOptionSelect(quizItem.id, option.label)
                          }
                          className={`dashboard_quiz_options flex justify-between items-center ${
                            selectedAnswers[quizItem.id] === option.label
                              ? "bg-[#F6F3F4] border border-[#49151B80]"
                              : ""
                          }`}
                        >
                          {option.label}
                          <input
                            type="radio"
                            name={`quiz-${quizItem.id}`}
                            onChange={() =>
                              handleOptionSelect(quizItem.id, option.label)
                            }
                            checked={
                              selectedAnswers[quizItem.id] === option.label
                            }
                            className="hidden"
                          />
                          {selectedAnswers[quizItem.id] === option.label && (
                            <div>
                              <FaCheck className="text-primaryColors-0 text-[1rem]" />
                            </div>
                          )}
                        </label>
                      ))}
                    </div>

                    <div className="dashboard_hr my-3"></div>
                  </div>
                ))}

                {/* 🚀 Submit Button */}
                <button
                  type="submit"
                  className="form_more bg-primaryColors-0 text-[#ffffff] cursor-pointer"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
          {popup && (
            <DashboardPop
              close={close}
              header="Review Quiz"
              paragraph="Your answers have been recorded successfully"
              buttonFunc="Review Answers"
              backToCourse={backToCourse}
              reviewCourse={reviewCourse}
            />
          )}
        </div>
      )}
      {showQuizReview && <DashboardQuizReview backFunction={backToCourseFor} />}
    </>
  );
}
