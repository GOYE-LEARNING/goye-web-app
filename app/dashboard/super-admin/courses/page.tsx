"use client";

import { useEffect, useState } from "react";
import Loader from "@/app/component/loader";
import DashboardSearch from "@/app/component/dashboard_search";
import { formatDistanceToNow } from "date-fns";
import { HiOutlineBookOpen, HiOutlineTrash } from "react-icons/hi";
import { FaSpinner, FaAngleDoubleUp } from "react-icons/fa";
import { LuUser } from "react-icons/lu";

interface Course {
  id: string;
  title: string;
  level: string;
  image: string | null;
  organizationName: string | null;
  creator: string;
  creatorEmail: string | null;
  enrollmentCount: number;
  moduleCount: number;
  createdAt: string;
}

export default function SuperAdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState("");
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchCourses = async () => {
    if (!API_URL) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/super-admin/courses`, { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.success) setCourses(data.data || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (course: Course) => {
    if (!confirm(`Delete "${course.title}"? This permanently removes the course and all its enrollments. This cannot be undone.`)) return;
    try {
      setPendingId(course.id);
      const res = await fetch(`${API_URL}/api/super-admin/courses/${course.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setCourses((prev) => prev.filter((c) => c.id !== course.id));
      } else {
        alert(data.message || "Failed to delete course");
      }
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setPendingId("");
    }
  };

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.creator.toLowerCase().includes(search.toLowerCase()) ||
      (c.organizationName || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="w-full">
      <div className="flex justify-between items-center">
        <h1 className="dashboard_h1">All Courses</h1>
        <span className="text-textGrey-0 text-[13px]">{courses.length} total</span>
      </div>
      <p className="text-textGrey-0 text-[13px] mb-4">Every course across the platform.</p>

      <div className="mb-4">
        <DashboardSearch
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, creator, or organization..."
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader height={35} width={35} border_width={4} full_border_color="transparent" small_border_color="#FFA500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <HiOutlineBookOpen className="text-3xl text-textGrey-0" />
          <p className="text-textGrey-0 text-sm">No courses found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white dark:bg-shadyColor-0 rounded-xl border border-[#ccc]/10 p-3 flex items-start gap-3">
              <img
                src={c.image || "/images/overview.png"}
                alt={c.title}
                className="h-[70px] w-[100px] object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-[14px] font-[700] text-textSlightDark-0 dark:text-white line-clamp-1">{c.title}</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[12px] text-textGrey-0">
                  <span className="flex items-center gap-1"><LuUser /> {c.creator}</span>
                  <span className="flex items-center gap-1 text-boldGreen-0 capitalize"><FaAngleDoubleUp /> {c.level || "—"}</span>
                  {c.organizationName && <span className="truncate">🏢 {c.organizationName}</span>}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[11px] text-textGrey-0">
                  <span>{c.enrollmentCount} enrolled</span>
                  <span>{c.moduleCount} modules</span>
                  <span>{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(c)}
                disabled={pendingId === c.id}
                title="Delete course"
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors flex-shrink-0 disabled:opacity-50"
              >
                {pendingId === c.id ? <FaSpinner className="animate-spin text-red-500" /> : <HiOutlineTrash className="w-5 h-5 text-red-500" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
