"use client";

import { BiLike } from "react-icons/bi";
import { CiClock2 } from "react-icons/ci";
import { FaPlus, FaRegCommentAlt } from "react-icons/fa";
import { FaReply } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import DashboardTutorNewPost from "./dashboard_tutor_new_post";
import DashboardTutorReply from "./dashboard_tutor_reply";
import Loader from "./loader";

interface Props {
  openPost: () => void;
  courseId: string;
}

interface Post {
  id?: string;
  content: string;
  createdAt: string;
  title: string;
  user: {
    first_name: string;
    last_name: string;
    user_pic: string;
  } | null;
  _count: {
    likes: number;
    replies: number;
  };
}

interface Reply {
  id: string;
  content: string;
  createdAt: string;
  user: {
    first_name: string;
    last_name: string;
    user_pic: string;
  };
  _count: {
    likes: number;
    children: number; // number of nested replies
  };
  children?: Reply[]; // actual nested replies
}

export default function DashboardTutorTabForum({ openPost, courseId }: Props) {
  const [showPost, setShowPost] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [postId, setPostId] = useState("");
  const [replyId, setReplyId] = useState(""); // parent reply for nested replies

  const [expandedPosts, setExpandedPosts] = useState<string[]>([]);
  const [expandedReplies, setExpandedReplies] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingForReply, setIsLoadingForReply] = useState(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [repliesByPostId, setRepliesByPostId] = useState<{ [key: string]: Reply[] }>({});
  const [nestedRepliesByReplyId, setNestedRepliesByReplyId] = useState<{ [key: string]: Reply[] }>({});

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Invalid Date";
    }
  };

  // Fetch posts
  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    setIsLoading(true);

    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/socials/get-post-by-course/${courseId}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) setPosts(data.data || []);
        else console.log("Error fetching posts");
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [courseId]);

  // Handle new post
  const handlePostUpdate = (newPost: Post) => setPosts((prev) => [newPost, ...prev]);

  // Toggle first-level replies
  const toggleReplies = async (postId: string) => {
    setIsLoadingForReply(true);

    if (!repliesByPostId[postId]) {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${API_URL}/api/socials/get-post-with-replies/${postId}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          setRepliesByPostId((prev) => ({
            ...prev,
            [postId]: data.data?.replies || [],
          }));
        } else console.log("Failed to fetch replies");
      } catch (error) {
        console.error("Error fetching replies:", error);
      }
    }

    setIsLoadingForReply(false);

    setExpandedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  // Toggle nested replies
  const toggleNestedReplies = async (replyId: string) => {
    if (!nestedRepliesByReplyId[replyId]) {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${API_URL}/api/socials/get-replies-from-replies/${replyId}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          setNestedRepliesByReplyId((prev) => ({
            ...prev,
            [replyId]: data.data || [],
          }));
        } else console.log("Failed to fetch nested replies");
      } catch (error) {
        console.error("Error fetching nested replies:", error);
      }
    }

    setExpandedReplies((prev) =>
      prev.includes(replyId) ? prev.filter((id) => id !== replyId) : [...prev, replyId]
    );
  };

  // Handle new reply to post
  const handleReplyUpdate = (newReply: Reply) => {
    if (postId) {
      setRepliesByPostId((prev) => ({
        ...prev,
        [postId]: [newReply, ...(prev[postId] || [])],
      }));
    }
  };

  // Handle new nested reply
  const handleNestedReplyUpdate = (newNestedReply: Reply) => {
    if (replyId) {
      setNestedRepliesByReplyId((prev) => ({
        ...prev,
        [replyId]: [newNestedReply, ...(prev[replyId] || [])],
      }));
    }
  };

  // Recursive nested replies
  const NestedRepliesList = ({ replies, depth = 0 }: { replies: Reply[]; depth?: number }) => {
    if (!replies || replies.length === 0) return null;

    return (
      <div className={`${depth > 0 ? "border-l-2 border-gray-200 pl-4" : ""}`}>
        {replies.map((reply) => (
          <div key={reply.id} className="py-3">
            <div className="flex gap-2 items-center">
              <div className="bg-[#EFEFF1] h-8 w-8 rounded-full overflow-hidden">
                <img src={reply.user?.user_pic || "/default-avatar.png"} alt="user_pic" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col items-start">
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
              <span className="flex items-center gap-1">
                <BiLike /> {reply._count.likes}
              </span>

              {reply._count.children > 0 && (
                <span className="flex items-center gap-1 cursor-pointer" onClick={() => toggleNestedReplies(reply.id)}>
                  <FaRegCommentAlt /> {reply._count.children}
                </span>
              )}

              <span
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => {
                  setReplyId(reply.id);
                  setPostId(replyId ? postId : ""); // ensure postId is preserved
                  setShowReply(true);
                }}
              >
                Reply <FaReply />
              </span>
            </div>

            {expandedReplies.includes(reply.id) && reply.children && (
              <NestedRepliesList replies={reply.children} depth={depth + 1} />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="dashboard_hr my-5"></div>
      <div className="dashboard_content_mainbox">
        <div className="flex justify-between">
          <h1 className="text-[#1F2130] font-bold text-[18px]">Course Forum</h1>
          <span className="flex items-center gap-3 text-primaryColors-0 text-[13px] font-[600] cursor-pointer" onClick={() => setShowPost(true)}>
            <FaPlus /> New Post
          </span>
        </div>

        <div className="my-5">
          {isLoading ? (
            <div className="flex justify-center">
              <Loader width={20} height={20} border_width={3} full_border_color="transparent" small_border_color="#49151B" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No posts yet. Be the first to start a discussion!</div>
          ) : (
            posts.map((p) => (
              <div key={p.id} className={`relative ${expandedPosts.includes(p.id as string) ? "reply_hook" : ""}`}>
                {/* Post Header */}
                <div className="flex gap-2 items-center my-5">
                  <div className="bg-[#EFEFF1] h-[40px] w-[40px] rounded-full overflow-hidden">
                    <img src={p.user?.user_pic || "/default-avatar.png"} alt="user_pic" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col items-start">
                    <h1 className="text-[#41415A] text-[14px] font-[600]">
                      {p.user?.last_name} {p.user?.first_name}
                    </h1>
                    <p className="flex items-center gap-2 text-[#71748C] text-[13px] font-[600]">
                      <CiClock2 /> {formatDate(p.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Post Content */}
                <div className="flex flex-col gap-2">
                  <h1 className="text-[14px] font-[600] text-[#1F2130]">{p.title}</h1>
                  <p className="text-[#71748C] text-[14px]">{p.content}</p>
                  <p className="flex items-center gap-4 text-[#71748C] text-[14px]">
                    <span className="flex items-center gap-1">
                      <BiLike /> {p._count.likes}
                    </span>
                    <span className="flex items-center gap-1 cursor-pointer" onClick={() => toggleReplies(p.id as string)}>
                      <FaRegCommentAlt /> {p._count.replies}
                    </span>
                    <span
                      onClick={() => {
                        setShowReply(true);
                        setPostId(p.id as string);
                        setReplyId(""); // replying directly to post
                      }}
                      className="flex items-center gap-1 cursor-pointer"
                    >
                      Reply <FaReply />
                    </span>
                  </p>
                </div>

                {/* Replies */}
                {expandedPosts.includes(p.id as string) && (
                  <div className="pl-[3rem]">
                    {isLoadingForReply ? (
                      <div className="flex justify-center py-4">
                        <Loader width={20} height={20} border_width={3} full_border_color="transparent" small_border_color="#49151B" />
                      </div>
                    ) : (
                      (repliesByPostId[p.id as string] || []).map((r) => (
                        <div key={r.id} className="w-full pl-[1.3rem] py-[1.3rem] my-[2.3rem] border border-[#f5f1f1] rounded-[30px]">
                          <div className="flex gap-2 items-center">
                            <div className="bg-[#EFEFF1] h-[40px] w-[40px] rounded-full overflow-hidden">
                              <img src={r.user?.user_pic || "/default-avatar.png"} alt="user_pic" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col items-start">
                              <h1 className="text-[#41415A] text-[14px] font-[600]">{r.user?.last_name} {r.user?.first_name}</h1>
                              <p className="flex items-center gap-2 text-[#71748C] text-[13px] font-[600]"><CiClock2 /> {formatDate(r.createdAt)}</p>
                            </div>
                          </div>

                          <p className="text-[#71748C] text-[14px] my-3">{r.content}</p>

                          <p className="flex items-center gap-4 text-[#71748C] text-[14px]">
                            <span className="flex items-center gap-1"><BiLike /> {r._count.likes}</span>
                            <span className="flex items-center gap-1 cursor-pointer" onClick={() => toggleNestedReplies(r.id)}>
                              <FaRegCommentAlt /> {r._count.children}
                            </span>
                            <span
                              className="flex items-center gap-1 cursor-pointer"
                              onClick={() => {
                                setShowReply(true);
                                setReplyId(r.id); // ✅ set parent reply id for nested reply
                                setPostId(p.id as string);
                              }}
                            >
                              Reply <FaReply />
                            </span>
                          </p>

                          {expandedReplies.includes(r.id) && r.children && (
                            <div className="mt-4 ml-4">
                              <NestedRepliesList replies={r.children} />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                <div className="dashboard_hr my-3"></div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sidebar Panels */}
      <div className={`fixed top-0 right-0 h-full bg-white w-[390px] transform transition-transform duration-300 ease-in-out z-50 ${showPost ? "translate-x-0" : "translate-x-full"}`}>
        <DashboardTutorNewPost courseId={courseId} cancel={() => setShowPost(false)} onPostUpdate={handlePostUpdate} />
      </div>

      <div className={`fixed top-0 right-0 h-full bg-white w-[390px] transform transition-transform duration-300 ease-in-out z-50 ${showReply ? "translate-x-0" : "translate-x-full"}`}>
        <DashboardTutorReply
          postId={postId}
          parentReplyId={replyId || undefined} // ✅ pass parentReplyId for nested reply
          cancel={() => setShowReply(false)}
          onReplyUpdate={replyId ? handleNestedReplyUpdate : handleReplyUpdate}
        />
      </div>
    </>
  );
}
