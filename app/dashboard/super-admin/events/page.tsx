"use client";

import { useEffect, useState } from "react";
import Loader from "@/app/component/loader";
import DashboardSearch from "@/app/component/dashboard_search";
import { format } from "date-fns";
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiOutlineTrash,
} from "react-icons/hi";
import { FaSpinner } from "react-icons/fa";

interface EventRow {
  id: string;
  name: string;
  description: string | null;
  date: string;
  time: string;
  location: string | null;
  type: string;
  status: string;
  capacity: number;
  organizationName: string;
  attendees: number;
  createdAt: string;
}

const statusColor = (s: string) => {
  switch (s) {
    case "upcoming": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "ongoing": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "past": return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    case "cancelled": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default: return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
  }
};

export default function SuperAdminEvents() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState("");
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchEvents = async () => {
    if (!API_URL) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/super-admin/events`, { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.success) setEvents(data.data || []);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (event: EventRow) => {
    if (!confirm(`Delete "${event.name}"? This cannot be undone.`)) return;
    try {
      setPendingId(event.id);
      const res = await fetch(`${API_URL}/api/super-admin/events/${event.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setEvents((prev) => prev.filter((e) => e.id !== event.id));
      } else {
        alert(data.message || "Failed to delete event");
      }
    } catch (err) {
      console.error("Error deleting event:", err);
    } finally {
      setPendingId("");
    }
  };

  const filtered = events.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.organizationName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="w-full">
      <div className="flex justify-between items-center">
        <h1 className="dashboard_h1">All Events</h1>
        <span className="text-textGrey-0 text-[13px]">{events.length} total</span>
      </div>
      <p className="text-textGrey-0 text-[13px] mb-4">Events across every organization.</p>

      <div className="mb-4">
        <DashboardSearch value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by event name or organization..." />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader height={35} width={35} border_width={4} full_border_color="transparent" small_border_color="#FFA500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <HiOutlineCalendar className="text-3xl text-textGrey-0" />
          <p className="text-textGrey-0 text-sm">No events found</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((e) => (
            <div key={e.id} className="bg-white dark:bg-shadyColor-0 rounded-xl border border-[#ccc]/10 p-4 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-11 h-11 bg-primaryColors-0/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <HiOutlineCalendar className="w-6 h-6 text-primaryColors-0" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-[600] text-textSlightDark-0 dark:text-white line-clamp-1">{e.name}</h3>
                  <p className="text-[12px] text-textGrey-0 line-clamp-1">{e.description}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-textGrey-0">
                    <span className="flex items-center gap-1"><HiOutlineClock /> {e.date ? format(new Date(e.date), "MMM d, yyyy") : "—"} · {e.time}</span>
                    {e.location && <span className="flex items-center gap-1"><HiOutlineLocationMarker /> {e.location}</span>}
                    <span className="flex items-center gap-1"><HiOutlineUserGroup /> {e.attendees}/{e.capacity}</span>
                    <span className="truncate">🏢 {e.organizationName}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`px-2 py-1 text-[11px] font-[600] rounded-full ${statusColor(e.status)}`}>{e.status}</span>
                <button
                  onClick={() => handleDelete(e)}
                  disabled={pendingId === e.id}
                  title="Delete event"
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                >
                  {pendingId === e.id ? <FaSpinner className="animate-spin text-red-500" /> : <HiOutlineTrash className="w-5 h-5 text-red-500" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
