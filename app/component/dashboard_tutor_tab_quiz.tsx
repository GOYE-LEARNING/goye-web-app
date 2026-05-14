"use client";

import { useEffect, useState } from "react";
import { BiPlus } from "react-icons/bi";
import { CiCircleQuestion, CiClock2 } from "react-icons/ci";
import Loader from "./loader";
interface Props {
  viewQuiz: () => void;
  openAddQuiz: () => void;
  courseId: string;
}

interface Quiz {
  courseId: string;
  title: string;
  description: string;
  duration: string;
  questions: {
    length: number;
  };
}
export default function DashboardTutorTabQuiz({
  viewQuiz,
  openAddQuiz,
  courseId,
}: Props) {
  const [quizDetails, setQuizDetails] = useState<Quiz[]>([]);
  const [isloading, setIsLoading] = useState<boolean>(false);
  useEffect(() => {
    const fetchQuiz = async () => {
      setIsLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      try {
        const res = await fetch(
          `${API_URL}/api/course/get-course/${courseId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          console.log("An error occured");
          return;
        }

        setQuizDetails(data.data.quiz);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    fetchQuiz();
  }, []);
  return (
    <div className="dashboard_content_mainbox">
      <div className="w-full gap-3">
        <div className="flex justify-between items-center">
          <h1 className="text-textSlightDark-0 font-[700] text-[18px] my-5">
            All Quizzes
          </h1>
          <button
            className="text-[13px] flex items-center gap-2 font-semibold text-primaryColors-0"
            onClick={openAddQuiz}
          >
            <BiPlus /> Add Quiz
          </button>
        </div>
        {!isloading ? (
          <div>
            {quizDetails.map((q, i) => (
              <div className="flex flex-col w-full gap-3" key={i}>
                <div className="flex flex-col gap-3">
                  <h1 className="text-textSlightDark-0 text-[14px] font-[600]">
                    {q.title}
                  </h1>
                  <p className="text-[#71748C] text-[14px]">{q.description} </p>
                  <p className="flex gap-4">
                    <span className="flex items-center text-[14px] text-[#71748C] gap-2">
                      <CiCircleQuestion size={15} /> {q.questions.length}{" "}
                      questions
                    </span>
                    <span className="flex items-center text-[14px] text-[#71748C] gap-2">
                      <CiClock2 size={15} /> {q.duration}min
                    </span>
                  </p>
                  <button
                    className="form_more font-semibold bg-white border border-[#D9D9D9] text-primaryColors-0"
                    onClick={viewQuiz}
                  >
                    View Quiz
                  </button>
                </div>
                <div className="dashboard_hr"></div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <Loader
              height={30}
              width={30}
              border_width={2}
              small_border_color="#49151B"
              full_border_color="transparent"
            />
          </div>
        )}
      </div>
    </div>
  );
}
