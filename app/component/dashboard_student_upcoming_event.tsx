"use client";

import SubHeader from "@/app/component/dashboard_subheader";
import React, { useEffect, useState } from "react";
import { CiCalendar } from "react-icons/ci";
import { FaExternalLinkAlt } from "react-icons/fa";
import { GoVideo } from "react-icons/go";
import Loader from "./loader";

interface Event {
  id: string;
  event_name: string;
  event_description: string;
  event_time: string;
  event_date: string;
  event_type: string;
  event_link: string;
  group: {
    id: string;
    group_title: string;
    createdAt: string;
  };
  createdAt: string;
}

interface Props {
  backFunc: () => void;
}

export default function UpcomingEvents({ backFunc }: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const backFunction = () => {
    backFunc();
  };

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(
        `${API_URL}/api/socials/fetch-event-by-the-student-group`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch events");
      }

      console.log("Events data:", data);
      setEvents(data.data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date TBD";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date TBD";
      
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Date TBD";
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType?.toLowerCase()) {
      case "meetings":
        return "bg-[#FF6B30]";
      case "prayer":
        return "bg-boldGreen-0";
      case "fellowship":
        return "bg-blue-600";
      default:
        return "bg-primaryColors-0";
    }
  };

  if (isLoading) {
    return (
      <div>
        <SubHeader header="Upcoming Events" backFunction={backFunction} />
        <div className="bg-[#ffffff] dark:bg-secondaryColors-0 drop-shadow-sm w-full p-[24px] my-5 flex flex-col gap-2">
          <div className="flex justify-center items-center h-64">
            <Loader
              height={40}
              width={40}
              border_width={3}
              full_border_color="transparent"
              small_border_color="#30A46F"
            />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <SubHeader header="Upcoming Events" backFunction={backFunction} />
        <div className="bg-[#ffffff] dark:bg-secondaryColors-0 drop-shadow-sm w-full p-[24px] my-5 flex flex-col gap-2">
          <div className="text-center py-8">
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <button
              onClick={fetchEvents}
              className="mt-4 px-4 py-2 bg-primaryColors-0 text-white rounded-lg hover:bg-primaryColors-0/90"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SubHeader header="Upcoming Events" backFunction={backFunction} />
      <div className="bg-[#ffffff] dark:bg-secondaryColors-0 drop-shadow-sm w-full p-[24px] my-5 flex flex-col gap-2">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <CiCalendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No Upcoming Events
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Join a group to see events from your communities
            </p>
          </div>
        ) : (
          events.map((event, i) => (
            <div key={event.id || i} className="w-full flex flex-col gap-1">
              <div className="w-full flex items-center justify-between">
                <h1 className="text-[14px] font-[600] text-textSlightDark-0 dark:text-white">
                  {event.event_name || "Untitled Event"}
                </h1>
                <span
                  className={`${getEventTypeColor(
                    event.event_type
                  )} text-[#ffffff] px-[8px] py-[2px] text-[12px] rounded-[2px] capitalize`}
                >
                  {event.event_type || "Event"}
                </span>
              </div>
              
              <p className="text-[14px] text-[#71748C] dark:text-gray-400 font-[400] line-clamp-2">
                {event.event_description || "No description available"}
              </p>
              
              <div className="flex gap-3 items-center text-[14px] font-[400] text-[#71748C] dark:text-gray-400 my-2">
                <span className="flex items-center gap-1">
                  <CiCalendar className="mb-1" /> {formatDate(event.event_date)}
                </span>
                <span className="flex items-center gap-1">
                  <GoVideo className="mb-1" /> {event.event_time || "Time TBD"}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-[35px] w-[35px] bg-lightWhite-0 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-primaryColors-0">
                    {event.group?.group_title?.charAt(0)?.toUpperCase() || "G"}
                  </span>
                </div>
                <p className="text-[#71748C] dark:text-gray-400 text-[14px] font-[400]">
                  {event.group?.group_title || "Group"}
                </p>
              </div>
              
              {event.event_link && (
                <button
                  className="h-[40px] bg-lightWhite-0 dark:bg-gray-800 text-primaryColors-0 my-3 flex items-center justify-center gap-2 text-[13px] font-[600] rounded-lg hover:bg-[#EBE5E7]/80 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    if (event.event_link) {
                      window.open(event.event_link, "_blank");
                    }
                  }}
                >
                  <p className="mt-1">Event Link</p>
                  <FaExternalLinkAlt size={12} />
                </button>
              )}

              <div className="h-[1px] w-full bg-[#EFEFF2] dark:bg-gray-700"></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}