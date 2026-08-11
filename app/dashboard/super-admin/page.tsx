"use client";

import { useEffect, useState } from "react";
import Loader from "@/app/component/loader";
import {
  HiOutlineOfficeBuilding,
  HiOutlineUserGroup,
  HiOutlineBookOpen,
  HiOutlineClipboardCheck,
  HiOutlineExclamationCircle,
  HiOutlineAcademicCap,
} from "react-icons/hi";

interface OverviewData {
  totalOrganizations: number;
  suspendedOrganizations: number;
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  completedEnrollments: number;
  totalOrganizationMembers: number;
  usersByRole: { role: string; count: number }[];
  organizationsByType: { type: string; count: number }[];
  signupsLast30Days: { date: string; count: number }[];
  enrollmentsLast30Days: { date: string; count: number }[];
  organizationGrowthLast6Months: { month: string; count: number }[];
  topCoursesByEnrollment: { courseId: string; title: string; enrollments: number }[];
}

const ROLE_LABELS: Record<string, string> = {
  student: "Students",
  instructor: "Tutors",
  tutor: "Tutors",
  org_admin: "Org Admins",
  goye_admin: "Platform Admins",
  invited_user: "Invited Members",
  administrator: "Administrators",
};

// Validated CVD-safe categorical hues (light / dark), assigned in fixed order.
const CATEGORICAL = [
  { light: "#2a78d6", dark: "#3987e5" }, // blue
  { light: "#1baf7a", dark: "#199e70" }, // aqua
  { light: "#eda100", dark: "#c98500" }, // yellow
  { light: "#008300", dark: "#008300" }, // green
  { light: "#4a3aa7", dark: "#9085e9" }, // violet
  { light: "#e34948", dark: "#e66767" }, // red
  { light: "#e87ba4", dark: "#d55181" }, // magenta
  { light: "#eb6834", dark: "#d95926" }, // orange
];

const ACCENT = "#FFA500"; // brand orange — single-series trend

function StatTile({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="bg-white dark:bg-shadyColor-0 rounded-xl p-4 flex items-center gap-3 border border-[#ccc]/10">
      <div
        className="h-11 w-11 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
        style={{ backgroundColor: `${accent || ACCENT}1a`, color: accent || ACCENT }}
      >
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

// Multi-series line chart with area wash (single series only) + hover
// crosshair + shared tooltip across all series. A legend renders above the
// chart whenever there's more than one series.
function MultiSeriesLineChart({
  series,
}: {
  series: { name: string; color: string; data: { date: string; count: number }[] }[];
}) {
  const [hover, setHover] = useState<number | null>(null);
  const width = 640;
  const height = 200;
  const padL = 8, padR = 8, padT = 14, padB = 26;
  const dates = series[0]?.data ?? [];
  const max = Math.max(1, ...series.flatMap((s) => s.data.map((d) => d.count)));
  const pw = width - padL - padR;
  const ph = height - padT - padB;

  const seriesPts = series.map((s) => ({
    ...s,
    pts: s.data.map((d, i) => ({
      x: padL + (i / Math.max(1, s.data.length - 1)) * pw,
      y: padT + ph - (d.count / max) * ph,
      ...d,
    })),
  }));

  return (
    <div className="relative">
      {series.length > 1 && (
        <div className="flex items-center gap-4 mb-2">
          {series.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5">
              <span className="h-[8px] w-[8px] rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-[11px] text-textGrey-0">{s.name}</span>
            </div>
          ))}
        </div>
      )}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[200px]" onMouseLeave={() => setHover(null)}>
        <defs>
          {series.length === 1 && (
            <linearGradient id="signupFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={series[0].color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={series[0].color} stopOpacity="0.02" />
            </linearGradient>
          )}
        </defs>
        <line x1={padL} y1={padT + ph} x2={width - padR} y2={padT + ph} className="text-[#ccc]/20" stroke="currentColor" strokeWidth={1} />
        {seriesPts.map((s) => {
          const line = s.pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
          const area = `${line} L ${s.pts[s.pts.length - 1]?.x ?? 0} ${padT + ph} L ${s.pts[0]?.x ?? 0} ${padT + ph} Z`;
          return (
            <g key={s.name}>
              {series.length === 1 && <path d={area} fill="url(#signupFill)" />}
              <path d={line} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              {hover !== null && s.pts[hover] && (
                <circle cx={s.pts[hover].x} cy={s.pts[hover].y} r={4} fill={s.color} stroke="white" strokeWidth={2} />
              )}
            </g>
          );
        })}
        {hover !== null && seriesPts[0]?.pts[hover] && (
          <line x1={seriesPts[0].pts[hover].x} y1={padT} x2={seriesPts[0].pts[hover].x} y2={padT + ph} className="text-[#ccc]/30" stroke="currentColor" strokeWidth={1} />
        )}
        {dates.map((_, i) => (
          <rect key={i} x={padL + (i / Math.max(1, dates.length)) * pw} y={padT} width={pw / Math.max(1, dates.length)} height={ph} fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
      </svg>
      {hover !== null && dates[hover] && (
        <div
          className="absolute -translate-x-1/2 bg-secondaryColors-0 text-white text-[11px] rounded px-2 py-1.5 pointer-events-none whitespace-nowrap shadow-lg flex flex-col gap-0.5"
          style={{ left: `${(seriesPts[0].pts[hover].x / width) * 100}%`, top: 0 }}
        >
          <span className="font-[600]">{new Date(dates[hover].date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
          {series.map((s) => (
            <span key={s.name}>{s.name}: {s.data[hover]?.count ?? 0}</span>
          ))}
        </div>
      )}
      <div className="flex justify-between text-[11px] text-textGrey-0 mt-1">
        <span>{dates[0] ? new Date(dates[0].date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : ""}</span>
        <span>{dates[dates.length - 1] ? new Date(dates[dates.length - 1].date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : ""}</span>
      </div>
    </div>
  );
}

// Horizontal bar list for top-N rankings with long labels (course titles).
function TopCoursesBarChart({ data }: { data: { title: string; enrollments: number }[] }) {
  if (data.length === 0) {
    return <p className="text-textGrey-0 text-sm text-center py-8">No enrollments yet</p>;
  }
  const max = Math.max(1, ...data.map((d) => d.enrollments));
  return (
    <div className="flex flex-col gap-3">
      {data.map((d, i) => {
        const hue = CATEGORICAL[i % CATEGORICAL.length];
        return (
          <div key={d.title + i} className="flex items-center gap-3">
            <span className="text-[12px] text-textSlightDark-0 dark:text-white w-[140px] flex-shrink-0 truncate" title={d.title}>
              {d.title}
            </span>
            <div className="flex-1 h-[20px] bg-[#ccc]/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(d.enrollments / max) * 100}%`, backgroundColor: hue.light }}
              />
            </div>
            <span className="text-[12px] font-[600] text-textSlightDark-0 dark:text-white w-[30px] text-right flex-shrink-0">
              {d.enrollments}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Vertical bar chart for monthly org-growth — month labels instead of a
// generic categorical label.
function MonthlyGrowthBarChart({ data }: { data: { month: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="flex items-end gap-3 h-[180px] w-full">
      {data.map((d) => {
        const pct = (d.count / max) * 100;
        const label = new Date(`${d.month}-01`).toLocaleDateString(undefined, { month: "short" });
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
            <span className="text-[12px] font-[700] text-textSlightDark-0 dark:text-white mb-1">{d.count}</span>
            <div className="w-full flex justify-center h-full items-end">
              <div
                className="w-full max-w-[36px] rounded-t-[4px] transition-all duration-300"
                style={{ height: `${Math.max(pct, 2)}%`, backgroundColor: ACCENT }}
              />
            </div>
            <span className="text-[10px] text-textGrey-0 mt-2">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

// Vertical bar chart — categorical magnitude comparison, one hue per category
// in fixed order, rounded data-end caps, value labels above each bar, hover.
function VerticalBarChart({
  data,
  dark,
}: {
  data: { label: string; value: number }[];
  dark: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  if (data.length === 0) {
    return <p className="text-textGrey-0 text-sm text-center py-8">No data yet</p>;
  }
  const max = Math.max(1, ...data.map((d) => d.value));
  const barW = 100 / data.length;

  return (
    <div className="flex items-end gap-2 h-[180px] w-full">
      {data.map((d, i) => {
        const hue = CATEGORICAL[i % CATEGORICAL.length];
        const color = dark ? hue.dark : hue.light;
        const pct = (d.value / max) * 100;
        return (
          <div
            key={d.label}
            className="flex-1 flex flex-col items-center justify-end h-full min-w-0"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <span className="text-[12px] font-[700] text-textSlightDark-0 dark:text-white mb-1">
              {hover === i ? d.value : d.value}
            </span>
            <div className="w-full flex justify-center h-full items-end">
              <div
                className="w-full max-w-[42px] rounded-t-[4px] transition-all duration-300"
                style={{
                  height: `${Math.max(pct, 2)}%`,
                  backgroundColor: color,
                  opacity: hover === null || hover === i ? 1 : 0.55,
                }}
              />
            </div>
            <span className="text-[10px] text-textGrey-0 mt-2 text-center truncate w-full capitalize">
              {d.label.toLowerCase()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Horizontal bar list — good when labels are long (roles).
function RoleBreakdownBars({ data, dark }: { data: { role: string; count: number }[]; dark: boolean }) {
  const sorted = [...data].sort((a, b) => b.count - a.count);
  const max = Math.max(1, ...sorted.map((d) => d.count));
  return (
    <div className="flex flex-col gap-3">
      {sorted.map((d, i) => {
        const hue = CATEGORICAL[i % CATEGORICAL.length];
        return (
          <div key={d.role} className="flex items-center gap-3">
            <span className="text-[12px] text-textSlightDark-0 dark:text-white w-[130px] flex-shrink-0 truncate">
              {ROLE_LABELS[d.role] || d.role}
            </span>
            <div className="flex-1 h-[20px] bg-[#ccc]/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(d.count / max) * 100}%`, backgroundColor: dark ? hue.dark : hue.light }}
              />
            </div>
            <span className="text-[12px] font-[600] text-textSlightDark-0 dark:text-white w-[40px] text-right flex-shrink-0">
              {d.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Completion ring — one figure (completion rate) with a radial gauge.
function CompletionRing({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2">
      <div className="relative w-[130px] h-[130px]">
        <svg viewBox="0 0 130 130" className="w-full h-full -rotate-90">
          <circle cx="65" cy="65" r={r} fill="none" stroke="currentColor" className="text-[#ccc]/15" strokeWidth={12} />
          <circle
            cx="65" cy="65" r={r} fill="none" stroke="#30A46F" strokeWidth={12} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[28px] font-[700] text-textSlightDark-0 dark:text-white">{pct}%</span>
          <span className="text-[11px] text-textGrey-0">completed</span>
        </div>
      </div>
      <p className="text-[12px] text-textGrey-0 text-center">
        {completed.toLocaleString()} of {total.toLocaleString()} enrollments
      </p>
    </div>
  );
}

export default function SuperAdminOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

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
        <StatTile label="Organizations" value={data.totalOrganizations} icon={<HiOutlineOfficeBuilding />} accent="#2a78d6" />
        <StatTile label="Total Users" value={data.totalUsers} icon={<HiOutlineUserGroup />} accent="#1baf7a" />
        <StatTile label="Courses" value={data.totalCourses} icon={<HiOutlineBookOpen />} accent="#eda100" />
        <StatTile label="Enrollments" value={data.totalEnrollments} icon={<HiOutlineClipboardCheck />} accent="#4a3aa7" />
        <StatTile label="Org Members" value={data.totalOrganizationMembers} icon={<HiOutlineAcademicCap />} accent="#e87ba4" />
        <StatTile label="Suspended Orgs" value={data.suspendedOrganizations} icon={<HiOutlineExclamationCircle />} accent="#e34948" />
      </div>

      <div className="bg-white dark:bg-shadyColor-0 rounded-xl p-4 border border-[#ccc]/10 mb-6">
        <h2 className="text-textSlightDark-0 dark:text-white font-[600] text-[14px] mb-3">
          Signups vs Enrollments — last 30 days
        </h2>
        <MultiSeriesLineChart
          series={[
            { name: "Signups", color: ACCENT, data: data.signupsLast30Days },
            { name: "Enrollments", color: CATEGORICAL[0].light, data: data.enrollmentsLast30Days },
          ]}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-shadyColor-0 rounded-xl p-4 border border-[#ccc]/10">
          <h2 className="text-textSlightDark-0 dark:text-white font-[600] text-[14px] mb-4">Users by Role</h2>
          <RoleBreakdownBars data={data.usersByRole} dark={dark} />
        </div>
        <div className="bg-white dark:bg-shadyColor-0 rounded-xl p-4 border border-[#ccc]/10">
          <h2 className="text-textSlightDark-0 dark:text-white font-[600] text-[14px] mb-4">Organizations by Type</h2>
          <VerticalBarChart
            data={data.organizationsByType.map((o) => ({ label: o.type, value: o.count }))}
            dark={dark}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-shadyColor-0 rounded-xl p-4 border border-[#ccc]/10">
          <h2 className="text-textSlightDark-0 dark:text-white font-[600] text-[14px] mb-4">Top Courses by Enrollment</h2>
          <TopCoursesBarChart data={data.topCoursesByEnrollment} />
        </div>
        <div className="bg-white dark:bg-shadyColor-0 rounded-xl p-4 border border-[#ccc]/10">
          <h2 className="text-textSlightDark-0 dark:text-white font-[600] text-[14px] mb-4">New Organizations — last 6 months</h2>
          <MonthlyGrowthBarChart data={data.organizationGrowthLast6Months} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-shadyColor-0 rounded-xl p-4 border border-[#ccc]/10">
          <h2 className="text-textSlightDark-0 dark:text-white font-[600] text-[14px] mb-2">Course Completion</h2>
          <CompletionRing completed={data.completedEnrollments} total={data.totalEnrollments} />
        </div>
        <div className="bg-white dark:bg-shadyColor-0 rounded-xl p-4 border border-[#ccc]/10 flex flex-col justify-center gap-4">
          <div>
            <p className="text-textGrey-0 text-[12px]">Active enrollments</p>
            <p className="text-textSlightDark-0 dark:text-white text-[24px] font-[700]">
              {(data.totalEnrollments - data.completedEnrollments).toLocaleString()}
            </p>
          </div>
          <div className="h-[1px] bg-[#ccc]/10" />
          <div>
            <p className="text-textGrey-0 text-[12px]">Avg enrollments / course</p>
            <p className="text-textSlightDark-0 dark:text-white text-[24px] font-[700]">
              {data.totalCourses > 0 ? (data.totalEnrollments / data.totalCourses).toFixed(1) : "0"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
