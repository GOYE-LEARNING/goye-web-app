"use client";

import Image from "next/image";
import pic from "@/public/images/overview.png";
import { CiBookmark } from "react-icons/ci";
import { useEffect, useState, } from "react";
import { IoBookmark } from "react-icons/io5";
import { LuUser } from "react-icons/lu";
import { FaAngleDoubleUp } from "react-icons/fa";
import pic2 from "@/public/images/notfound.png";
import logo from "@/public/images/logo.png"
import Loader from "./loader";
interface Course {
  id?: string;
  course_image: string | null;
  course_title: string;
  course_description: string;
  createdBy: string;
  course_duration: string;
  course_level: string;
  enrolled: string;
}

interface Props {
  openCourse: (id: string) => void;
  search: string;
  isRefreshing: boolean;
}
export default function DashboardCourseAll({
  openCourse,
  search,
  isRefreshing,
}: Props) {
  const [fill, setFill] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [courseDetails, setCourseDetails] = useState<Course[]>([]);

  const course: Course[] = [
    {
      course_image: pic as any,
      course_title: "Foundation of Discipleship",
      course_description:
        "Discover what it means to truly follow Jesus in your daily life. This foundational course helps you build strong spiritual habits, understand key biblical principles, and live as a disciple in your community.",
      course_duration: "1hr 15min",
      course_level: "Beginner",
      createdBy: "Imayi Sean",
      enrolled: "Enrolled",
    },
  ];

  const toogleBookMark = (id: string) => {
    setFill((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/course/get-all-courses`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log("An error occured while fetching courses");
      }
      setIsLoading(false);
      setCourseDetails(data.data.getAllCourses);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  const filterCourse = courseDetails.filter(
    (course) =>
      course.course_title.toLowerCase().includes(search.toLowerCase()) ||
      course.course_description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {!isRefreshing ? (
        <div>
          {" "}
          {filterCourse.length === 0 ? (
            <div className="flex justify-center items-center flex-col gap-1 md:mt-10 mt-[8rem]">
              <Image src={pic2} alt="pic" height={100} width={100} />
              <h1 className="text-textSlightDark-0 font-semibold text-[18px]">
                No Course Found
              </h1>
              <p className="text-textGrey-0">Create a Course</p>
            </div>
          ) : (
            <div>
              {filterCourse.map((course, i) => (
                <div
                  key={i}
                  className="md:bg-[#ffffff] md:drop-shadow-sm w-full md:p-[24px] my-5 flex flex-col gap-2"
                >
                  <div className="flex justify-start items-start w-full gap-3">
                    <div className="relative">
                      <img
                        src={course.course_image as any || logo}
                        alt="pic"
                        className="h-[89.16px] w-[130px]"
                      />
                      <span
                        className="absolute top-1 right-1"
                        onClick={() => toogleBookMark(course.id as any)}
                      >
                        {!fill.includes(course.id as any) ? (
                          <CiBookmark color="#B1B1B6" size={23} />
                        ) : (
                          <IoBookmark color="#ffffff" size={23} />
                        )}
                      </span>
                    </div>
                    <div className="w-full flex flex-col  gap-2">
                      <div className="flex justify-between items-center w-full">
                        <h1 className="text-[14px] font-[700] text-[#41415A]">
                          {course.course_title}
                        </h1>
                        <span className="text-[10px] text-[#41415A] bg-[#F1F1F4] px-[4px]">
                          {course.enrolled}
                        </span>
                      </div>
                      <p className="text-[#71748C] text-[13px] font-[600] line-clamp-2 md:line-clamp-[none]">
                        {course.course_description}
                      </p>
                      <p className="flex items-center gap-6">
                        <span className="flex items-center gap-3 text-[#71748C] md:text-[13px] text-[12px]">
                          <LuUser /> {course.createdBy}
                        </span>
                        <span className="flex items-center gap-3 text-[#30A46F] text-[13px]">
                          <FaAngleDoubleUp />
                          {course.course_level}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    className="h-[36px] text-[14px] bg-shadyColor-0 text-primaryColors-0 my-3 w-full"
                    onClick={() => openCourse(course.id as any)}
                  >
                    View Course
                  </button>
                  <div className="h-[1px] w-full bg-[#EFEFF2]"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-[6rem]">
          <Loader
            height={30}
            width={30}
            border_width={2}
            full_border_color="transparent"
            small_border_color="#3F1F22"
          />
        </div>
      )}
    </>
  );
}
