"use client";

import { RiGroupLine } from "react-icons/ri";
import SubHeader from "./dashboard_subheader";
import { FaExternalLinkAlt, FaRegBell, FaRegClock } from "react-icons/fa";
import { CiCalendar, CiLock } from "react-icons/ci";
import { GoVideo } from "react-icons/go";
import { useEffect, useState, useCallback, useRef } from "react";
import { MdLogout, MdOutlineChat } from "react-icons/md";
import { formatDistanceToNow } from "date-fns";
import { IoMdCalendar } from "react-icons/io";
import Loader from "./loader";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useBuiltInTab } from "../context/BuiltinTabContext";
import { dispatchAPIError } from "@/app/hook/useAPIErrorHandler";

interface Props {
  backToMainPage: () => void;
  groupId: string;
}

interface Event {
  id: string;
  event_name: string;
  event_description: string;
  event_type: string;
  event_time: string;
  event_date: string;
  event_link: string;
}

interface User {
  first_name: string;
  last_name: string;
  user_pic: string;
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
  _count: GroupCount;
  createdAt?: string;
  updatedAt?: string;
  event: Event[];
}

export default function StudentCommunityGroup({
  backToMainPage,
  groupId,
}: Props) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [groups, setGroups] = useState<GroupData | null>(null);
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [loadEvents, setLoadEvents] = useState<string[]>([]);
  
  // Use refs to track mounted state and prevent memory leaks
  const isMounted = useRef(true);

  // Use the built-in tab hook
  const { openInBuiltTab } = useBuiltInTab();

  const backFunc = () => {
    backToMainPage();
  };

  const router = useRouter();

  const formatDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Invalid Date";
    }
  }, []);

  const loadEventDetails = useCallback((eventId: string) => {
    setLoadEvents((prev) => {
      if (prev.includes(eventId)) {
        return prev.filter((id) => id !== eventId);
      }
      return [...prev, eventId];
    });
  }, []);

  const formatDate2 = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-us", {
      day: "numeric",
      month: "short",
      weekday: "short",
    });
  }, []);

  // Fetch group details and check join status in parallel
  const fetchGroup = useCallback(async () => {
    if (!groupId || !API_URL) return;
    
    setIsLoading(true);
    try {
      // Parallelize both API calls - don't wait for one to finish before starting the other
      const [groupRes, joinRes] = await Promise.all([
        fetch(`${API_URL}/api/socials/get-group/${groupId}`, {
          method: "GET",
          credentials: "include",
        }),
        fetch(`${API_URL}/api/socials/check-joined/${groupId}`, {
          method: "GET",
          credentials: "include",
        }),
      ]);

      // Handle group fetch
      if (!groupRes.ok) {
        if (groupRes.status === 429) {
          dispatchAPIError({
            status: 429,
            message: "Too many requests, please slow down.",
            retryAfter: 5,
            endpoint: `/api/socials/get-group/${groupId}`,
          });
        } else {
          throw new Error(`Failed to fetch group: ${groupRes.status}`);
        }
        return;
      }

      const groupData = await groupRes.json();
      
      // Handle join status fetch
      let joinedStatus = false;
      if (joinRes.ok) {
        const joinData = await joinRes.json();
        joinedStatus = joinData.data === true;
      }

      // Only update if component is still mounted
      if (isMounted.current) {
        setGroups(groupData.data);
        setHasJoined(joinedStatus);
      }
    } catch (error: any) {
      console.error("Error fetching group:", error);
      if (error?.status !== 429) {
        dispatchAPIError({
          status: error?.status || 500,
          message: error?.message || "Failed to load group details",
          endpoint: `/api/socials/get-group/${groupId}`,
        });
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [groupId, API_URL]);

  useEffect(() => {
    isMounted.current = true;
    fetchGroup();
    
    return () => {
      isMounted.current = false;
    };
  }, [groupId, fetchGroup]);

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
        setGroups((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            _count: {
              ...prev._count,
              member: prev._count.member + 1,
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
        setGroups((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            _count: {
              ...prev._count,
              member: prev._count.member - 1,
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

  // Handle opening event link in built-in tab using the hook
  const handleOpenEventLink = useCallback((eventLink: string, eventName: string) => {
    if (eventLink && eventLink !== "") {
      openInBuiltTab(eventLink, eventName);
    } else {
      console.error("No event link provided");
    }
  }, [openInBuiltTab]);

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
        duration: 0.5,
      },
    },
    exit: {
      x: "100%",
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4 },
    },
  };

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
                header={groups?.group_title as string}
                backFunction={backFunc}
              />
              <p className="flex items-center gap-5 text-[#71748C] text-[14px]">
                <span className="flex items-center gap-2">
                  <RiGroupLine />
                  {groups?._count.member} members
                </span>
                <span className="flex items-center gap-2">
                  <FaRegClock />
                  {formatDate(groups?.createdAt as string)}
                </span>
              </p>
              <div className="flex items-center gap-3 my-5">
                <span className="h-[35px] w-[35px] bg-plainColors-0 rounded-full overflow-hidden">
                  <img
                    src={groups?.createdBy.user_pic || "/default-avatar.png"}
                    alt="creator_pic"
                    className="w-full h-full object-cover"
                  />
                </span>
                <p className="text-[#71748C] text-[14px] font-[400]">
                  {groups?.createdBy.last_name} {groups?.createdBy.first_name}
                </p>
              </div>
              <div className="bg-[#ffffff] dark:bg-secondaryColors-0 p-[24px] drop-shadow-sm">
                <div className="w-full h-[220px] relative ">
                  <img
                    src={
                      (groups?.group_image as string) ||
                      "/default-group-image.png"
                    }
                    alt="pic_info"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-[14px] text-[#71748C] font-[400] my-4">
                  {groups?.group_description}
                </p>

                {!hasJoined && (
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
                )}

                {hasJoined && (
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
                      {groups?._count.member}
                    </span>
                    <p className="text-[#71748C] text-[14px] font-[400]">
                      Members
                    </p>
                  </div>
                  <div className="flex justify-center items-center flex-col">
                    <span className="dark:text-textSlightDark-0 text-lightBoldText-0 text-[18px] font-bold">
                      {groups?._count.event}
                    </span>
                    <p className="text-[#71748C] text-[14px] font-[400]">
                      Upcoming Events
                    </p>
                  </div>
                </section>

                <div className="h-[16px] w-full bg-lightWhite-0 dark:bg-shadyColor-0 border-t border-b border-t-[#ccc]/20 border-b-[#ccc]/20"></div>

                {groups?.event.length === 0 ? (
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
                    {groups?.event.map((e, i) => (
                      <motion.div
                        className="w-full flex flex-col gap-1 my-5"
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                      >
                        <div className="w-full flex items-center justify-between">
                          <h1 className="text-[14px] font-[600] text-textSlightDark-0">
                            {e.event_name}
                          </h1>
                          <span className="bg-[#FF6B30] text-[#ffffff] px-[4px] text-[12px] rounded-[2px]">
                            {e.event_type}
                          </span>
                        </div>
                        <p
                          className={`text-[14px] text-[#71748C] font-[400] ${loadEvents.includes(e.id) ? "cursor-pointer line-clamp-none" : "line-clamp-3"} cursor-pointer`}
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
                            <GoVideo className="mb-1" /> {e.event_time}
                          </span>
                        </div>

                        {!hasJoined && (
                          <button className="h-[40px] bg-lightWhite-0 dark:bg-shadyColor-0 dark:text-white text-primaryColors-0 my-3 flex items-center justify-center gap-2 text-[13px] font-[600] cursor-not-allowed opacity-60">
                            <p className="mt-1">Event Link </p>
                            <CiLock />
                          </button>
                        )}

                        {hasJoined && (
                          <div className="w-full flex justify-between items-center gap-3">
                            <button
                              onClick={() =>
                                handleOpenEventLink(e.event_link, e.event_name)
                              }
                              className="h-[40px] bg-lightWhite-0 dark:bg-shadyColor-0 dark:text-white text-primaryColors-0 my-3 flex items-center justify-center gap-2 text-[13px] font-[600] w-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <p className="mt-1">Event Link </p>
                              <FaExternalLinkAlt />
                            </button>
                            <button className="h-[40px] w-[40px] bg-primaryColors-0 border border-[#ccc]/20 flex justify-center items-center rounded hover:bg-primaryColors-600 transition-colors">
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
