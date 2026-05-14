"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { FaArrowRight, FaRocket } from "react-icons/fa6";
import { MdMenuBook } from "react-icons/md";
import { useProgress } from "../context/progressContext";

interface Props {
  openGrowth: () => void;
}
export default function DashboardStudentGrowth({ openGrowth }: Props) {
  const {progressId, setProgressId} = useProgress()
  const [showJourney, setShowJourney] = useState<boolean>(true);
  const [showStartJourney, setShowStartJourney] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const params = useParams<{ org_name: string }>();
  const type = localStorage.getItem("type");
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const navigate = useRouter();
  const startJourney = async () => {
    try {
      const res = await fetch(`${API_URL}/api/growth/start-journey`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      console.log(data);
      setProgressId(data.data.id)
    } catch (error) {
      console.error(error)
    }
  };

  const showJourneyFunc = () => {
    setShowJourney(false);
    setShowStartJourney(true);
  };
  return (
    <>
      <div className="dashboard_content_box">
        <div className="dashboard_content_header">
          <div></div>
        </div>
        {showStartJourney && (
          <div>
            <div className="font-semibold">
              <h1 onClick={startJourney}>Level 1 Seeker / <span className="text-nearTextColors-0">Level 5 Mentor</span></h1>
            </div>

            <div className="dashboard_content_subbox">
              <div className="dashboard_content_progress">
                <h3>Beginner</h3>
                <div className="w-full h-[8px] bg-[#E8E1E2] dark:bg-secondaryColors-0 relative">
                  <div className="h-[8px] w-[0%] bg-[#30A46F]"></div>
                </div>
                <div className="dark:bg-[#EFEFF2]/10 bg-[#ccc]/20 h-[1px] w-full"></div>
              </div>
              <div className="flex justify-around items-center w-full">
                <div className="flex flex-col justify-center items-center gap-2  ">
                  <span className="font-[700]">0</span>
                  <p className="font-[400] text-[#71748C]">Acheivement</p>
                </div>

                <div className="flex flex-col justify-center items-center gap-2  ">
                  <span className="font-[700]">0</span>
                  <p className="font-[400] text-[#71748C]">Certificate</p>
                </div>

                <div className="flex flex-col justify-center items-center gap-2  ">
                  <span className="font-[700]">0</span>
                  <p className="font-[400] text-[#71748C]">Badges</p>
                </div>
                <div className="flex flex-col justify-center items-center gap-2  ">
                  <span className="font-[700]">0</span>
                  <p className="font-[400] text-[#71748C] text-[10px]">
                    Total Point
                  </p>
                </div>
              </div>
              <button
                className="h-[36px] py-[17px] dark:bg-secondaryColors-0 bg-primaryColors-0 flex justify-center items-center w-full dark:text-primaryColors-0 text-white font-[600] cursor-pointer"
                onClick={openGrowth}
              >
                View Growth
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
