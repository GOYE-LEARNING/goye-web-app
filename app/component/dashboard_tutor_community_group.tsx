"use client";

import { RiGroupLine } from "react-icons/ri";
import SubHeader from "./dashboard_subheader";
import { FaExternalLinkAlt } from "react-icons/fa";
import { CiCalendar } from "react-icons/ci";
import { GoVideo } from "react-icons/go";
import { useEffect, useRef, useState } from "react";
import { MdEdit, MdMoreVert } from "react-icons/md";
import { IoMdTrash } from "react-icons/io";
import DashboardTutorCreateEvent from "./dashboard_tutor_create_events";
import { formatDistanceToNow } from "date-fns";
import Loader from "./loader";
import { useRouter } from "next/navigation";

interface Props {
  backToMainPage: () => void;
  groupId: string;
  onDeleteGroup: (id?: any) => void;
  openEditGroup: (id: string) => void;
}

interface User {
  first_name: string;
  last_name: string;
  user_pic: string;
}

interface Event {
  id?: string;
  event_name?: string;
  event_description?: string;
  event_time?: string;
  event_date?: string;
  event_type?: string;
  event_link?: string;
}

interface GroupCount {
  member: number;
  event: number;
}

interface GroupData {
  id: string;
  group_title: string;
  group_short_description: string;
  group_description: string;
  group_image: string;
  createdBy: User;
  createdAt: string;
  _count: GroupCount;
  event: Event[];
  updatedAt?: string;
}

export default function TutorCommunityGroup({
  backToMainPage,
  groupId,
  onDeleteGroup,
  openEditGroup,
}: Props) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [createEvent, setCreateEvent] = useState<boolean>(false);
  const [openEventIndex, setOpenEventIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [groupDetails, setGroupDetails] = useState<GroupData | null>(null);
  const [eventId, setEventId] = useState<string>("");
  const [groupIds, setGroupId] = useState<string>("");
  const [eventDetails, setEventDetails] = useState<Event[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const eventRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const groupDropdownRef = useRef<HTMLDivElement | null>(null);
  const [shouldRenderEventModal, setShouldRenderEventModal] = useState(false);

  const backFunc = () => {
    backToMainPage();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Invalid Date";
    }
  };

  const formatNormalDate = (dateString: string) => {
    if (!dateString) return <span>No Date</span>;

    try {
      let date: Date;

      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        date = new Date(dateString);
      } else if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(dateString)) {
        const separators = /[/\-]/;
        const parts = dateString.split(separators);
        const [month, day, year] = parts.map(Number);
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(dateString);
      }

      if (isNaN(date.getTime())) {
        return <span>Invalid Date</span>;
      }

      const formattedDate = `${date.toLocaleDateString("en-US", {
        weekday: "short",
      })}, ${date.getDate()}, ${date.toLocaleDateString("en-US", {
        month: "short",
      })}`;

      return <span>{formattedDate}</span>;
    } catch (error) {
      return <span>Invalid Date</span>;
    }
  };

  // Show and hide event dropdown using index
  const dropDownEvent = (index: number) => {
    setOpenEventIndex((prev) => (prev === index ? null : index));
  };

  useEffect(() => {
    const fetchGroupDetails = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/socials/get-group/${groupId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        const data = await res.json();
        
        // Set group details with safe defaults
        if (data.data) {
          setGroupDetails({
            id: data.data.id || "",
            group_title: data.data.group_title || "",
            group_short_description: data.data.group_short_description || "",
            group_description: data.data.group_description || "",
            group_image: data.data.group_image || "",
            createdBy: data.data.createdBy || { first_name: "", last_name: "", user_pic: "" },
            createdAt: data.data.createdAt || "",
            _count: {
              member: data.data._count?.member || 0,
              event: data.data._count?.event || 0
            },
            event: data.data.event || [],
            updatedAt: data.data.updatedAt || ""
          });
          setEventDetails(data.data.event || []);
        }
        
        setIsLoading(false);
        
        if (!res.ok) {
          console.log("An error occured while fetching group details");
          return;
        }
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };
    fetchGroupDetails();

    function removeDropdown(e: MouseEvent) {
      // Check if click is outside group dropdown
      if (
        groupDropdownRef.current &&
        !groupDropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }

      // Check if click is outside event dropdown
      if (openEventIndex !== null) {
        const currentEventDropdown = eventRefs.current[openEventIndex];
        if (
          currentEventDropdown &&
          !currentEventDropdown.contains(e.target as Node)
        ) {
          setOpenEventIndex(null);
        }
      }
    }

    document.addEventListener("mousedown", removeDropdown);
    return () => document.removeEventListener("mousedown", removeDropdown);
  }, [groupId]);

  // FIXED: Simple function to open event modal
  const handleOpenEvent = () => {
    setShouldRenderEventModal(true);
  };

  // FIXED: Handle animation end properly
  const handleAnimationEnd = () => {
    if (!createEvent) {
      setShouldRenderEventModal(false);
    }
  };

  const iconEdit = () => {
    setShowDropdown(true);
  };

  const deleteGroupById = async (groupId: string) => {
    try {
      // Show confirmation
      if (!window.confirm("Are you sure you want to delete this group?")) {
        return;
      }

      // Update parent state immediately
      if (onDeleteGroup) {
        onDeleteGroup();
      }

      // Then make API call
      const res = await fetch(
        `${API_URL}/api/socials/delete-group/${groupId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      await res.json();

      if (!res.ok) {
        console.log("An error occured while deleting group");
        // Optionally show error message
        return;
      }

      // Navigate back after successful deletion
      backFunc();
    } catch (error) {
      console.error(error);
    }
  };

  const updateGroupEvent = (eventId: string) => {
    console.log("Opening edit mode for event:", eventId);
    setEventId(eventId);
    setCreateEvent(true);
    setOpenEventIndex(null); // Close the dropdown
    handleOpenEvent(); // ✅ Call this to render the modal
  };

  const handleEditEvent = (updatedEvent?: Event) => {
    console.log("Event updated:", updatedEvent);
    if (updatedEvent) {
      setEventDetails((prev) =>
        prev.map((event) =>
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );
    }
  };

  const deleteEvent = async (eventId: string) => {
    console.log("Deleting event:", eventId);

    if (!eventId) {
      return;
    }

    // Update local state immediately
    setEventDetails((prev) => prev.filter((e) => e.id !== eventId));
    
    setGroupDetails((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        _count: {
          ...prev._count,
          event: Math.max(0, prev._count.event - 1),
        },
      };
    });

    setOpenEventIndex(null);

    try {
      const res = await fetch(
        `${API_URL}/api/socials/delete-event/${eventId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      await res.json();

      if (!res.ok) {
        console.log("An error occured while deleting event");
        return;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addEvent = (event?: Event) => {
    console.log("Adding new event:", event);

    if (event) {
      setEventDetails((prev: Event[]) => [event, ...prev]);

      setGroupDetails((prev) => {
        if (!prev) {
          return prev;
        }

        const newCount = prev._count.event + 1;
        console.log("Updating event count to:", newCount);

        return {
          ...prev,
          _count: {
            ...prev._count,
            event: newCount,
          },
        };
      });
    }

    setCreateEvent(false);
  };

    const router = useRouter()


  return (
    <div>
      <div>
        {!isLoading ? (
          <div>
            <div className="flex justify-between items-center">
              <div>
                <SubHeader
                  header={groupDetails?.group_title as string}
                  backFunction={backFunc}
                />
                <p className="flex items-center gap-5 text-[#71748C] text-[14px]">
                  <span className="flex items-center gap-2">
                    <RiGroupLine />
                    {groupDetails?._count?.member || 0} members
                  </span>
                  <span className="flex items-center gap-2">
                    <CiCalendar />
                    {formatDate(groupDetails?.createdAt as any)}
                  </span>
                </p>
                <div className="flex items-center gap-3 my-3">
                  <span className="h-[35px] w-[35px] bg-plainColors-0 rounded-full overflow-hidden">
                    {groupDetails?.createdBy?.user_pic ? (
                      <img
                        src={groupDetails.createdBy.user_pic}
                        className="h-full w-full object-cover"
                        alt="Group creator"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">
                          {groupDetails?.createdBy?.first_name?.[0] || "G"}
                        </span>
                      </div>
                    )}
                  </span>
                  <p className="text-[#71748C] text-[14px] font-[400]">
                    {groupDetails?.createdBy?.last_name || ""}{" "}
                    {groupDetails?.createdBy?.first_name || ""}
                  </p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={iconEdit}
                  className="text-[#41415A] text-[16px]"
                >
                  <MdMoreVert />
                </button>
                {showDropdown && (
                  <div
                    ref={groupDropdownRef}
                    onClick={() => {
                      setGroupId(groupDetails?.id as string);
                    }}
                    className="bg-secondaryColors-0/50 backdrop-blur-md drop-shadow-2xl w-[152px] text-[14px] absolute right-0 z-10 border border-[#E3E3E8]/10"
                  >
                    <span
                      className="flex items-center gap-[12px] px-[16px] py-[8px] hover:bg-secondaryColors-0 cursor-pointer"
                      onClick={() => {
                        openEditGroup(groupDetails?.id as string);
                      }}
                    >
                      <MdEdit /> Edit
                    </span>
                    <div className="dashboard_hr"></div>
                    <span
                      className="flex items-center gap-[12px] px-[16px] py-[8px] text-[#DA0E29] hover:bg-secondaryColors-0 cursor-pointer"
                      onClick={() => deleteGroupById(groupId)}
                    >
                      <IoMdTrash /> Delete
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-secondaryColors-0/50 backdrop-blur-md md:p-[24px] drop-shadow-sm">
              <div className="w-full h-[220px] relative">
                {groupDetails?.group_image ? (
                  <img
                    src={groupDetails.group_image}
                    alt="Group banner"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>
              <p className="text-[#71748C] text-[14px] font-[400] my-4">
                {groupDetails?.group_description}
              </p>

              <button
                className="h-[40px] w-full text-[#ffffff] bg-primaryColors-0 flex items-center justify-center gap-2"
                onClick={() => {
                  setEventId(""); // Clear eventId for create mode
                  setCreateEvent(true);
                  handleOpenEvent(); // ✅ Call this to render the modal
                }}
              >
                + Create Event
              </button>

              <section className="grid grid-cols-3 my-5 bg-secondaryColors-0 p-[16px]">
                <div className="flex justify-center items-center flex-col">
                  <span className="text-textSlightDark-0 text-[18px] font-bold">
                    0
                  </span>
                  <p className="text-[#71748C] text-[14px] font-[400]">
                    Posts the Week
                  </p>
                </div>
                <div className="flex justify-center items-center flex-col">
                  <span className="text-textSlightDark-0 text-[18px] font-bold">
                    {groupDetails?._count?.member || 0}
                  </span>
                  <p className="text-[#71748C] text-[14px] font-[400]">
                    Members
                  </p>
                </div>
                <div className="flex justify-center items-center flex-col">
                  <span className="text-textSlightDark-0 text-[18px] font-bold">
                    {groupDetails?._count?.event || 0}
                  </span>
                  <p className="text-[#71748C] text-[14px] font-[400]">
                    Upcoming Events
                  </p>
                </div>
              </section>
            </div>
            <div className="w-full flex flex-col gap-1 my-5 dashboard_content_mainbox">
              <h1 className="text-textSlightDark-0 font-bold text-[16px]">
                Upcoming Events
              </h1>
              {!isLoading ? (
                <div>
                  <div>
                    <div>
                      <div>
                        {(groupDetails?._count?.event || 0) === 0 ? (
                          <div>
                            <div className="flex justify-center items-center flex-col gap-1 md:mt-10 mt-[2rem]">
                              <p className="text-textGrey-0">
                                Nothing found here please create an event
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {eventDetails.map((e, i) => {
                              return (
                                <div key={i} className="my-5">
                                  <div className="w-full flex items-center justify-between">
                                    <h1 className="text-[14px] font-[600] text-textSlightDark-0">
                                      {e?.event_name || "Untitled Event"}
                                    </h1>
                                    <span
                                      className={`${
                                        e.event_type == "Meetings"
                                          ? "bg-[#FF6B30]"
                                          : e.event_type == "Prayer"
                                          ? "bg-boldGreen-0"
                                          : "bg-blue-600"
                                      } text-[#ffffff] px-[4px] text-[12px] rounded-[2px]`}
                                    >
                                      {e?.event_type || "Event"}
                                    </span>
                                  </div>
                                  <p className="text-[14px] text-[#71748C] font-[400]">
                                    {e?.event_description || "No description"}
                                  </p>
                                  <div className="flex gap-3 items-center text-[14px] font-[400] text-[#71748C] my-2">
                                    <span className="flex items-center gap-1">
                                      <CiCalendar className="mb-1" />{" "}
                                      {
                                        formatNormalDate(
                                          e?.event_date as any
                                        ) as any
                                      }
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <GoVideo className="mb-1" />{" "}
                                      {e?.event_time || "No time"}
                                    </span>
                                  </div>
                                  <div className="w-full flex justify-between items-center gap-3">
                                    <button
                                      className="h-[40px] bg-[#EBE5E7] text-primaryColors-0 my-3 flex items-center justify-center gap-2 text-[13px] font-[600] w-full"
                                      onClick={() => {
                                        if (e.event_link) {
                                          window.location.href = e.event_link;
                                        }
                                      }}
                                      disabled={!e.event_link}
                                    >
                                      <p className="mt-1">Event Link </p>
                                      <FaExternalLinkAlt />
                                    </button>
                                    <div className="relative">
                                      <button
                                        className="h-[40px] w-[40px] bg-[#ffffff] border border-[#D9D9D9] flex justify-center items-center"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          dropDownEvent(i);
                                        }}
                                      >
                                        <MdMoreVert color="#41415A" />
                                      </button>

                                      {openEventIndex === i && (
                                        <div
                                          ref={(el) => {
                                            eventRefs.current[i] = el;
                                          }}
                                          className="bg-white drop-shadow-2xl w-[152px] text-[14px] absolute right-0 z-10 border border-[#E3E3E8]"
                                        >
                                          <span
                                            className="flex items-center gap-[12px] px-[16px] py-[8px] hover:bg-gray-100 cursor-pointer"
                                            onClick={() =>
                                              updateGroupEvent(e.id as string)
                                            }
                                          >
                                            <MdEdit /> Edit
                                          </span>
                                          <div className="dashboard_hr"></div>
                                          <span
                                            className="flex items-center gap-[12px] px-[16px] py-[8px] text-[#DA0E29] hover:bg-gray-100 cursor-pointer"
                                            onClick={() =>
                                              deleteEvent(e.id as string)
                                            }
                                          >
                                            <IoMdTrash /> Delete
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="h-[1px] w-full bg-[#EFEFF2]"></div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <Loader
                    full_border_color="transparent"
                    small_border_color="#49151B"
                    height={30}
                    width={30}
                    border_width={3}
                  />
                </div>
              )}
            </div>

            {/* FIXED: Modal rendering with proper animation handling */}
            {shouldRenderEventModal && (
              <>
                {/* Overlay */}
                <div
                  className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
                    createEvent
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none"
                  }`}
                  onClick={() => setCreateEvent(false)}
                  onTransitionEnd={handleAnimationEnd}
                />

                {/* Sidebar */}
                <div
                  className={`fixed top-0 right-0 h-full bg-white w-[390px] transform transition-transform duration-300 ease-in-out z-50 ${
                    createEvent ? "translate-x-0" : "translate-x-full"
                  }`}
                  onTransitionEnd={handleAnimationEnd}
                >
                  <DashboardTutorCreateEvent
                    eventId={eventId}
                    onEditEvent={handleEditEvent}
                    onAddEvent={addEvent}
                    groupId={groupId}
                    cancel={() => setCreateEvent(false)}
                  />
                </div>
              </>
            )}
          </div>
        ) : (
          <div>
            <Loader
              full_border_color="transparent"
              small_border_color="#49151B"
              height={30}
              width={30}
              border_width={3}
            />
          </div>
        )}
      </div>
    </div>
  );
}