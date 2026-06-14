"use client";
import TutorCommunityGroup from "@/app/component/dashboard_tutor_community_group";
import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  Suspense,
} from "react";
import { FaRegClock } from "react-icons/fa";
import { RiGroupLine } from "react-icons/ri";
import { MdAdd } from "react-icons/md";
import DashboardSearch from "@/app/component/dashboard_search";
import DashboardTutorCreateGroup from "@/app/component/dashboard_tutor_create-group";
import { formatDistanceToNow } from "date-fns";
import Loader from "@/app/component/loader";
import Image from "next/image";
import pic2 from "@/public/images/notfound.png";
import { IoMdRefresh } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { dispatchAPIError } from "@/app/hook/useAPIErrorHandler";
import { FaMessage, FaPeopleGroup, FaChalkboardUser } from "react-icons/fa6";
import { IoExtensionPuzzle } from "react-icons/io5";
import MessagesModal from "@/app/component/MessagesModal";
import SocialMode from "@/app/component/dashboard_social_feed";

// Cache to prevent duplicate fetches
let isFetching = false;
let fetchPromise: Promise<any> | null = null;

interface User {
  first_name: string;
  last_name: string;
  user_pic: string;
}

interface GroupCount {
  member: number;
}

interface GroupData {
  id: string;
  group_title: string;
  group_short_description: string;
  group_description: string;
  group_image: string;
  createdBy: User;
  _count: GroupCount;
  updatedAt?: string;
}

// Helper function to get loader props
const getLoaderProps = () => ({
  full_border_color: "transparent",
  small_border_color: "orange",
  height: 40,
  width: 40,
  border_width: 3,
});

const getSmallLoaderProps = () => ({
  full_border_color: "transparent",
  small_border_color: "orange",
  height: 20,
  width: 20,
  border_width: 2,
});

export default function TutorCommunity() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [group, setGroup] = useState<GroupData[]>([]);
  const [groupId, setGroupId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showCommunityGroup, setShowCommunityGroup] = useState<boolean>(false);
  const [showCommunity, setShowCommunity] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [showGroup, setShowGroup] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("live");
  const [showMessagesModal, setShowMessagesModal] = useState(false);

  // Refs to prevent memory leaks
  const isMounted = useRef(true);
  const initialFetchDone = useRef(false);

  const formatDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Invalid Date";
    }
  }, []);

  // Optimized fetch with deduplication
  const fetchGroups = useCallback(async () => {
    if (isFetching) {
      if (fetchPromise) await fetchPromise;
      return;
    }

    isFetching = true;
    setIsLoading(true);

    fetchPromise = (async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/socials/get-groups-created-by-tutor`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        const data = await res.json();

        if (!res.ok) {
          if (res.status === 429) {
            dispatchAPIError({
              status: 429,
              message:
                "Too many requests, please slow down and try again later.",
              retryAfter: 5,
              endpoint: "/api/socials/get-groups-created-by-tutor",
            });
          } else {
            console.error(`HTTP Error: ${res.status}`);
          }
          if (isMounted.current) {
            setGroup([]);
          }
          return;
        }

        let groupsArray: GroupData[] = [];

        if (Array.isArray(data)) {
          groupsArray = data;
        } else if (Array.isArray(data.data)) {
          groupsArray = data.data;
        } else if (Array.isArray(data.groups)) {
          groupsArray = data.groups;
        }

        const transformedGroups = groupsArray.map((group: any) => ({
          id: group.id || "",
          group_title: group.group_title || "",
          group_short_description: group.group_short_description || "",
          group_description: group.group_description || "",
          group_image: group.group_image || "",
          createdBy: group.createdBy || {
            first_name: "",
            last_name: "",
            user_pic: "",
          },
          _count: {
            member: group._count?.member || group.memberCount || 0,
          },
          updatedAt: group.updatedAt || group.createdAt || "",
        }));

        if (isMounted.current) {
          setGroup(transformedGroups);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        if (isMounted.current) {
          setGroup([]);
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
        isFetching = false;
        fetchPromise = null;
      }
    })();

    await fetchPromise;
  }, [API_URL]);

  // Initial fetch only once
  useEffect(() => {
    isMounted.current = true;
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchGroups();
    }

    return () => {
      isMounted.current = false;
    };
  }, [fetchGroups]);

  const refreshGroup = useCallback(() => {
    setIsRefreshing(true);
    fetchGroups();
  }, [fetchGroups]);

  const onAddGroup = useCallback((newGroup: GroupData) => {
    setGroup((prev) => [newGroup, ...prev]);
  }, []);

  const onEditGroup = useCallback((updatedGroup: GroupData) => {
    setGroup((prev) =>
      prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)),
    );
  }, []);

  const deleteGroup = useCallback((groupIdToDelete?: string) => {
    if (groupIdToDelete) {
      setGroup((prev) => prev.filter((g) => g.id !== groupIdToDelete));
    }
  }, []);

  const backToMainPage = useCallback(() => {
    setShowCommunity(true);
    setShowCommunityGroup(false);
    setShowGroup(false);
    setGroupId("");
  }, []);

  const showCreateGroup = useCallback(() => {
    setGroupId("");
    setShowCommunityGroup(false);
    setShowGroup(true);
  }, []);

  const handleEditGroup = useCallback((groupIdToEdit: string) => {
    setGroupId(groupIdToEdit);
    setShowCommunity(false);
    setShowCommunityGroup(false);
    setShowGroup(true);
  }, []);

  // Memoized filtered groups
  const filteredGroups = useMemo(
    () =>
      group.filter((g) =>
        g.group_title.toLowerCase().includes(search.toLowerCase()),
      ),
    [group, search],
  );

  // Tab content
  const tabContent = useMemo(() => {
    if (activeTab === "live") {
      return (
        <Suspense
          fallback={
            <div className="flex justify-center py-20">
              <Loader {...getLoaderProps()} />
            </div>
          }
        >
          <SocialMode />
        </Suspense>
      );
    } else if (activeTab === "groups") {
      return (
        <>
          <div className="flex justify-between items-center gap-4 mb-4">
            <div className="w-full">
              <DashboardSearch
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search groups..."
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refreshGroup}
                className="h-9 w-9 bg-primaryColors-0 rounded-full flex items-center justify-center cursor-pointer hover:bg-primaryColors-600 transition-colors flex-shrink-0"
                aria-label="Refresh groups"
              >
                {isRefreshing ? (
                  <Loader {...getSmallLoaderProps()} />
                ) : (
                  <IoMdRefresh className="text-white" size={18} />
                )}
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader {...getLoaderProps()} />
              <p className="ml-3 text-gray-500 dark:text-gray-400">
                Loading groups...
              </p>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-20">
              <Image src={pic2} alt="No groups" height={100} width={100} />
              <h1 className="text-textSlightDark-0 font-semibold">
                No Groups Found
              </h1>
              <p className="text-textGrey-0">Create a Group</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGroups.map((data) => (
                <div
                  key={data.id}
                  className="cursor-pointer border border-[#ccc]/10 bg-white dark:bg-secondaryColors-0 py-4 px-4 rounded-xl my-3 transition-all hover:shadow-md"
                  onClick={() => {
                    setShowCommunity(false);
                    setShowCommunityGroup(true);
                    setGroupId(data.id);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <h1 className="font-bold text-[#41415A] dark:text-white text-lg line-clamp-1">
                      {data.group_title}
                    </h1>
                    <span className="bg-gray-100 dark:bg-gray-700 py-1 px-2 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Moderator
                    </span>
                  </div>

                  <p className="text-[#71748C] dark:text-gray-400 text-sm my-1 line-clamp-2">
                    {data.group_short_description}
                  </p>

                  <div className="flex items-center gap-4 text-[#71748C] text-xs">
                    <span className="flex items-center gap-1">
                      <RiGroupLine size={14} /> {data._count?.member || 0}{" "}
                      members
                    </span>
                    <span className="flex items-center gap-1">
                      <FaRegClock size={12} />{" "}
                      {formatDate(data.updatedAt || "")}
                    </span>
                  </div>

                  <div className="border-t border-[#ccc]/10 my-3" />

                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                      {data.createdBy?.user_pic ? (
                        <img
                          src={data.createdBy.user_pic}
                          className="h-full w-full object-cover"
                          alt=""
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-500 text-xs">
                          {data.createdBy?.first_name?.[0] || "G"}
                        </div>
                      )}
                    </div>
                    <p className="text-[#71748C] dark:text-gray-400 text-xs truncate">
                      {data.createdBy?.first_name || ""}{" "}
                      {data.createdBy?.last_name || ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      );
    }

    if (activeTab === "messages") {
      return (
        <div className="flex justify-center items-center h-96 bg-white/50 dark:bg-secondaryColors-0/50 backdrop-blur-md rounded-xl">
          <div className="text-center">
            <FaMessage className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              Messages
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Connect with your students
            </p>
            <button
              onClick={() => setShowMessagesModal(true)}
              className="mt-6 px-6 py-2 bg-primaryColors-0 text-white rounded-full hover:bg-primaryColors-600 transition-colors font-semibold"
            >
              Open Messages
            </button>
          </div>
        </div>
      );
    }

    return null;
  }, [
    activeTab,
    search,
    isLoading,
    filteredGroups,
    formatDate,
    refreshGroup,
    isRefreshing,
  ]);

  return (
    <>
      <AnimatePresence mode="wait">
        {showCommunity ? (
          <motion.div
            key="community-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="container mx-auto"
          >
            <br />

            {/* Header with Tabs - Matching Student Design */}
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-start flex-col gap-3">
                <h1 className="text-2xl font-bold">Community</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  {[
                    {
                      id: "live",
                      label: "Live Community",
                      icon: <IoExtensionPuzzle size={16} />,
                    },
                    {
                      id: "groups",
                      label: "My Groups",
                      icon: <FaPeopleGroup size={16} />,
                    },

                    {
                      id: "messages",
                      label: "Messages",
                      icon: <FaMessage size={16} />,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`h-10 rounded-full font-semibold flex items-center justify-center gap-2 px-4 shadow-md border transition-all text-sm ${
                        activeTab === tab.id
                          ? "bg-primaryColors-0 text-white border-primaryColors-0"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {tab.label} {tab.icon}
                    </button>
                  ))}
                  {/* Create Group Button */}
                  <button
                    onClick={showCreateGroup}
                    className="h-10 rounded-full font-semibold flex items-center justify-center gap-2 px-4 shadow-md border transition-all text-sm bg-green-500 text-white border-green-500 hover:bg-green-600"
                  >
                    <MdAdd size={16} /> New Group
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6">{tabContent}</div>
          </motion.div>
        ) : (
          <motion.div
            key="community-group"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <TutorCommunityGroup
              openEditGroup={() => {
                handleEditGroup(groupId);
              }}
              onDeleteGroup={() => deleteGroup(groupId)}
              groupId={groupId}
              backToMainPage={backToMainPage}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Group Sidebar */}
      <div
        className={`${showGroup ? "translate-x-0" : "translate-x-full"} transition-all duration-300 h-full w-full bg-secondaryColors-0/40 backdrop-blur-md fixed top-0 left-0 z-[60] overflow-hidden`}
      >
        <DashboardTutorCreateGroup
          groupId={groupId}
          onAddGroup={onAddGroup}
          onEditGroup={onEditGroup}
          cancel={backToMainPage}
        />
      </div>

      {/* Messages Modal */}
      <MessagesModal
        isOpen={showMessagesModal}
        onClose={() => setShowMessagesModal(false)}
      />
    </>
  );
}
