"use client";

import { CiClock1 } from "react-icons/ci";
import SubHeader from "./dashboard_subheader";
import { useState, useEffect } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import { MdCheck, MdClose } from "react-icons/md";
import DashboardPop from "./dashboard_popop";
import DashboardQuizReview from "./dashboard_quiz_review";
import Loader from "./loader";
import { useQuiz } from "../context/quizContext";

interface Props {
  backFunction: () => void;
  reviewCourse: () => void;
  backToCourse: () => void;
  courseId: string;
  checkIfViewQuizIsActive: boolean;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  duration: number;
  passingScore?: number;
  maxAttempts?: number;
  questions: QuizQuestions[];
  QuizAttempt: QuizAttempt[];
}

interface QuizQuestions {
  id: string;
  question: string;
  points: number;
  options: string[];
  correctAnswer: string;
  explanation?: string | null;
}

interface AnswerSubmission {
  questionId: string;
  answer: string;
  correct: boolean;
  point: number;
}

interface QuizSubmissionDTO {
  totalPoint: number;
  completed: boolean;
  timeFinished: number;
  answers: AnswerSubmission[];
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

export default function DashboardCourseQuizzesAnswered({
  backFunction,
  backToCourse,
  courseId,
  checkIfViewQuizIsActive
}: Props) {
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [popup, setPopup] = useState<boolean>(false);
  const [showQuiz, setShowQuiz] = useState<boolean>(true);
  const [showQuizReview, setShowQuizReview] = useState<boolean>(false);
  const [quizzes, setQuizzes] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [isTimerStarted, setIsTimerStarted] = useState<boolean>(false);
  const [currentQuizId, setCurrentQuizId] = useState<string>("");
  const [quizId, setQuizId] = useState<string>("");
  const [reviewMode, setReviewMode] = useState<boolean>(false);
  const [reviewData, setReviewData] = useState<{
    quiz: Quiz;
    attempt: QuizAttempt;
  } | null>(null);
  const { quizContext, setQuizContext } = useQuiz();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchQuizQuestions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/course/fetch-quiz-answers/${quizContext}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      const data = await res.json();
      console.log("Quiz data:", data);

      const quizData = data.data;
      
      if (quizData) {
        setQuizzes(quizData);
        setCurrentQuizId(quizData.id);
        
        // If we're in view mode, also set up the review data from the attempt
        if (checkIfViewQuizIsActive && quizData.QuizAttempt && quizData.QuizAttempt.length > 0) {
          const latestAttempt = quizData.QuizAttempt[0];
          setReviewData({
            quiz: quizData,
            attempt: latestAttempt,
          });
          
          // Pre-fill selected answers with the user's answers from the attempt
          if (latestAttempt && latestAttempt.answers) {
            const userAnswers: Record<string, string> = {};
            latestAttempt.answers.forEach((answer: any) => {
              userAnswers[answer.questionId] = answer.answer;
            });
            setSelectedAnswers(userAnswers);
          }
        } else {
          // Only start timer if not in review mode
          const durationInSeconds = quizData.duration * 60;
          setTimeLeft(durationInSeconds);
          setTotalTime(durationInSeconds);
          setIsTimerStarted(true);
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizQuestions();
  }, [quizContext, checkIfViewQuizIsActive]);

  // Timer countdown - only in quiz mode
  useEffect(() => {
    if (reviewMode || checkIfViewQuizIsActive || !isTimerStarted || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, isTimerStarted, reviewMode, checkIfViewQuizIsActive]);

  const progress =
    totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  const handleOptionSelect = (questionId: string, label: string) => {
    if (reviewMode || checkIfViewQuizIsActive) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: label }));
  };

  const calculateTotalPoints = (): number => {
    if (!quizzes?.questions) return 0;
    return quizzes?.questions.reduce(
      (sum, question) => sum + (question.points || 0),
      0,
    );
  };

  const handleAutoSubmit = async () => {
    if (!currentQuizId) return;

    const totalPossiblePoints = calculateTotalPoints();
    const allQuestionsAnswered =
      Object.keys(selectedAnswers).length === quizzes?.questions.length;

    const answers: AnswerSubmission[] = quizzes?.questions.map((question) => {
      const userAnswer = selectedAnswers[question.id] || "";
      const isCorrect = userAnswer === question.correctAnswer;

      return {
        questionId: question.id,
        answer: userAnswer,
        correct: isCorrect,
        point: isCorrect ? question.points : 0,
      };
    }) as any;

    const quizDTO: QuizSubmissionDTO = {
      totalPoint: totalPossiblePoints,
      completed: allQuestionsAnswered,
      timeFinished: totalTime - timeLeft,
      answers: answers,
    };

    await submitQuizToAPI(quizDTO, currentQuizId);
    setPopup(true);
    setIsTimerStarted(false);
  };

  const submitQuizToAPI = async (
    quizDTO: QuizSubmissionDTO,
    quizId: string,
  ) => {
    try {
      console.log("Submitting quiz payload:", JSON.stringify(quizDTO, null, 2));

      const res = await fetch(
        `${API_URL}/api/course/submit-quiz/${courseId}/${quizId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(quizDTO),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Quiz submission error:", data);
        throw new Error(data.message || "Failed to submit quiz");
      }

      return data;
    } catch (error) {
      console.error("Error submitting quiz:", error);
      throw error;
    }
  };

  const handleSubmit = async (
    e: React.MouseEvent<HTMLButtonElement>,
    quizId: string,
  ) => {
    e.preventDefault();

    if (!quizzes) return;

    const totalQuestions = quizzes?.questions?.length || 0;
    const answeredCount = Object.keys(selectedAnswers).length;

    if (totalQuestions === answeredCount) {
      const totalPossiblePoints = calculateTotalPoints();

      const answers: AnswerSubmission[] = quizzes?.questions.map((question) => {
        const userAnswer = selectedAnswers[question.id] || "";
        const isCorrect = userAnswer === question.correctAnswer;

        return {
          questionId: question.id,
          answer: userAnswer,
          correct: isCorrect,
          point: isCorrect ? question.points : 0,
        };
      });

      const quizDTO: QuizSubmissionDTO = {
        totalPoint: totalPossiblePoints,
        completed: true,
        timeFinished: totalTime - timeLeft,
        answers: answers,
      };

      console.log("Submitting quiz DTO:", JSON.stringify(quizDTO, null, 2));

      await submitQuizToAPI(quizDTO, quizId);
      setPopup(true);
      setIsTimerStarted(false);
      setQuizId(quizId);
    } else {
      alert(
        `Please answer all questions. You've answered ${answeredCount} out of ${totalQuestions}`,
      );
    }
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = quizzes?.questions?.length || 0;

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const backToCourseFor = () => {
    backFunction();
  };

  const reviewCourse = () => {
    setShowQuiz(false);
    setShowQuizReview(true);
    setIsTimerStarted(false);
  };

  const reviewQuizFunc = async () => {
    setReviewMode(true);
    setShowQuiz(true);
    setShowQuizReview(false);
    try {
      const res = await fetch(
        `${API_URL}/api/course/fetch-quiz-answers/${quizId}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      const data = await res.json();
      if (!res.ok) {
        console.log(data);
        return;
      }

      console.log("Review data:", data);

      if (data.data) {
        const quizData = data.data;
        
        // Get the most recent quiz attempt (first one in the array)
        const latestAttempt = quizData.QuizAttempt && quizData.QuizAttempt.length > 0 
          ? quizData.QuizAttempt[0] 
          : null;
        
        setReviewData({
          quiz: {
            id: quizData.id,
            title: quizData.title,
            duration: quizData.duration,
            questions: quizData.questions,
            QuizAttempt: quizData.QuizAttempt
          },
          attempt: latestAttempt,
        });

        // Pre-fill selected answers with the user's answers from the attempt
        if (latestAttempt && latestAttempt.answers) {
          const userAnswers: Record<string, string> = {};
          latestAttempt.answers.forEach((answer: any) => {
            userAnswers[answer.questionId] = answer.answer;
          });
          setSelectedAnswers(userAnswers);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const exitReviewMode = () => {
    setReviewMode(false);
    setSelectedAnswers({});
    setReviewData(null);
    setShowQuizReview(false);
    setShowQuiz(true);
    backFunction();
  };

  const testingBackFunction = () => {
    backFunction();
    setReviewMode(false);
    console.log("Test Pass1");
  };

  // Get active quiz data
  const activeQuiz = reviewData?.quiz || quizzes;
  const activeAttempt = reviewData?.attempt || null;

  // Determine if we're in review mode (either explicit review or view quiz mode)
  const isReviewMode = reviewMode || checkIfViewQuizIsActive;

  // Function to get user's answer for a specific question in review mode
  const getUserAnswerForQuestion = (questionId: string) => {
    if (!isReviewMode || !activeAttempt) return null;
    return activeAttempt.answers?.find((a) => a.questionId === questionId);
  };

  // Calculate total correct answers for review mode
  const totalCorrectAnswers = activeAttempt?.answers?.filter((a) => a.correct).length || 0;
  const totalAttemptAnswers = activeAttempt?.answers?.length || 0;

  console.log("Debug - isReviewMode:", isReviewMode);
  console.log("Debug - activeAttempt:", activeAttempt);
  console.log("Debug - activeQuiz:", activeQuiz);

  return (
    <>
      {showQuiz && (
        <div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader
                height={40}
                width={40}
                border_width={3}
                full_border_color="transparent"
                small_border_color="#FFA500"
              />
            </div>
          ) : (
            <div>
              <div key={quizContext}>
                <SubHeader
                  header={
                    isReviewMode
                      ? `${activeQuiz?.title} - Review`
                      : activeQuiz?.title || "Quiz"
                  }
                  backFunction={
                    isReviewMode ? exitReviewMode : testingBackFunction
                  }
                />

                <div className="dashboard_content_mainbox">
                  {/* Progress bar - only show in quiz mode */}
                  {!isReviewMode && (
                    <>
                      <div className="relative h-[8px] bg-[#E8E1E2]">
                        <div
                          className="h-full bg-primaryColors-0 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>

                      {/* Quiz Info */}
                      <div className="flex justify-between items-center my-3">
                        <span className="font-[600] text-[12px]">
                          {answeredCount}/{totalQuestions} answered
                        </span>
                        <span className="flex items-center gap-2 font-[500] text-[#71748C] text-[13px]">
                          <CiClock1 /> {formatTime(timeLeft)}
                        </span>
                      </div>
                      <div className="dashboard_hr"></div>
                    </>
                  )}

                  {/* Review Mode Header */}
                  {isReviewMode && activeAttempt && (
                    <div className="bg-[#F9F9FC] border border-[#F1F1F4] p-4 rounded-lg mb-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h2 className="font-[700] text-[16px]">
                            Your Results
                          </h2>
                          <p className="text-[14px] text-[#71748C]">
                            Score: {activeAttempt.score}% • Correct: {totalCorrectAnswers}/{totalAttemptAnswers}
                          </p>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-[13px] font-[600] ${
                            (activeAttempt.score || 0) >= (activeQuiz?.passingScore || 70)
                              ? "bg-[#30A46F1A] text-[#30A46F]"
                              : "bg-[#DA0E291A] text-[#DA0E29]"
                          }`}
                        >
                          {(activeAttempt.score || 0) >= (activeQuiz?.passingScore || 70) ? "PASSED" : "FAILED"}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quiz Questions */}
                  <form noValidate>
                    {activeQuiz?.questions?.map((quizItem, questionIndex) => {
                      // For review mode, get the user's answer for this question
                      const userAnswer = getUserAnswerForQuestion(quizItem.id);
                      const isUserAnswerCorrect = userAnswer?.correct || false;
                      const userSelectedOption = userAnswer?.answer || "";

                      return (
                        <div
                          key={quizItem.id}
                          className="flex flex-col gap-3 my-5"
                        >
                          <div className="flex gap-[16px] items-center">
                            <span
                              className={`h-[20px] w-[20px] flex justify-center items-center text-[#ffffff] text-[12px] font-[600] rounded-[2px] ${
                                isReviewMode
                                  ? isUserAnswerCorrect
                                    ? "bg-[#30A46F]"
                                    : "bg-[#DA0E29]"
                                  : "bg-[#30A46F]"
                              }`}
                            >
                              {questionIndex + 1}
                            </span>
                            <h1 className="text-textSlightDark-0 text-[14px] font-[600]">
                              {quizItem.question}
                            </h1>
                            <span className="text-[12px] text-gray-500 ml-auto">
                              {quizItem.points}{" "}
                              {quizItem.points === 1 ? "point" : "points"}
                            </span>
                          </div>

                          <div className="flex flex-col gap-3">
                            {quizItem.options?.map((option, optionIndex) => {
                              // Determine styling based on mode
                              let optionClassName =
                                "dashboard_quiz_options flex justify-between items-center";
                              let rightIcon = null;

                              const isUserSelected = isReviewMode
                                ? userSelectedOption === option
                                : selectedAnswers[quizItem.id] === option;

                              const isCorrectAnswer =
                                option === quizItem.correctAnswer;

                              if (isReviewMode) {
                                // Review mode styling - properly show correct/wrong answers
                                if (isCorrectAnswer) {
                                  // This is the correct answer - always show in green
                                  optionClassName +=
                                    " bg-[#30A46F0D] border border-[#30A46F] cursor-default";
                                  rightIcon = (
                                    <MdCheck className="text-[#30A46F] text-[1rem]" />
                                  );
                                } else if (isUserSelected && !isCorrectAnswer) {
                                  // User's wrong answer - show in red
                                  optionClassName +=
                                    " bg-[#DA0E290D] border border-[#DA0E29] cursor-default";
                                  rightIcon = (
                                    <MdClose className="text-[#DA0E29] text-[1rem]" />
                                  );
                                } else {
                                  // Unselected, non-correct options
                                  optionClassName += " cursor-default opacity-60";
                                }
                              } else {
                                // Quiz mode styling
                                if (isUserSelected) {
                                  optionClassName +=
                                    " bg-[#F6F3F4] border border-[#49151B80] cursor-pointer";
                                  rightIcon = (
                                    <FaCheck className="text-primaryColors-0 text-[1rem]" />
                                  );
                                } else {
                                  optionClassName += " cursor-pointer";
                                }
                              }

                              return (
                                <label
                                  key={optionIndex}
                                  onClick={() =>
                                    !isReviewMode && handleOptionSelect(quizItem.id, option)
                                  }
                                  className={optionClassName}
                                >
                                  <span className="flex items-center gap-2">
                                    {option}
                                    {isReviewMode && isCorrectAnswer && (
                                      <span className="text-[11px] text-[#30A46F] font-[500]">
                                        (Correct answer)
                                      </span>
                                    )}
                                  </span>
                                  <input
                                    type="radio"
                                    name={`quiz-${quizItem.id}`}
                                    onChange={() => {}}
                                    checked={isUserSelected}
                                    className="hidden"
                                    disabled={isReviewMode}
                                  />
                                  {rightIcon}
                                </label>
                              );
                            })}
                          </div>

                          <div className="dashboard_hr my-3"></div>
                        </div>
                      );
                    })}

                    {/* Submit Button - only show in quiz mode */}
                    {!isReviewMode && activeQuiz && (
                      <button
                        type="button"
                        onClick={(e) => {
                          handleSubmit(e, activeQuiz.id);
                        }}
                        className={`form_more bg-primaryColors-0 text-[#ffffff] w-full py-3 rounded-md mt-4`}
                      >
                        Submit Quiz
                      </button>
                    )}
                  </form>
                </div>
              </div>
            </div>
          )}
          {popup && (
            <DashboardPop
              close={() => setPopup(false)}
              header="Quiz Completed!"
              paragraph="Your answers have been recorded successfully"
              buttonFunc="Review Answers"
              backToCourse={backToCourse}
              reviewCourse={reviewCourse}
            />
          )}
        </div>
      )}
      {showQuizReview && (
        <DashboardQuizReview
          backFunction={backToCourseFor}
          backToQuiz={reviewQuizFunc}
          quizId={quizId}
        />
      )}
    </>
  );
}