"use client";

import React, { useEffect, useRef, useState } from "react";
import { BiChevronDown } from "react-icons/bi";
import { HiOutlineChartBar } from "react-icons/hi";
import { LuChartLine } from "react-icons/lu";
import { MdOutlineShowChart, MdPeople } from "react-icons/md";
import { useSocket } from "@/app/context/SocketContext";
import { useAuthContext } from "@/app/context/AuthContext";

type RangeOption = "Today" | "This week" | "Last week" | "Last month" | "Select a date";

interface OverviewStats {
  total_members: number;
  online_members: number;
  new_members_in_range: number;
  new_members_trend_pct: number;
  courses_completed_in_range: number;
  total_courses_completed: number;
  avg_completion: number;
}

export default function DashboardOrgAdminOverview() {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const [showBox, setShowBox] = useState<boolean>(false);
  const [date, setDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<RangeOption>("Today");

  const [stats, setStats] = useState<OverviewStats>({
    total_members: 0,
    online_members: 0,
    new_members_in_range: 0,
    new_members_trend_pct: 0,
    courses_completed_in_range: 0,
    total_courses_completed: 0,
    avg_completion: 0,
  });

  const { authStatus } = useAuthContext();
  const organizationId = authStatus?.organization?.id;

  // ✅ FIX: use the org-scoped count, not the global onlineUsers list
  const {
    organizationOnlineCount,
    refreshOrganizationOnlineUsers,
    isConnected,
    isAuthenticated,
  } = useSocket();

  useEffect(() => {
    console.log("Checking connection...", isConnected, isAuthenticated, organizationId, organizationOnlineCount);
    const removeBox = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setShowBox(false);
      }
    };
    document.addEventListener("mousedown", removeBox);
    return () => document.removeEventListener("mousedown", removeBox);
  }, []);

  useEffect(() => {
  console.log("Socket state:", {
    isConnected,
    isAuthenticated,
    organizationId,
    organizationOnlineCount,
  });
}, [isConnected, isAuthenticated, organizationId, organizationOnlineCount]);

  // ✅ Once authenticated (and org is known), proactively request the
  // org-scoped online list. Covers the case where this component mounts
  // after the socket already authenticated elsewhere in the app.
  useEffect(() => {
    if (isAuthenticated && organizationId) {
      refreshOrganizationOnlineUsers();
    }
  }, [isAuthenticated, organizationId, refreshOrganizationOnlineUsers]);

  const fetchOverviewStats = async (range: RangeOption, customDate?: string) => {
    if (!organizationId) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ range });
      if (range === "Select a date" && customDate) {
        params.set("date", customDate);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organizations/overview-stats/${organizationId}?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!res.ok) throw new Error("Failed to load organization stats");

      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to load stats");

      setStats(json.data);
    } catch (err: any) {
      setError(err.message ?? "Unable to load stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewStats(selectedValue, date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedValue, date, organizationId]);

  const selectFunc = () => setShowBox(true);

  const handleChangeDate = (e?: any) => {
    const value = e.target.value;
    setDate(value);
    setSelectedValue("Select a date");
    setShowBox(false);
  };

  const selectValue = (value: RangeOption) => {
    setShowBox(false);
    setSelectedValue(value);
  };

  const displayLabel = selectedValue === "Select a date" && date ? date : selectedValue;

  return (
    <div className="dashboard_content_box">
      <div className="flex justify-between items-center">
        <h1 className="font-semibold dark:text-textSlightDark-0 text-lightBoldText-0 text-[14px]">
          Overview
        </h1>
        <div className="relative">
          <button
            className="flex items-center gap-1 text-primaryColors-0 text-[12px]"
            onClick={selectFunc}
          >
            {displayLabel} <BiChevronDown />
          </button>
          {showBox && (
            <div
              className="dark:bg-shadyColor-0 bg-white border border-[#ccc]/20 absolute w-[min(180px,85vw)] right-0 z-10 rounded-lg shadow-lg"
              ref={boxRef}
            >
              <ul className="flex flex-col gap-2">
                <li className="admin_data_date_select" onClick={() => selectValue("Today")}>
                  Today
                </li>
                <li className="admin_data_date_select" onClick={() => selectValue("This week")}>
                  This week
                </li>
                <li className="admin_data_date_select" onClick={() => selectValue("Last week")}>
                  Last week
                </li>
                <li className="admin_data_date_select" onClick={() => selectValue("Last month")}>
                  Last Month
                </li>
                <label
                  className="admin_data_date_select relative"
                  onClick={() => dateInputRef.current?.showPicker?.()}
                >
                  Select previous date
                </label>
                <input
                  type="date"
                  ref={dateInputRef}
                  value={date}
                  onChange={handleChangeDate}
                  className="hidden absolute right-0"
                />
              </ul>
            </div>
          )}
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      <div className="grid grid-cols-2 gap-[8px] mt-2">
        {/* ✅ Active/Online members — live, org-scoped, backed by socket presence */}
        <div className="admin_dashboard_data">
          <div className="flex gap-1 flex-col">
            <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0 font-bold text-[18px]">
              {loading ? "..." : organizationOnlineCount}
            </h1>
            <span className="dark:text-white text-lightBoldText-0 text-[12px] flex items-center gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"
                }`}
              />
              Active Members
            </span>
          </div>
          <div className="flex items-center justify-center h-[32px] w-[32px] dark:bg-shadyColor-0 bg-white text-primaryColors-0 rounded-md border border-[#ccc]/20">
            <MdOutlineShowChart />
          </div>
        </div>

        {/* Total members */}
        <div className="admin_dashboard_data">
          <div className="flex gap-1 flex-col">
            <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0 font-bold text-[18px]">
              {loading ? "..." : stats.total_members}
            </h1>
            <span className="dark:text-white text-lightBoldText-0 text-[12px]">
              Total Members
            </span>
          </div>
          <div className="flex items-center justify-center h-[32px] w-[32px] dark:bg-shadyColor-0 bg-white text-primaryColors-0 rounded-md border border-[#ccc]/20">
            <MdPeople />
          </div>
        </div>

        {/* New members within selected range */}
        <div className="admin_dashboard_data">
          <div className="flex gap-1 flex-col">
            <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0 font-bold text-[18px]">
              {loading ? "..." : stats.new_members_in_range}
            </h1>
            <span className="dark:text-white text-lightBoldText-0 text-[12px]">
              New Members ({displayLabel})
            </span>
          </div>
          <div className="flex items-center justify-center h-[32px] w-[32px] dark:bg-shadyColor-0 bg-white text-primaryColors-0 rounded-md border border-[#ccc]/20">
            <LuChartLine />
          </div>
        </div>

        {/* Avg completion */}
        <div className="admin_dashboard_data">
          <div className="flex gap-1 flex-col">
            <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0 font-bold text-[18px]">
              {loading ? "..." : `${stats.avg_completion}%`}
            </h1>
            <span className="dark:text-white text-lightBoldText-0 text-[12px]">
              Avg. Completion
            </span>
          </div>
          <div className="flex items-center justify-center h-[32px] w-[32px] dark:bg-shadyColor-0 bg-white text-primaryColors-0 rounded-md border border-[#ccc]/20">
            <HiOutlineChartBar />
          </div>
        </div>
      </div>
    </div>
  );
}