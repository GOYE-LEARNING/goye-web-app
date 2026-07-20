"use client";

import { useEffect, useState } from "react";
import Loader from "@/app/component/loader";
import {
  HiOutlineOfficeBuilding,
  HiOutlineUserGroup,
  HiOutlineBookOpen,
  HiOutlineClipboardCheck,
  HiOutlineExclamationCircle,
} from "react-icons/hi";

interface OverviewData {
  totalOrganizations: number;
  suspendedOrganizations: number;
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalOrganizationMembers: number;
  usersByRole: { role: string; count: number }[];
  signupsLast30Days: { date: string; count: number }[];
}

const ROLE_LABELS: Record<string, string> = {
  student: "Students",
  instructor: "Tutors",
  tutor: "Tutors",
  org_admin: "Organization Admins",
  goye_admin: "Platform Admins",
  invited_user: "Invited Members",
  administrator: "Administrators",
};

function StatTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-shadyColor-0 rounded-xl p-4 flex items-center gap-3 border border-[#ccc]/10">
      <div className="h-11 w-11 rounded-lg bg-primaryColors-0/10 flex items-center justify-center text-primaryColors-0 text-xl flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-textGrey-0 text-[12px]">{label}</p>
        <p className="text-textSlightDark-0 dark:text-white text-[22px] font-[700] leading-tight">
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

// A minimal single-series line chart: 2px line, rounded joins, a light area
// wash under the line, and a hover crosshair + tooltip. One series needs no
// legend — the section title already says what's plotted.
function SignupsTrendChart({ data }: { data: { date: string; count: number }[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const width = 640;
  const height = 180;
  const paddingLeft = 8;
  const paddingRight = 8;
  const paddingTop = 12;
  const paddingBottom = 24;

  const maxCount = Math.max(1, ...data.map((d) => d.count));
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const points = data.map((d, i) => {
    const x = paddingLeft + (i / Math.max(1, data.length - 1)) * plotWidth;
    const y = paddingTop + plotHeight - (d.count / maxCount) * plotHeight;
    return { x, y, ...d };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? 0} ${
    paddingTop + plotHeight
  } L ${points[0]?.x ?? 0} ${paddingTop + plotHeight} Z`;

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-[180px]"
        onMouseLeave={() => setHoverIndex(null)}
      >
        {/* baseline (recessive, hairline) */}
        <line
          x1={paddingLeft}
          y1={paddingTop + plotHeight}
          x2={width - paddingRight}
          y2={paddingTop + plotHeight}
          stroke="currentColor"
          className="text-[#ccc]/20"
          strokeWidth={1}
        />
        <path d={areaPath} fill="#FFA500" fillOpacity={0.1} stroke="none" />
        <path
          d={linePath}
          fill="none"
          stroke="#FFA500"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {hovered && (
          <>
            <line
              x1={hovered.x}
              y1={paddingTop}
              x2={hovered.x}
              y2={paddingTop + plotHeight}
              stroke="currentColor"
              className="text-[#ccc]/30"
              strokeWidth={1}
            />
            <circle
              cx={hovered.x}
              cy={hovered.y}
              r={4}
              fill="#FFA500"
              stroke="white"
              strokeWidth={2}
            />
          </>
        )}
        {/* invisible hover targets, one per day, wider than the mark itself */}
        {points.map((p, i) => (
          <rect
            key={i}
            x={p.x - plotWidth / data.length / 2}
            y={paddingTop}
            width={plotWidth / data.length}
            height={plotHeight}
            fill="transparent"
            onMouseEnter={() => setHoverIndex(i)}
          />
        ))}
      </svg>
      {hovered && (
        <div
          className="absolute -translate-x-1/2 bg-secondaryColors-0 text-white text-[11px] rounded px-2 py-1 pointer-events-none whitespace-nowrap"
          style={{
            left: `${(hovered.x / width) * 100}%`,
            top: 0,
          }}
        >
          {new Date(hovered.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}: {hovered.count} signup{hovered.count === 1 ? "" : "s"}
        </div>
      )}
      <div className="flex justify-between text-[11px] text-textGrey-0 mt-1">
        <span>{data[0] ? new Date(data[0].date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : ""}</span>
        <span>{data[data.length - 1] ? new Date(data[data.length - 1].date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : ""}</span>
      </div>
    </div>
  );
}

// Horizontal bar list for a magnitude comparison across a handful of
// categories — one hue (the categorical accent), sorted descending,
// direct value labels at the bar end.
function RoleBreakdownBars({ data }: { data: { role: string; count: number }[] }) {
  const sorted = [...data].sort((a, b) => b.count - a.count);
  const maxCount = Math.max(1, ...sorted.map((d) => d.count));

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((d) => (
        <div key={d.role} className="flex items-center gap-3">
          <span className="text-[12px] text-textSlightDark-0 dark:text-white w-[150px] flex-shrink-0 truncate">
            {ROLE_LABELS[d.role] || d.role}
          </span>
          <div className="flex-1 h-[20px] bg-[#ccc]/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primaryColors-0 rounded-full"
              style={{ width: `${(d.count / maxCount) * 100}%` }}
            />
          </div>
          <span className="text-[12px] font-[600] text-textSlightDark-0 dark:text-white w-[40px] text-right flex-shrink-0">
            {d.count}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function SuperAdminOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOverview = async () => {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_URL) {
        setError("API URL not configured");
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/super-admin/overview`, {
          method: "GET",
          credentials: "include",
        });
        const result = await res.json();

        if (!res.ok || !result.success) {
          setError(result.message || "Failed to load platform overview");
          setIsLoading(false);
          return;
        }

        setData(result.data);
      } catch (err) {
        console.error("Error fetching super admin overview:", err);
        setError("We couldn't reach the server. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader height={35} width={35} border_width={4} full_border_color="transparent" small_border_color="#FFA500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <HiOutlineExclamationCircle className="text-3xl text-textGrey-0" />
        <p className="text-textGrey-0 text-sm">{error || "No data available"}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="dashboard_h1">Platform Overview</h1>
      <p className="text-textGrey-0 text-[13px] mb-4">
        A live look across every organization and account on GOYE.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <StatTile
          label="Organizations"
          value={data.totalOrganizations}
          icon={<HiOutlineOfficeBuilding />}
        />
        <StatTile
          label="Total Users"
          value={data.totalUsers}
          icon={<HiOutlineUserGroup />}
        />
        <StatTile
          label="Courses"
          value={data.totalCourses}
          icon={<HiOutlineBookOpen />}
        />
        <StatTile
          label="Enrollments"
          value={data.totalEnrollments}
          icon={<HiOutlineClipboardCheck />}
        />
        <StatTile
          label="Organization Members"
          value={data.totalOrganizationMembers}
          icon={<HiOutlineUserGroup />}
        />
        <StatTile
          label="Suspended Organizations"
          value={data.suspendedOrganizations}
          icon={<HiOutlineExclamationCircle />}
        />
      </div>

      <div className="bg-white dark:bg-shadyColor-0 rounded-xl p-4 border border-[#ccc]/10 mb-6">
        <h2 className="text-textSlightDark-0 dark:text-white font-[600] text-[14px] mb-3">
          Signups — last 30 days
        </h2>
        <SignupsTrendChart data={data.signupsLast30Days} />
      </div>

      <div className="bg-white dark:bg-shadyColor-0 rounded-xl p-4 border border-[#ccc]/10">
        <h2 className="text-textSlightDark-0 dark:text-white font-[600] text-[14px] mb-4">
          Users by Role
        </h2>
        <RoleBreakdownBars data={data.usersByRole} />
      </div>
    </div>
  );
}
