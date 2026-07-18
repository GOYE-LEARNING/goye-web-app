"use client";

import { useEffect, useState } from "react";
import { CiClock1 } from "react-icons/ci";
import { HiOutlineBookOpen } from "react-icons/hi";
import { IoMdGlobe } from "react-icons/io";
import { MdOutlineQuiz, MdPeople } from "react-icons/md";
import { formatDate } from "../hook/formatDate";
interface Props {
  createQuiz: () => void;
  createModule: () => void;
  courseId: string;
  course_description: string;
  openViewContent: () => void;
  openActivities: () => void;
}

interface Course {
  id?: string;
  _count: {
    post: number;
    enrollment: number;
  };
}

interface Activities {
  id?: string;
  message?: string;
  type: string;
  createdAt?: string;
}

interface TutorOverviewData {
  avgCompletionPercentage: number;
}

export default function DashboardTutorTabOverview({
  createQuiz,
  createModule,
  courseId,
  course_description,
  openViewContent,
  openActivities,
}: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [courseDetails, setCourseDetails] = useState<Course | null>(null);
  const [showActivities, setShowActivities] = useState<string[]>([]);
  const [overviewData, setOverviewData] = useState<TutorOverviewData | null>(
    null,
  );
  const [activities, setActivities] = useState<Activities[]>([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const toogleActivity = (id: string) => {
    setShowActivities((prev) => {
      if (prev.includes(id)) {
        return prev.filter((activityId) => activityId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/course/get-course/${courseId}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log("An error occured while fetching courses");
      }
      console.log("Overview " + data);
      setIsLoading(false);
      setCourseDetails(data.data);
      // setCourseDetails([data.data]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAverageCompletion = async () => {
    try {
      const response = await fetch(`${API_URL}/api/course/tutor-overview`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch overview data");
      }

      setOverviewData(data.data);
      console.log("Overview ", data);
    } catch (err: any) {
      console.error("Error fetching tutor overview:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/course/fetch-activities/${courseId}`,
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

      setActivities(data.data);
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchAverageCompletion();
    fetchActivities();
    fetchCourse();
  }, []);
  return (
    <div>
      <div className="dashboard_content_mainbox">
        <p className="text-[14px] text-textGrey-0">{course_description}</p>

        <div className="flex items-center gap-5 text-textGrey-0 my-3">
          <span className="flex items-center gap-2 text-[14px]">
            <IoMdGlobe />
            <span>English(Auto)</span>
          </span>
          <span className="flex items-center gap-2 text-[14px]">
            <MdPeople />
            <span>{courseDetails?._count.enrollment} Student</span>
          </span>
        </div>

        <div className="dark:bg-shadyColor-0 bg-lightWhite-0 p-[16px]">
          <h1 className="font-semibold text-[14px] dark:text-textSlightDark-0 text-lightBoldText-0">
            Quick Action
          </h1>
          <div className="grid grid-cols-2 gap-[10px] my-4">
            <div
              className="h-[72px] bg-white dark:bg-boldShadyColor-0 flex justify-center items-center flex-col gap-1 cursor-pointer"
              onClick={createModule}
            >
              <HiOutlineBookOpen color="#71748C" />
              <span className="dark:text-textSlightDark-0 text-lightBoldText-0 font-semibold text-[12px]">
                Add Module
              </span>
            </div>
            <div
              className="h-[72px] bg-white dark:bg-boldShadyColor-0 flex justify-center items-center flex-col gap-1 cursor-pointer"
              onClick={createQuiz}
            >
              <MdOutlineQuiz color="#71748C" />
              <span className="dark:text-textSlightDark-0 text-lightBoldText-0 font-semibold text-[12px]">
                Create Quiz
              </span>
            </div>
          </div>
          <div className="dashboard_hr"></div>
          <div className="grid grid-cols-3 justify-around bg-white dark:bg-boldShadyColor-0 my-4 p-[12px]">
            <div className="flex justify-center items-center flex-col gap-1">
              <span className="dark:text-textSlightDark-0 text-lightBoldText-0 font-bold text-[18px]">
                {courseDetails?._count.enrollment}
              </span>
              <p className="text-textGrey-0 text-[12px]">Enrolled</p>
            </div>
            <div className="flex justify-center items-center flex-col gap-1">
              <span className="dark:text-textSlightDark-0 font-bold text-[18px]">
                {courseDetails?._count.post}
              </span>
              <p className="text-textGrey-0 text-[12px]">Discussion</p>
            </div>
            <div className="flex justify-center items-center flex-col gap-1">
              <span className="dark:text-textSlightDark-0 text-lightBoldText-0 font-bold text-[18px]">
                {overviewData
                  ? `${overviewData.avgCompletionPercentage}%`
                  : "0%"}
              </span>
              <p className="text-textGrey-0 text-[12px]">Avg. Completion</p>
            </div>
          </div>
          <button
            className="h-[36px] bg-white dark:bg-boldShadyColor-0 text-primaryColors-0 w-full text-[12px]"
            onClick={openViewContent}
          >
            View Content
          </button>
        </div>
        <button className="bg-primaryColors-0 text-white text-[14px] w-full h-[48px] my-5">
          Start Course
        </button>
        <div className="dashboard_hr"></div>
        <div className="my-5">
          <div className="flex justify-between items-center w-full">
            <h1 className="font-semibold  dark:text-textSlightDark-0 text-[14px] mb-3">
              Activities
            </h1>
            <div
              className="text-primaryColors-0 cursor-pointer"
              onClick={openActivities}
            >
              See all
            </div>
          </div>

          <div>
            {activities.length == 0 ? (
              <div className="text-center text-nearTextColors-0">
                No activities yet
              </div>
            ) : (
              <div>
                {activities.slice(0, 5).map((a, i) => (
                  <div key={i}>
                    <div
                      className="flex items-center justify-between w-full"
                      onClick={() => toogleActivity(a.id as string)}
                    >
                      <div className="flex items-center gap-4 w-[82%] overflow-hidden">
                        <div className="h-[32px] w-[32px] bg-[#2C7FFF0D] text-[#2C7FFF] flex justify-center items-center">
                          {a.type == "enrollment" ? <HiOutlineBookOpen /> : ""}
                        </div>
                        <p
                          className={`font-semibold text-textSlightDark-0 text-[13px] ${showActivities.includes(a.id as string) ? "line-clamp-none" : "line-clamp-1"} `}
                        >
                          {a.message}
                        </p>
                      </div>
                      <span className="flex items-center gap-1 text-textGrey-0 text-[13px] ">
                        <CiClock1 /> {formatDate(a.createdAt as any)}
                      </span>
                    </div>
                    <div className="dashboard_hr my-4"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
