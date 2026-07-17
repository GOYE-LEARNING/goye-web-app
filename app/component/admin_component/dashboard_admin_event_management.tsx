"use client";

import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaCalendar, FaMapMarkerAlt } from "react-icons/fa";
import SubHeader from "@/app/component/dashboard_subheader";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  attendees: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
}

interface Props {
  backFunction: () => void;
  orgId?: string;
}

export default function DashboardAdminEventManagement({ backFunction, orgId }: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "ongoing" | "completed">("upcoming");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    capacity: 50,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const endpoint = orgId
        ? `${API_URL}/api/organizations/${orgId}/events`
        : `${API_URL}/api/events`;

      const response = await fetch(endpoint, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (response.ok && data.data) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [orgId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? "PUT" : "POST";
      const endpoint = editingId
        ? `${API_URL}/api/organizations/${orgId}/events/${editingId}`
        : `${API_URL}/api/organizations/${orgId}/events`;

      const response = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchEvents();
        resetForm();
      }
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(
        `${API_URL}/api/organizations/${orgId}/events/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        setEvents(events.filter((e) => e.id !== id));
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      capacity: 50,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (event: Event) => {
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      capacity: event.capacity,
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "ongoing":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (showForm) {
    return (
      <div>
        <SubHeader
          header={editingId ? "Edit Event" : "Create Event"}
          backFunction={resetForm}
        />
        <form onSubmit={handleSubmit} className="dashboard_content_mainbox flex flex-col gap-4">
          <div className="form_input">
            <label className="text-textGrey-0 text-[12px]">Event Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Summer Bootcamp"
              className="border-none bg-transparent outline-none w-full text-textSlightDark-0 font-[500] text-[16px]"
            />
          </div>

          <div className="form_input">
            <label className="text-textGrey-0 text-[12px]">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Event details..."
              className="border-none bg-transparent outline-none w-full text-textSlightDark-0 font-[500] text-[14px] resize-none h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form_input">
              <label className="text-textGrey-0 text-[12px]">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="border-none bg-transparent outline-none w-full text-textSlightDark-0 font-[500] text-[16px]"
              />
            </div>
            <div className="form_input">
              <label className="text-textGrey-0 text-[12px]">Time *</label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="border-none bg-transparent outline-none w-full text-textSlightDark-0 font-[500] text-[16px]"
              />
            </div>
          </div>

          <div className="form_input">
            <label className="text-textGrey-0 text-[12px]">Location *</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Virtual or specific address"
              className="border-none bg-transparent outline-none w-full text-textSlightDark-0 font-[500] text-[16px]"
            />
          </div>

          <div className="form_input">
            <label className="text-textGrey-0 text-[12px]">Capacity</label>
            <input
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              className="border-none bg-transparent outline-none w-full text-textSlightDark-0 font-[500] text-[16px]"
            />
          </div>

          <button
            type="submit"
            className="h-[48px] bg-primaryColors-0 text-white font-semibold rounded mt-4"
          >
            {editingId ? "Update Event" : "Create Event"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <SubHeader header="Events" backFunction={backFunction} />

      <div className="dashboard_content_mainbox flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-[#ccc]/20 rounded px-3 py-2 flex-1 bg-transparent"
          />
          <button
            onClick={() => setShowForm(true)}
            className="ml-3 bg-primaryColors-0 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <FaPlus /> New Event
          </button>
        </div>

        <div className="flex gap-2">
          {["all", "upcoming", "ongoing", "completed"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-3 py-1 rounded text-sm capitalize ${
                statusFilter === status
                  ? "bg-primaryColors-0 text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-textGrey-0">No events found</div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="border border-[#ccc]/20 rounded p-4 hover:bg-gray-50 dark:hover:bg-shadyColor-0 transition"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-[15px] dark:text-textSlightDark-0 text-lightBoldText-0">
                        {event.title}
                      </h3>
                      <span className={`text-[11px] px-2 py-1 rounded capitalize ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                    <p className="text-textGrey-0 text-[13px] mb-2 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex gap-4 text-[12px] text-textGrey-0">
                      <div className="flex items-center gap-1">
                        <FaCalendar size={12} />
                        {event.date} at {event.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <FaMapMarkerAlt size={12} />
                        {event.location}
                      </div>
                      <span>{event.attendees}/{event.capacity} attendees</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(event)}
                      className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded text-blue-600"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600"
                      title="Delete"
                    >
                      <FaTrash />
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
