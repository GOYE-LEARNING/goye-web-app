"use client";

import { useEffect, useState } from "react";
import SubHeader from "./dashboard_subheader";
import Loader from "./loader";
import { FaCheck } from "react-icons/fa6";
import { FaEdit, FaTrash } from "react-icons/fa";
import { BsPlus } from "react-icons/bs";
import { IoTrashOutline } from "react-icons/io5";
import { MdCancel } from "react-icons/md";
import Portal from "./Portal";
import { useModal } from "@/app/context/SimpleModalContext";
import { useI18n } from "@/app/context/I18nContext";

interface Props {
  removeReview: () => void;
  courseId: string;
}
interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  duration?: number;
  passingScore?: number;
  questions: Question[]; // This is an ARRAY of questions
}

interface EditQuestionDraft {
  question: string;
  options: string[];
  correctAnswer: string;
}

export default function DashboardTutorQuizView({
  removeReview,
  courseId,
}: Props) {
  const [quizDetails, setQuizDetails] = useState<Quiz[]>([]);
  const [isloading, setIsLoading] = useState<boolean>(false);
  const [courseName, setCourseName] = useState<string>("");
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [editDuration, setEditDuration] = useState<string>("");
  const [editPassingScore, setEditPassingScore] = useState<string>("");
  const [editQuestions, setEditQuestions] = useState<EditQuestionDraft[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);
  const { showModal } = useModal();
  const { t } = useI18n();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchQuiz = async () => {
    setIsLoading(true);
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
      if (data.data.quiz?.[0]) {
        setCourseName(data.data.quiz[0].title);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [courseId]);

  const openEditQuiz = (qz: Quiz) => {
    setEditingQuiz(qz);
    setEditTitle(qz.title || "");
    setEditDescription(qz.description || "");
    setEditDuration(qz.duration ? String(qz.duration) : "");
    setEditPassingScore(qz.passingScore ? String(qz.passingScore) : "");
    setEditQuestions(
      qz.questions.map((q) => ({
        question: q.question,
        options: [...q.options],
        correctAnswer: q.correctAnswer,
      })),
    );
    setEditError(null);
  };

  const closeEditQuiz = () => {
    setEditingQuiz(null);
    setEditError(null);
    setIsSaving(false);
  };

  const updateEditQuestion = (
    index: number,
    updater: (q: EditQuestionDraft) => EditQuestionDraft,
  ) => {
    setEditQuestions((prev) =>
      prev.map((q, i) => (i === index ? updater(q) : q)),
    );
  };

  const addEditQuestion = () => {
    setEditQuestions((prev) => [
      ...prev,
      { question: "", options: ["", "", "", ""], correctAnswer: "" },
    ]);
  };

  const removeEditQuestion = (index: number) => {
    setEditQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const saveEditQuiz = async () => {
    if (!editingQuiz) return;

    if (!editTitle.trim()) {
      setEditError(t("Quiz title is required."));
      return;
    }
    if (editQuestions.length === 0) {
      setEditError(t("Add at least one question."));
      return;
    }
    for (const q of editQuestions) {
      const filled = q.options.filter((o) => o.trim() !== "");
      if (!q.question.trim() || filled.length < 2 || !q.correctAnswer.trim()) {
        setEditError(
          t("Every question needs text, at least 2 options, and a selected correct answer."),
        );
        return;
      }
    }

    setIsSaving(true);
    setEditError(null);

    try {
      const res = await fetch(
        `${API_URL}/api/course/update-quiz/${editingQuiz.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editTitle,
            description: editDescription,
            duration: editDuration ? Number(editDuration) : undefined,
            passingScore: editPassingScore ? Number(editPassingScore) : undefined,
            questions: editQuestions.map((q, idx) => ({
              question: q.question,
              options: q.options.filter((o) => o.trim() !== ""),
              correctAnswer: q.correctAnswer,
              order: idx + 1,
            })),
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || t("Failed to update quiz"));
      }

      closeEditQuiz();
      await fetchQuiz();
    } catch (error: any) {
      setEditError(error.message || t("Failed to update quiz"));
      setIsSaving(false);
    }
  };

  const deleteQuiz = (quizId: string) => {
    showModal(
      t("Delete Quiz"),
      t("Are you sure you want to delete this quiz? This action cannot be undone."),
      "confirm",
      async () => {
        setDeletingQuizId(quizId);
        try {
          const res = await fetch(`${API_URL}/api/course/delete-quiz/${quizId}`, {
            method: "DELETE",
            credentials: "include",
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data?.message || t("Failed to delete quiz"));
          }
          await fetchQuiz();
        } catch (error: any) {
          showModal(t("Error"), error.message || t("Failed to delete quiz"), "error");
        } finally {
          setDeletingQuizId(null);
        }
      },
    );
  };

  return (
    <>
      <div>
        <SubHeader header={courseName} backFunction={removeReview} />

        {quizDetails.map((qz, _) => (
          <div key={_}>
            {!isloading ? (
              <div>
                <div className="dashboard_content_mainbox">
                  {/* Quiz header with Edit/Delete */}
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="font-semibold text-[16px] dark:text-textSlightDark-0 text-lightBoldText-0">
                      {qz.title}
                    </h2>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditQuiz(qz)}
                        className="p-2 rounded-full hover:bg-primaryColors-0/10 dark:text-textSlightDark-0 text-lightBoldText-0/70 transition-colors"
                        aria-label={t("Edit quiz")}
                        title={t("Edit")}
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => deleteQuiz(qz.id)}
                        disabled={deletingQuizId === qz.id}
                        className="p-2 rounded-full hover:bg-red-500/10 text-red-500 disabled:opacity-40 transition-colors"
                        aria-label={t("Delete quiz")}
                        title={t("Delete")}
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>

                  <div>
                    {qz.questions.map((qzop, i) => (
                      <div key={i}>
                        <div className="flex items-center gap-2">
                          <span className="h-[20px] w-[20px] bg-[#30A46F] text-white flex justify-center items-center rounded-[2px]">
                            {i + 1}
                          </span>
                          <p className="dark:text-textSlightDark-0 text-lightBoldText-0 font-semibold text-[14px]">
                            {qzop.question}
                          </p>
                        </div>
                        <div className="flex flex-col gap-3 my-4">
                          {qzop.options.map((op, i) => (
                            <div
                              key={i}
                              className={`py-[17px] px-[40px] w-full border flex justify-between items-center font-semibold ${
                                qzop.correctAnswer == op
                                  ? "bg-[#30A46F0D] border-[#30A46F80] text-[#30A46F]"
                                  : "bg-transparent border-[#D9D9D9] dark:border-white/10 dark:text-textSlightDark-0 text-lightBoldText-0"
                              }`}
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
                  <button
                    onClick={removeReview}
                    className="form_more dark:bg-secondaryColors-0 bg-white border border-[#D9D9D9] dark:border-white/10 text-primaryColors-0 text-[13px] font-semibold"
                  >
                    {t("Done")}
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

      {/* Edit quiz — full centered modal, matching the lesson edit pattern,
          rendered through a Portal so it isn't clipped by an ancestor's
          overflow or stacking context. */}
      {editingQuiz && (
        <Portal>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4">
          <div className="bg-white dark:bg-secondaryColors-0 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold dark:text-textSlightDark-0 text-lightBoldText-0">
                {t("Edit Quiz")}
              </h2>
              <button
                onClick={closeEditQuiz}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl transition-colors"
                aria-label={t("Close")}
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-[13px] font-medium dark:text-textSlightDark-0 text-lightBoldText-0/80 mb-1">
                  {t("Title")}
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full h-[40px] px-3 rounded-lg border border-[#D9D9D9] dark:border-white/10 bg-transparent outline-none dark:text-textSlightDark-0 text-lightBoldText-0"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium dark:text-textSlightDark-0 text-lightBoldText-0/80 mb-1">
                  {t("Description")}
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full h-[80px] resize-none px-3 py-2 rounded-lg border border-[#D9D9D9] dark:border-white/10 bg-transparent outline-none dark:text-textSlightDark-0 text-lightBoldText-0"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium dark:text-textSlightDark-0 text-lightBoldText-0/80 mb-1">
                    {t("Duration (min)")}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    className="w-full h-[40px] px-3 rounded-lg border border-[#D9D9D9] dark:border-white/10 bg-transparent outline-none dark:text-textSlightDark-0 text-lightBoldText-0"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium dark:text-textSlightDark-0 text-lightBoldText-0/80 mb-1">
                    {t("Passing Score (%)")}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editPassingScore}
                    onChange={(e) => setEditPassingScore(e.target.value)}
                    className="w-full h-[40px] px-3 rounded-lg border border-[#D9D9D9] dark:border-white/10 bg-transparent outline-none dark:text-textSlightDark-0 text-lightBoldText-0"
                  />
                </div>
              </div>

              <div className="dashboard_hr"></div>

              {editQuestions.map((q, qi) => (
                <div
                  key={qi}
                  className="p-3 rounded-lg border border-[#D9D9D9] dark:border-white/10"
                >
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[13px] font-medium dark:text-textSlightDark-0 text-lightBoldText-0/80">
                      {t("Question")} {qi + 1}
                    </label>
                    <button
                      onClick={() => removeEditQuestion(qi)}
                      className="text-red-500 text-[12px] flex items-center gap-1"
                    >
                      <IoTrashOutline /> {t("Remove")}
                    </button>
                  </div>
                  <div className="flex flex-col border border-[#D2D5DA]/20 justify-between w-full py-[8px] px-[12px] mb-2 dark:bg-transparent bg-transparent">
                    <label className="text-textGrey-0 text-[12px]">{t("Question")}</label>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) =>
                        updateEditQuestion(qi, (prev) => ({
                          ...prev,
                          question: e.target.value,
                        }))
                      }
                      className="border-none outline-none w-full dark:text-textSlightDark-0 text-lightBoldText-0 bg-transparent font-[500] text-[16px]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex justify-between gap-2 items-start">
                        <div className="flex flex-col border border-[#D2D5DA]/20 justify-between w-full py-[8px] px-[12px] dark:bg-transparent bg-transparent">
                          <label className="text-textGrey-0 text-[12px]">
                            {`${t("Option")} ${oi + 1}`}
                          </label>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) =>
                              updateEditQuestion(qi, (prev) => {
                                const options = [...prev.options];
                                const wasCorrect = prev.correctAnswer === options[oi];
                                options[oi] = e.target.value;
                                return {
                                  ...prev,
                                  options,
                                  correctAnswer: wasCorrect
                                    ? e.target.value
                                    : prev.correctAnswer,
                                };
                              })
                            }
                            className="border-none outline-none w-full dark:text-textSlightDark-0 text-lightBoldText-0 bg-transparent font-[500] text-[16px]"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`correct-${qi}`}
                              checked={q.correctAnswer === opt && opt !== ""}
                              onChange={() =>
                                updateEditQuestion(qi, (prev) => ({
                                  ...prev,
                                  correctAnswer: opt,
                                }))
                              }
                              className="hidden"
                            />

                            <div className="h-[59px] w-[20px] border border-[#D2D5DA]/20 flex flex-col">
                              <div
                                onClick={() =>
                                  opt !== "" &&
                                  updateEditQuestion(qi, (prev) => ({
                                    ...prev,
                                    correctAnswer: opt,
                                  }))
                                }
                                className={`flex-1 flex justify-center items-center border-b border-[#D2D5DA]/20 transition-colors ${
                                  q.correctAnswer === opt && opt !== ""
                                    ? "bg-[#30A46F]"
                                    : "dark:bg-transparent bg-white"
                                }`}
                              >
                                {q.correctAnswer === opt && opt !== "" && (
                                  <FaCheck className="text-white" size={10} />
                                )}
                              </div>

                              <div
                                onClick={() =>
                                  updateEditQuestion(qi, (prev) => ({
                                    ...prev,
                                    correctAnswer:
                                      prev.correctAnswer === opt ? "" : prev.correctAnswer,
                                  }))
                                }
                                className={`flex-1 flex justify-center items-center transition-colors ${
                                  q.correctAnswer !== opt && q.correctAnswer !== ""
                                    ? "bg-[#DA0E29]"
                                    : "bg-[#6A6A6A0D]"
                                }`}
                              >
                                {q.correctAnswer !== opt && q.correctAnswer !== "" && (
                                  <MdCancel className="text-white" size={10} />
                                )}
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={addEditQuestion}
                className="h-[42px] dark:bg-boldShadyColor-0 bg-lightWhite-0 text-primaryColors-0 text-[14px] font-semibold flex justify-center items-center gap-2 w-full rounded-lg"
              >
                <BsPlus /> {t("Add Question")}
              </button>

              {editError && (
                <p className="text-red-500 text-[13px]">{editError}</p>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={saveEditQuiz}
                disabled={isSaving}
                className="flex-1 h-[40px] rounded-lg bg-primaryColors-0 text-white font-semibold disabled:opacity-60"
              >
                {isSaving ? t("Saving...") : t("Save Changes")}
              </button>
              <button
                onClick={closeEditQuiz}
                disabled={isSaving}
                className="flex-1 h-[40px] rounded-lg border border-[#D9D9D9] dark:border-white/10 dark:text-textSlightDark-0 text-lightBoldText-0"
              >
                {t("Cancel")}
              </button>
            </div>
          </div>
        </div>
        </Portal>
      )}
    </>
  );
}
