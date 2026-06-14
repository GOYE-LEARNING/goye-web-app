"use client";

import { RiGroupLine } from "react-icons/ri";
import SubHeader from "./dashboard_subheader";
import { FaExternalLinkAlt, FaRegBell, FaRegClock } from "react-icons/fa";
import { CiCalendar, CiLock } from "react-icons/ci";
import { GoVideo } from "react-icons/go";
import { useEffect, useRef, useState } from "react";
import { MdEdit, MdMoreVert, MdLogout, MdOutlineChat } from "react-icons/md";
import { IoMdTrash } from "react-icons/io";
import DashboardTutorCreateEvent from "./dashboard_tutor_create_events";
import { formatDistanceToNow } from "date-fns";
import { IoMdCalendar } from "react-icons/io";
import Loader from "./loader";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useBuiltInTab } from "../context/BuiltinTabContext";

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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [groupDetails, setGroupDetails] = useState<GroupData | null>(null);
  const [eventId, setEventId] = useState<string>("");
  const [eventDetails, setEventDetails] = useState<Event[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const eventRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const groupDropdownRef = useRef<HTMLDivElement | null>(null);
  const [shouldRenderEventModal, setShouldRenderEventModal] = useState(false);

  // Use the built-in tab hook
  const { openInBuiltTab } = useBuiltInTab();
  const router = useRouter();

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

  const formatDate2 = (dateString: string) => {
    if (!dateString) return "No Date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-us", {
      day: "numeric",
      month: "short",
      weekday: "short",
    });
  };

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
        
        if (!res.ok) {
          console.log("An error occurred while fetching group details");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGroupDetails();

    function removeDropdown(e: MouseEvent) {
      if (
        groupDropdownRef.current &&
        !groupDropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }

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

  const handleOpenEvent = () => {
    setShouldRenderEventModal(true);
  };

  const handleAnimationEnd = () => {
    if (!createEvent) {
      setShouldRenderEventModal(false);
    }
  };

  const iconEdit = () => {
    setShowDropdown(true);
  };

  const deleteGroupById = async (groupId: string) => {
    if (!window.confirm("Are you sure you want to delete this group?")) {
      return;
    }

    setIsDeleting(true);
    try {
      if (onDeleteGroup) {
        onDeleteGroup();
      }

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
        console.log("An error occurred while deleting group");
        return;
      }

      backFunc();
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const updateGroupEvent = (eventId: string) => {
    setEventId(eventId);
    setCreateEvent(true);
    setOpenEventIndex(null);
    handleOpenEvent();
  };

  const handleEditEvent = (updatedEvent?: Event) => {
    if (updatedEvent) {
      setEventDetails((prev) =>
        prev.map((event) =>
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!eventId) return;

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
        console.log("An error occurred while deleting event");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addEvent = (event?: Event) => {
    if (event) {
      setEventDetails((prev: Event[]) => [event, ...prev]);

      setGroupDetails((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          _count: {
            ...prev._count,
            event: prev._count.event + 1,
          },
        };
      });
    }
    setCreateEvent(false);
  };

  // Handle opening event link in built-in tab
  const handleOpenEventLink = (eventLink: string, eventName: string) => {
    if (eventLink && eventLink !== "") {
      openInBuiltTab(eventLink, eventName);
    } else {
      console.error("No event link provided");
    }
  };

  // Animation variants
  const slideInFromRight = {
    hidden: { x: "100%", opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
        duration: 0.5
      }
    },
    exit: { 
      x: "100%", 
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  // Loading state UI
  if (isLoading) {
    return (
      <motion.div 
        className="flex flex-col justify-center items-center h-96 gap-4"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <Loader
          full_border_color="transparent"
          small_border_color="#49151B"
          height={50}
          width={50}
          border_width={3}
        />
        <p className="text-gray-500 dark:text-gray-400 text-sm animate-pulse">
          Loading group details...
        </p>
      </motion.div>
    );
  }

  // No data state
  if (!groupDetails) {
    return (
      <motion.div 
        className="flex flex-col justify-center items-center h-96 gap-4"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <p className="text-gray-500 dark:text-gray-400">Group not found</p>
        <button
          onClick={backFunc}
          className="px-4 py-2 bg-primaryColors-0 text-white rounded-lg"
        >
          Go Back
        </button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="community-group"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={slideInFromRight as any}
      >
        <div>
          <div className="flex justify-between items-center">
            <div>
              <SubHeader
                header={groupDetails.group_title}
                backFunction={backFunc}
              />
              <p className="flex items-center gap-5 text-[#71748C] text-[14px]">
                <span className="flex items-center gap-2">
                  <RiGroupLine />
                  {groupDetails._count?.member || 0} members
                </span>
                <span className="flex items-center gap-2">
                  <FaRegClock />
                  {formatDate(groupDetails.createdAt)}
                </span>
              </p>
              <div className="flex items-center gap-3 my-5">
                <span className="h-[35px] w-[35px] bg-plainColors-0 rounded-full overflow-hidden">
                  {groupDetails.createdBy?.user_pic ? (
                    <img
                      src={groupDetails.createdBy.user_pic}
                      className="h-full w-full object-cover"
                      alt="Group creator"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">
                        {groupDetails.createdBy?.first_name?.[0] || "G"}
                      </span>
                    </div>
                  )}
                </span>
                <p className="text-[#71748C] text-[14px] font-[400]">
                  {groupDetails.createdBy?.last_name || ""}{" "}
                  {groupDetails.createdBy?.first_name || ""}
                </p>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={iconEdit}
                className="text-[#41415A] text-[20px] p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader
                    full_border_color="transparent"
                    small_border_color="#49151B"
                    height={20}
                    width={20}
                    border_width={2}
                  />
                ) : (
                  <MdMoreVert />
                )}
              </button>
              {showDropdown && !isDeleting && (
                <div
                  ref={groupDropdownRef}
                  className="bg-white dark:bg-gray-800 drop-shadow-2xl w-[152px] text-[14px] absolute right-0 z-10 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <span
                    className="flex items-center gap-[12px] px-[16px] py-[8px] hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-300"
                    onClick={() => {
                      openEditGroup(groupDetails.id);
                    }}
                  >
                    <MdEdit /> Edit
                  </span>
                  <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
                  <span
                    className="flex items-center gap-[12px] px-[16px] py-[8px] text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => deleteGroupById(groupId)}
                  >
                    <IoMdTrash /> Delete
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-secondaryColors-0 md:p-[24px] drop-shadow-sm rounded-lg">
            <div className="w-full h-[220px] relative rounded-t-lg overflow-hidden">
              {groupDetails.group_image ? (
                <img
                  src={groupDetails.group_image}
                  alt="Group banner"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <span className="text-gray-400 dark:text-gray-500">No image</span>
                </div>
              )}
            </div>
            <p className="text-[14px] text-[#71748C] dark:text-gray-400 font-[400] my-4">
              {groupDetails.group_description}
            </p>

            <button
              className="form_more text-white bg-primaryColors-0 flex items-center justify-center gap-2 mb-2 w-full"
              onClick={() => {
                setEventId("");
                setCreateEvent(true);
                handleOpenEvent();
              }}
            >
              + Create Event
            </button>

            <section className="grid grid-cols-3 my-5 bg-lightWhite-0 dark:bg-shadyColor-0 p-[16px] rounded-lg">
              <div className="flex justify-center items-center flex-col">
                <span className="dark:text-textSlightDark-0 text-lightBoldText-0 text-[18px] font-bold">
                  0
                </span>
                <p className="text-[#71748C] dark:text-gray-400 text-[14px] font-[400]">
                  Posts this Week
                </p>
              </div>
              <div className="flex justify-center items-center flex-col">
                <span className="dark:text-textSlightDark-0 text-lightBoldText-0 text-[18px] font-bold">
                  {groupDetails._count?.member || 0}
                </span>
                <p className="text-[#71748C] dark:text-gray-400 text-[14px] font-[400]">
                  Members
                </p>
              </div>
              <div className="flex justify-center items-center flex-col">
                <span className="dark:text-textSlightDark-0 text-lightBoldText-0 text-[18px] font-bold">
                  {groupDetails._count?.event || 0}
                </span>
                <p className="text-[#71748C] dark:text-gray-400 text-[14px] font-[400]">
                  Upcoming Events
                </p>
              </div>
            </section>
          </div>


          <div className="w-full flex flex-col gap-1 my-5 bg-lightWhite-0 dark:bg-secondaryColors-0 p-[16px] rounded-lg">
            <h1 className="text-lightBoldText-0 dark:text-gray-200 font-bold text-[16px]">
              Upcoming Events
            </h1>
            
            {(groupDetails._count?.event || 0) === 0 ? (
              <motion.div 
                className="flex justify-center items-center flex-col gap-1 my-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <IoMdCalendar size={80} className="text-nearTextColors-0 dark:text-gray-600" />
                <p className="text-[0.9rem] text-textSlightDark-0 dark:text-gray-400">
                  No Events here yet
                </p>
              </motion.div>
            ) : (
              <div>
                {eventDetails.map((e, i) => (
                  <motion.div 
                    className="w-full flex flex-col gap-1 my-5" 
                    key={e.id || i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                  >
                    <div className="w-full flex items-center justify-between">
                      <h1 className="text-[14px] font-[600] text-lightBoldText-0 dark:text-gray-200">
                        {e.event_name || "Untitled Event"}
                      </h1>
                      <span
                        className={`${
                          e.event_type == "Meetings"
                            ? "bg-[#FF6B30]"
                            : e.event_type == "Prayer"
                            ? "bg-boldGreen-0"
                            : "bg-blue-600"
                        } text-white px-[4px] text-[12px] rounded-[2px]`}
                      >
                        {e.event_type || "Event"}
                      </span>
                    </div>
                    <p className="text-[14px] text-[#71748C] dark:text-gray-400 font-[400]">
                      {e.event_description || "No description"}
                    </p>
                    <div className="flex gap-3 items-center text-[14px] font-[400] text-[#71748C] dark:text-gray-400 my-2">
                      <span className="flex items-center gap-1">
                        <CiCalendar className="mb-1" />{" "}
                        {formatDate2(e.event_date as string)}
                      </span>
                      <span className="flex items-center gap-1">
                        <GoVideo className="mb-1" /> {e.event_time || "No time"}
                      </span>
                    </div>

                    <div className="w-full flex justify-between items-center gap-3">
                      <button 
                        onClick={() => handleOpenEventLink(e.event_link as string, e.event_name as string)}
                        className="h-[40px] bg-lightWhite-0 dark:bg-shadyColor-0 dark:text-white text-primaryColors-0 my-3 flex items-center justify-center gap-2 text-[13px] font-[600] w-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <p className="mt-1">Event Link </p>
                        <FaExternalLinkAlt />
                      </button>
                      <div className="relative">
                        <button
                          className="h-[40px] w-[40px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex justify-center items-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          onClick={(event) => {
                            event.stopPropagation();
                            dropDownEvent(i);
                          }}
                        >
                          <MdMoreVert className="text-gray-600 dark:text-gray-400" />
                        </button>

                        {openEventIndex === i && (
                          <div
                            ref={(el) => {
                              eventRefs.current[i] = el;
                            }}
                            className="bg-white dark:bg-gray-800 drop-shadow-2xl w-[152px] text-[14px] absolute right-0 z-10 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                          >
                            <span
                              className="flex items-center gap-[12px] px-[16px] py-[8px] hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-300"
                              onClick={() => updateGroupEvent(e.id as string)}
                            >
                              <MdEdit /> Edit
                            </span>
                            <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
                            <span
                              className="flex items-center gap-[12px] px-[16px] py-[8px] text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                              onClick={() => deleteEvent(e.id as string)}
                            >
                              <IoMdTrash /> Delete
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-[#ccc]/20"></div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {shouldRenderEventModal && (
            <>
              <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
                  createEvent ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setCreateEvent(false)}
                onTransitionEnd={handleAnimationEnd}
              />

              <div
                className={`fixed top-0 right-0 h-full bg-white dark:bg-gray-900 w-[390px] max-w-[90vw] transform transition-transform duration-300 ease-in-out z-50 shadow-xl ${
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
      </motion.div>
    </AnimatePresence>
  );
}