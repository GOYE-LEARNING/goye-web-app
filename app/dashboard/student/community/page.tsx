"use client";
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  lazy,
  Suspense,
  useRef,
  memo as reactMemo,
} from "react";
import { FaRegClock } from "react-icons/fa";
import { RiGroupLine } from "react-icons/ri";
import { MdAdd } from "react-icons/md";
import DashboardSearch from "@/app/component/dashboard_search";
import { formatDistanceToNow } from "date-fns";
import Loader from "@/app/component/loader";
import Image from "next/image";
import pic2 from "@/public/images/notfound.png";
import { IoMdRefresh } from "react-icons/io";
import StudentCommunityGroup from "@/app/component/dashboard_student_community_group";
import MessagesModal from "@/app/component/MessagesModal";
import { motion, AnimatePresence } from "framer-motion";
import { dispatchAPIError } from "@/app/hook/useAPIErrorHandler";
import { FaMessage, FaPeopleGroup } from "react-icons/fa6";
import { IoExtensionPuzzle } from "react-icons/io5";
import { useRouter, useSearchParams } from "next/navigation";

// Lazy load heavy components
const SocialMode = lazy(() => import("@/app/component/dashboard_social_feed"));

interface GroupData {
  id: string;
  group_title: string;
  group_short_description: string;
  group_description: string;
  group_image: string;
  createdBy: {
    first_name: string;
    last_name: string;
    user_pic: string;
  };
  _count: { member: number };
  hasJoined: boolean; // Now comes from API directly
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
  height: 16,
  width: 16,
  border_width: 2,
});

// Separate component for group card to isolate re-renders
const GroupCard = reactMemo(
  ({
    data,
    isJoining,
    onJoin,
    onClick,
    formatDate,
  }: {
    data: GroupData;
    isJoining: boolean;
    onJoin: (e: React.MouseEvent) => void;
    onClick: () => void;
    formatDate: (date: string) => string;
  }) => (
    <div
      className="cursor-pointer border border-[#ccc]/10 bg-white dark:bg-secondaryColors-0 py-4 px-4 rounded-xl my-3 transition-all hover:shadow-md"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <h1 className="font-bold text-[#41415A] dark:text-white text-lg line-clamp-1">
          {data.group_title}
        </h1>

        {!data.hasJoined ? (
          <button
            onClick={onJoin}
            disabled={isJoining}
            className="flex items-center gap-1 text-primaryColors-0 hover:text-primaryColors-600 transition-colors disabled:opacity-50"
          >
            {isJoining ? (
              <Loader {...getSmallLoaderProps()} />
            ) : (
              <>
                <MdAdd size={16} /> Join
              </>
            )}
          </button>
        ) : (
          <span className="bg-green-100 dark:bg-green-900/30 py-1 px-2 rounded-full text-xs font-semibold text-green-600 dark:text-green-400">
            Joined ✓
          </span>
        )}
      </div>

      <p className="text-[#71748C] dark:text-gray-400 text-sm my-1 line-clamp-2">
        {data.group_short_description}
      </p>

      <div className="flex items-center gap-4 text-[#71748C] text-xs">
        <span className="flex items-center gap-1">
          <RiGroupLine size={14} /> {data._count?.member || 0} members
        </span>
        <span className="flex items-center gap-1">
          <FaRegClock size={12} /> {formatDate(data.updatedAt || "")}
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
          {data.createdBy?.first_name || ""} {data.createdBy?.last_name || ""}
        </p>
      </div>
    </div>
  ),
);

export default function StudentCommunity() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [group, setGroup] = useState<GroupData[]>([]);
  const [groupId, setGroupId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("live");
  const [showCommunityGroup, setShowCommunityGroup] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [showCommunity, setShowCommunity] = useState(true);
  const [search, setSearch] = useState("");
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Lets a group card clicked elsewhere (e.g. the ShekiAI assistant panel)
  // deep-link straight to a specific group via
  // /dashboard/student/community?groupId=... — mirrors the same pattern
  // added to the course page for the same reason.
  useEffect(() => {
    const linkedGroupId = searchParams.get("groupId");
    if (!linkedGroupId) return;
    setActiveTab("groups");
    setShowCommunity(false);
    setShowCommunityGroup(true);
    setGroupId(linkedGroupId);
    router.replace("/dashboard/student/community");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Use refs to prevent unnecessary re-renders
  const isMounted = useRef(true);
  const initialFetchDone = useRef(false);

  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return "Invalid Date";
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Invalid Date";
    }
  }, []);

  // OPTIMIZED: Single fetch function - NO extra API calls
  const fetchGroups = useCallback(async () => {
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

      const data = await res.json();
      
      // The API already returns groups with hasJoined field!
      let groupsArray = Array.isArray(data?.data) 
        ? data.data 
        : Array.isArray(data) 
          ? data 
          : [];

      if (isMounted.current) {
        setGroup(groupsArray);
      }
      
      console.log(`✅ Loaded ${groupsArray.length} groups with join status from API`);
      
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [API_URL]);

  // Initial fetch only once
  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchGroups();
    }

    return () => {
      isMounted.current = false;
    };
  }, [fetchGroups]);

  // Handle join with optimistic update
  const handleJoin = useCallback(
    async (e: React.MouseEvent, groupItem: GroupData) => {
      e.stopPropagation();
      if (joiningId) return;

      setJoiningId(groupItem.id);

      // Optimistic update
      setGroup((prev) =>
        prev.map((g) =>
          g.id === groupItem.id
            ? { ...g, hasJoined: true, _count: { member: g._count.member + 1 } }
            : g,
        ),
      );

      try {
        const res = await fetch(
          `${API_URL}/api/socials/join-group/${groupItem.id}`,
          {
            method: "POST",
            credentials: "include",
          },
        );

        if (!res.ok) {
          // Rollback on error
          setGroup((prev) =>
            prev.map((g) =>
              g.id === groupItem.id
                ? {
                    ...g,
                    hasJoined: false,
                    _count: { member: Math.max(0, g._count.member - 1) },
                  }
                : g,
            ),
          );
        }
      } catch (error) {
        // Rollback on error
        setGroup((prev) =>
          prev.map((g) =>
            g.id === groupItem.id
              ? {
                  ...g,
                  hasJoined: false,
                  _count: { member: Math.max(0, g._count.member - 1) },
                }
              : g,
          ),
        );
      } finally {
        setJoiningId(null);
      }
    },
    [API_URL, joiningId],
  );

  // Memoized filtered groups
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return group;
    const searchLower = search.toLowerCase();
    return group.filter((g) =>
      g.group_title.toLowerCase().includes(searchLower),
    );
  }, [group, search]);

  // Memoized tab content
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
              Open your message inbox
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

    // Groups tab
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
          <button
            onClick={() => fetchGroups()}
            className="h-9 w-9 bg-primaryColors-0 rounded-full flex items-center justify-center cursor-pointer hover:bg-primaryColors-600 transition-colors flex-shrink-0"
            aria-label="Refresh groups"
          >
            <IoMdRefresh className="text-white" size={18} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader {...getLoaderProps()} />
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-20">
            <Image src={pic2} alt="No groups" height={100} width={100} />
            <h1 className="text-textSlightDark-0 font-semibold">
              No Groups Found
            </h1>
            <p className="text-textGrey-0">Join or Create a Group</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGroups.map((data) => (
              <GroupCard
                key={data.id}
                data={data}
                isJoining={joiningId === data.id}
                onJoin={(e) => handleJoin(e, data)}
                onClick={() => {
                  setShowCommunity(false);
                  setShowCommunityGroup(true);
                  setGroupId(data.id);
                }}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </>
    );
  }, [
    activeTab,
    search,
    isLoading,
    filteredGroups,
    joiningId,
    handleJoin,
    formatDate,
    fetchGroups,
  ]);

  return (
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

          {/* Header */}
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
                    label: "Groups",
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
          <StudentCommunityGroup
            backToMainPage={() => {
              setShowCommunity(true);
              setShowCommunityGroup(false);
              setGroupId("");
              // Refresh groups when coming back to update join status
              fetchGroups();
            }}
            groupId={groupId}
          />
        </motion.div>
      )}
      <MessagesModal
        isOpen={showMessagesModal}
        onClose={() => setShowMessagesModal(false)}
      />
    </AnimatePresence>
  );
}