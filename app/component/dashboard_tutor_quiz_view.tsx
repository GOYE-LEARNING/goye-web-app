import { useEffect, useState } from "react";
import SubHeader from "./dashboard_subheader";
import Loader from "./loader";
import { FaCheck } from "react-icons/fa6";
interface Props {
  removeReview: () => void;
  courseId: string;
}
interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[]; // This is an ARRAY of questions
}

export default function DashboardTutorQuizView({
  removeReview,
  courseId,
}: Props) {
  const [quizDetails, setQuizDetails] = useState<Quiz[]>([]);
  const [isloading, setIsLoading] = useState<boolean>(false);
  const [courseName, setCourseName] = useState<string>("");
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
        setCourseName(data.data.quiz[0].title);
      } catch (error) {
        console.error(error);
      }
    };
    fetchQuiz();
  }, [courseId]);

  return (
    <>
      <div>
        <SubHeader header={courseName} backFunction={removeReview} />

        {quizDetails.map((qz, _) => (
          <div key={_}>
            {!isloading ? (
              <div>
                <div className="dashboard_content_mainbox">
                  <div>
                    {qz.questions.map((qzop, i) => (
                      <div key={i}>
                        <div className="flex items-center gap-2">
                          <span className="h-[20px] w-[20px] bg-[#30A46F] text-white flex justify-center items-center rounded-[2px]">
                            {i + 1}
                          </span>
                          <p className="text-textSlightDark-0 font-semibold text-[14px]">
                            {qzop.question}
                          </p>
                        </div>
                        <div className="flex flex-col gap-3 my-4">
                          {qzop.options.map((op, i) => (
                            <div
                              key={i}
                              className={`${
                                qzop.correctAnswer == op &&
                                "border bg-[#30A46F0D] border-[#30A46F80]"
                              } py-[17px] px-[40px] w-full bg-[#F9F9FBB2] flex justify-between items-center text-[#41415A] font-semibold`}
                            >
                              {op}
                              {qzop.correctAnswer == op && (
                                <div className="text-[#30A46F80]">
                                  <FaCheck />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                                            <div className="dashboard_hr my-5"></div>

                      </div>
                    ))}
                  </div>
                  <button className="form_more bg-white border border-[#D9D9D9] text-primaryColors-0 text-[13px] font-semibold">
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <Loader
                  width={30}
                  height={30}
                  small_border_color="#49151B"
                  full_border_color="transparent"
                  border_width={2}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
