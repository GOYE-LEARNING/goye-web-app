"use client";

import { useEffect, useState } from "react";
import Loader from "@/app/component/loader";
import DashboardSearch from "@/app/component/dashboard_search";
import { formatDistanceToNow } from "date-fns";
import {
  HiOutlineUserGroup,
  HiOutlineX,
  HiOutlineMail,
  HiOutlineGlobe,
  HiOutlineAcademicCap,
} from "react-icons/hi";
import { FaSpinner } from "react-icons/fa";
import { HiUserCircle } from "react-icons/hi2";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  userType: string;
  level: string;
  profilePic: string | null;
  country: string;
  isOnline: boolean;
  isVerified: boolean;
  isSuspended: boolean;
  lastActive: string;
  createdAt: string;
  enrollmentCount: number;
  courseCount: number;
}

interface UserDetail extends UserRow {
  phone: string;
  state: string;
  points: number;
  enrollments: {
    id: string;
    status: string;
    enrolledAt: string;
    completedAt: string | null;
    courseTitle: string;
    courseLevel: string;
  }[];
  memberships: {
    role: string;
    joinedAt: string;
    organizationName: string;
  }[];
}

const roleBadge = (role: string) => {
  switch (role) {
    case "goye_admin": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    case "org_admin": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "tutor":
    case "instructor": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    default: return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
  }
};

export default function SuperAdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [selected, setSelected] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [pendingSuspend, setPendingSuspend] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchUsers = async () => {
    if (!API_URL) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/super-admin/users`, { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.success) setUsers(data.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setSelected({ id } as UserDetail); // opens the panel with a spinner
    try {
      const res = await fetch(`${API_URL}/api/super-admin/users/${id}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.success) setSelected(data.data);
    } catch (err) {
      console.error("Error fetching user detail:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleSuspend = async () => {
    if (!selected) return;
    try {
      setPendingSuspend(true);
      const res = await fetch(`${API_URL}/api/super-admin/users/${selected.id}/suspend`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suspend: !selected.isSuspended }),
      });
      const data = await res.json();
      if (data.success) {
        setSelected({ ...selected, isSuspended: !selected.isSuspended });
        setUsers((prev) => prev.map((u) => (u.id === selected.id ? { ...u, isSuspended: !selected.isSuspended } : u)));
      } else {
        alert(data.message || "Failed to update user");
      }
    } catch (err) {
      console.error("Error suspending user:", err);
    } finally {
      setPendingSuspend(false);
    }
  };

  const roles = ["all", "student", "tutor", "org_admin", "goye_admin"];
  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole =
      filterRole === "all" ||
      u.role === filterRole ||
      (filterRole === "tutor" && (u.role === "tutor" || u.role === "instructor"));
    return matchesSearch && matchesRole;
  });

  return (
    <div className="w-full">
      <div className="flex justify-between items-center">
        <h1 className="dashboard_h1">All Users</h1>
        <span className="text-textGrey-0 text-[13px]">{users.length} total</span>
      </div>
      <p className="text-textGrey-0 text-[13px] mb-4">Every account on the platform.</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <DashboardSearch value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-3 py-2 border border-[#ccc]/20 rounded-lg bg-white dark:bg-shadyColor-0 text-textSlightDark-0 dark:text-white text-sm"
        >
          {roles.map((r) => (
            <option key={r} value={r}>{r === "all" ? "All roles" : r.replace("_", " ")}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader height={35} width={35} border_width={4} full_border_color="transparent" small_border_color="#FFA500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <HiOutlineUserGroup className="text-3xl text-textGrey-0" />
          <p className="text-textGrey-0 text-sm">No users found</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr className="border-b border-[#ccc]/10 text-left">
                <th className="py-3 px-2 text-[11px] font-[600] text-textGrey-0 uppercase">User</th>
                <th className="py-3 px-2 text-[11px] font-[600] text-textGrey-0 uppercase">Role</th>
                <th className="py-3 px-2 text-[11px] font-[600] text-textGrey-0 uppercase">Courses</th>
                <th className="py-3 px-2 text-[11px] font-[600] text-textGrey-0 uppercase">Status</th>
                <th className="py-3 px-2 text-[11px] font-[600] text-textGrey-0 uppercase">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => openDetail(u.id)}
                  className="border-b border-[#ccc]/10 hover:bg-[#ccc]/5 cursor-pointer"
                >
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {u.profilePic ? <img src={u.profilePic} alt="" className="w-full h-full object-cover" /> : <HiUserCircle className="w-6 h-6 text-gray-400" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13px] font-[600] text-textSlightDark-0 dark:text-white truncate">{u.name || "—"}</span>
                          {u.isOnline && <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />}
                        </div>
                        <span className="text-[11px] text-textGrey-0 truncate block">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`text-[11px] font-[600] px-2 py-1 rounded-full capitalize ${roleBadge(u.role)}`}>
                      {u.role === "goye_admin" ? "Platform Admin" : u.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-[12px] text-textSlightDark-0 dark:text-white">{u.enrollmentCount}</td>
                  <td className="py-3 px-2">
                    <span className={`text-[11px] font-[600] ${u.isSuspended ? "text-red-500" : "text-green-600 dark:text-green-400"}`}>
                      {u.isSuspended ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-[12px] text-textGrey-0">
                    {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail slide-in panel */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelected(null)} />
          <div className="fixed top-0 right-0 h-full w-full md:w-[420px] bg-white dark:bg-secondaryColors-0 z-50 shadow-2xl overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[20px] font-[700] text-textSlightDark-0 dark:text-white">User Details</h2>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-shadyColor-0 rounded-lg">
                <HiOutlineX className="w-5 h-5 text-textGrey-0" />
              </button>
            </div>

            {detailLoading || !selected.name ? (
              <div className="flex justify-center py-16">
                <Loader height={30} width={30} border_width={4} full_border_color="transparent" small_border_color="#FFA500" />
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center gap-2 mb-5">
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                    {selected.profilePic ? <img src={selected.profilePic} alt="" className="w-full h-full object-cover" /> : <HiUserCircle className="w-12 h-12 text-gray-400" />}
                  </div>
                  <h3 className="text-[18px] font-[600] text-textSlightDark-0 dark:text-white">{selected.name}</h3>
                  <span className={`text-[11px] font-[600] px-2 py-1 rounded-full capitalize ${roleBadge(selected.role)}`}>
                    {selected.role === "goye_admin" ? "Platform Admin" : selected.role.replace("_", " ")}
                  </span>
                </div>

                <div className="space-y-2 text-[13px] mb-5">
                  <div className="flex items-center gap-2 text-textGrey-0"><HiOutlineMail /> <span className="text-textSlightDark-0 dark:text-white break-all">{selected.email}</span></div>
                  {selected.phone && <div className="flex items-center gap-2 text-textGrey-0">📞 <span className="text-textSlightDark-0 dark:text-white">{selected.phone}</span></div>}
                  <div className="flex items-center gap-2 text-textGrey-0"><HiOutlineGlobe /> <span className="text-textSlightDark-0 dark:text-white">{selected.country || "—"}{selected.state ? `, ${selected.state}` : ""}</span></div>
                  <div className="flex items-center gap-2 text-textGrey-0"><HiOutlineAcademicCap /> <span className="text-textSlightDark-0 dark:text-white capitalize">{selected.level || "—"} · {selected.points} XP</span></div>
                  <div className="flex items-center gap-2 text-textGrey-0">🕑 <span className="text-textSlightDark-0 dark:text-white">Joined {formatDistanceToNow(new Date(selected.createdAt), { addSuffix: true })}</span></div>
                </div>

                <button
                  onClick={toggleSuspend}
                  disabled={pendingSuspend}
                  className={`w-full py-2 rounded-lg text-[13px] font-[600] mb-5 transition-colors disabled:opacity-50 ${
                    selected.isSuspended
                      ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {pendingSuspend ? <FaSpinner className="animate-spin inline" /> : selected.isSuspended ? "Reactivate User" : "Suspend User"}
                </button>

                <h4 className="text-[13px] font-[700] text-textSlightDark-0 dark:text-white mb-2">
                  Enrollments ({selected.enrollments.length})
                </h4>
                {selected.enrollments.length === 0 ? (
                  <p className="text-[12px] text-textGrey-0 mb-4">No enrollments yet</p>
                ) : (
                  <div className="flex flex-col gap-2 mb-4">
                    {selected.enrollments.map((e) => (
                      <div key={e.id} className="bg-shadyColor-0/60 dark:bg-shadyColor-0 rounded-lg p-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[12px] font-[600] text-textSlightDark-0 dark:text-white line-clamp-1">{e.courseTitle}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${e.status === "COMPLETED" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}>
                            {e.status === "COMPLETED" ? "Completed" : "In progress"}
                          </span>
                        </div>
                        <span className="text-[11px] text-textGrey-0">Enrolled {formatDistanceToNow(new Date(e.enrolledAt), { addSuffix: true })}</span>
                      </div>
                    ))}
                  </div>
                )}

                {selected.memberships.length > 0 && (
                  <>
                    <h4 className="text-[13px] font-[700] text-textSlightDark-0 dark:text-white mb-2">Organizations</h4>
                    <div className="flex flex-col gap-2">
                      {selected.memberships.map((m, i) => (
                        <div key={i} className="bg-shadyColor-0/60 dark:bg-shadyColor-0 rounded-lg p-2 flex justify-between items-center">
                          <span className="text-[12px] text-textSlightDark-0 dark:text-white">{m.organizationName}</span>
                          <span className="text-[11px] text-textGrey-0 capitalize">{m.role?.replace("_", " ")}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
