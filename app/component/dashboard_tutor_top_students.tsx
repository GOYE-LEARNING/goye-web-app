"use client";

import { useEffect, useState } from "react";
import { FaMedal } from "react-icons/fa";

interface StudentRanking {
  rank?: number;
  name?: string;
  xp?: number;
  level?: number;
  courseCount?: number;
  // Alternative field names from API
  id?: string;
  first_name?: string;
  last_name?: string;
  user_name?: string;
  points?: number;
  total_xp?: number;
  user_level?: number;
  profile_picture?: string;
}

interface Props {
  courseId?: string;
}

export default function DashboardTutorTopStudents({ courseId }: Props) {
  const [students, setStudents] = useState<StudentRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchTopStudents = async () => {
      if (!API_URL) {
        console.error('NEXT_PUBLIC_API_URL is not defined');
        setError("API URL not configured");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const endpoint = courseId
          ? `/api/gamification/leaderboard?type=course&id=${courseId}&limit=5`
          : `/api/gamification/leaderboard?limit=5`;

        const response = await fetch(`${API_URL}${endpoint}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        console.log("Leaderboard response:", data);

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch rankings");
        }

        // Handle different response formats
        let leaderboardData = [];
        if (Array.isArray(data.data)) {
          // If data.data is already an array
          leaderboardData = data.data;
        } else if (data.data && Array.isArray(data.data.leaderboard)) {
          // If data.data has a leaderboard property
          leaderboardData = data.data.leaderboard;
        } else if (data.data && Array.isArray(data.data.students)) {
          // If data.data has a students property
          leaderboardData = data.data.students;
        } else if (Array.isArray(data)) {
          // If data itself is an array
          leaderboardData = data;
        }

        if (leaderboardData && leaderboardData.length > 0) {
          // Map API response to our interface, handling different field names
          const mappedStudents = leaderboardData.slice(0, 5).map((student: any, idx: number) => ({
            rank: student.rank || idx + 1,
            name: student.name || student.user_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Unknown',
            xp: student.xp || student.total_xp || student.points || 0,
            level: student.level || student.user_level || 1,
            courseCount: student.courseCount || 0,
          }));
          setStudents(mappedStudents);
        } else {
          setError("No leaderboard data found");
        }
      } catch (err: any) {
        console.error("Error fetching top students:", err);
        setError(err.message || "Failed to load rankings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopStudents();
  }, [courseId, API_URL]);

  if (isLoading) {
    return (
      <div className="cr_box">
        <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0 text-[14px] font-[600] mb-3">
          Top Students
        </h1>
        <div className="dark:bg-shadyColor-0 bg-lightWhite-0 p-[16px]">
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 dark:bg-shadyColor-0 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !students.length) {
    return (
      <div className="cr_box">
        <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0 text-[14px] font-[600] mb-3">
          Top Students
        </h1>
        <div className="dark:bg-shadyColor-0 bg-lightWhite-0 p-[16px]">
          <p className="text-textGrey-0 text-sm text-center">
            {error || "No student data available"}
          </p>
        </div>
      </div>
    );
  }

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-primaryYellow-0";
      case 2:
        return "text-gray-400";
      case 3:
        return "text-amber-600";
      default:
        return "text-primaryColors-0";
    }
  };

  return (
    <div className="cr_box">
      <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0 text-[14px] font-[600] mb-3">
        Top Performing Students
      </h1>
      <div className="dark:bg-shadyColor-0 bg-lightWhite-0 p-[16px] flex flex-col gap-3">
        {students.map((student, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 border border-[#F1F1F1] dark:border-[#ccc]/10 rounded hover:bg-gray-50 dark:hover:bg-shadyColor-0 transition"
          >
            <div className="flex items-center gap-2 flex-1">
              <span className={`${getMedalColor(student.rank)} text-lg`}>
                {student.rank === 1 && "🥇"}
                {student.rank === 2 && "🥈"}
                {student.rank === 3 && "🥉"}
                {student.rank > 3 && <span className="text-sm font-bold">#{student.rank}</span>}
              </span>
              <div>
                <h2 className="text-[13px] font-semibold dark:text-textSlightDark-0 text-lightBoldText-0 line-clamp-1">
                  {student.name}
                </h2>
                <p className="text-[11px] text-textGrey-0">Lv {student.level}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[12px] font-bold dark:text-textSlightDark-0 text-lightBoldText-0">
                {(student.xp || 0).toLocaleString()} XP
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
