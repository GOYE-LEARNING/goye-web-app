// components/DashboardAdminOrgBreakdown.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface BreakdownData {
  total_members: number;
  students: number;
  instructors: number;
  admins: number;
  online_members: number;
  pending_invitations: number;
  breakdown: {
    by_role: {
      student: number;
      instructor: number;
      admin: number;
      org_admin: number;
    };
    by_user_type: {
      invited_member: number;
      individual: number;
      organization_owner: number;
    };
  };
  activity: {
    total_enrollments: number;
    completed_courses: number;
    in_progress_courses: number;
    completion_rate: number;
  };
}

export default function DashboardAdminOrgBreakdown() {
  const params = useParams<{ org_name: string }>();
  const [data, setData] = useState<BreakdownData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBreakdown = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        
        // First get the organization ID from the org_name
        const orgRes = await fetch(
          `${API_URL}/api/organizations/fetch-specific-organization/${params.org_name}`,
          {
            credentials: "include",
          }
        );
        
        if (!orgRes.ok) throw new Error("Failed to fetch organization");
        const orgData = await orgRes.json();
        const organizationId = orgData.data?.id;
        
        if (!organizationId) throw new Error("Organization ID not found");

        // Fetch user breakdown
        const res = await fetch(
          `${API_URL}/api/organizations/user-breakdown/${organizationId}`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch user breakdown");
        const result = await res.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || "Failed to fetch data");
        }
      } catch (err) {
        console.error("Error fetching breakdown:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (params.org_name) {
      fetchBreakdown();
    }
  }, [params.org_name]);

  if (loading) {
    return (
      <div className="dashboard_content_box">
        <h1 className="font-semibold dark:text-textSlightDark-0 text-lightBoldText-0 text-[14px]">
          Users Breakdown
        </h1>
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard_content_box">
        <h1 className="font-semibold dark:text-textSlightDark-0 text-lightBoldText-0 text-[14px]">
          Users Breakdown
        </h1>
        <p className="text-red-500 text-center py-4">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="dashboard_content_box">
        <h1 className="font-semibold dark:text-textSlightDark-0 text-lightBoldText-0 text-[14px]">
          Users Breakdown
        </h1>
        <p className="text-gray-500 text-center py-4">No data available</p>
      </div>
    );
  }

  return (
    <div className="dashboard_content_box">
      <div className="flex justify-between items-center">
        <h1 className="font-semibold dark:text-textSlightDark-0 text-lightBoldText-0 text-[14px]">
          Users Breakdown
        </h1>
      
      </div>
      <div className="flex flex-col gap-3 mt-2">
        <div className="admin_dashboard_data2">
          <div className="flex flex-col gap-1 items-center justify-center md:w-[206.3333282470703px] w-[100.66666412353516px]">
            <h1 className="font-bold dark:text-textSlightDark-0 text-lightBoldText-0 text-[18px]">
              {data.total_members}
            </h1>
            <span className="text-[#71748C] text-[12px]">All Members</span>
            {data.pending_invitations > 0 && (
              <span className="text-[10px] text-orange-500">
                +{data.pending_invitations} pending
              </span>
            )}
          </div>
          
          <div className="flex flex-col gap-1 items-center justify-center md:w-[206.3333282470703px] w-[100.66666412353516px]">
            <h1 className="font-bold dark:text-textSlightDark-0 text-lightBoldText-0 text-[18px]">
              {data.students}
            </h1>
            <span className="text-[#71748C] text-[12px]">Students</span>
            {data.activity.in_progress_courses > 0 && (
              <span className="text-[10px] text-blue-500">
                {data.activity.in_progress_courses} in progress
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1 items-center justify-center md:w-[206.3333282470703px] w-[100.66666412353516px]">
            <h1 className="font-bold dark:text-textSlightDark-0 text-lightBoldText-0 text-[18px]">
              {data.instructors}
            </h1>
                  <span className="text-[#71748C] text-[12px]">Instructors</span>

          </div>
        </div>
      </div>
    </div>
  );
}