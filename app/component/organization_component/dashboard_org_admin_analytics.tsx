"use client";

import { useEffect, useState } from "react";
import { useOrganizationContext } from "./organanization_context";
import Loader from "../loader";
import {
  ACCENT,
  BarChart,
  ChartCard,
  DonutChart,
  HorizontalBars,
  LineChart,
  ProgressRing,
  StatTile,
  hueAt,
} from "../charts";
import {
  HiOutlineUserGroup,
  HiOutlineBookOpen,
  HiOutlineClipboardCheck,
  HiOutlineExclamationCircle,
} from "react-icons/hi";

interface AnalyticsData {
  summary: {
    totalMembers: number;
    onlineMembers: number;
    totalCourses: number;
    publishedCourses: number;
    totalEnrollments: number;
    completedEnrollments: number;
    completionRate: number;
  };
  memberGrowthLast6Months: { month: string; count: number }[];
  enrollmentsLast30Days: { date: string; count: number }[];
  completionsLast30Days: { date: string; count: number }[];
  membersByRole: { label: string; value: number }[];
  enrollmentsByStatus: { label: string; value: number }[];
  membersByJoinMethod: { label: string; value: number }[];
  topCoursesByEnrollment: { courseId: string; title: string; enrollments: number }[];
}

export default function DashboardOrgAdminAnalytics() {
  const { organizationId } = useOrganizationContext();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    if (!organizationId) return;
    let cancelled = false;

    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/organizations/analytics/${organizationId}`,
          { method: "GET", credentials: "include" },
        );
        const json = await res.json();
        if (cancelled) return;

        if (!res.ok || !json.success) {
          setError(json.message || "Failed to load analytics");
          return;
        }
        setData(json.data);
        setError("");
      } catch (err) {
        if (!cancelled) setError("We couldn't reach the server. Please try again.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchAnalytics();
    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader
          height={35}
          width={35}
          border_width={4}
          full_border_color="transparent"
          small_border_color="#FFA500"
        />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <HiOutlineExclamationCircle className="text-3xl text-textGrey-0" />
        <p className="text-textGrey-0 text-sm">{error || "No analytics available yet"}</p>
      </div>
    );
  }

  const { summary } = data;
  const activeEnrollments = summary.totalEnrollments - summary.completedEnrollments;

  return (
    <div className="w-full">
      <h2 className="text-textSlightDark-0 dark:text-white font-[600] text-[18px]">
        Analytics
      </h2>
      <p className="text-textGrey-0 text-[13px] mb-4">
        How your members are engaging with your courses.
      </p>

      {/* Headline numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatTile
          label="Members"
          value={summary.totalMembers}
          icon={<HiOutlineUserGroup />}
          accent={hueAt(0, dark)}
          sublabel={`${summary.onlineMembers} online now`}
        />
        <StatTile
          label="Courses"
          value={summary.totalCourses}
          icon={<HiOutlineBookOpen />}
          accent={hueAt(1, dark)}
          sublabel={`${summary.publishedCourses} published`}
        />
        <StatTile
          label="Enrollments"
          value={summary.totalEnrollments}
          icon={<HiOutlineClipboardCheck />}
          accent={hueAt(2, dark)}
          sublabel={`${activeEnrollments} still active`}
        />
        <StatTile
          label="Completion rate"
          value={`${summary.completionRate}%`}
          icon={<HiOutlineClipboardCheck />}
          accent={hueAt(3, dark)}
          sublabel={`${summary.completedEnrollments} finished`}
        />
      </div>

      {/* Line — the two series that answer "is activity growing?" */}
      <div className="mb-6">
        <ChartCard
          title="Enrollments vs completions"
          subtitle="Last 30 days"
        >
          <LineChart
            series={[
              {
                name: "Enrollments",
                color: ACCENT,
                data: data.enrollmentsLast30Days,
              },
              {
                name: "Completions",
                color: hueAt(1, dark),
                data: data.completionsLast30Days,
              },
            ]}
          />
        </ChartCard>
      </div>

      {/* Pie/donut composition */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Members by role" subtitle="Share of your organization">
          <DonutChart data={data.membersByRole} dark={dark} centerLabel="members" />
        </ChartCard>
        <ChartCard title="Enrollment status" subtitle="Where members are in their courses">
          <DonutChart
            data={data.enrollmentsByStatus}
            dark={dark}
            centerLabel="enrollments"
          />
        </ChartCard>
      </div>

      {/* Bars */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <ChartCard title="New members" subtitle="Last 6 months">
          <BarChart
            data={data.memberGrowthLast6Months.map((m) => ({
              label: new Date(`${m.month}-01`).toLocaleDateString(undefined, {
                month: "short",
              }),
              value: m.count,
            }))}
            dark={dark}
            singleHue={ACCENT}
          />
        </ChartCard>
        <ChartCard title="Top courses" subtitle="By enrollment">
          <HorizontalBars
            data={data.topCoursesByEnrollment.map((c) => ({
              label: c.title,
              value: c.enrollments,
            }))}
            dark={dark}
            emptyMessage="No enrollments in your courses yet"
          />
        </ChartCard>
      </div>

      {/* Completion + join method */}
      <div className="grid md:grid-cols-2 gap-6">
        <ChartCard title="Course completion" subtitle="Across all enrollments">
          <ProgressRing
            value={summary.completedEnrollments}
            total={summary.totalEnrollments}
            caption={`${summary.completedEnrollments.toLocaleString()} of ${summary.totalEnrollments.toLocaleString()} enrollments`}
          />
        </ChartCard>
        <ChartCard title="How members joined" subtitle="Invite vs other routes">
          <DonutChart
            data={data.membersByJoinMethod}
            dark={dark}
            centerLabel="members"
          />
        </ChartCard>
      </div>
    </div>
  );
}
