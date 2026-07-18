import Image from "next/image";
import { useEffect, useState } from "react";
import { IoBookOutline } from "react-icons/io5";
import { useParams, useRouter } from "next/navigation";
import { FaArrowRight } from "react-icons/fa6";
import { MdEvent } from "react-icons/md";

interface Props {
  openEvent: () => void;
}

interface Event {
  id: string;
  event_name: string;
  event_date: string;
  event_time: string;
  event_type?: string;
  // Add other event properties as needed
}

interface ApiResponse {
  message: string;
  data: Event[];
  count: number;
}

export default function DashboardStudentEvent({ openEvent }: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams<{ org_name: string }>();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const type = localStorage.getItem("type");
  const fetchEvent = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `${API_URL}/api/socials/fetch-event-by-the-student-group`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      // Check if response is OK
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data: ApiResponse = await res.json();

      // Set the events array, not the whole response
      setEvents(data.data || []);
    } catch (error: any) {
      console.error("Error fetching events:", error);
      setError(error.message);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const router = useRouter();
  return (
    <div className="dashboard_content_box">
      <div className="dashboard_content_header">
        <h1>Upcoming Events</h1>
        {events.length == 0 ? (
          <div></div>
        ) : (
          <div>
            <span onClick={openEvent} className="cursor-pointer">
              View All
            </span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryColors-0"></div>
          <p className="ml-2">Loading events...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="text-center py-8 text-red-500">
          <p>Error loading events: {error}</p>
          <button
            onClick={fetchEvent}
            className="mt-2 px-4 py-2 bg-primaryColors-0 text-white rounded"
          >
            Retry
          </button>
        </div>
      )}

      {/* No Events State */}
      {!isLoading && !error && events.length === 0 && (
        <div className="flex justify-center items-center flex-col gap-1 py-8">
          <span>
            <MdEvent size={60} color="rgb(219 204 205)" />
          </span>
          <h1 className="text-textSlightDark-0 font-semibold text-[18px] mt-4">
            No upcoming events.
          </h1>
          <button
            onClick={() =>
              router.push(
                type == "invited_user"
                  ? `/dashboard/${params.org_name}/community`
                  : "/dashboard/student/community",
              )
            }
            className="game_button flex items-center gap-2"
          >
            Catch up with an event
            <FaArrowRight />
          </button>
        </div>
      )}

      {/* Events List */}
      {!isLoading && !error && events.length > 0 && (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="dashboard_content_subbox">
              <div className="flex justify-between items-start w-full">
                <div className="flex justify-start items-start gap-[12px]">
                  <span className="pt-1">
                    <IoBookOutline />
                  </span>
                  <div className="flex justify-start items-start flex-col gap-[12px]">
                    <h1 className="text-[14px] font-[600] text-[#41415A] dark:text-white">
                      {event.event_name || "Untitled Event"}
                    </h1>
                    <p className="text-[12px]">
                      {formatDate(event.event_date)}
                      <span className="text-[8px] mx-2">|</span>
                      {event.event_time || "TBD"}
                    </p>
                  </div>
                </div>
                <span className="text-[#ffffff] py-[0.1rem] px-2 bg-[#FF6B30] text-center rounded-[2px]">
                  {event.event_type || "Event"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
