"use client";

import { BiBookOpen, BiTrophy } from "react-icons/bi";
import { MdEmojiEvents, MdLeaderboard } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import { useEffect, useState } from "react";
import GeneralLeaderboard from "@/app/component/leaderboard_component/general_leaderboard";
import { AnimatePresence, motion } from "framer-motion";
interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  avatar: string | null;
  total_xp: number;
  level: string;
  level_number: number;
  courses_completed?: number;
  groups_joined?: number;
  country?: string;
}

interface PersonalData {
  gamification: {
    totalXP: number;
  };
  user: {
    avatar: string;
  };
}

export default function StudentLeaderBoardPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [personalData, setPersonalData] = useState<PersonalData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("Global Leaderboard");
  const [search, setSearch] = useState<string>("");
  const fetchLeaderboard = async (
    type: "global" | "course" | "group" = "global",
    id?: string,
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      let url = `${API_URL}/api/gamification/leaderboard?type=${type}&limit=50`;
      if (id) {
        url += `&id=${id}`;
      }

      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch leaderboard");
      }

      setLeaderboardData(data.data.leaderboard);
      setTitle(data.data.title);
    } catch (err: any) {
      console.error("Error fetching leaderboard:", err);
      setError(err.message || "Failed to load leaderboard");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchLeaderboard("global");
  }, []);

  const fetchProgress = async () => {
    try {
      const res = await fetch(`${API_URL}/api/gamification/dashboard`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        return;
      }
      console.log(data);
      setPersonalData(data.data)
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchProgress();
  }, []);

  return (
    <div>
      <br/>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-[1.5rem] font-bold"> Leaderboard </h1>
          <div className="text-[1.5rem]">
            <MdLeaderboard />{" "}
          </div>
        </div>
        <div className="w-[auto] bg-white dark:bg-secondaryColors-0 py-2 px-3 rounded-[10px] flex items-center justify-between gap-1">
          <div className="h-[30px] w-[30px] rounded-full overflow-hidden">
            <img src={personalData?.user.avatar} alt="user_pic" className="h-full w-full object-cover z-10" />
          </div>
          <p className="font-semibold text-[14px]">You</p>
          <div className="h-[20px] w-[1px] mx-2 bg-nearTextColors-0/20"></div>
          <div className="flex items-center gap-1">
            <p className="font-semibold text-[12px]">
              {personalData?.gamification.totalXP || 0}XP
            </p>
            <BiTrophy color="#FE9900" />
          </div>
        </div>
      </div>    
      <div className="dashboard_content_mainbox min-h-screen rounded-[30px] overflow-hidden">
        <div className="flex justify-between md:items-center  md:flex-row flex-col w-full ">
          <div className="mb-6">
            <h2 className="text-2xl font-bold dark:text-textSlightDark-0 text-lightBoldText-0/80 flex items-center gap-2">
              <MdEmojiEvents size={28} className="text-primaryColors-0" />
              {title}
            </h2>
            <p className="dark:text-textSlightDark-0 text-lightBoldText-0/80 text-sm mt-1">
              Top {leaderboardData.length} learners ranked by total experience
              points
            </p>
          </div>
          <div className="flex items-center gap-3 md:w-auto w-full">
            <div className="relative h-full md:w-auto w-full">
              <div className="absolute top-[20%] left-1">
                {" "}
                <CiSearch size={20} color="#ccc" />
              </div>
              <input
                type="text"
                placeholder="Search for friends..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-[#ccc]/10 outline-none h-[35px] md:w-[200px] w-full pl-6 pr-3 text-[12px] rounded-[10px] bg-lightWhite-0 dark:bg-shadyColor-0"
              />
            </div>
          </div>
        </div>
        {/*Tabs Selection */}
        <AnimatePresence mode="wait">
          <motion.div
            key="tab1"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <GeneralLeaderboard search={search} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
