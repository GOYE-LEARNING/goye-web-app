"use client";

import { BiLike } from "react-icons/bi";
import { CiClock2 } from "react-icons/ci";
import { FaPlus, FaRegCommentAlt } from "react-icons/fa";
import { FaReply } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import DashboardNewPost from "./dashboard_new_post";
import DashboardNewReply from "./dashboard_reply";
import Loader from "./loader";
import { MdOutlineThumbUp, MdThumbUp } from "react-icons/md";

interface Props {
  openPost: () => void;
  courseId: string;
}

interface User {
  first_name: string;
  last_name: string;
  user_pic: string;
  id?: string;
}

interface Post {
  id?: string;
  content: string;
  createdAt: string;
  title: string;
  user: User | null;
  _count: {
    likes: number;
    replies: number;
  };
}

interface Reply {
  id: string;
  content: string;
  createdAt: string;
  user: User;
  _count: {
    likes: number;
    children: number;
  };
  children?: Reply[];
  parentId?: string | null;
}

export default function DashboardCourseForums({ openPost, courseId }: Props) {
  const [showPost, setShowPost] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState("");
  const [selectedParentReplyId, setSelectedParentReplyId] = useState<
    string | undefined
  >(undefined);
  const [expandedPosts, setExpandedPosts] = useState<string[]>([]);
  const [expandedReplies, setExpandedReplies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState<{
    [key: string]: boolean;
  }>({});

  const [posts, setPosts] = useState<Post[]>([]);
  const [repliesByPostId, setRepliesByPostId] = useState<{
    [key: string]: Reply[];
  }>({});

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Invalid Date";
    }
  };

  const checkAndToggleLike = async (type: "post" | "reply", id: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const params = new URLSearchParams();

    if (type === "post") {
      params.append("postId", id);
    } else if (type === "reply") {
      params.append("replyId", id);
    }

    try {
      const res = await fetch(
        `${API_URL}/api/socials/check-like?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!res.ok) {
        console.log("Error checking like status");
        return;
      }

      const data = await res.json();
      const { liked } = data;

      if (liked) {
        await unlikeContent(type, id);
      } else {
        await likeContent(type, id);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const likeContent = async (type: "post" | "reply", id: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const endpoint =
      type === "post"
        ? `${API_URL}/api/socials/like-post/${id}`
        : `${API_URL}/api/socials/like-reply/${id}`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        console.log(`Error liking ${type}`);
        return;
      }

      if (type === "post") {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === id
              ? { ...p, _count: { ...p._count, likes: p._count.likes + 1 } }
              : p
          )
        );
      } else if (type === "reply") {
        updateReplyLikes(id, 1);
      }
    } catch (error) {
      console.error(`Error liking ${type}:`, error);
    }
  };

  const unlikeContent = async (type: "post" | "reply", id: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const endpoint =
      type === "post"
        ? `${API_URL}/api/socials/unlike-post/${id}`
        : `${API_URL}/api/socials/unlike-reply/${id}`;

    try {
      const res = await fetch(endpoint, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        console.log(`Error unliking ${type}`);
        return;
      }

      if (type === "post") {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  _count: { ...p._count, likes: Math.max(0, p._count.likes - 1) },
                }
              : p
          )
        );
      } else if (type === "reply") {
        updateReplyLikes(id, -1);
      }
    } catch (error) {
      console.error(`Error unliking ${type}:`, error);
    }
  };

  const updateReplyLikes = (replyId: string, change: number) => {
    const updateLikesInReplies = (replies: Reply[]): Reply[] => {
      return replies.map((reply) => {
        if (reply.id === replyId) {
          return {
            ...reply,
            _count: { ...reply._count, likes: Math.max(0, reply._count.likes + change) },
          };
        }
        if (reply.children && reply.children.length > 0) {
          return {
            ...reply,
            children: updateLikesInReplies(reply.children),
          };
        }
        return reply;
      });
    };

    setRepliesByPostId((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((postId) => {
        updated[postId] = updateLikesInReplies(updated[postId]);
      });
      return updated;
    });
  };

  // Fetch posts
  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    setIsLoading(true);

    const fetchPosts = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/socials/get-post-by-course/${courseId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await res.json();
        if (res.ok) {
          setPosts(data.data || []);
        } else {
          console.log("Error fetching posts");
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [courseId]);

  // Toggle first-level replies
  const toggleReplies = async (postId: string) => {
    if (!repliesByPostId[postId]) {
      setIsLoadingReplies((prev) => ({ ...prev, [postId]: true }));
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(
          `${API_URL}/api/socials/get-post-with-replies/${postId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await res.json();
        if (res.ok && data.data) {
          setRepliesByPostId((prev) => ({
            ...prev,
            [postId]: data.data.replies || [],
          }));
        } else {
          setRepliesByPostId((prev) => ({ ...prev, [postId]: [] }));
        }
      } catch (error) {
        console.error("Error fetching replies:", error);
        setRepliesByPostId((prev) => ({ ...prev, [postId]: [] }));
      } finally {
        setIsLoadingReplies((prev) => ({ ...prev, [postId]: false }));
      }
    }

    setExpandedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  // Toggle nested replies
  const toggleNestedReplies = async (replyId: string, currentReply: Reply) => {
    if (currentReply.children && currentReply.children.length > 0) {
      setExpandedReplies((prev) =>
        prev.includes(replyId)
          ? prev.filter((id) => id !== replyId)
          : [...prev, replyId]
      );
      return;
    }

    setIsLoadingReplies((prev) => ({ ...prev, [replyId]: true }));
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(
        `${API_URL}/api/socials/get-child-replies/${replyId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.ok && data.data) {
        const updateReplyWithChildren = (replies: Reply[]): Reply[] => {
          return replies.map((reply) => {
            if (reply.id === replyId) {
              return { ...reply, children: data.data };
            }
            if (reply.children && reply.children.length > 0) {
              return { ...reply, children: updateReplyWithChildren(reply.children) };
            }
            return reply;
          });
        };

        setRepliesByPostId((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((postId) => {
            updated[postId] = updateReplyWithChildren(updated[postId]);
          });
          return updated;
        });

        setExpandedReplies((prev) => [...prev, replyId]);
      }
    } catch (error) {
      console.error("Error fetching nested replies:", error);
    } finally {
      setIsLoadingReplies((prev) => ({ ...prev, [replyId]: false }));
    }
  };

  const handlePostUpdate = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleReplyUpdate = (newReply: Reply, parentReplyId?: string) => {
    if (parentReplyId && selectedPostId) {
      // Nested reply
      const addNestedReply = (replies: Reply[]): Reply[] => {
        return replies.map((reply) => {
          if (reply.id === parentReplyId) {
            return {
              ...reply,
              children: [newReply, ...(reply.children || [])],
              _count: { ...reply._count, children: (reply._count.children || 0) + 1 },
            };
          }
          if (reply.children && reply.children.length > 0) {
            return { ...reply, children: addNestedReply(reply.children) };
          }
          return reply;
        });
      };

      setRepliesByPostId((prev) => {
        const updated = { ...prev };
        if (selectedPostId) {
          updated[selectedPostId] = addNestedReply(updated[selectedPostId] || []);
        }
        return updated;
      });
    } else if (selectedPostId) {
      // Top-level reply
      setRepliesByPostId((prev) => ({
        ...prev,
        [selectedPostId]: [newReply, ...(prev[selectedPostId] || [])],
      }));
      
      setPosts((prev) =>
        prev.map((p) =>
          p.id === selectedPostId
            ? { ...p, _count: { ...p._count, replies: p._count.replies + 1 } }
            : p
        )
      );
    }
  };

  const openReplyModal = (postId: string, parentReplyId?: string) => {
    setSelectedPostId(postId);
    setSelectedParentReplyId(parentReplyId);
    setShowReply(true);
  };

  // Recursive nested replies component
  const NestedRepliesList = ({
    replies,
    depth = 0,
    currentPostId,
  }: {
    replies: Reply[];
    depth?: number;
    currentPostId: string;
  }) => {
    if (!replies || replies.length === 0) return null;

    return (
      <div className="relative">
        {replies.map((reply) => (
          <div key={reply.id} className="relative">
            {/* Vertical connector line */}
            {depth > 0 && (
              <div
                className="absolute left-[-24px] top-0 bottom-0 w-px bg-gray-200"
                style={{
                  height: "100%",
                  left: `${depth * -20 - 4}px`,
                }}
              />
            )}
            
            {/* Horizontal connector line */}
            {depth > 0 && (
              <div
                className="absolute w-4 h-px bg-gray-200"
                style={{
                  left: `${depth * -20 - 4}px`,
                  top: "28px",
                  width: "20px",
                }}
              />
            )}

            <div className="relative pl-6 py-3">
              <div className="flex gap-2 items-center">
                <div className="bg-[#EFEFF1] h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={reply.user?.user_pic || "/default-avatar.png"}
                    alt="user_pic"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col items-start flex-1">
                  <h1 className="text-[#41415A] text-sm font-semibold">
                    {reply.user?.last_name} {reply.user?.first_name}
                  </h1>
                  <p className="flex items-center gap-2 text-[#71748C] text-xs font-semibold">
                    <CiClock2 /> {formatDate(reply.createdAt)}
                  </p>
                </div>
              </div>

              <p className="text-[#71748C] text-sm mt-2 ml-10">{reply.content}</p>

              <div className="flex items-center gap-4 text-[#71748C] text-sm mt-2 ml-10">
                <span
                  className="flex items-center gap-1 cursor-pointer hover:text-primaryColors-0 transition-colors"
                  onClick={() => checkAndToggleLike("reply", reply.id)}
                >
                  <BiLike className="text-sm" /> {reply._count.likes}
                </span>

                {reply._count.children > 0 && (
                  <span
                    className="flex items-center gap-1 cursor-pointer hover:text-primaryColors-0 transition-colors"
                    onClick={() => toggleNestedReplies(reply.id, reply)}
                  >
                    <FaRegCommentAlt /> {reply._count.children}
                    {isLoadingReplies[reply.id] && (
                      <Loader
                        width={12}
                        height={12}
                        border_width={2}
                        full_border_color="transparent"
                        small_border_color="#49151B"
                      />
                    )}
                  </span>
                )}

                <span
                  className="flex items-center gap-1 cursor-pointer hover:text-primaryColors-0 transition-colors"
                  onClick={() => openReplyModal(currentPostId, reply.id)}
                >
                  Reply <FaReply className="text-xs" />
                </span>
              </div>

              {expandedReplies.includes(reply.id) && reply.children && (
                <div className="mt-2 ml-6">
                  <NestedRepliesList
                    replies={reply.children}
                    depth={depth + 1}
                    currentPostId={currentPostId}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="dashboard_hr my-5"></div>
      <div className="dashboard_content_mainbox">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-textSlightDark-0 font-bold text-[18px]">Course Forum</h1>
          <button
            className="flex items-center gap-2 text-primaryColors-0 text-[13px] font-[600] cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setShowPost(true)}
          >
            <FaPlus /> New Post
          </button>
        </div>

        <div className="my-5">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader
                width={30}
                height={30}
                border_width={3}
                full_border_color="transparent"
                small_border_color="#49151B"
              />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-2">No posts yet</p>
              <p className="text-gray-400 text-sm">
                Be the first to start a discussion!
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="mb-6 border-b border-gray-100 pb-4 last:border-0"
              >
                {/* Post Header */}
                <div className="flex gap-3 items-center mb-3">
                  <div className="bg-[#EFEFF1] h-[45px] w-[45px] rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={post.user?.user_pic || "/default-avatar.png"}
                      alt="user_pic"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <h1 className="text-[#41415A] text-[15px] font-[600]">
                      {post.user?.last_name} {post.user?.first_name}
                    </h1>
                    <p className="flex items-center gap-2 text-[#71748C] text-[12px] font-[500]">
                      <CiClock2 /> {formatDate(post.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Post Content */}
                <div className="ml-12">
                  <h2 className="text-[16px] font-[600] text-textSlightDark-0 mb-2">
                    {post.title}
                  </h2>
                  <p className="text-[#71748C] text-[14px] leading-relaxed mb-3">
                    {post.content}
                  </p>
                  
                  <div className="flex items-center gap-5 text-[#71748C] text-[14px]">
                    <span
                      className="flex items-center gap-1.5 cursor-pointer hover:text-primaryColors-0 transition-colors"
                      onClick={() => checkAndToggleLike("post", post.id as string)}
                    >
                      <MdOutlineThumbUp className="text-base" />
                      {post._count.likes}
                    </span>
                    <span
                      className="flex items-center gap-1.5 cursor-pointer hover:text-primaryColors-0 transition-colors"
                      onClick={() => toggleReplies(post.id as string)}
                    >
                      <FaRegCommentAlt />
                      {post._count.replies}
                      {isLoadingReplies[post.id as string] && (
                        <Loader
                          width={12}
                          height={12}
                          border_width={2}
                          full_border_color="transparent"
                          small_border_color="#49151B"
                        />
                      )}
                    </span>
                    <button
                      onClick={() => openReplyModal(post.id as string)}
                      className="flex items-center gap-1.5 hover:text-primaryColors-0 transition-colors"
                    >
                      Reply <FaReply className="text-xs" />
                    </button>
                  </div>
                </div>

                {/* Replies Section */}
                {expandedPosts.includes(post.id as string) && (
                  <div className="mt-5 ml-12 pl-4 border-l-2 border-gray-100">
                    {repliesByPostId[post.id as string]?.length > 0 ? (
                      <NestedRepliesList
                        replies={repliesByPostId[post.id as string]}
                        depth={0}
                        currentPostId={post.id as string}
                      />
                    ) : (
                      !isLoadingReplies[post.id as string] && (
                        <div className="text-center py-4 text-gray-400 text-sm">
                          No replies yet. Be the first to reply!
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Post Modal */}
      <div
        className={`fixed top-0 right-0 h-full bg-white w-[400px] transform transition-transform duration-300 ease-in-out z-50 shadow-2xl ${
          showPost ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <DashboardNewPost
          courseId={courseId}
          cancel={() => setShowPost(false)}
          openPosts={openPost}
        />
      </div>

      {/* Reply Modal */}
      <div
        className={`fixed top-0 right-0 h-full bg-white w-[400px] transform transition-transform duration-300 ease-in-out z-50 shadow-2xl ${
          showReply ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <DashboardNewReply
          postId={selectedPostId}
          parentReplyId={selectedParentReplyId}
          cancel={() => {
            setShowReply(false);
            setSelectedParentReplyId(undefined);
            setSelectedPostId("");
          }}
          onReplyUpdate={(newReply: Reply) => {
            handleReplyUpdate(newReply, selectedParentReplyId);
            setShowReply(false);
            setSelectedParentReplyId(undefined);
            setSelectedPostId("");
          }}
        />
      </div>
    </>
  );
}