import { set } from "date-fns/fp";
import React, { useEffect, useRef, useState } from "react";
import { BiChevronDown } from "react-icons/bi";
import { HiOutlineChartBar } from "react-icons/hi";
import { LuChartLine } from "react-icons/lu";
import { MdOutlineShowChart, MdPeople } from "react-icons/md";

export default function DashboardAdminOverview() {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const [showBox, setShowBox] = useState<boolean>(false);
  const [date, setDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    activeUsers: number;
    newUsersToday: number;
    avgCompletionRate: number;
    engagementRate: number;
  }>({
    activeUsers: 0,
    newUsersToday: 0,
    avgCompletionRate: 0,
    engagementRate: 0,
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
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // This used to hand-roll an Authorization header from a legacy,
        // non-httpOnly `token` cookie. Login sets accessToken/refreshToken as
        // httpOnly, so document.cookie can't read them and that lookup was
        // effectively always undefined — but a browser still holding an old
        // `token` cookie would now have it preferred over its valid session
        // cookie (the backend gives an explicit header precedence). Rely on
        // credentials: "include" like every other authenticated call here.
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/admin-dashboard-stats`,
          {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to load admin stats");
        }

        const data = await res.json();
        const apiStats = data?.stats || {};

        setStats({
          activeUsers: apiStats.activeUsers ?? 0,
          newUsersToday: apiStats.newUsersToday ?? 0,
          avgCompletionRate: apiStats.avgCompletionRate ?? 0,
          engagementRate: apiStats.engagementRate ?? 0,
        });
      } catch (err: any) {
        setError(err.message ?? "Unable to load stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
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
        <h1 className="font-semibold dark:text-textSlightDark-0 text-lightBoldText-0 text-[14px]">Overview</h1>
        <div className="relative">
          <button
            className="flex items-center gap-1 text-primaryColors-0 text-[12px]"
            onClick={selectFunc}
          >
            {selectedValue} <BiChevronDown />
          </button>
          {showBox && (
            <div
              className="dark:bg-shadyColor-0 bg-white border border-[#ccc]/20 absolute w-[min(180px,85vw)] right-0 z-10 rounded-lg shadow-lg"
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
                    selectValue('Select a date')
                  }}
                  onChange={handleChangeDate}
                  className="hidden absolute right-0 bg-red-500"
                />
              </ul>
            </div>
          )}
        </div>
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-500">
          {error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-[8px] mt-2">
        <div className="admin_dashboard_data">
          <div className="flex gap-1 flex-col">
            <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0 font-bold text-[18px]">
              {loading ? "..." : stats.activeUsers}
            </h1>
            <span className="dark:text-white text-lightBoldText-0 text-[12px]">Active Users</span>
          </div>

          <div className="flex items-center justify-center h-[32px] w-[32px] dark:bg-shadyColor-0 bg-white text-primaryColors-0 rounded-md border border-boldShadyColor-0">
            <MdOutlineShowChart />
          </div>
        </div>
        <div className="admin_dashboard_data">
          <div className="flex gap-1 flex-col">
            <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0 font-bold text-[18px]">
              {loading ? "..." : stats.newUsersToday}
            </h1>
            <span className="dark:text-white text-lightBoldText-0 text-[12px]">New Users</span>
          </div>

          <div className="flex items-center justify-center h-[32px] w-[32px] dark:bg-shadyColor-0 bg-white text-primaryColors-0 rounded-md border border-boldShadyColor-0">
            <MdPeople />
          </div>
        </div>
        <div className="admin_dashboard_data">
          <div className="flex gap-1 flex-col">
            <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0 font-bold text-[18px]">
              {loading ? "..." : `${stats.avgCompletionRate}%`}
            </h1>
            <span className="dark:text-white text-lightBoldText-0 text-[12px]">Avg. Completion</span>
          </div>

          <div className="flex items-center justify-center h-[32px] w-[32px] dark:bg-shadyColor-0 bg-white text-primaryColors-0 rounded-md border border-boldShadyColor-0">
            <LuChartLine />
          </div>
        </div>
        <div className="admin_dashboard_data">
          <div className="flex gap-1 flex-col">
            <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0 font-bold text-[18px]">
              {loading ? "..." : `${stats.engagementRate}%`}
            </h1>
            <span className="dark:text-white text-lightBoldText-0 text-[12px]">Engagement</span>
          </div>

          <div className="flex items-center justify-center h-[32px] w-[32px] dark:bg-shadyColor-0 bg-white text-primaryColors-0 rounded-md border border-boldShadyColor-0">
            <HiOutlineChartBar />
          </div>
        </div>
      </div>
    </div>
  );
}
