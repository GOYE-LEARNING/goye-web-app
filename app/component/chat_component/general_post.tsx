// app/component/chat_component/general_post.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import pic1 from "@/public/images/pic1.png";
import { BsTypeH1, BsTypeH2, BsTypeH3 } from "react-icons/bs";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaListUl,
  FaListOl,
  FaImage,
  FaVideo,
  FaSpinner,
} from "react-icons/fa";
import { MdAdd, MdClose } from "react-icons/md";
import { AnimatePresence, motion } from "framer-motion";
import { Discussion, MediaFile } from "@/app/interface/discussion";
import DiscussionCard from "./discussion/discussion_card";
import { FaMessage, FaPen, FaRegCommentDots } from "react-icons/fa6";
interface Props {
  openPrivateMessages: () => void;
  triggerCreatePost?: boolean;
  onTriggerClose?: () => void;
}
export default function GeneralPost({
  openPrivateMessages,
  triggerCreatePost = false,
  onTriggerClose,
}: Props) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const selectionButtonRef = useRef<HTMLDivElement | null>(null);

  const [textArea, setTextArea] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [openSelections, setOpenSelections] = useState<boolean>(false);
  const [showPost, setShowPost] = useState(false);
  const [showPeoplePost, setShowPeoplePost] = useState(true);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userPic, setUserPic] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");

  // Per-discussion state
  const [commentText, setCommentText] = useState<{ [id: string]: string }>({});
  const [isLoadingReplies, setIsLoadingReplies] = useState<{
    [id: string]: boolean;
  }>({});
  const [showReplies, setShowReplies] = useState<{ [id: string]: boolean }>({});
  const [showNestedReplies, setShowNestedReplies] = useState<{
    [id: string]: boolean;
  }>({});
  const [nestedCommentText, setNestedCommentText] = useState<{
    [replyId: string]: string;
  }>({});
  const [replyingTo, setReplyingTo] = useState<{
    [discussionId: string]: { replyId: string; authorName: string };
  }>({});

  useEffect(() => {
    if (triggerCreatePost) {
      setShowPost(true);
      setShowPeoplePost(false);
      if (onTriggerClose) onTriggerClose();
    }
  }, [triggerCreatePost, onTriggerClose]);

  useEffect(() => {
    fetchProfile();
    fetchDiscussions();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/profile`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data?.user) {
        setUserPic(data.user.user_pic ?? "");
        setCurrentUserId(data.user.id ?? "");
        setUserName(`${data.user.first_name} ${data.user.last_name}`);
        setUserRole(data.user.role ?? "");
      }
    } catch {
      setUserPic("");
      setCurrentUserId("");
      setUserName("");
    }
  };

  const fetchDiscussions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/discussion/public`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      console.log(data);
      if (res.ok) setDiscussions(data.data?.discussions || data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== TEXT FORMATTING ====================
  const getSelectedText = () => {
    if (textAreaRef.current) {
      const start = textAreaRef.current.selectionStart;
      const end = textAreaRef.current.selectionEnd;
      const selected = textArea.substring(start, end);
      setSelectedText(selected);
      setSelectionStart(start);
      setSelectionEnd(end);
      return { start, end, selected };
    }
    return null;
  };

  const closeOutside = (e: MouseEvent) => {
    if (
      selectionButtonRef.current &&
      !selectionButtonRef.current.contains(e.target as Node)
    ) {
      setOpenSelections(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", closeOutside);
    return () => document.removeEventListener("mousedown", closeOutside);
  }, []);

  const applyFormatting = (
    formatType:
      | "bold"
      | "italic"
      | "underline"
      | "h1"
      | "h2"
      | "h3"
      | "ul"
      | "ol",
  ) => {
    if (!textAreaRef.current) return;

    const start = textAreaRef.current.selectionStart;
    const end = textAreaRef.current.selectionEnd;

    if (start === end) {
      let wrapText = "";
      switch (formatType) {
        case "bold":
          wrapText = "** **";
          break;
        case "italic":
          wrapText = "* *";
          break;
        case "underline":
          wrapText = "__ __";
          break;
        case "h1":
          wrapText = "# ";
          break;
        case "h2":
          wrapText = "## ";
          break;
        case "h3":
          wrapText = "### ";
          break;
        case "ul":
          wrapText = "- ";
          break;
        case "ol":
          wrapText = "1. ";
          break;
      }
      const newText = textArea.slice(0, start) + wrapText + textArea.slice(end);
      setTextArea(newText);
      setTimeout(() => {
        if (textAreaRef.current) {
          const newCursorPos = start + wrapText.length;
          textAreaRef.current.selectionStart = newCursorPos;
          textAreaRef.current.selectionEnd = newCursorPos;
          textAreaRef.current.focus();
        }
      }, 0);
      return;
    }

    const selected = textArea.substring(start, end);
    let formattedText = "";
    switch (formatType) {
      case "bold":
        formattedText = `**${selected}**`;
        break;
      case "italic":
        formattedText = `*${selected}*`;
        break;
      case "underline":
        formattedText = `__${selected}__`;
        break;
      case "h1":
        formattedText = `# ${selected}`;
        break;
      case "h2":
        formattedText = `## ${selected}`;
        break;
      case "h3":
        formattedText = `### ${selected}`;
        break;
      case "ul":
        formattedText = selected
          .split("\n")
          .map((line) => `- ${line}`)
          .join("\n");
        break;
      case "ol":
        formattedText = selected
          .split("\n")
          .map((line, idx) => `${idx + 1}. ${line}`)
          .join("\n");
        break;
    }
    const newText =
      textArea.slice(0, start) + formattedText + textArea.slice(end);
    setTextArea(newText);
    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.selectionStart = start;
        textAreaRef.current.selectionEnd = start + formattedText.length;
        textAreaRef.current.focus();
      }
    }, 0);
  };

  // ==================== MEDIA UPLOAD ====================
  const uploadFile = async (
    file: File,
    type: "image" | "video",
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = (reader.result as string).split(",")[1];
        try {
          const endpoint =
            type === "image"
              ? `${API_URL}/api/discussion/upload/image`
              : `${API_URL}/api/discussion/upload/video`;
          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              file: base64String,
              fileName: file.name,
              mimeType: file.type,
            }),
          });
          const data = await response.json();
          if (!response.ok) reject(new Error(data.message || "Upload failed"));
          else resolve(data.data?.url || data.url);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      const preview = URL.createObjectURL(file);
      const newMedia: MediaFile = {
        id: `${Date.now()}-${i}`,
        file,
        preview,
        type: "image",
        uploading: true,
        uploadProgress: 0,
      };
      setMediaFiles((prev) => [...prev, newMedia]);
      const progressInterval = setInterval(() => {
        setMediaFiles((prev) =>
          prev.map((m) =>
            m.id === newMedia.id && m.uploadProgress < 90
              ? { ...m, uploadProgress: m.uploadProgress + 10 }
              : m,
          ),
        );
      }, 200);
      try {
        const url = await uploadFile(file, "image");
        clearInterval(progressInterval);
        setMediaFiles((prev) =>
          prev.map((m) =>
            m.id === newMedia.id
              ? {
                  ...m,
                  uploading: false,
                  uploadProgress: 100,
                  uploadedUrl: url,
                }
              : m,
          ),
        );
      } catch (error) {
        console.error(error);
        clearInterval(progressInterval);
        setMediaFiles((prev) => prev.filter((m) => m.id !== newMedia.id));
        alert("Failed to upload image");
      }
    }
  };

  const handleVideoUpload = async (files: FileList | null) => {
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("video/")) continue;
      const preview = URL.createObjectURL(file);
      const newMedia: MediaFile = {
        id: `${Date.now()}-${i}`,
        file,
        preview,
        type: "video",
        uploading: true,
        uploadProgress: 0,
      };
      setMediaFiles((prev) => [...prev, newMedia]);
      const progressInterval = setInterval(() => {
        setMediaFiles((prev) =>
          prev.map((m) =>
            m.id === newMedia.id && m.uploadProgress < 90
              ? { ...m, uploadProgress: m.uploadProgress + 5 }
              : m,
          ),
        );
      }, 300);
      try {
        const url = await uploadFile(file, "video");
        clearInterval(progressInterval);
        setMediaFiles((prev) =>
          prev.map((m) =>
            m.id === newMedia.id
              ? {
                  ...m,
                  uploading: false,
                  uploadProgress: 100,
                  uploadedUrl: url,
                }
              : m,
          ),
        );
      } catch (error) {
        console.error(error);
        clearInterval(progressInterval);
        setMediaFiles((prev) => prev.filter((m) => m.id !== newMedia.id));
        alert("Failed to upload video");
      }
    }
  };

  const removeMedia = (id: string) => {
    const mediaToRemove = mediaFiles.find((m) => m.id === id);
    if (mediaToRemove) URL.revokeObjectURL(mediaToRemove.preview);
    setMediaFiles((prev) => prev.filter((m) => m.id !== id));
  };

  const createPost = async () => {
    if (!textArea.trim() && mediaFiles.length === 0) {
      alert("Please add some content");
      return;
    }
    setIsSubmitting(true);
    const mediaUrls = mediaFiles
      .filter((m) => m.uploadedUrl)
      .map((m) => ({
        type: m.type,
        url: m.uploadedUrl,
        filename: m.file.name,
      }));
    try {
      const response = await fetch(`${API_URL}/api/discussion/public`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: textArea, isPublic: true, mediaUrls }),
      });
      const data = await response.json();
      if (response.ok && data.success !== false) {
        setTextArea("");
        setMediaFiles([]);
        setShowPost(false);
        setShowPeoplePost(true);
        await fetchDiscussions();
      } else {
        alert(data.message || "Failed to create post");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== DISCUSSION HANDLERS ====================
  const fetchDiscussionWithReplies = async (discussionId: string) => {
    setIsLoadingReplies((prev) => ({ ...prev, [discussionId]: true }));
    try {
      const res = await fetch(
        `${API_URL}/api/discussion/public/${discussionId}/comments?page=1&limit=50`,
        { method: "GET", credentials: "include" },
      );
      const data = await res.json();
      if (res.ok) {
        setDiscussions((prev) =>
          prev.map((d) =>
            d.id === discussionId
              ? { ...d, replies: data.data.comments || [] }
              : d,
          ),
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingReplies((prev) => ({ ...prev, [discussionId]: false }));
    }
  };

  const toggleLike = async (discussionId: string) => {
    try {
      const res = await fetch(
        `${API_URL}/api/discussion/${discussionId}/like`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (res.ok) {
        setDiscussions((prev) =>
          prev.map((d) =>
            d.id === discussionId
              ? {
                  ...d,
                  _count: { ...d._count, likes: data.data.likeCount },
                  liked: data.data.liked,
                }
              : d,
          ),
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleReplies = (discussionId: string) => {
    const isOpen = !showReplies[discussionId];
    setShowReplies((prev) => ({ ...prev, [discussionId]: isOpen }));
    if (isOpen) fetchDiscussionWithReplies(discussionId);
  };

  const submitComment = async (discussionId: string) => {
    const content = commentText[discussionId]?.trim();
    if (!content) return;
    try {
      const res = await fetch(
        `${API_URL}/api/discussion/public/${discussionId}/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content, mediaUrls: [] }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        setCommentText((prev) => ({ ...prev, [discussionId]: "" }));
        setDiscussions((prev) =>
          prev.map((d) =>
            d.id === discussionId
              ? {
                  ...d,
                  _count: {
                    ...d._count,
                    replies: (d._count?.replies || 0) + 1,
                  },
                }
              : d,
          ),
        );
        if (showReplies[discussionId]) fetchDiscussionWithReplies(discussionId);
      } else {
        alert(data.message || "Failed to add comment");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const showReplyInput = (
    discussionId: string,
    replyId: string,
    authorName: string,
  ) => {
    setReplyingTo((prev) => ({
      ...prev,
      [discussionId]: { replyId, authorName },
    }));
    setTimeout(
      () => document.getElementById(`reply-input-${replyId}`)?.focus(),
      100,
    );
  };

  const cancelReply = (discussionId: string) => {
    setReplyingTo((prev) => {
      const s = { ...prev };
      delete s[discussionId];
      return s;
    });
  };

  const handleNestedTextChange = (discussionId: string, value: string) => {
    const replyId = replyingTo[discussionId]?.replyId;
    if (replyId)
      setNestedCommentText((prev) => ({ ...prev, [replyId]: value }));
  };

  const submitNestedReply = async (
    discussionId: string,
    parentReplyId: string,
  ) => {
    const content = nestedCommentText[parentReplyId]?.trim();
    if (!content) return;
    try {
      const res = await fetch(
        `${API_URL}/api/discussion/reply/${parentReplyId}/nested`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content, mediaUrls: [] }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        setNestedCommentText((prev) => {
          const s = { ...prev };
          delete s[parentReplyId];
          return s;
        });
        cancelReply(discussionId);
        fetchDiscussionWithReplies(discussionId);
      } else {
        alert(data.message || "Failed to add reply");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleReplyLike = async (discussionId: string, replyId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/discussion/${replyId}/like`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setDiscussions((prev) =>
          prev.map((d) =>
            d.id === discussionId
              ? {
                  ...d,
                  replies: d.replies?.map((r) =>
                    r.id === replyId
                      ? {
                          ...r,
                          _count: { ...r._count, likes: data.data.likeCount },
                          liked: data.data.liked,
                        }
                      : r,
                  ),
                }
              : d,
          ),
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleNestedReplyLike = async (
    discussionId: string,
    replyId: string,
    parentReplyId: string,
  ) => {
    try {
      const res = await fetch(`${API_URL}/api/discussion/${replyId}/like`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setDiscussions((prev) =>
          prev.map((d) =>
            d.id === discussionId
              ? {
                  ...d,
                  replies: d.replies?.map((r) =>
                    r.id === parentReplyId
                      ? {
                          ...r,
                          replies: r.replies?.map((nr) =>
                            nr.id === replyId
                              ? {
                                  ...nr,
                                  _count: {
                                    ...nr._count,
                                    likes: data.data.likeCount,
                                  },
                                  liked: data.data.liked,
                                }
                              : nr,
                          ),
                        }
                      : r,
                  ),
                }
              : d,
          ),
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleNestedReplies = (replyId: string) => {
    setShowNestedReplies((prev) => ({ ...prev, [replyId]: !prev[replyId] }));
  };

  const renderFormattedText = (text: string) => {
    if (!text) return null;
    return text.split("\n").map((line, i) => {
      if (line.startsWith("# "))
        return (
          <h1 key={i} className="text-[18px] font-bold my-2 break-words">
            {line.slice(2)}
          </h1>
        );
      if (line.startsWith("## "))
        return (
          <h2 key={i} className="text-[15px] font-bold my-2 break-words">
            {line.slice(3)}
          </h2>
        );
      if (line.startsWith("### "))
        return (
          <h3 key={i} className="text-[12px] font-bold my-2 break-words">
            {line.slice(4)}
          </h3>
        );
      if (line.startsWith("- "))
        return (
          <li key={i} className="ml-4 list-disc break-words text-[13px]">
            {line.slice(2)}
          </li>
        );
      if (/^\d+\. /.test(line))
        return (
          <li key={i} className="ml-4 list-decimal break-words text-[13px]">
            {line.replace(/^\d+\. /, "")}
          </li>
        );
      const formatted = line
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/__(.*?)__/g, "<u>$1</u>");
      return (
        <span
          key={i}
          dangerouslySetInnerHTML={{ __html: formatted }}
          className="my-1 break-words text-[13px] text-textSlightDark-0 block"
        />
      );
    });
  };

  // In general_post.tsx, add these functions:

  // Edit post
  const handleEditPost = async (discussionId: string) => {
    const currentPost = discussions.find((d) => d.id === discussionId);
    if (!currentPost) return;

    // Prompt user for new content
    const newContent = prompt("Edit your post:", currentPost.content);
    if (!newContent || newContent === currentPost.content) return;

    try {
      const response = await fetch(
        `${API_URL}/api/discussion/${discussionId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            content: newContent,
            mediaUrls: currentPost.mediaUrls,
          }),
        },
      );

      const data = await response.json();

      if (response.ok && data.success !== false) {
        // Update local state
        setDiscussions((prev) =>
          prev.map((d) =>
            d.id === discussionId
              ? { ...d, content: newContent, isEdited: true }
              : d,
          ),
        );
        alert("Post updated successfully!");
      } else {
        alert(data.message || "Failed to update post");
      }
    } catch (error) {
      console.error("Error editing post:", error);
      alert("An error occurred while editing the post");
    }
  };

  // Delete post
  const handleDeletePost = async (discussionId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/discussion/${discussionId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (response.ok && data.success !== false) {
        // Remove from local state
        setDiscussions((prev) => prev.filter((d) => d.id !== discussionId));
        alert("Post deleted successfully!");
      } else {
        alert(data.message || "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("An error occurred while deleting the post");
    }
  };

  const slideVariants = {
    initial: { x: 50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  
  const buttonStyle =
    "drop-shadow-2xl py-2 md:py-1 px-4  flex justify-between items-center gap-2 rounded-full";

  return (
    <div className="flex flex-col h-full w-full">
      <div className="w-full flex-1 overflow-y-auto scrollbar2">
        <div className="flex items-center gap-4  my-4 md:my-2">
          <button className={`${buttonStyle} bg-primaryColors-0`}>
            <p>Latest</p>{" "}
            <div className="h-5 w-5 bg-white rounded-full text-primaryColors-0 flex justify-center items-center">
              3
            </div>
          </button>
          <button
            className={`${buttonStyle} bg-secondaryColors-0/50 backdrop-blur-md border border-[#ccc]/10`}
          >
            <p>Popular</p>{" "}
            <div className="h-5 w-5 bg-white rounded-full text-black flex justify-center items-center">
              3
            </div>
          </button>
        </div>
        <AnimatePresence mode="wait">
          {showPost && (
            <motion.div
              key="create-post"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="rounded-[20px] w-full py-[15px] mb-10 mt-5"
            >
              {/* CREATE POST UI */}
              <div className="bg-shadyColor-0/60 backdrop-blur-md border border-white/10 rounded-[20px] p-5 shadow-sm mt-[5.5rem] md:mt-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-[45px] w-[45px] rounded-full overflow-hidden bg-gray-200">
                      {userPic ? (
                        <img
                          src={userPic}
                          alt="profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-primaryColors-0 text-white font-bold">
                          {userName.charAt(0) || "U"}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-textSlightDark-0">
                        {userName || "User"}
                      </h3>
                      <p className="text-xs text-gray-400 capitalize">
                        {userRole || "Student"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowPost(false);
                      setShowPeoplePost(true);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <MdClose size={20} />
                  </button>
                </div>

                {/* Text Editor */}
                <textarea
                  ref={textAreaRef}
                  placeholder="What's on your mind?"
                  className="w-full min-h-[120px] border-none outline-none resize-none text-textSlightDark-0 text-sm bg-transparent"
                  value={textArea}
                  onChange={(e) => setTextArea(e.target.value)}
                  onMouseUp={getSelectedText}
                  onKeyUp={getSelectedText}
                />

                {/* Media Preview */}
                {mediaFiles.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {mediaFiles.map((media) => (
                      <div key={media.id} className="relative group">
                        {media.type === "image" ? (
                          <img
                            src={media.preview}
                            alt="preview"
                            className="h-24 w-full object-cover rounded-lg"
                          />
                        ) : (
                          <video
                            src={media.preview}
                            className="h-24 w-full object-cover rounded-lg"
                          />
                        )}
                        {media.uploading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                            <FaSpinner className="animate-spin text-white" />
                          </div>
                        )}
                        <button
                          onClick={() => removeMedia(media.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <MdClose size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Formatting Toolbar */}
                <div className="flex items-center gap-2 flex-wrap border-t border-t-[#ccc]/10 pt-3 mt-3">
                  <button
                    onClick={() => applyFormatting("bold")}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Bold"
                  >
                    <FaBold className="text-white" />
                  </button>
                  <button
                    onClick={() => applyFormatting("italic")}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Italic"
                  >
                    <FaItalic className="text-white" />
                  </button>
                  <button
                    onClick={() => applyFormatting("underline")}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Underline"
                  >
                    <FaUnderline className="text-white" />
                  </button>
                  <div className="w-px h-6 bg-gray-300" />
                  <button
                    onClick={() => applyFormatting("h1")}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Heading 1"
                  >
                    <BsTypeH1 className="text-white" />
                  </button>
                  <button
                    onClick={() => applyFormatting("h2")}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Heading 2"
                  >
                    <BsTypeH2 className="text-white" />
                  </button>
                  <button
                    onClick={() => applyFormatting("h3")}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Heading 3"
                  >
                    <BsTypeH3 className="text-white" />
                  </button>
                  <div className="w-px h-6 bg-gray-300" />
                  <button
                    onClick={() => applyFormatting("ul")}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Bullet List"
                  >
                    <FaListUl className="text-white" />
                  </button>
                  <button
                    onClick={() => applyFormatting("ol")}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Numbered List"
                  >
                    <FaListOl className="text-white" />
                  </button>
                  <div className="w-px h-6 bg-gray-300" />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files)}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Upload Image"
                  >
                    <FaImage className="text-white" />
                  </button>
                  <input
                    type="file"
                    ref={videoInputRef}
                    accept="video/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleVideoUpload(e.target.files)}
                  />
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Upload Video"
                  >
                    <FaVideo className="text-white" />
                  </button>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={createPost}
                    disabled={
                      isSubmitting ||
                      (!textArea.trim() && mediaFiles.length === 0)
                    }
                    className="px-6 py-2 bg-primaryColors-0 text-white rounded-full text-sm font-medium disabled:opacity-50 hover:bg-primaryColors-0/90 transition"
                  >
                    {isSubmitting ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      "Post"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {showPeoplePost && (
            <motion.div
              key="show-post"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-3 z-10"
            >
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <FaSpinner className="animate-spin text-2xl text-primaryColors-0" />
                </div>
              ) : discussions.length === 0 ? (
                <div className="text-center py-12 text-textGrey-0">
                  No discussions yet. Be the first to post!
                </div>
              ) : (
                discussions.map((discussion) => (
                  <DiscussionCard
                    key={discussion.id}
                    discussion={discussion}
                    userPic={userPic}
                    commentText={commentText[discussion.id] || ""}
                    isLoadingReplies={!!isLoadingReplies[discussion.id]}
                    showReplies={!!showReplies[discussion.id]}
                    replyingTo={replyingTo[discussion.id] || null}
                    nestedCommentText={nestedCommentText}
                    showNestedReplies={showNestedReplies}
                    onToggleLike={toggleLike}
                    onToggleReplies={toggleReplies}
                    onCommentChange={(id, val) =>
                      setCommentText((prev) => ({ ...prev, [id]: val }))
                    }
                    onSubmitComment={submitComment}
                    onToggleReplyLike={toggleReplyLike}
                    onToggleNestedReplyLike={toggleNestedReplyLike}
                    onShowReplyInput={showReplyInput}
                    onCancelReply={cancelReply}
                    onNestedTextChange={handleNestedTextChange}
                    onSubmitNestedReply={submitNestedReply}
                    onToggleNestedReplies={toggleNestedReplies}
                    renderFormattedText={renderFormattedText}
                    currentUserId={currentUserId}
                    onDelete={handleDeletePost}
                    onEdit={handleEditPost}
                  />
                ))
              )}
              <div className="h-[40px] w-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
