"use client";

import { CiCircleCheck } from "react-icons/ci";
import SubHeader from "./dashboard_subheader";
import { FaBullseye } from "react-icons/fa";
import { MdCheck, MdClose } from "react-icons/md";
import { HiOutlineBookOpen } from "react-icons/hi";
import { IoIosRefresh } from "react-icons/io";
import { useEffect, useState } from "react";

interface Props {
  backFunction: () => void;
  backToQuiz: () => void;
  quizId: string;
}

interface QuizAttempt {
  id: string;
  score: number;
  completed: boolean;
  timeFinished: number;
  answers: Array<{
    questionId: string;
    answer: string;
    correct: boolean;
    point: number;
  }>;
}

interface Question {
  id: string;
  question: string;
  correctAnswer: string;
  options: string[];
  points: number;
  explanation?: string;
}

interface QuizData {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  passingScore: number;
  QuizAttempt: QuizAttempt[];
}

interface ApiResponse {
  message: string;
  data: QuizData;
}

export default function DashboardQuizReview({
  backFunction,
  quizId,
  backToQuiz,
}: Props) {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchQuizResult = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/course/fetch-quiz-answers/${quizId}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      const data: ApiResponse = await res.json();

      if (!res.ok) {
        setError(data.message || "Error fetching quiz");
        return;
      }

      console.log("Quiz data:", data);
      setQuizData(data.data);
    } catch (error) {
      console.error(error);
      setError("Failed to fetch quiz results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizResult();
  }, [quizId]);

  if (loading) {
    return (
      <div>
        <SubHeader header="Quiz Review" backFunction={backFunction} />
        <div className="dashboard_content_mainbox flex justify-center items-center h-64">
          <div className="text-center">Loading quiz results...</div>
        </div>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div>
        <SubHeader header="Quiz Review" backFunction={backFunction} />
        <div className="dashboard_content_mainbox flex justify-center items-center h-64">
          <div className="text-center text-red-500">
            {error || "Failed to load quiz data"}
          </div>
        </div>
      </div>
    );
  }

  // Get the most recent quiz attempt
  const latestAttempt = quizData.QuizAttempt?.[0];

  if (!latestAttempt) {
    return (
      <div>
        <SubHeader header="Quiz Review" backFunction={backFunction} />
        <div className="dashboard_content_mainbox flex justify-center items-center h-64">
          <div className="text-center">No quiz attempt found</div>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalQuestions = quizData.questions.length;
  const correctAnswers = latestAttempt.answers.filter((a) => a.correct).length;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const score =
    latestAttempt.score || Math.round((correctAnswers / totalQuestions) * 100);

  // Format time taken (convert seconds to minutes:seconds)
  const formatTimeTaken = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Check if passed (score >= passingScore)
  const passed = score >= (quizData.passingScore || 70);

  // Create a map of answers by questionId for easy lookup
  const answerMap = new Map(
    latestAttempt.answers.map((a) => [a.questionId, a]),
  );

  return (
    <>
      <div>
        <SubHeader header="Quiz Review" backFunction={backFunction} />
        <div className="dashboard_content_mainbox">
          {/* Score Summary Card */}
          <div className="bg-[#ffffff] dark:bg-secondaryColors-0 border border-[#ccc]/20 py-[24px] px-[16px] flex flex-col items-center">
            <CiCircleCheck color="#30A46F" size={30} />
            <div className="flex flex-col justify-center items-center gap-1 mt-5">
              <h1 className="font-[700] text-[24px] dark:text-textSlightDark-0 text-lightBoldText-0">
                {score}%
              </h1>
              <p className="text-[#71748C] text-[14px]">
                {correctAnswers} out of {totalQuestions} correct
              </p>
            </div>
            <div className="dashboard_hr my-4"></div>

            {/* Stats Row */}
            <div className="flex justify-around items-center w-full">
              <div className="flex flex-col gap-1 items-center">
                <h1 className="font-[700] text-textSlightDark-0 text-[18px]">
                  {correctAnswers}
                </h1>
                <p className="text-[14px]">Correct</p>
              </div>
              <div className="flex flex-col gap-1 items-center">
                <h1 className="font-[700] text-[#DA0E29] text-[18px]">
                  {incorrectAnswers}
                </h1>
                <p className="text-[14px]">Incorrect</p>
              </div>
              <div className="flex flex-col gap-1 items-center">
                <h1 className="font-[700] text-textSlightDark-0 text-[18px]">
                  {formatTimeTaken(latestAttempt.timeFinished || 0)}
                </h1>
                <p className="text-[14px]">Time taken</p>
              </div>
            </div>
          </div>

          {/* Performance Section */}
          <div className="my-5 flex flex-col gap-3">
            <span className="flex items-center gap-3 text-[#41415A] text-[14px] font-[600]">
              <FaBullseye /> Performance
            </span>

            {/* Performance Bar */}
            <div className="relative h-[8px] bg-[#E8E1E2] dark:bg-shadyColor-0">
              <div
                className="h-full bg-[#30A46F] transition-all duration-500"
                style={{ width: `${score}%` }}
              ></div>
            </div>

            {/* Overall Score */}
            <div className="flex justify-between items-center text-[14px] font-[600] dark:text-[#41415A] text-lightBoldText-0">
              <h1>Overall score</h1>
              <p>{score}%</p>
            </div>

            {/* Pass/Fail Message */}
            {passed ? (
              <div className="border border-[#F1F1F4] h-[41px] flex items-center p-[12px] text-[#30A46F]">
                <p className="flex gap-5 items-center text-[14px]">
                  <MdCheck />
                  Passing grade achieved! Great understanding of the course.
                </p>
              </div>
            ) : (
              <div className="border border-[#ccc]/20 h-[41px] flex items-center p-[12px] text-[#DA0E29]">
                <p className="flex gap-5 items-center text-[14px]">
                  <MdClose />
                  Keep learning! Review the material and try again.
                </p>
              </div>
            )}

            <div className="dashboard_hr my-4"></div>

            {/* Question Overview */}
            <div className="w-full flex flex-col gap-3">
              <span className="flex items-center gap-3 text-[#41415A] text-[14px] font-[600]">
                <HiOutlineBookOpen /> Question Overview
              </span>

              {/* Question Grid */}
              <div className="grid grid-cols-5 md:grid-cols-10 w-full gap-3">
                {quizData.questions.map((question, index) => {
                  const answer = answerMap.get(question.id);
                  const isCorrect = answer?.correct || false;

                  return (
                    <div
                      key={question.id}
                      className={`h-[56px] flex justify-center items-center flex-col rounded-md ${
                        isCorrect
                          ? "bg-[#30A46F0D] border border-[#30A46F] text-[#30A46F]"
                          : "bg-[#DA0E290D] border border-[#DA0E29] text-[#DA0E29]"
                      }`}
                    >
                      <h1 className="font-[600]">{index + 1}</h1>
                      {isCorrect ? <MdCheck /> : <MdClose />}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="dashboard_hr my-5"></div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-5">
              <button
                className="form_more bg-primaryColors-0 text-[#ffffff] font-[600] text-[13px] py-3 rounded-md"
                onClick={backToQuiz}
              >
                Review in Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
