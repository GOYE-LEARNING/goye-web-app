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
  HiOutlineX,
} from "react-icons/hi";
import { FaSpinner } from "react-icons/fa";
import { format } from "date-fns";

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location?: string;
  type: string;
  capacity: number;
  attendees: number;
  status: "upcoming" | "ongoing" | "past" | "cancelled";
  createdAt: string;
}

interface ManageEventsProps {
  onBack: () => void;
}

interface EventFormState {
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: string;
  type: string;
}

const EMPTY_FORM: EventFormState = {
  name: "",
  description: "",
  date: "",
  time: "",
  location: "",
  capacity: "100",
  type: "webinar",
};

export default function ManageEvents({ onBack }: ManageEventsProps) {
  const params = useParams<{ org_name: string }>();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<EventFormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const organizationId = params.org_name;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    if (!API_URL) {
      console.error("NEXT_PUBLIC_API_URL is not defined");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/organizations/events/${organizationId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setEvents(data.data || []);
      }
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

  const openCreateModal = () => {
    setEditingEvent(null);
    setFormData(EMPTY_FORM);
    setFormError("");
    setShowFormModal(true);
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      description: event.description || "",
      date: event.date?.slice(0, 10) || "",
      time: event.time || "",
      location: event.location || "",
      capacity: String(event.capacity ?? 100),
      type: event.type || "webinar",
    });
    setFormError("");
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingEvent(null);
    setFormData(EMPTY_FORM);
    setFormError("");
  };

  const handleSubmitForm = async () => {
    if (!formData.name.trim() || !formData.date || !formData.time) {
      setFormError("Name, date, and time are required");
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    try {
      const isEdit = !!editingEvent;
      const url = isEdit
        ? `${API_URL}/api/organizations/events/${organizationId}/${editingEvent!.id}`
        : `${API_URL}/api/organizations/events/${organizationId}`;

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          date: formData.date,
          time: formData.time,
          location: formData.location,
          capacity: parseInt(formData.capacity, 10) || 100,
          type: formData.type,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || "Failed to save event");
        return;
      }

      closeFormModal();
      fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
      setFormError("An error occurred while saving the event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (event: Event) => {
    if (!confirm(`Delete "${event.name}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(
        `${API_URL}/api/organizations/events/${organizationId}/${event.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success) {
        setEvents((prev) => prev.filter((e) => e.id !== event.id));
      } else {
        console.error("Failed to delete event:", data.message);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || event.type === filterType;
    return matchesSearch && matchesType;
  });

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
            onClick={openCreateModal}
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
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <HiOutlineCalendar className="w-16 h-16 text-gray-300 dark:text-gray-600" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">No events found</p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create your first event
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredEvents.map((event) => (
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
                          {event.date ? format(new Date(event.date), 'MMM d, yyyy') : "—"} at {event.time}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <HiOutlineLocationMarker className="w-4 h-4" />
                            {event.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <HiOutlineUserGroup className="w-4 h-4" />
                          {event.attendees ?? 0} attendees
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                    <button
                      onClick={() => openEditModal(event)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <HiOutlinePencilAlt className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(event)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <HiOutlineTrash className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold dark:text-white">
                {editingEvent ? "Edit Event" : "Create Event"}
              </h2>
              <button
                onClick={closeFormModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <HiOutlineX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Optional"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="webinar">Webinar</option>
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                    <option value="social">Social</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={closeFormModal}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitForm}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting && <FaSpinner className="animate-spin w-4 h-4" />}
                {editingEvent ? "Save Changes" : "Create Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
