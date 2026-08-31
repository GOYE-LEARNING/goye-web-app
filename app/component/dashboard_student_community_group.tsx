"use client";

import { RiGroupLine } from "react-icons/ri";
import SubHeader from "./dashboard_subheader";
import { FaExternalLinkAlt, FaRegBell, FaRegClock } from "react-icons/fa";
import { CiCalendar, CiLock } from "react-icons/ci";
import { GoVideo as VideoIcon } from "react-icons/go";
import { useEffect, useState, useCallback, useRef } from "react";
import { MdLogout } from "react-icons/md";
import { formatDistanceToNow } from "date-fns";
import { IoMdCalendar } from "react-icons/io";
import Loader from "./loader";
import { motion, AnimatePresence } from "framer-motion";
import { useBuiltInTab } from "../context/BuiltinTabContext";
import { dispatchAPIError } from "@/app/hook/useAPIErrorHandler";

interface Props {
  backToMainPage: () => void;
  groupId: string;
}

interface EventItem {
  id: string;
  event_name: string;
  event_description: string;
  event_type: string;
  event_time: string;
  event_date: string;
  event_link: string;
}

interface GroupData {
  id: string;
  group_title: string;
  group_short_description?: string;
  group_description?: string;
  group_image?: string;
  createdAt?: string;
  createdBy?: {
    first_name?: string;
    last_name?: string;
    user_pic?: string;
  };
  member?: Array<unknown>;
  event?: EventItem[];
  _count?: { member?: number; event?: number };
  hasJoined?: boolean;
  updatedAt?: string;
}

export default function StudentCommunityGroup({
  backToMainPage,
  groupId,
}: Props) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [group, setGroup] = useState<GroupData | null>(null);
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [loadEvents, setLoadEvents] = useState<string[]>([]);

  const isMounted = useRef(true);
  const { openInBuiltTab } = useBuiltInTab();

  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Invalid Date";
    }
  }, []);

  const formatDate2 = useCallback((dateString?: string) => {
    if (!dateString) return "TBA";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "TBA";
      return date.toLocaleDateString("en-us", {
        day: "numeric",
        month: "short",
        weekday: "short",
      });
    } catch {
      return "TBA";
    }
  }, []);

  const loadEventDetails = useCallback((eventId: string) => {
    setLoadEvents((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    );
  }, []);

  const fetchGroups = useCallback(async () => {
    if (!API_URL) {
      setIsLoading(false);
      console.error("API_URL is missing. Check your environment variables.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/socials/get-groups`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 429) {
          dispatchAPIError({
            status: 429,
            message: "Too many requests, please slow down.",
            retryAfter: 5,
            endpoint: "/api/socials/get-groups",
          });
        }
        return;
      }

      const responseData = await res.json();
      console.log("Groups displayed", responseData);

      const groupsArray: GroupData[] = Array.isArray(responseData?.data)
        ? responseData.data
        : Array.isArray(responseData)
        ? responseData
        : [];

      const targetGroup = groupsArray.find((g) => g.id === groupId) || groupsArray[0] || null;

      if (isMounted.current) {
        setGroup(targetGroup);
        if (targetGroup?.hasJoined !== undefined) {
          setHasJoined(targetGroup.hasJoined);
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [API_URL, groupId]);

  useEffect(() => {
    isMounted.current = true;
    fetchGroups();

    return () => {
      isMounted.current = false;
    };
  }, [groupId, fetchGroups]);

  const joinGroupFunc = useCallback(async () => {
    if (!groupId || !API_URL) return;

    setIsJoining(true);
    try {
      const res = await fetch(`${API_URL}/api/socials/join-group/${groupId}`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 429) {
          dispatchAPIError({
            status: 429,
            message: "Too many requests, please slow down.",
            retryAfter: 5,
            endpoint: `/api/socials/join-group/${groupId}`,
          });
        } else {
          throw new Error(`Failed to join group: ${res.status}`);
        }
        return;
      }

      if (isMounted.current) {
        setGroup((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            _count: {
              ...prev._count,
              member: (prev._count?.member || 0) + 1,
            },
          };
        });
        setHasJoined(true);
      }
    } catch (error: any) {
      console.error("Error joining group:", error);
      if (error?.status !== 429) {
        dispatchAPIError({
          status: error?.status || 500,
          message: error?.message || "Failed to join group",
          endpoint: `/api/socials/join-group/${groupId}`,
        });
      }
    } finally {
      if (isMounted.current) {
        setIsJoining(false);
      }
    }
  }, [groupId, API_URL]);

  const exitGroupFunc = useCallback(async () => {
    if (!groupId || !API_URL) return;

    setIsExiting(true);
    try {
      const res = await fetch(`${API_URL}/api/socials/exit-group/${groupId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 429) {
          dispatchAPIError({
            status: 429,
            message: "Too many requests, please slow down.",
            retryAfter: 5,
            endpoint: `/api/socials/exit-group/${groupId}`,
          });
        } else {
          throw new Error(`Failed to exit group: ${res.status}`);
        }
        return;
      }

      if (isMounted.current) {
        setGroup((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            _count: {
              ...prev._count,
              member: Math.max(0, (prev._count?.member || 1) - 1),
            },
          };
        });
        setHasJoined(false);
      }
    } catch (error: any) {
      console.error("Error exiting group:", error);
      if (error?.status !== 429) {
        dispatchAPIError({
          status: error?.status || 500,
          message: error?.message || "Failed to exit group",
          endpoint: `/api/socials/exit-group/${groupId}`,
        });
      }
    } finally {
      if (isMounted.current) {
        setIsExiting(false);
      }
    }
  }, [groupId, API_URL]);

  const handleOpenEventLink = useCallback(
    (eventLink?: string, eventName?: string) => {
      if (eventLink) {
        openInBuiltTab(eventLink, eventName || "Event");
      }
    },
    [openInBuiltTab]
  );

  const slideInFromRight = {
    hidden: { x: "100%", opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
        duration: 0.5,
      },
    },
    exit: {
      x: "100%",
      opacity: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } },
  };

  const eventsList = group?.event || [];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="community-group"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={slideInFromRight as any}
      >
        {isLoading ? (
          <motion.div
            className="flex flex-col justify-center items-center h-96 gap-4"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <Loader
              full_border_color="transparent"
              small_border_color="#49151B"
              height={40}
              width={40}
              border_width={3}
            />
            <p className="text-gray-500 dark:text-gray-400 text-sm animate-pulse">
              Loading group details...
            </p>
          </motion.div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <div>
              <SubHeader
                header={group?.group_title || "Group Community"}
                backFunction={backToMainPage}
              />
              <p className="flex items-center gap-5 text-[#71748C] text-[14px]">
                <span className="flex items-center gap-2">
                  <RiGroupLine />
                  {group?._count?.member ?? 0} members
                </span>
                <span className="flex items-center gap-2">
                  <FaRegClock />
                  {formatDate(group?.createdAt)}
                </span>
              </p>
              <div className="flex items-center gap-3 my-5">
                <span className="h-[35px] w-[35px] bg-plainColors-0 rounded-full overflow-hidden">
                  <img
                    src={group?.createdBy?.user_pic || "/default-avatar.png"}
                    alt="creator_pic"
                    className="w-full h-full object-cover"
                  />
                </span>
                <p className="text-[#71748C] text-[14px] font-[400]">
                  {group?.createdBy?.first_name || group?.createdBy?.last_name
                    ? `${group?.createdBy?.last_name || ""} ${group?.createdBy?.first_name || ""}`
                    : "Community Admin"}
                </p>
              </div>
              <div className="bg-[#ffffff] dark:bg-secondaryColors-0 p-[24px] drop-shadow-sm">
                <div className="w-full h-[220px] relative">
                  <img
                    src={group?.group_image || "/default-group-image.png"}
                    alt="pic_info"
                    className="h-full w-full object-cover rounded"
                  />
                </div>
                <p className="text-[14px] text-[#71748C] font-[400] my-4">
                  {group?.group_description || group?.group_short_description || "No description provided."}
                </p>

                {!hasJoined ? (
                  <button
                    className="form_more text-[#ffffff] bg-primaryColors-0 flex items-center justify-center gap-2 mb-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={joinGroupFunc}
                    disabled={isJoining}
                  >
                    {isJoining ? (
                      <div className="flex items-center gap-2 justify-center">
                        <Loader
                          full_border_color="transparent"
                          small_border_color="#ffffff"
                          height={20}
                          width={20}
                          border_width={2}
                        />
                        Joining...
                      </div>
                    ) : (
                      "+ Join Group"
                    )}
                  </button>
                ) : (
                  <div>
                    <button
                      className="form_more w-full text-primaryColors-0 bg-[#ffffff] dark:bg-shadyColor-0 dark:text-white border border-[#ccc]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={exitGroupFunc}
                      disabled={isExiting}
                    >
                      {isExiting ? (
                        <div className="flex items-center gap-2 justify-center">
                          <Loader
                            full_border_color="transparent"
                            small_border_color="#FFA500"
                            height={20}
                            width={20}
                            border_width={2}
                          />
                          Exiting...
                        </div>
                      ) : (
                        <>
                          <MdLogout /> Exit Group
                        </>
                      )}
                    </button>
                  </div>
                )}

                <section className="grid grid-cols-3 my-5 bg-lightWhite-0 dark:bg-shadyColor-0 p-[16px] rounded-lg">
                  <div className="flex justify-center items-center flex-col">
                    <span className="dark:text-textSlightDark-0 text-lightBoldText-0 text-[18px] font-bold">
                      0
                    </span>
                    <p className="text-[#71748C] text-[14px] font-[400]">
                      Posts this Week
                    </p>
                  </div>
                  <div className="flex justify-center items-center flex-col">
                    <span className="dark:text-textSlightDark-0 text-lightBoldText-0 text-[18px] font-bold">
                      {group?._count?.member ?? 0}
                    </span>
                    <p className="text-[#71748C] text-[14px] font-[400]">
                      Members
                    </p>
                  </div>
                  <div className="flex justify-center items-center flex-col">
                    <span className="dark:text-textSlightDark-0 text-lightBoldText-0 text-[18px] font-bold">
                      {group?._count?.event ?? 0}
                    </span>
                    <p className="text-[#71748C] text-[14px] font-[400]">
                      Upcoming Events
                    </p>
                  </div>
                </section>

                <div className="h-[16px] w-full bg-lightWhite-0 dark:bg-shadyColor-0 border-t border-b border-t-[#ccc]/20 border-b-[#ccc]/20"></div>

                {eventsList.length === 0 ? (
                  <motion.div
                    className="flex justify-center items-center flex-col gap-1 my-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <IoMdCalendar size={80} className="text-nearTextColors-0" />
                    <p className="text-[0.9rem] text-textSlightDark-0">
                      No Events here yet
                    </p>
                  </motion.div>
                ) : (
                  <div>
                    {eventsList.map((e, i) => (
                      <motion.div
                        className="w-full flex flex-col gap-1 my-5"
                        key={e.id || i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                      >
                        <div className="w-full flex items-center justify-between">
                          <h1 className="text-[14px] font-[600] text-textSlightDark-0">
                            {e.event_name || "Untitled Event"}
                          </h1>
                          <span className="bg-[#FF6B30] text-[#ffffff] px-[4px] text-[12px] rounded-[2px]">
                            {e.event_type || "General"}
                          </span>
                        </div>
                        <p
                          className={`text-[14px] text-[#71748C] font-[400] ${
                            loadEvents.includes(e.id)
                              ? "line-clamp-none"
                              : "line-clamp-3"
                          } cursor-pointer`}
                          onClick={() => loadEventDetails(e.id)}
                        >
                          {e.event_description}
                        </p>
                        <div className="flex gap-3 items-center text-[14px] font-[400] text-[#71748C] my-2">
                          <span className="flex items-center gap-1">
                            <CiCalendar className="mb-1" />{" "}
                            {formatDate2(e.event_date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <VideoIcon className="mb-1" /> {e.event_time || "TBA"}
                          </span>
                        </div>

                        {!hasJoined ? (
                          <button className="h-[40px] bg-lightWhite-0 dark:bg-shadyColor-0 dark:text-white text-primaryColors-0 my-3 flex items-center justify-center gap-2 text-[13px] font-[600] cursor-not-allowed opacity-60 w-full">
                            <p className="mt-1">Event Link</p>
                            <CiLock />
                          </button>
                        ) : (
                          <div className="w-full flex justify-between items-center gap-3">
                            <button
                              onClick={() =>
                                handleOpenEventLink(e.event_link, e.event_name)
                              }
                              className="h-[40px] bg-lightWhite-0 dark:bg-shadyColor-0 dark:text-white text-primaryColors-0 my-3 flex items-center justify-center gap-2 text-[13px] font-[600] w-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <p className="mt-1">Event Link</p>
                              <FaExternalLinkAlt />
                            </button>
                            <button className="h-[40px] w-[40px] bg-primaryColors-0 border border-[#ccc]/20 flex justify-center items-center rounded hover:bg-primaryColors-600 transition-colors flex-shrink-0">
                              <FaRegBell color="white" />
                            </button>
                          </div>
                        )}

                        <div className="h-[1px] w-full bg-[#ccc]/20"></div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}