import { set } from "date-fns/fp";
import React, { useEffect, useRef, useState } from "react";
import { BiChevronDown } from "react-icons/bi";
import { HiOutlineChartBar } from "react-icons/hi";
import { LuChartLine } from "react-icons/lu";
import { MdOutlineShowChart, MdPeople } from "react-icons/md";

export default function DashboardOrgAdminOverview() {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const [showBox, setShowBox] = useState<boolean>(false);
  const [date, setDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    total_members: number;
    total_courses_completed: number;
    avg_completion: number;
    new_members_today: number;
  }>({
    total_members: 0,
    total_courses_completed: 0,
    avg_completion: 0,
    new_members_today: 0,
  });
  const [selectedValue, setSelectedValue] = useState<
    "Today" | "This week" | "Last week" | "Last month" | typeof date
  >("Today");
  useEffect(() => {
    const removeBox = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setShowBox(false);
      }
    };

    document.addEventListener("mousedown", removeBox);
    return () => document.removeEventListener("mousedown", removeBox);
  }, []);

  useEffect(() => {
    const fetchOrgStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const token =
          typeof window !== "undefined"
            ? document.cookie
                .split("; ")
                .find((row) => row.startsWith("token="))
                ?.split("=")[1]
            : undefined;

        // Uses existing backend aggregation in StudentEnrollmentController.GetAllStudents
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/enroll/fetch-all-students`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to load organization stats");
        }

        const data = await res.json();
        const api = data?.data;
        const students = api?.students || [];
        const apiStats = api?.stats || {};

        const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
        const newMembersToday = students.filter((s: any) => {
          const joined = s?.joined_date ? new Date(s.joined_date) : null;
          return joined && joined >= todayStart;
        }).length;

        const totalMembers = apiStats.total_students ?? students.length ?? 0;
        const totalCompleted = apiStats.total_courses_completed ?? 0;

        const totalEnrollments = apiStats.total_enrollments ?? 0;
        const avgCompletion =
          totalEnrollments > 0
            ? Math.round((totalCompleted / totalEnrollments) * 100)
            : 0;

        setStats({
          total_members: totalMembers,
          total_courses_completed: totalCompleted,
          avg_completion: avgCompletion,
          new_members_today: newMembersToday,
        });
      } catch (err: any) {
        setError(err.message ?? "Unable to load stats");
      } finally {
        setLoading(false);
      }
    };

    fetchOrgStats();
  }, []);

  const selectFunc = () => {
    setShowBox(true);
  };

  const handleChangeDate = (e?: any) => {
    setDate(e.target.value);
    setShowBox(false);
  };

  const selectValue = (
    value: "Today" | "This week" | "Last week" | "Last month" | "Select a date"
  ) => {
    setShowBox(false);
    if (value == "Today") {
      setSelectedValue("Today");
    } else if (value == "This week") {
      setSelectedValue("This week");
    } else if (value == "Last week") {
      setSelectedValue("Last week");
    } else if (value == "Last month") {
      setSelectedValue("Last month");
    } else if (value == "Select a date") {
      setSelectedValue(date);
    }
  };
  return (
    <div className="dashboard_content_box">
      <div className="flex justify-between items-center">
        <h1 className="font-semibold text-textSlightDark-0 text-[14px]">Overview</h1>
        <div className="relative">
          <button
            className="flex items-center gap-1 text-primaryColors-0 text-[12px]"
            onClick={selectFunc}
          >
            {selectedValue} <BiChevronDown />
          </button>
          {showBox && (
            <div
              className="bg-boldShadyColor-0 border border-boldShadyColor-0 absolute w-[min(180px,85vw)] right-0 z-10 rounded-lg shadow-lg"
              ref={boxRef}
            >
              <ul className="flex flex-col gap-2">
                <li
                  className="admin_data_date_select"
                  onClick={() => selectValue("Today")}
                >
                  Today
                </li>
                <li
                  className="admin_data_date_select"
                  onClick={() => selectValue("This week")}
                >
                  This week
                </li>
                <li
                  className="admin_data_date_select"
                  onClick={() => selectValue("Last week")}
                >
                  Last week
                </li>
                <li
                  className="admin_data_date_select"
                  onClick={() => selectValue("Last month")}
                >
                  Last Month
                </li>
                <label
                  className="admin_data_date_select relative"
                  onClick={() => {
                    dateInputRef.current?.showPicker?.();
                  }}
                >
                  Select previous date
                </label>
                <input
                  type="date"
                  ref={dateInputRef}
                  value={date}
                  onClick={() => {
                    selectValue("Select a date");
                  }}
                  onChange={handleChangeDate}
                  className="hidden absolute right-0 bg-red-500"
                />
              </ul>
            </div>
          )}
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      <div className="grid grid-cols-2 gap-[8px] mt-2">
        <div className="admin_dashboard_data">
          <div className="flex gap-1 flex-col">
            <h1 className="text-textSlightDark-0 font-bold text-[18px]">
              {loading ? "..." : stats.total_members}
            </h1>
            <span className="text-textGrey-0 text-[12px]">Active Members</span>
          </div>

          <div className="flex items-center justify-center h-[32px] w-[32px] bg-shadyColor-0 text-primaryColors-0 rounded-md border border-boldShadyColor-0">
            <MdOutlineShowChart />
          </div>
        </div>
        <div className="admin_dashboard_data">
          <div className="flex gap-1 flex-col">
            <h1 className="text-textSlightDark-0 font-bold text-[18px]">
              {loading ? "..." : stats.new_members_today}
            </h1>
            <span className="text-textGrey-0 text-[12px]">New Members</span>
          </div>

          <div className="flex items-center justify-center h-[32px] w-[32px] bg-shadyColor-0 text-primaryColors-0 rounded-md border border-boldShadyColor-0">
            <MdPeople />
          </div>
        </div>
        <div className="admin_dashboard_data">
          <div className="flex gap-1 flex-col">
            <h1 className="text-textSlightDark-0 font-bold text-[18px]">
              {loading ? "..." : stats.total_courses_completed}
            </h1>
            <span className="text-textGrey-0 text-[12px]">Courses Completed</span>
          </div>

          <div className="flex items-center justify-center h-[32px] w-[32px] bg-shadyColor-0 text-primaryColors-0 rounded-md border border-boldShadyColor-0">
            <LuChartLine />
          </div>
        </div>
        <div className="admin_dashboard_data">
          <div className="flex gap-1 flex-col">
            <h1 className="text-textSlightDark-0 font-bold text-[18px]">
              {loading ? "..." : `${stats.avg_completion}%`}
            </h1>
            <span className="text-textGrey-0 text-[12px]"> Avg. Completion</span>
          </div>

          <div className="flex items-center justify-center h-[32px] w-[32px] bg-shadyColor-0 text-primaryColors-0 rounded-md border border-boldShadyColor-0">
            <HiOutlineChartBar />
          </div>
        </div>
      </div>
    </div>
  );
}
