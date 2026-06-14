"use client";

import { useEffect, useState } from "react";
import { CiClock1 } from "react-icons/ci";
import { formatDate } from "../hook/formatDate";
import { HiOutlineBookOpen } from "react-icons/hi";
import { IoArrowBack } from "react-icons/io5";
interface Props {
  courseId: string;
  backFunc?: () => void;
  isAlone: boolean;
}
interface Activities {
  id?: string;
  message?: string;
  type: string;
  createdAt?: string;
}
export default function DashboardTutorMoreCourseActivities({
  courseId,
  backFunc,
  isAlone,
}: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activities, setActivities] = useState<Activities[]>([]);
  const [showActivities, setShowActivities] = useState<string[]>([]);
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
    fetchActivities();
  }, [isAlone]);
  return (
    <div className="my-5 dashboard_content_mainbox">
      <div className="flex items-center gap-2 w-full mb-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-full dark:bg-[#2C7FFF0D] bg-lightWhite-0 text-[#2C7FFF]">
          {isAlone && <IoArrowBack onClick={backFunc} />}
        </div>
        <h1 className="font-semibold  dark:text-textSlightDark-0 text-[14px]">
          Activities
        </h1>
      </div>

      <div>
        {activities.length == 0 ? (
          <div className="text-center text-nearTextColors-0">
            No activities yet
          </div>
        ) : (
          <div>
            {activities.map((a, i) => (
              <div key={i}>
                <div className="flex items-center justify-between w-full" onClick={() => toogleActivity(a.id as string)}>
                  <div className="flex items-center gap-4 w-[82%] overflow-hidden">
                    <div className="h-[32px] w-[32px] bg-[#2C7FFF0D] text-[#2C7FFF] flex justify-center items-center">
                      {a.type == "enrollment" ? <HiOutlineBookOpen /> : ""}
                    </div>
                    <p className={`font-semibold text-textSlightDark-0 text-[13px] ${showActivities.includes(a.id as string) ? "line-clamp-none" : "line-clamp-1"}`}>
                      {a.message}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-textGrey-0 text-[13px]">
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
  );
}
