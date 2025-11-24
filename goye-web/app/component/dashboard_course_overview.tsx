"use client";

import React, { useEffect, useState } from "react";
import { CiGlobe } from "react-icons/ci";
import { GoPeople, GoTrophy, GoVideo } from "react-icons/go";
import { HiOutlineBookOpen } from "react-icons/hi";
import { MdChevronRight } from "react-icons/md";
import { motion } from "framer-motion";
import { SlBadge } from "react-icons/sl";
import Loader from "./loader";

interface Props {
  removeFunc: () => void;
  courseId: string;
}

interface Course {
  id?: string;
  course_image: string | null;
  course_title: string;
  course_description: string;
  createdBy: string;
  course_duration: string;
  course_level: string;
  enrolled: string;
  module?: [
    {
      module_title: string
      module_description: string;
    }
  ];
  objectives?: [
    {
      objective_title1: string;
      objective_title2: string;
      objective_title3: string;
      objective_title4: string;
      objective_title5: string;
    }
  ];
}

interface AccordionItem1 {
  header: string;
  body: {
    header1: string;
    paragraph: string;
    mainIcon: React.ReactNode;
    icon1: React.ReactNode;
    icons2: React.ReactNode;
    icon_sub1: string;
    icons_sub2: string;
  };
}

interface AccordionItem2 {
  header: string;
  body: {
    videoDuration: string;
  };
}

interface AccordionItem3 {
  input: React.ReactElement;
  header: string;
  icon: React.ReactNode;
  videoDuration: string;
}

interface Accordion4 {
  header: string;
  body: {
    input: React.ReactElement;
    header: string;
    icon: React.ReactNode;
    videoDuration: string;
  };
}

export default function DashboardCourseOverView({
  removeFunc,
  courseId,
}: Props) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [course, setCourse] = useState<boolean>(true);
  const [coursesPlace, setCoursesPlace] = useState<boolean>(true);
  const [courseList, setCourseList] = useState<boolean>(false);
  const [courseVideo, setCourseVideo] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [courseDetails, setCourseDetails] = useState<Course | null>(null);

  const openCourse = () => {
    setCourse(false);
    setCourseList(true);
    setCoursesPlace(false);
    removeFunc();
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchCourse = async () => {
    if (!courseId) {
      console.error("No courseId provided");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/course/get-course/${courseId}`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch course: ${res.status}`);
      }

      const data = await res.json();
      console.log("Fetched course details Innit:", data);
      setCourseDetails(data.data);
    } catch (error) {
      console.error("Error fetching course:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  const accordion1: AccordionItem1[] = [
    {
      header: "Introduction to discipleship",
      body: {
        header1: "Introduction To Discipleship",
        mainIcon: <MdChevronRight />,
        paragraph:
          "This introduces the meaning of discipleship, exploring its biblical foundation and the call to follow Jesus.",
        icon1: <GoVideo />,
        icons2: <HiOutlineBookOpen />,
        icon_sub1: "35 min to complete",
        icons_sub2: "6 videos",
      },
    },
  ];

  const accordion2: AccordionItem2[] = [
    {
      header: "Introduction to discipleship",
      body: {
        videoDuration: "1/6 lessons | 35min",
      },
    },
    {
      header: "Follow the master",
      body: {
        videoDuration: "1/8 lessons | 65min",
      },
    },
  ];

  const accordion3: AccordionItem3[] = [
    {
      input: <input type="checkbox" className="accent-primaryColors-0" />,
      header: "Discipleship 101",
      icon: <GoVideo />,
      videoDuration: "4min",
    },
  ];

  const accordion4: Accordion4[] = [
    {
      header: "The Life of Jesus as a Mentor",
      body: {
        input: <input type="checkbox" className="accent-primaryColors-0" />,
        header: "Follow the Master 101",
        icon: <GoVideo />,
        videoDuration: "6min",
      },
    },
  ];

  const toggleAccordion = (i: number) => {
    if (activeIndex === i) {
      setActiveIndex(0);
      setCourseVideo(false);
    } else {
      setActiveIndex((prev) => (prev === i ? -1 : i));
      setCourseVideo(true);
    }
  };

  return (
    <>
      {course && (
        <div className="cr_box">
          <div className="cr_p">
            {!isLoading ? (
              <div>{courseDetails?.course_description}</div>
            ) : (
              <div>
                <Loader
                  height={30}
                  width={30}
                  border_width={2}
                  full_border_color="transparent"
                  small_border_color="#3F1F22"
                />
              </div>
            )}
          </div>

          <p className="cr_p flex items-center gap-4 my-5">
            <span className="flex items-center justify-center gap-2">
              <CiGlobe />
              English (Auto)
            </span>
            <span className="flex items-center justify-center gap-2">
              <GoPeople />
              124 Students
            </span>
          </p>

          <div className="h-[1px] w-full bg-[#EFEFF2]"></div>

          <ol className="my-5 flex flex-col gap-1">
            <h1 className="text-primaryColors-0 font-[700]">
              Learning Objectives
            </h1>
            <ul className="pl-[24px] flex flex-col gap-1">
              {!isLoading ? (
                <div>
                  {" "}
                  {courseDetails?.objectives?.map((obj, i) => (
                    <div key={i}>
                      <li className="cr_list">{obj.objective_title1}</li>
                      <li className="cr_list">{obj.objective_title2}</li>
                      <li className="cr_list">{obj.objective_title3}</li>
                      <li className="cr_list">{obj.objective_title4}</li>
                      <li className="cr_list">{obj.objective_title5}</li>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  {" "}
                  <Loader
                    height={30}
                    width={30}
                    border_width={2}
                    full_border_color="transparent"
                    small_border_color="#3F1F22"
                  />
                </div>
              )}
            </ul>
          </ol>

          <button
            className="h-[48px] bg-primaryColors-0 w-full text-center text-white"
            onClick={openCourse}
          >
            Start Course
          </button>
        </div>
      )}

      <div className="cr_box flex items-start gap-3 flex-col">
        {coursesPlace && (
          <>
            <h1 className="text-[#1F2130] text-[16px] font-[700]">Modules</h1>
            {accordion1.map((data, i) => {
              return (
                <div className="w-full cursor-pointer" key={i}>
                  <h2
                    className="text-[14px] text-[#1F2130] flex justify-between items-center"
                    onClick={() => {
                      toggleAccordion(i);
                    }}
                  >
                    <p className="font-[600]">{courseDetails?.module?.[0].module_title}</p>
                    <span className="text-[1.3rem]">
                      <div
                        className={`${activeIndex === i ? "rotate-90" : ""}`}
                      >
                        {data.body.mainIcon}
                      </div>
                    </span>
                  </h2>

                  {activeIndex === i && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="my-3 flex flex-col gap-2 items-start"
                    >
                      <p className="text-[#71748C] text-[14px] font-[400]">
                        {courseDetails?.module?.[0].module_description}
                      </p>
                      <span className="flex items-center gap-3">
                        {data.body.icon1}
                        <p className="text-[#71748C] text-[14px] font-[400]">
                          {data.body.icon_sub1}
                        </p>
                      </span>
                      <span className="flex items-center gap-3">
                        {data.body.icons2}
                        <p className="text-[#71748C] text-[14px] font-[400]">
                          {data.body.icons_sub2}
                        </p>
                      </span>
                    </motion.div>
                  )}

                  <div className="h-[1px] w-full bg-[#EFEFF2] my-3"></div>
                </div>
              );
            })}
          </>
        )}

        {courseList && (
          <div className="w-full">
            {accordion2.map((data, index) => {
              const isActiveAccordion = activeIndex === index;

              return (
                <div
                  key={index}
                  className="flex gap-2 flex-col w-full border-b border-[#EFEFF2] pb-5 accord_header"
                >
                  {/* Accordion Header (Always visible) */}
                  {!isActiveAccordion && (
                    <div
                      className="flex justify-between items-center text-[#1F2130] text-[14px] font-[500] w-full cursor-pointer "
                      onClick={() => toggleAccordion(index)}
                    >
                      {data.header}
                      <MdChevronRight
                        className={`transform transition-transform duration-200 ${
                          isActiveAccordion ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  )}

                  {/* Accordion Content */}
                  {isActiveAccordion && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-3"
                    >
                      <h1 className="text-[#1F2130] text-[18px] font-[700] mb-1">
                        {data.header}
                      </h1>
                      <p className="text-[14px] font-[400] text-[#71748C] mb-3">
                        This introduces the meaning of discipleship, exploring
                        its biblical foundation and the call to follow Jesus.
                      </p>

                      <div
                        className="w-full flex items-center justify-between cursor-pointer"
                        onClick={() => setCourseVideo(!courseVideo)}
                      >
                        <p className="text-[#41415A] text-[14px]">
                          {data.body.videoDuration}
                        </p>
                        <MdChevronRight
                          className={`transform transition-transform duration-200 ${
                            courseVideo ? "rotate-90" : ""
                          }`}
                        />
                      </div>

                      {/* Accordion 3 (Video list) */}
                      {courseVideo && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-3"
                        >
                          {accordion3.map((data, i) => (
                            <div
                              key={i}
                              className="bg-[#FAF8F8] p-[8px] course_video flex items-start gap-3 rounded-md"
                            >
                              <span>{data.input}</span>
                              <div className="flex flex-col gap-[0.4rem]">
                                <h2 className="text-[#1F2130] text-[14px]">
                                  {data.header}
                                </h2>
                                <span className="flex items-center gap-2 text-[12px] text-[#71748C]">
                                  {data.icon}
                                  {data.videoDuration}
                                </span>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {course && (
        <>
          {" "}
          <div className="cr_box">
            <h1 className="font-[700] text-[16px]">Instructor</h1>
            <div className="flex gap-2 items-center my-4">
              <span className="h-[40px] w-[40px] rounded-full bg-secondaryColors-0"></span>
              <span className="flex items-start flex-col gap-1">
                <h1 className="text-[13px] text-primaryColors-0 font-[600]">
                  {courseDetails?.createdBy}
                </h1>
                <p className="text-[12px] font-[400] text-[#71748C]">
                  GOYE Instructor
                </p>
              </span>
            </div>
          </div>
          <div className="cr_box flex items-start flex-col gap-1">
            <h1 className="font-[700] text-[16px]">Outcomes & Reward</h1>
            <span className="flex items-center gap-3 text-[13px]">
              <GoTrophy color="#FE9900" />
              Certificate of Completion
            </span>
            <span className="flex items-center gap-3 text-[13px]">
              <SlBadge color="#2C7FFF" />
              Achievement Badge
            </span>
          </div>
        </>
      )}
    </>
  );
}
