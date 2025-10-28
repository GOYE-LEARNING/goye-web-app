"use client";

import React, { useEffect, useState } from "react";
import { BsPlus } from "react-icons/bs";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { IoTrashOutline } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Pic from "@/public/images/notfound.png";
import { IoIosRefresh } from "react-icons/io";
import { MdDelete } from "react-icons/md";

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
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

interface Lesson {
  id: number;
  lesson_title: string;
  lesson_video: string;
  video_preview?: string | null;
}

interface Module {
  id: number;
  module_title: string;
  module_description: string;
  module_time: string;
  lessons: Lesson[];
  visible: boolean;
}

export default function CourseStep2({ formData, setFormData }: Props) {
  const [modules, setModules] = usePersistentState<Module[]>('module',[]);

  // --- FORM ARRAYS ---
  const modulesForm = [
    { label: "Module Title", type: "text", name: "module_title" },
    { label: "Description", type: "text", name: "module_description" },
    { label: "Duration (Min)", type: "text", name: "module_time" },
  ];

  const lessonForm = [
    { label: "Lesson Title", type: "text", name: "lesson_title" },
    { label: "Lesson Video", type: "file", name: "lesson_video" },
  ];

  // --- MODULE FUNCTIONS ---
  const createModule = () => {
    setModules((prev) => [
      ...prev,
      {
        id: Date.now(),
        module_title: "",
        module_description: "",
        module_time: "",
        lessons: [],
        visible: true,
      },
    ]);
  };

  const handleModuleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    id: number
  ) => {
    const { name, value } = e.target;
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [name]: value } : m))
    );
  };

  const moduleShow = (id: number) => {
    setModules((prev) =>
      prev.map((mod) =>
        mod.id == id ? { ...mod, visible: !mod.visible } : mod
      )
    );
  };

  const deleteModule = (id: number) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
  };

  // --- LESSON FUNCTIONS ---
  const createLesson = (moduleId: number) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: [
                ...m.lessons,
                {
                  id: Date.now(),
                  lesson_title: "",
                  lesson_video: "",
                  video_preview: null,
                },
              ],
            }
          : m
      )
    );
  };

  const handleLessonChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    moduleId: number,
    lessonId: number
  ) => {
    const { name, value } = e.target;
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: m.lessons.map((l) =>
                l.id === lessonId ? { ...l, [name]: value } : l
              ),
            }
          : m
      )
    );
  };

  const deleteLesson = (moduleId: number, lessonId: number) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
          : m
      )
    );
  };

  // --- VIDEO UPLOAD / REMOVE ---
  const handleVideoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    moduleId: number,
    lessonId: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? {
                ...m,
                lessons: m.lessons.map((l) =>
                  l.id === lessonId
                    ? { ...l, lesson_video: file.name, video_preview: previewURL }
                    : l
                ),
              }
            : m
        )
      );
    }
  };

  const handleVideoRemove = (moduleId: number, lessonId: number) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: m.lessons.map((l) =>
                l.id === lessonId
                  ? { ...l, lesson_video: "", video_preview: null }
                  : l
              ),
            }
          : m
      )
    );
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        <div key="module">
          {/* --- HEADER --- */}
          <div className="flex justify-between items-center">
            <h1 className="text-textSlightDark-0 font-semibold text-[18px]">
              Course Structure
            </h1>
            <span
              className="flex items-center gap-2 cursor-pointer"
              onClick={createModule}
            >
              <BsPlus /> Add Module
            </span>
          </div>

          {modules.length === 0 ? (
            <div className="flex justify-center items-center flex-col gap-1">
              <Image src={Pic} alt="pic" height={100} width={100} />
              <h1 className="text-textSlightDark-0 font-semibold text-[18px]">
                No Course Found
              </h1>
              <p className="text-textGrey-0">Create a course</p>
            </div>
          ) : (
            <div>
              {modules.map((mod, i) => (
                <div key={mod.id} className="w-full my-3">
                  {/* MODULE HEADER */}
                  <div className="w-full flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="h-[20px] w-[20px] bg-boldGreen-0 text-white flex justify-center items-center rounded-[2px]">
                        {i + 1}
                      </span>
                      <h1>Module</h1>
                      <div
                        className="flex flex-col text-[0.5em]"
                        onClick={() => moduleShow(mod.id)}
                      >
                        <FaChevronUp />
                        <FaChevronDown />
                      </div>
                    </div>

                    <button
                      onClick={() => deleteModule(mod.id)}
                      className="text-red-500"
                    >
                      <IoTrashOutline />
                    </button>
                  </div>

                  {mod.visible && (
                    <motion.div
                      key="module"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      {/* MODULE FORM */}
                      <div className="my-3 flex flex-col gap-3">
                        {modulesForm.map((form, index) => (
                          <div
                            className="flex flex-col border border-[#D2D5DA] justify-between w-full py-[8px] px-[12px]"
                            key={index}
                          >
                            <label className="text-textGrey-0 text-[12px]">
                              {form.label}
                            </label>
                            {form.name === "module_description" ? (
                              <textarea
                                name={form.name}
                                value={mod.module_description}
                                onChange={(e) => handleModuleChange(e, mod.id)}
                                className="resize-none h-[154px] outline-none border-none"
                              />
                            ) : (
                              <input
                                type={form.type}
                                name={form.name}
                                value={
                                  form.name === "module_title"
                                    ? mod.module_title
                                    : form.name === "module_time"
                                    ? mod.module_time
                                    : ""
                                }
                                onChange={(e) => handleModuleChange(e, mod.id)}
                                className="border-none outline-none w-full text-textSlightDark-0 font-[500] text-[16px]"
                              />
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="dashboard_hr my-3"></div>

                      {/* LESSONS */}
                      <div className="my-3 w-full">
                        {mod.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="p-[12px] bg-shadyColor-0 flex flex-col gap-2 relative w-full my-5"
                          >
                            {lessonForm.map((form, i) => (
                              <div key={i} className="w-full flex flex-col gap-1">
                                {form.name === "lesson_video" ? (
                                  <div className="flex flex-col gap-1 w-full">
                                    <span className="text-textGrey-0 text-[14px] font-semibold">
                                      {form.label}
                                    </span>

                                    {!lesson.video_preview ? (
                                      <label
                                        htmlFor={`video-${lesson.id}`}
                                        className="border-dashed border border-[#D2D5DA] bg-white py-[8px] px-[12px] h-[88px] flex flex-col items-center justify-center gap-[3px] cursor-pointer"
                                      >
                                        <h1 className="font-[500] text-[14px] text-textSlightDark-0">
                                          Upload Lesson Video
                                        </h1>
                                        <p className="text-textGrey-0 text-[12px]">
                                          Support MP4 or MKV
                                        </p>
                                        <input
                                          id={`video-${lesson.id}`}
                                          type="file"
                                          accept="video/*"
                                          className="hidden"
                                          onChange={(e) =>
                                            handleVideoUpload(e, mod.id, lesson.id)
                                          }
                                        />
                                      </label>
                                    ) : (
                                      <div className="relative w-full h-[200px] border border-[#D2D5DA] overflow-hidden rounded-md">
                                        <video
                                          src={lesson.video_preview}
                                          controls
                                          className="object-cover w-full h-full"
                                        />
                                        <div className="flex justify-center items-center gap-2 w-full h-full text-white absolute top-0 left bg-[#0000004D]">
                                          <button
                                            onClick={() =>
                                              handleVideoRemove(mod.id, lesson.id)
                                            }
                                            className="h-[30px] w-[113px] flex items-center justify-center gap-2 bg-[#FFFFFF66]"
                                          >
                                            <MdDelete /> Remove
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleVideoRemove(mod.id, lesson.id)
                                            }
                                            className="h-[30px] w-[113px] flex items-center justify-center gap-2 bg-[#FFFFFF66]"
                                          >
                                            <IoIosRefresh /> Retake
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="form_input bg-white">
                                    <label className="text-textGrey-0 text-[12px]">
                                      {form.label}
                                    </label>
                                    <input
                                      type="text"
                                      name="lesson_title"
                                      value={lesson.lesson_title}
                                      onChange={(e) =>
                                        handleLessonChange(e, mod.id, lesson.id)
                                      }
                                      className="border-none outline-none w-full text-textSlightDark-0 font-[500] text-[16px]"
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                            <button
                              onClick={() => deleteLesson(mod.id, lesson.id)}
                              className="form_more bg-[#DA0E290D] text-[#DA0E29] text-[15px] font-[600] w-full flex items-center justify-center gap-2"
                            >
                              <IoTrashOutline /> Delete
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* ADD LESSON BUTTON */}
                      <button
                        onClick={() => createLesson(mod.id)}
                        className="h-[48px] bg-boldShadyColor-0 text-primaryColors-0 text-[15px] font-semibold flex justify-center items-center gap-2 w-full"
                      >
                        <BsPlus /> Add Lesson
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
  );
}
