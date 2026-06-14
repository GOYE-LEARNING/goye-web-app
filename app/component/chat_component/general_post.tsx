// app/component/chat_component/general_post.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
  FaHeart,
  FaStar,
  FaAngleDown,
  FaFire,
  FaChartLine,
  FaRegNewspaper,
  FaClipboardList,
  FaSync,
} from "react-icons/fa";
import { MdAdd, MdClose } from "react-icons/md";
import { AnimatePresence, motion } from "framer-motion";
import { Discussion, MediaFile } from "@/app/interface/discussion";
import DiscussionCard from "./discussion/discussion_card";
import { FaBookBible, FaMessage, FaPen, FaRegCommentDots } from "react-icons/fa6";
import { GiPrayerBeads, GiPearlNecklace } from "react-icons/gi";
import Portal from "@/app/component/Portal";

interface Props {
  openPrivateMessages: () => void;
  triggerCreatePost?: boolean;
  onTriggerClose?: () => void;
}

// Post Categories for creating posts (IDs are uppercase to match backend enum)
const postCategories = [
  { id: "DISCUSSION", label: "General Discussion", icon: <FaMessage />, color: "from-gray-500 to-gray-600", bgColor: "bg-gray-500/10", textColor: "text-gray-500", emoji: "💬" },
  { id: "DEVOTION", label: "Daily Devotion", icon: <FaBookBible />, color: "from-purple-500 to-pink-500", bgColor: "bg-purple-500/10", textColor: "text-purple-500", emoji: "📖" },
  { id: "BLESSING", label: "Blessings", icon: <GiPearlNecklace />, color: "from-emerald-500 to-teal-500", bgColor: "bg-emerald-500/10", textColor: "text-emerald-500", emoji: "💎" },
  { id: "PRAYER", label: "Prayer Request", icon: <GiPrayerBeads />, color: "from-blue-500 to-cyan-500", bgColor: "bg-blue-500/10", textColor: "text-blue-500", emoji: "🙏" },
  { id: "TESTIMONY", label: "Testimony", icon: <FaHeart />, color: "from-rose-500 to-pink-500", bgColor: "bg-rose-500/10", textColor: "text-rose-500", emoji: "✨" },
  { id: "QUESTION", label: "Faith Questions", icon: <FaStar />, color: "from-amber-500 to-orange-500", bgColor: "bg-amber-500/10", textColor: "text-amber-500", emoji: "❓" },
];

// Filter tabs for viewing posts
const filterTabs = [
  { id: "ALL", label: "All", icon: <FaClipboardList />, color: "from-gray-400 to-gray-500" },
  { id: "latest", label: "Latest Post", icon: <FaFire />, color: "from-orange-500 to-red-500" },
  { id: "POST", label: "Post", icon: <FaRegNewspaper />, color: "from-gray-500 to-gray-600" },
  { id: "popular", label: "Popular", icon: <FaStar />, color: "from-amber-500 to-yellow-500" },
  { id: "trending", label: "Trending", icon: <FaChartLine />, color: "from-emerald-500 to-teal-500" },
  { id: "DEVOTION", label: "Devotion", icon: <FaBookBible />, color: "from-purple-500 to-pink-500" },
  { id: "QUESTION", label: "Faith Questions", icon: <FaStar />, color: "from-amber-500 to-orange-500" },
  { id: "PRAYER", label: "Prayers", icon: <GiPrayerBeads />, color: "from-blue-500 to-cyan-500" },
  { id: "BLESSING", label: "Blessings", icon: <GiPearlNecklace />, color: "from-rose-500 to-pink-500" },
];

// Simple Markdown Helper Functions
const applyFormatting = (text: string, selectedText: string, format: string): string => {
  if (!selectedText) {
    switch (format) {
      case "bold": return text + "**bold**";
      case "italic": return text + "*italic*";
      case "underline": return text + "__underline__";
      case "h1": return text + "\n# Heading 1\n";
      case "h2": return text + "\n## Heading 2\n";
      case "h3": return text + "\n### Heading 3\n";
      case "ul": return text + "\n- List item\n";
      case "ol": return text + "\n1. List item\n";
      default: return text;
    }
  }
  
  switch (format) {
    case "bold": return text.replace(selectedText, `**${selectedText}**`);
    case "italic": return text.replace(selectedText, `*${selectedText}*`);
    case "underline": return text.replace(selectedText, `__${selectedText}__`);
    case "h1": return text.replace(selectedText, `# ${selectedText}`);
    case "h2": return text.replace(selectedText, `## ${selectedText}`);
    case "h3": return text.replace(selectedText, `### ${selectedText}`);
    case "ul": return text.replace(selectedText, selectedText.split("\n").map(line => `- ${line}`).join("\n"));
    case "ol": return text.replace(selectedText, selectedText.split("\n").map((line, idx) => `${idx + 1}. ${line}`).join("\n"));
    default: return text;
  }
};

// Create Post Modal Component
const CreatePostModal = ({
  isOpen,
  onClose,
  onSubmit,
  userPic,
  userName,
  userRole,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { content: string; category: string; mediaFiles: MediaFile[] }) => void;
  userPic: string;
  userName: string;
  userRole: string;
  isSubmitting: boolean;
}) => {
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("DISCUSSION");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [selectedText, setSelectedText] = useState("");
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setContent("");
      setMediaFiles([]);
      setSelectedCategory("DISCUSSION");
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Close category dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getSelectedText = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const selected = content.substring(start, end);
      setSelectedText(selected);
      setSelectionStart(start);
      setSelectionEnd(end);
    }
  };

  const handleFormat = (format: string) => {
    if (!textareaRef.current) return;
    
    const newContent = applyFormatting(content, selectedText, format);
    setContent(newContent);
    
    // Focus back on textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      const newCursorPos = selectionStart + (newContent.length - content.length);
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const selectedCategoryInfo = postCategories.find(c => c.id === selectedCategory) || postCategories[0];

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    const allowedVideoCats = ["TESTIMONY", "DISCUSSION", "DEVOTION"];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      if (!isImage && !isVideo) continue;
      if (isVideo && !allowedVideoCats.includes(selectedCategory)) {
        alert("You can only upload videos for Post, Devotion, or Testimony categories.");
        continue;
      }
      const preview = URL.createObjectURL(file);
      const newMedia: MediaFile = {
        id: `${Date.now()}-${i}`,
        file,
        preview,
        type: isVideo ? "video" : "image",
        uploading: false,
        uploadProgress: 100,
        uploadedUrl: preview,
      };
      setMediaFiles((prev) => [...prev, newMedia]);
    }
  };

  const removeMedia = (id: string) => {
    const mediaToRemove = mediaFiles.find((m) => m.id === id);
    if (mediaToRemove) URL.revokeObjectURL(mediaToRemove.preview);
    setMediaFiles((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = () => {
    if (!content.trim() && mediaFiles.length === 0) {
      alert("Please add some content");
      return;
    }
    onSubmit({ content, category: selectedCategory, mediaFiles });
  };

  // Preview formatted content
  const renderPreview = (text: string) => {
    if (!text) return null;
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/__(.*?)__/g, "<u>$1</u>")
      .replace(/^# (.*?)$/gm, "<h1 class='text-2xl font-bold my-2'>$1</h1>")
      .replace(/^## (.*?)$/gm, "<h2 class='text-xl font-bold my-2'>$1</h2>")
      .replace(/^### (.*?)$/gm, "<h3 class='text-lg font-bold my-2'>$1</h3>")
      .replace(/^- (.*?)$/gm, "<li class='ml-4 list-disc'>$1</li>")
      .replace(/^\d+\. (.*?)$/gm, "<li class='ml-4 list-decimal'>$1</li>");
    
    return <div dangerouslySetInnerHTML={{ __html: formatted }} className="prose prose-sm max-w-none" />;
  };

  if (!isOpen) return null;

  return (
    <Portal containerId="create-post-modal-root">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative md:w-full md:max-w-3xl md:max-h-[90vh] h-full w-full overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-900 rounded-t-2xl">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Create Post</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <MdClose size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* User Info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                {userPic ? (
                  <img src={userPic} alt="profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primaryColors-0 text-white font-bold">
                    {userName?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">{userName || "User"}</p>
                <p className="text-xs text-gray-500 capitalize">{userRole || "Christian"}</p>
              </div>
            </div>

            {/* Category Selector */}
            <div className="mb-4" ref={categoryDropdownRef}>
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                  ${selectedCategoryInfo.bgColor} ${selectedCategoryInfo.textColor} border border-current/20`}
              >
                <span className="text-base">{selectedCategoryInfo.emoji}</span>
                <span>{selectedCategoryInfo.label}</span>
                <FaAngleDown className={`text-sm transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute z-20 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden w-48">
                  {postCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setShowCategoryDropdown(false);
                      }}
                      className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                        ${selectedCategory === category.id ? category.bgColor : ''}`}
                    >
                      <span className="text-base">{category.emoji}</span>
                      <span className={selectedCategory === category.id ? category.textColor : 'text-gray-700 dark:text-gray-300'}>
                        {category.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Formatting Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 mb-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <button
                type="button"
                onClick={() => handleFormat('bold')}
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Bold"
              >
                <FaBold className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                type="button"
                onClick={() => handleFormat('italic')}
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Italic"
              >
                <FaItalic className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                type="button"
                onClick={() => handleFormat('underline')}
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Underline"
              >
                <FaUnderline className="text-gray-600 dark:text-gray-400" />
              </button>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
              <button
                type="button"
                onClick={() => handleFormat('h1')}
                className="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-bold"
                title="Heading 1"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => handleFormat('h2')}
                className="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-semibold"
                title="Heading 2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => handleFormat('h3')}
                className="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                title="Heading 3"
              >
                H3
              </button>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
              <button
                type="button"
                onClick={() => handleFormat('ul')}
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Bullet List"
              >
                <FaListUl className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                type="button"
                onClick={() => handleFormat('ol')}
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Numbered List"
              >
                <FaListOl className="text-gray-600 dark:text-gray-400" />
              </button>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files)}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Upload Image or Video"
              >
                <FaImage className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Text Editor */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onMouseUp={getSelectedText}
              onKeyUp={getSelectedText}
              onSelect={getSelectedText}
              placeholder={`Share your ${selectedCategoryInfo.label.toLowerCase()}...`}
              className="w-full min-h-[200px] p-3 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primaryColors-0 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              autoFocus
            />

            {/* Live Preview */}
            {content.trim() && (
              <div className="mt-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Preview:</p>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {renderPreview(content)}
                </div>
              </div>
            )}

            {/* Media Preview */}
            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {mediaFiles.map((media) => (
                  <div key={media.id} className="relative group">
                    {media.type === "video" ? (
                      <video src={media.preview} controls className="h-24 w-full object-cover rounded-lg" />
                    ) : (
                      <img src={media.preview} alt="preview" className="h-24 w-full object-cover rounded-lg" />
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
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex justify-end p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-900 rounded-b-2xl">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (!content.trim() && mediaFiles.length === 0)}
              className="px-6 py-2 bg-primaryColors-0 text-white rounded-full text-sm font-medium disabled:opacity-50 hover:bg-primaryColors-0/90 transition"
            >
              {isSubmitting ? <FaSpinner className="animate-spin" /> : "Post"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </Portal>
  );
};

export default function GeneralPost({
  openPrivateMessages,
  triggerCreatePost = false,
  onTriggerClose,
}: Props) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const selectionButtonRef = useRef<HTMLDivElement | null>(null);

  const [showPost, setShowPost] = useState(false);
  const [showPeoplePost, setShowPeoplePost] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userPic, setUserPic] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [openSelections, setOpenSelections] = useState<boolean>(false);
  
  // Filter state for viewing posts
  const [activeFilter, setActiveFilter] = useState("latest");

  // Per-discussion state
  const [commentText, setCommentText] = useState<{ [id: string]: string }>({});
  const [isLoadingReplies, setIsLoadingReplies] = useState<{ [id: string]: boolean }>({});
  const [showReplies, setShowReplies] = useState<{ [id: string]: boolean }>({});
  const [showNestedReplies, setShowNestedReplies] = useState<{ [id: string]: boolean }>({});
  const [nestedCommentText, setNestedCommentText] = useState<{ [replyId: string]: string }>({});
  const [replyingTo, setReplyingTo] = useState<{ [discussionId: string]: { replyId: string; authorName: string } }>({});

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

  const fetchDiscussions = async (showRefreshAnimation = false) => {
    if (showRefreshAnimation) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const res = await fetch(`${API_URL}/api/discussion/public`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) setDiscussions(data.data?.discussions || data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Handle refresh with animation
  const handleRefresh = async () => {
    await fetchDiscussions(true);
  };

  // Filter discussions based on active filter
  const getFilteredDiscussions = () => {
    if (!discussions.length) return [];
    
    switch (activeFilter) {
      case "latest":
        return [...discussions].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "popular":
        return [...discussions].sort((a, b) => 
          (b._count?.likes || 0) - (a._count?.likes || 0)
        );
      case "trending":
        return [...discussions].sort((a, b) => {
          const aEngagement = (a._count?.likes || 0) + (a._count?.replies || 0);
          const bEngagement = (b._count?.likes || 0) + (b._count?.replies || 0);
          return bEngagement - aEngagement;
        });
      case "POST":
        return discussions.filter(d => (d.category || '').toUpperCase() === "DISCUSSION");
      case "ALL":
        return [...discussions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "DEVOTION":
        return discussions.filter(d => (d.category || '').toUpperCase() === "DEVOTION");
      case "QUESTION":
        return discussions.filter(d => (d.category || '').toUpperCase() === "QUESTION");
      case "PRAYER":
        return discussions.filter(d => (d.category || '').toUpperCase() === "PRAYER");
      case "BLESSING":
        return discussions.filter(d => (d.category || '').toUpperCase() === "BLESSING");
      default:
        return discussions;
    }
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

  const createPost = async (postData: { content: string; category: string; mediaFiles: MediaFile[] }) => {
    setIsSubmitting(true);
    const mediaUrls = postData.mediaFiles.map((m) => ({
      type: m.type,
      url: m.uploadedUrl,
      filename: m.file?.name || "media",
    }));
    try {
      const response = await fetch(`${API_URL}/api/discussion/public`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          content: postData.content, 
          isPublic: true, 
          mediaUrls,
          category: postData.category
        }),
      });
      const data = await response.json();
      if (response.ok && data.success !== false) {
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
      const res = await fetch(`${API_URL}/api/discussion/public/${discussionId}/comments?page=1&limit=50`, {
        method: "GET", credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setDiscussions((prev) =>
          prev.map((d) => d.id === discussionId ? { ...d, replies: data.data.comments || [] } : d)
        );
      }
    } catch (err) { console.error(err); } finally {
      setIsLoadingReplies((prev) => ({ ...prev, [discussionId]: false }));
    }
  };

  const toggleLike = async (discussionId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/discussion/${discussionId}/like`, { method: "POST", credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setDiscussions((prev) =>
          prev.map((d) => d.id === discussionId ? { ...d, _count: { ...d._count, likes: data.data.likeCount }, liked: data.data.liked } : d)
        );
      }
    } catch (err) { console.error(err); }
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
      const res = await fetch(`${API_URL}/api/discussion/public/${discussionId}/reply`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ content, mediaUrls: [] }),
      });
      const data = await res.json();
      if (res.ok) {
        setCommentText((prev) => ({ ...prev, [discussionId]: "" }));
        setDiscussions((prev) =>
          prev.map((d) => d.id === discussionId ? { ...d, _count: { ...d._count, replies: (d._count?.replies || 0) + 1 } } : d)
        );
        if (showReplies[discussionId]) fetchDiscussionWithReplies(discussionId);
      } else { alert(data.message || "Failed to add comment"); }
    } catch (err) { console.error(err); }
  };

  const showReplyInput = (discussionId: string, replyId: string, authorName: string) => {
    setReplyingTo((prev) => ({ ...prev, [discussionId]: { replyId, authorName } }));
    setTimeout(() => document.getElementById(`reply-input-${replyId}`)?.focus(), 100);
  };

  const cancelReply = (discussionId: string) => {
    setReplyingTo((prev) => { const s = { ...prev }; delete s[discussionId]; return s; });
  };

  const handleNestedTextChange = (discussionId: string, value: string) => {
    const replyId = replyingTo[discussionId]?.replyId;
    if (replyId) setNestedCommentText((prev) => ({ ...prev, [replyId]: value }));
  };

  const submitNestedReply = async (discussionId: string, parentReplyId: string) => {
    const content = nestedCommentText[parentReplyId]?.trim();
    if (!content) return;
    try {
      const res = await fetch(`${API_URL}/api/discussion/reply/${parentReplyId}/nested`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ content, mediaUrls: [] }),
      });
      const data = await res.json();
      if (res.ok) {
        setNestedCommentText((prev) => { const s = { ...prev }; delete s[parentReplyId]; return s; });
        cancelReply(discussionId);
        fetchDiscussionWithReplies(discussionId);
      } else { alert(data.message || "Failed to add reply"); }
    } catch (err) { console.error(err); }
  };

  const toggleReplyLike = async (discussionId: string, replyId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/discussion/${replyId}/like`, { method: "POST", credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setDiscussions((prev) =>
          prev.map((d) => d.id === discussionId ? {
            ...d, replies: d.replies?.map((r) => r.id === replyId ? { ...r, _count: { ...r._count, likes: data.data.likeCount }, liked: data.data.liked } : r)
          } : d)
        );
      }
    } catch (err) { console.error(err); }
  };

  const toggleNestedReplyLike = async (discussionId: string, replyId: string, parentReplyId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/discussion/${replyId}/like`, { method: "POST", credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setDiscussions((prev) =>
          prev.map((d) => d.id === discussionId ? {
            ...d, replies: d.replies?.map((r) => r.id === parentReplyId ? {
              ...r, replies: r.replies?.map((nr) => nr.id === replyId ? { ...nr, _count: { ...nr._count, likes: data.data.likeCount }, liked: data.data.liked } : nr)
            } : r)
          } : d)
        );
      }
    } catch (err) { console.error(err); }
  };

  const toggleNestedReplies = (replyId: string) => {
    setShowNestedReplies((prev) => ({ ...prev, [replyId]: !prev[replyId] }));
  };

  const renderFormattedText = (text: string) => {
    if (!text) return null;
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/__(.*?)__/g, "<u>$1</u>")
      .replace(/^# (.*?)$/gm, "<h1 class='text-2xl font-bold my-2'>$1</h1>")
      .replace(/^## (.*?)$/gm, "<h2 class='text-xl font-bold my-2'>$1</h2>")
      .replace(/^### (.*?)$/gm, "<h3 class='text-lg font-bold my-2'>$1</h3>")
      .replace(/^- (.*?)$/gm, "<li class='ml-4 list-disc'>$1</li>")
      .replace(/^\d+\. (.*?)$/gm, "<li class='ml-4 list-decimal'>$1</li>");
    
    return <div dangerouslySetInnerHTML={{ __html: formatted }} className="prose prose-sm max-w-none break-words" />;
  };

  const handleEditPost = async (discussionId: string) => {
    const currentPost = discussions.find((d) => d.id === discussionId);
    if (!currentPost) return;
    const newContent = prompt("Edit your post:", currentPost.content);
    if (!newContent || newContent === currentPost.content) return;
    try {
      const response = await fetch(`${API_URL}/api/discussion/${discussionId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ content: newContent, mediaUrls: currentPost.mediaUrls, category: (currentPost.category || '').toUpperCase() }),
      });
      const data = await response.json();
      if (response.ok && data.success !== false) {
        setDiscussions((prev) => prev.map((d) => d.id === discussionId ? { ...d, content: newContent, isEdited: true } : d));
        alert("Post updated successfully!");
      } else { alert(data.message || "Failed to update post"); }
    } catch (error) { console.error("Error editing post:", error); alert("An error occurred while editing the post"); }
  };

  const handleDeletePost = async (discussionId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const response = await fetch(`${API_URL}/api/discussion/${discussionId}`, { method: "DELETE", credentials: "include" });
      const data = await response.json();
      if (response.ok && data.success !== false) {
        setDiscussions((prev) => prev.filter((d) => d.id !== discussionId));
        alert("Post deleted successfully!");
      } else { alert(data.message || "Failed to delete post"); }
    } catch (error) { console.error("Error deleting post:", error); alert("An error occurred while deleting the post"); }
  };

  const slideVariants = {
    initial: { x: 50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  const filteredDiscussions = getFilteredDiscussions();

  const getEmptyMessage = (filterId: string) => {
    const id = (filterId || "").toUpperCase();
    switch (id) {
      case "PRAYER":
        return "No Prayers yet — be the first to pray for a nation.";
      case "DEVOTION":
        return "No Devotions yet — be the first to share a devotion.";
      case "BLESSING":
        return "No Blessings yet — be the first to share a blessing.";
      case "TESTIMONY":
        return "No Testimonies yet — be the first to share your story of faith.";
      case "QUESTION":
        return "No Faith Questions yet — be the first to ask or seek an answer.";
      case "POST":
      case "DISCUSSION":
        return "No Posts yet — be the first to start a conversation.";
      case "ALL":
      case "LATEST":
      case "POPULAR":
      case "TRENDING":
      default:
        return "No discussions yet. Be the first to post!";
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="w-full flex-1 overflow-y-auto scrollbar2">
        {/* Filter Tabs with Refresh Button */}
        <div className="flex flex-wrap items-center justify-between gap-2 my-4">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {filterTabs.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`group relative overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95
                  ${activeFilter === filter.id 
                    ? `bg-gradient-to-r ${filter.color} text-white shadow-lg` 
                    : 'bg-white/80 dark:bg-secondaryColors-0/50 backdrop-blur-sm border border-white/20 text-gray-700 dark:text-gray-300'
                  }
                  rounded-full px-3 py-1.5 md:px-4 md:py-2 shadow-md`}
              >
                <div className="flex items-center gap-1.5 relative z-10">
                  <span className="text-sm">{filter.icon}</span>
                  <span className={`font-medium text-xs md:text-sm ${activeFilter === filter.id ? 'text-white' : ''}`}>
                    {filter.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className={`group relative overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95
              bg-gradient-to-r from-primaryColors-0 to-primaryColors-600 text-white rounded-full p-2 md:p-2.5 shadow-md
              disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Refresh posts"
          >
            <FaSync 
              className={`text-sm md:text-base ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} 
            />
          </button>
        </div>

        {/* Posts Feed */}
        <motion.div
          key="show-post"
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-3 z-10 pb-20"
        >
          {(() => {
            if (isLoading) return <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-2xl text-primaryColors-0" /></div>;
            if (filteredDiscussions.length === 0) return <div className="text-center py-12 text-textGrey-0">{getEmptyMessage(activeFilter)}</div>;
            return filteredDiscussions.map((discussion) => (
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
                onCommentChange={(id: any, val: any) => setCommentText((prev) => ({ ...prev, [id]: val }))}
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
            ));
          })()}
        </motion.div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showPost}
        onClose={() => {
          setShowPost(false);
          setShowPeoplePost(true);
        }}
        onSubmit={createPost}
        userPic={userPic}
        userName={userName}
        userRole={userRole}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}