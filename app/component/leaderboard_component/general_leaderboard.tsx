"use client";

import { useEffect, useState } from "react";
import { BiBookOpen, BiTrophy } from "react-icons/bi";
import { FaUserGroup } from "react-icons/fa6";
import { MdEmojiEvents } from "react-icons/md";
import Image from "next/image";
import Loader from "../loader";

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

interface LeaderboardResponse {
  success: boolean;
  message: "";
  data: {
    title: string;
    type: string;
    id: string | null;
    leaderboard: LeaderboardUser[];
    total: number;
  };
}

interface Props {
  search: string;
}

export default function GeneralLeaderboard({ search }: Props) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderboardType, setLeaderboardType] = useState<
    "global" | "course" | "group"
  >("global");
  const [selectedId, setSelectedId] = useState<string>("");
  const [title, setTitle] = useState<string>("Global Leaderboard");

  // Fetch leaderboard data
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

      const data: LeaderboardResponse = await res.json();

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

  // Helper function to get medal color based on rank
  const getMedalStyle = (rank: number) => {
    if (rank === 1) return "bg-[#FFA82F]"; // Gold
    if (rank === 2) return "bg-[#C7C8C7]"; // Silver
    if (rank === 3) return "bg-[#C8936E]"; // Bronze
    return "bg-gray-300";
  };

  // Helper function to get medal label
  const getMedalLabel = (rank: number) => {
    if (rank === 1) return "1st";
    if (rank === 2) return "2nd";
    if (rank === 3) return "3rd";
    return rank.toString();
  };

  const filterStudent = leaderboardData.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader
          height={40}
          width={40}
          full_border_color="#E5E7EB"
          small_border_color="#3B82F6"
          border_width={3}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold">Error loading leaderboard</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => fetchLeaderboard("global")}
            className="mt-4 px-4 py-2 bg-primaryColors-0 text-white rounded-lg hover:bg-primaryColors-0/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Leaderboard Table */}
      <div className="overflow-x-auto mt-6">
        <table className="w-full">
          <thead className="bg-lightWhite-0 dark:bg-shadyColor-0 h-[40px] rounded">
            <tr>
              <th className="leader_board_table_header rounded-tl-lg rounded-bl-lg  w-[60px] text-left pl-3">
                #
              </th>
              <th className="leader_board_table_header text-left pl-3">Name</th>
                <th className="leader_board_table_header text-left pl-3 hidden md:table-cell">
                Country
              </th>
              <th className="leader_board_table_header text-left pl-3 hidden md:table-cell">
                Level
              </th>
              <th className="leader_board_table_header text-left pl-3 hidden lg:table-cell">
                Courses Completed
              </th>
              <th className="leader_board_table_header text-left pl-3 rounded-tr-lg rounded-br-lg">
                Total XP
              </th>
            </tr>
          </thead>
          <tbody>
            {filterStudent.map((user, i) => (
              <tr
                key={user.id}
                className="h-[65px] border-b border-[#ccc]/20 hover:bg-lightWhite-0 dark:hover:bg-shadyColor-0 transition-colors"
              >
                {/* Rank with medal */}
                <td className="pl-3">
                  <div className="text-[12px] text-nearTextColors-0">
                    {i + 1}
                  </div>
                </td>

                {/* User info */}
                <td className="pl-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`${getMedalStyle(user.rank)} rounded-full flex justify-center items-center h-[40px] w-[40px] text-white font-semibold text-[12px]`}
                    >
                      {getMedalLabel(user.rank)}
                    </div>
                    <div className="h-[40px] w-[40px] rounded-full overflow-hidden bg-gray-200 -ml-4">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-primaryColors-0/10 text-primaryColors-0 font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-[14px] text-textSlightDark-0">
                        {user.name}
                      </div>
                      <div className="text-[11px] text-textGrey-0 md:hidden">
                        Level {user.level_number}: {user.level}
                      </div>
                    </div>
                  </div>
                </td>

                 <td className="hidden md:table-cell pl-3">
                  <div className="font-semibold text-textSlightDark-0/70 text-[13px]">
                    {user.country}
                  </div>
                </td>

                {/* Level (desktop) */}
                <td className="hidden md:table-cell pl-3">
                  <div className="font-semibold text-textSlightDark-0/70 text-[13px]">
                    Level {user.level_number}: <i className="not-italic capitalize">{user.level}</i>
                  </div>
                </td>

                {/* Courses Completed (desktop) */}
                <td className="hidden lg:table-cell pl-3">
                  <div className="font-semibold text-textSlightDark-0/50 text-[12px] flex items-center gap-1">
                    <BiBookOpen size={16} />
                    {user.courses_completed || 0} courses
                  </div>
                </td>

                {/* Total XP */}
                <td className="pl-3">
                  <div className="font-semibold text-[14px] text-primaryColors-0 flex items-center gap-1">
                    <BiTrophy size={18} color="#FE9900" />
                    {user.total_xp.toLocaleString()} XP
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {leaderboardData.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <BiTrophy size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-textGrey-0">No users on the leaderboard yet</p>
          <p className="text-sm text-textGrey-0/60">
            Complete activities to earn XP and appear here!
          </p>
        </div>
      )}

      {filterStudent.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <BiTrophy size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-textGrey-0">No users matches your search</p>
        </div>
      )}
    </div>
  );
}
