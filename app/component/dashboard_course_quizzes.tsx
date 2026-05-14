"use client";

import { useEffect, useState } from "react";
import { CiCircleQuestion, CiClock2 } from "react-icons/ci";
import Loader from "./loader";
import { useQuiz } from "../context/quizContext";
import { number } from "framer-motion";
interface Props {
  openQuiz: (id?: string) => void;
  openViewQuiz: (id?: string) => void;
  courseId: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  duration: string;
  questions: [];
  QuizAttempt: QuizAttempt[];
}

interface QuizAttempt {
  id: string;
  score: number;
}

export default function DashboardCourseQuizzes({
  openQuiz,
  courseId,
  openViewQuiz,
}: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [quiz, setQuiz] = useState<Quiz[]>([]);
  const { quizContext, setQuizContext } = useQuiz();
  const [quizAttempted, setQuizAttempted] = useState<number | null>(null);
  const [quizPercentage, setQuizPercentage] = useState<number | null>(null)
  const fetchQuiz = async () => {
    setIsLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(
        `${API_URL}/api/course/get-course/${courseId}`,
        {},
      );

      const data = await res.json();

      if (!res.ok) {
        console.log(data);
      }

      console.log(data);
      setIsLoading(false);
      setQuiz(data.data.quiz);
      // If data.data.quiz is an array of quizzes
      const totalAttempts = data.data.quiz.filter(
        (quiz: Quiz) => quiz.QuizAttempt && quiz.QuizAttempt.length > 0
      ).length;

      setQuizAttempted(totalAttempts);


      console.log("Total attempts across all quizzes:",);
      setQuizPercentage(totalAttempts / data.data.quiz.length * 100)
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, []);

  return (
    <>
      <div className="dashboard_content_mainbox">
        {isLoading ? (
          <Loader
            height={30}
            width={30}
            border_width={2}
            full_border_color="#FFA500"
            small_border_color="white"
          />
        ) : (
          <div>
            <div className="bg-[#FAF8F8] p-[16px]">
              <div className="flex justify-between items-center ">
                <h1 className="text-[#41415A] text-[12px] font-[600]">
                  Quiz Progress
                </h1>
                <span className="text-[#71748C] text-[12px] font-[500]">
                  {quizAttempted}/{quiz.length} completed
                </span>
              </div>
              <div className="relative bg-[#E8E1E2] h-[8px] my-2 w-full">
                <div
                  className={`bg-[#30A46F] h-full  transition-all duration-200`}
                  style={{width: `${quizPercentage}%`}}
                ></div>
              </div>
            </div>

            <div className="w-full gap-3">
              <h1 className="text-textSlightDark-0 font-[700] text-[18px] my-5">
                All Quizzes
              </h1>
              {quiz.map((quiz, i) => (
                <div className="flex flex-col w-full gap-3 mb-3" key={i}>
                  <div className="flex flex-col gap-3">
                    <h1 className="text-textSlightDark-0 text-[14px] font-[600]">
                      {quiz?.title}
                    </h1>
                    <p className="text-[#71748C] text-[14px]">
                      {quiz?.description}
                    </p>
                    <p className="flex gap-4">
                      <span className="flex items-center text-[14px] text-[#71748C] gap-2">
                        <CiCircleQuestion size={15} /> {quiz?.questions.length}{" "}
                        questions
                      </span>
                      <span className="flex items-center text-[14px] text-[#71748C] gap-2">
                        <CiClock2 size={15} /> {quiz?.duration}min
                      </span>
                    </p>

                    {quiz.QuizAttempt.length > 0 ? (
                      <div className="">
                        <div className="bg-[#30A46F1A] p-[12px] mb-4">
                          <div className="flex items-center justify-between">
                            <div className="text-[#30A46F] text-[12px] font-semibold">
                              {quiz.QuizAttempt.map((q) => q.score)} / 100
                            </div>
                            <div className="bg-[#30A46F] text-white text-[12px] rounded px-1">
                              Completed
                            </div>
                          </div>
                        </div>
                        <button
                          className="form_more border border-[#EDEDED] text-primaryColors-0 bg-transparent font-semibold"
                          onClick={() => {
                            setQuizContext(quiz.id);
                            openViewQuiz(quiz.id as any);
                          }}
                        >
                          View Quiz
                        </button>
                      </div>
                    ) : (
                      <button
                        className="form_more text-[#ffffff] bg-primaryColors-0"
                        onClick={() => {
                          setQuizContext(quiz.id);
                          openQuiz(quiz.id);
                        }}
                      >
                        Start Quiz
                      </button>
                    )}
                  </div>
                  <div className="dashboard_hr"></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
