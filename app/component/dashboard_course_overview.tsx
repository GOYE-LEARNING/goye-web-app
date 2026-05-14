"use client";

import React, { useEffect, useState } from "react";
import { CiGlobe } from "react-icons/ci";
import { GoPeople, GoTrophy, GoVideo } from "react-icons/go";
import { HiOutlineBookOpen } from "react-icons/hi";
import { MdChevronRight } from "react-icons/md";
import { motion } from "framer-motion";
import { SlBadge } from "react-icons/sl";
import Loader from "./loader";
import { BiLogOut } from "react-icons/bi";
import DashboardStudentCourseList from "./dashboard_student_course_list";
import Image from "next/image";

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
  enrollment: string;
  createdByDetails: {
    user_pic: string;
  };
  module?: [
    {
      lesson?: Lesson[];
      module_title: string;
      module_duration: string;
      module_description: string;
    },
  ];
  objectives?: [
    {
      objective_title1: string;
      objective_title2: string;
      objective_title3: string;
      objective_title4: string;
      objective_title5: string;
    },
  ];
}

interface Lesson {
  id?: string;
  lesson_title?: string;
  lesson_video?: string;
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
  const [isLoading2, setIsLoading2] = useState<boolean>(false);
  const [startIsLoading, setIsStartLoading] = useState<boolean>(false);
  const [courseDetails, setCourseDetails] = useState<Course | null>(null);
  const [checkEnroll, setCheckEnroll] = useState<boolean | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const checkIfEnrolled = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/enroll/check-if-enrolled/${courseId}`,
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

      console.log(data);
      setCheckEnroll(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const startCourse = async () => {
    setIsStartLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/enroll/student-enroll/${courseId}`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const data = await res.json();

      if (!res.ok) {
        console.log(data);
        return;
      }

      setCourse(false);
      setCourseList(true);
      setCoursesPlace(false);
      setIsStartLoading(false);
      removeFunc();

      console.log(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const openCourse = () => {
    startCourse();
  };

  const showVideoLessonsCourse = () => {
    setCourse(false);
    setCourseList(true);
    setCoursesPlace(false);
    setIsStartLoading(false);
    removeFunc();
  };

  const exitCourse = () => {};

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
      setIsLoading2(false);
    }
  };

  useEffect(() => {
    checkIfEnrolled();
    fetchCourse();
  }, []);

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
      {!isLoading && course ? (
        <div>
          <div className="cr_box">
            <div className="cr_p">
              <div>{courseDetails?.course_description}</div>
            </div>

            <p className="cr_p flex items-center gap-4 my-5">
              <span className="flex items-center justify-center gap-2">
                <CiGlobe />
                English (Auto)
              </span>
              <span className="flex items-center justify-center gap-2">
                <GoPeople />
                {courseDetails?.enrollment.length}
              </span>
            </p>

            <div className="h-[1px] w-full bg-[#EFEFF2]"></div>

            <ol className="my-5 flex flex-col gap-1">
              <h1 className="text-primaryColors-0 font-[700]">
                Learning Objectives
              </h1>
              <ul className="pl-[24px] flex flex-col gap-1">
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
              </ul>
            </ol>

            <div className="flex flex-col-reverse gap-3">
              <div className="w-full">
                {checkEnroll == false ? (
                  <button
                    className="h-[48px] bg-primaryColors-0 w-full text-center text-white"
                    onClick={openCourse}
                    disabled={isLoading2 == false ? false : true}
                  >
                    {isLoading2 == false ? (
                      "Start Course"
                    ) : (
                      <Loader
                        height={25}
                        width={25}
                        border_width={2}
                        full_border_color="transparent"
                        small_border_color="white"
                      />
                    )}
                  </button>
                ) : (
                  <button
                    className="h-[48px] bg-white w-full text-center text-nearTextColors-0  border border-nearTextColors-0/20"
                    onClick={exitCourse}
                    disabled={isLoading2 == false ? false : true}
                  >
                    {isLoading2 == false ? (
                      <div className="flex items-center justify-center gap-2">
                        {" "}
                        <BiLogOut />
                        Exit Course
                      </div>
                    ) : (
                      <Loader
                        height={25}
                        width={25}
                        border_width={2}
                        full_border_color="transparent"
                        small_border_color="white"
                      />
                    )}
                  </button>
                )}
              </div>

              {checkEnroll == false ? (
                ""
              ) : (
                <button
                  className="h-[48px] bg-primaryColors-0 w-full text-center text-white"
                  onClick={showVideoLessonsCourse}
                >
                  Let Begin
                </button>
              )}
            </div>
          </div>

          <div className="cr_box flex items-start gap-3 flex-col">
            {coursesPlace && (
              <>
                <h1 className="text-textSlightDark-0 text-[16px] font-[700]">
                  Modules
                </h1>
                {courseDetails?.module?.map((data, i) => {
                  return (
                    <div className="w-full cursor-pointer" key={i}>
                      <h2
                        className="text-[14px] text-textSlightDark-0 flex justify-between items-center"
                        onClick={() => {
                          toggleAccordion(i);
                        }}
                      >
                        <p className="font-[600]">{data.module_title}</p>
                        <span className="text-[1.3rem]">
                          <div
                            className={`${activeIndex === i ? "rotate-90" : ""}`}
                          >
                            <MdChevronRight />{" "}
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
                            {data.module_description}
                          </p>
                          <span className="flex items-center gap-3">
                            <GoVideo />
                            <p className="text-[#71748C] text-[14px] font-[400]">
                              {data.module_duration} to complete this course
                            </p>
                          </span>
                          <span className="flex items-center gap-3">
                            <HiOutlineBookOpen />
                            <div className="text-[#71748C] text-[14px] font-[400]">
                              {data.lesson?.length == 1 ? (
                                <div>{data.lesson.length} video</div>
                              ) : (
                                <div>{data.lesson?.length} videos</div>
                              )}
                            </div>
                          </span>
                        </motion.div>
                      )}

                      <div className="h-[1px] w-full bg-[#EFEFF2] my-3"></div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {course && (
            <>
              {" "}
              <div className="cr_box">
                <h1 className="font-[700] text-[16px]">Instructor</h1>
                <div className="flex gap-2 items-center my-4">
                  <span className="h-[40px] w-[40px] rounded-full bg-secondaryColors-0 overflow-hidden">
                    <img
                      src={courseDetails?.createdByDetails.user_pic}
                      alt="profile-pic"
                      className="h-full w-full covver"
                    />
                  </span>
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
        </div>
      ) : (
        <div className="mt-10">
          <Loader
            height={25}
            width={25}
            border_width={2}
            full_border_color="#FFA500"
            small_border_color="transparent"
          />
        </div>
      )}
    </>
  );
}
