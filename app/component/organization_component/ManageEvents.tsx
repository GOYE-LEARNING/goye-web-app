// components/org-admin/ManageEvents.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  HiOutlineCalendar, 
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineChevronDown,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiOutlinePlus,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineX
} from "react-icons/hi";
import { FaSpinner } from "react-icons/fa";
import { formatDistanceToNow, format } from "date-fns";

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location?: string;
  type: string;
  attendees: number;
  status: "upcoming" | "ongoing" | "past" | "cancelled";
  createdAt: string;
  groupId?: string;
  groupName?: string;
}

interface ManageEventsProps {
  onBack: () => void;
}

export default function ManageEvents({ onBack }: ManageEventsProps) {
  const params = useParams<{ org_name: string }>();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API endpoint
      // const res = await fetch(`${API_URL}/api/organizations/events/${params.org_name}`);
      // const data = await res.json();
      // setEvents(data.data || []);
      setEvents([]);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'ongoing': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'past': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <HiOutlineChevronDown className="w-5 h-5 rotate-90 text-gray-600 dark:text-gray-300" />
            </button>
            <h1 className="text-xl font-semibold dark:text-white">Manage Events</h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({events.length} events)
            </span>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <HiOutlinePlus className="w-5 h-5" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <HiOutlineFilter className="w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="webinar">Webinar</option>
              <option value="workshop">Workshop</option>
              <option value="seminar">Seminar</option>
              <option value="social">Social</option>
            </select>
          </div>
        </div>
      </div>

      {/* Event List */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <FaSpinner className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <HiOutlineCalendar className="w-16 h-16 text-gray-300 dark:text-gray-600" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">No events found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create your first event
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <HiOutlineCalendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold dark:text-white">{event.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {event.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <HiOutlineClock className="w-4 h-4" />
                          {format(new Date(event.date), 'MMM d, yyyy')} at {event.time}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <HiOutlineLocationMarker className="w-4 h-4" />
                            {event.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <HiOutlineUserGroup className="w-4 h-4" />
                          {event.attendees} attendees
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <HiOutlinePencilAlt className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                      <HiOutlineTrash className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}