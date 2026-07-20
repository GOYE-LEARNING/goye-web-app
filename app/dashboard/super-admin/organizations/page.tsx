"use client";

import { useEffect, useState } from "react";
import Loader from "@/app/component/loader";
import DashboardSearch from "@/app/component/dashboard_search";
import { formatDistanceToNow } from "date-fns";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { FaSpinner } from "react-icons/fa";

interface Organization {
  id: string;
  name: string;
  type: string;
  email: string;
  country: string;
  isVerified: boolean;
  isSuspended: boolean;
  isOnline: boolean;
  createdAt: string;
  memberCount: number;
  courseCount: number;
}

export default function SuperAdminOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "suspended">("all");
  const [pendingId, setPendingId] = useState<string>("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchOrganizations = async () => {
    if (!API_URL) {
      console.error("NEXT_PUBLIC_API_URL is not defined");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/super-admin/organizations`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        console.log("Failed to fetch organizations");
        return;
      }

      setOrganizations(data.data || []);
    } catch (error) {
      console.error("Error fetching organizations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleToggleSuspend = async (org: Organization) => {
    const confirmed = confirm(
      org.isSuspended
        ? `Reactivate "${org.name}"? Its members will regain access.`
        : `Suspend "${org.name}"? Its members will lose access until reactivated.`,
    );
    if (!confirmed) return;

    try {
      setPendingId(org.id);
      const res = await fetch(
        `${API_URL}/api/super-admin/organizations/${org.id}/suspend`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ suspend: !org.isSuspended }),
        },
      );
      const data = await res.json();

      if (data.success) {
        setOrganizations((prev) =>
          prev.map((o) => (o.id === org.id ? { ...o, isSuspended: !o.isSuspended } : o)),
        );
      } else {
        alert(data.message || "Failed to update organization status");
      }
    } catch (error) {
      console.error("Error toggling organization suspension:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setPendingId("");
    }
  };

  const filtered = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "suspended" && org.isSuspended) ||
      (filterStatus === "active" && !org.isSuspended);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full">
      <div className="flex justify-between items-center">
        <h1 className="dashboard_h1">Organizations</h1>
        <span className="text-textGrey-0 text-[13px]">
          {organizations.length} total
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 my-4">
        <div className="flex-1">
          <DashboardSearch
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search organizations by name or email..."
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-3 py-2 border border-[#ccc]/20 rounded-lg bg-white dark:bg-shadyColor-0 text-textSlightDark-0 dark:text-white text-sm"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader height={35} width={35} border_width={4} full_border_color="transparent" small_border_color="#FFA500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <HiOutlineOfficeBuilding className="text-3xl text-textGrey-0" />
          <p className="text-textGrey-0 text-sm">No organizations found</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="border-b border-[#ccc]/10 text-left">
                <th className="py-3 px-2 text-[11px] font-[600] text-textGrey-0 uppercase">Organization</th>
                <th className="py-3 px-2 text-[11px] font-[600] text-textGrey-0 uppercase">Type</th>
                <th className="py-3 px-2 text-[11px] font-[600] text-textGrey-0 uppercase">Members</th>
                <th className="py-3 px-2 text-[11px] font-[600] text-textGrey-0 uppercase">Courses</th>
                <th className="py-3 px-2 text-[11px] font-[600] text-textGrey-0 uppercase">Joined</th>
                <th className="py-3 px-2 text-[11px] font-[600] text-textGrey-0 uppercase">Status</th>
                <th className="py-3 px-2 text-[11px] font-[600] text-textGrey-0 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((org) => (
                <tr key={org.id} className="border-b border-[#ccc]/10 hover:bg-[#ccc]/5">
                  <td className="py-3 px-2">
                    <p className="text-textSlightDark-0 dark:text-white text-[13px] font-[600]">{org.name}</p>
                    <p className="text-textGrey-0 text-[11px]">{org.email}</p>
                  </td>
                  <td className="py-3 px-2 text-[12px] text-textSlightDark-0 dark:text-white capitalize">
                    {org.type.toLowerCase()}
                  </td>
                  <td className="py-3 px-2 text-[12px] text-textSlightDark-0 dark:text-white">{org.memberCount}</td>
                  <td className="py-3 px-2 text-[12px] text-textSlightDark-0 dark:text-white">{org.courseCount}</td>
                  <td className="py-3 px-2 text-[12px] text-textGrey-0">
                    {formatDistanceToNow(new Date(org.createdAt), { addSuffix: true })}
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`text-[11px] font-[600] px-2 py-1 rounded-full ${
                        org.isSuspended
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      }`}
                    >
                      {org.isSuspended ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button
                      onClick={() => handleToggleSuspend(org)}
                      disabled={pendingId === org.id}
                      className={`text-[12px] font-[600] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                        org.isSuspended
                          ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {pendingId === org.id ? (
                        <FaSpinner className="animate-spin inline" />
                      ) : org.isSuspended ? (
                        "Reactivate"
                      ) : (
                        "Suspend"
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
