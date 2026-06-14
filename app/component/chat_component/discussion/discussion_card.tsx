// app/component/chat_component/discussion/discussion_card.tsx
"use client";

import { BiHeart } from "react-icons/bi";
import { BsHeartFill, BsThreeDots, BsX, BsPlayCircle } from "react-icons/bs";
import {
  FaCommentAlt,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaBook,
  FaQuestionCircle,
  FaHeart,
} from "react-icons/fa";
import { GiPearlNecklace, GiPrayerBeads } from "react-icons/gi";
import { IoSend } from "react-icons/io5";
import { Discussion } from "@/app/interface/discussion";
import ReplyItem from "./reply_item";
import DiscussionDropdown from "./discussion_dropdown";
import { CiShare2 } from "react-icons/ci";
import { FaRegCommentDots } from "react-icons/fa6";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsPlayFill,
  BsPauseFill,
  BsVolumeUpFill,
  BsVolumeMuteFill,
} from "react-icons/bs";
import Portal from "../../Portal";

interface Props {
  discussion: Discussion;
  userPic: string;
  commentText: string;
  isLoadingReplies: boolean;
  showReplies: boolean;
  replyingTo: { replyId: string; authorName: string } | null;
  nestedCommentText: { [replyId: string]: string };
  showNestedReplies: { [replyId: string]: boolean };
  onToggleLike: (id: string) => void;
  onToggleReplies: (id: string) => void;
  onCommentChange: (discussionId: string, value: string) => void;
  onSubmitComment: (discussionId: string) => void;
  onToggleReplyLike: (discussionId: string, replyId: string) => void;
  onToggleNestedReplyLike: (
    discussionId: string,
    replyId: string,
    parentReplyId: string,
  ) => void;
  onShowReplyInput: (
    discussionId: string,
    replyId: string,
    authorName: string,
  ) => void;
  onCancelReply: (discussionId: string) => void;
  onNestedTextChange: (discussionId: string, value: string) => void;
  onSubmitNestedReply: (discussionId: string, replyId: string) => void;
  onToggleNestedReplies: (replyId: string) => void;
  renderFormattedText: (text: string) => any;
  currentUserId: string;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onVideoComplete?: (videoUrl: string) => void;
}

// Media Item interface
interface MediaItem {
  url: string;
  type: string;
  filename?: string;
  thumbnail?: string;
}

// Custom Video Player Component
const CustomVideoPlayer = ({
  src,
  poster,
  onComplete,
  autoPlay = true,
}: {
  src: string;
  poster?: string;
  onComplete?: () => void;
  autoPlay?: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const completionTriggeredRef = useRef(false);

  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
      resetControlsTimeout();
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      resetControlsTimeout();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      setCurrentTime(current);
      setProgress((current / dur) * 100);

      if (!completionTriggeredRef.current && dur > 0) {
        const percentWatched = (current / dur) * 100;
        if (percentWatched >= 95) {
          completionTriggeredRef.current = true;
          onComplete?.();
        }
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      if (autoPlay) {
        videoRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const newTime = percentage * duration;
      videoRef.current.currentTime = newTime;
      setProgress(percentage * 100);
      resetControlsTimeout();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div
      className="relative group rounded-lg overflow-hidden bg-black w-full h-full"
      onMouseMove={resetControlsTimeout}
      onMouseEnter={() => setShowControls(true)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => {
          setIsPlaying(true);
          resetControlsTimeout();
        }}
        onPause={() => setIsPlaying(false)}
        playsInline
      />

      {!isPlaying && (
        <button
          onClick={handlePlayPause}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
            w-14 h-14 md:w-20 md:h-20 rounded-full bg-primaryColors-0/90 hover:bg-primaryColors-0 
            flex items-center justify-center transition-all duration-200 z-20
            shadow-lg hover:scale-110"
        >
          <BsPlayFill className="text-white text-3xl md:text-5xl ml-1" />
        </button>
      )}

      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent 
          p-2 md:p-3 transition-opacity duration-300 z-10
          ${showControls ? "opacity-100" : "opacity-0"}`}
      >
        <div
          className="w-full h-1 bg-gray-600 rounded-full cursor-pointer mb-2 md:mb-3"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-primaryColors-0 rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 md:w-3 md:h-3 bg-primaryColors-0 rounded-full"></div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={handlePlayPause}
              className="text-white hover:text-primaryColors-0 transition-colors"
            >
              {isPlaying ? (
                <BsPauseFill className="text-xl md:text-2xl" />
              ) : (
                <BsPlayFill className="text-xl md:text-2xl" />
              )}
            </button>

            <button
              onClick={handleMuteToggle}
              className="text-white hover:text-primaryColors-0 transition-colors"
            >
              {isMuted ? (
                <BsVolumeMuteFill className="text-lg md:text-xl" />
              ) : (
                <BsVolumeUpFill className="text-lg md:text-xl" />
              )}
            </button>

            <span className="text-white text-[10px] md:text-xs">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// SlideshowModal Component
const SlideshowModal = ({
  mediaItems,
  initialIndex,
  onClose,
  onVideoComplete,
}: {
  mediaItems: MediaItem[];
  initialIndex: number;
  onClose: () => void;
  onVideoComplete?: (videoUrl: string) => void;
}) => {
  // ... (keep existing SlideshowModal code)
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && mediaItems.length > 1) {
      handleNext();
    }
    if (isRightSwipe && mediaItems.length > 1) {
      handlePrev();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : mediaItems.length - 1));
    setIsZoomed(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < mediaItems.length - 1 ? prev + 1 : 0));
    setIsZoomed(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") handlePrev();
    if (e.key === "ArrowRight") handleNext();
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mediaItems.length]);

  const currentMedia = mediaItems[currentIndex];
  const isVideo = currentMedia?.type === "video";

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999]"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="absolute inset-0 dark:bg-black/50 bg-white/50 backdrop-blur-md"
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <div className="absolute top-0 left-0 right-0 z-[10000] flex items-center justify-between px-4 py-3 md:px-6 md:py-4 bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={onClose}
          className="p-2 md:p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 backdrop-blur-sm hover:scale-105"
          aria-label="Close"
        >
          <svg
            className="w-5 h-5 md:w-6 md:h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="px-3 py-1.5 md:px-4 md:py-1.5 bg-black/60 rounded-full text-white text-xs md:text-sm font-medium backdrop-blur-sm">
          {currentIndex + 1} / {mediaItems.length}
        </div>

        <div className="w-8 h-8 md:w-10 md:h-10" />
      </div>

      {mediaItems.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-[10000] flex items-center justify-center w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-black/50 hover:bg-black/70 rounded-full transition-all duration-200 backdrop-blur-sm hover:scale-110"
            aria-label="Previous"
          >
            <FaChevronLeft className="text-white text-xl md:text-2xl lg:text-3xl" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-[10000] flex items-center justify-center w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-black/50 hover:bg-black/70 rounded-full transition-all duration-200 backdrop-blur-sm hover:scale-110"
            aria-label="Next"
          >
            <FaChevronRight className="text-white text-xl md:text-2xl lg:text-3xl" />
          </button>
        </>
      )}

      <div className="absolute inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
        <motion.div
          key={currentIndex}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: isZoomed && !isVideo ? 1.5 : 1, opacity: 1 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative flex items-center justify-center w-full h-full"
          onClick={(e) => {
            e.stopPropagation();
            if (!isVideo) setIsZoomed(!isZoomed);
          }}
        >
          {isVideo ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-full max-w-5xl max-h-full">
                <CustomVideoPlayer
                  src={currentMedia.url}
                  poster={currentMedia.thumbnail}
                  onComplete={() => onVideoComplete?.(currentMedia.url)}
                  autoPlay={true}
                />
              </div>
            </div>
          ) : (
            <img
              src={currentMedia.url}
              alt={currentMedia.filename || `Media ${currentIndex + 1}`}
              className={`max-w-full max-h-full w-auto h-auto object-contain transition-all duration-300 ${
                isZoomed ? "scale-150 lg:scale-175" : "scale-100"
              }`}
              style={{ cursor: isZoomed ? "zoom-out" : "zoom-in" }}
              draggable={false}
            />
          )}
        </motion.div>
      </div>

      {mediaItems.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-[10000] pb-2 pt-8 md:pb-4 md:pt-12 bg-gradient-to-t from-black/90 to-transparent">
          <div className="flex justify-center gap-2 overflow-x-auto px-4 pb-2 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
            {mediaItems.map((media, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                  setIsZoomed(false);
                }}
                className={`relative flex-shrink-0 transition-all duration-200 rounded-lg overflow-hidden
                  w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16
                  ${
                    currentIndex === idx
                      ? "ring-2 ring-white scale-105 shadow-lg"
                      : "opacity-40 hover:opacity-70"
                  }`}
              >
                <img
                  src={media.thumbnail || media.url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {media.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <BsPlayCircle className="text-white text-sm md:text-base lg:text-xl" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {mediaItems.length > 1 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 md:hidden z-[10000] animate-pulse">
          <div className="px-4 py-2 bg-black/70 rounded-full text-white/90 text-xs backdrop-blur-sm flex items-center gap-3">
            <span className="text-sm">←</span>
            <span className="font-medium">Swipe to navigate</span>
            <span className="text-sm">→</span>
          </div>
        </div>
      )}

      {!isVideo && (
        <div className="absolute bottom-6 right-4 md:bottom-8 md:right-6 z-[10000]">
          <div className="px-3 py-1.5 bg-black/50 rounded-full text-white/60 text-xs md:text-sm backdrop-blur-sm">
            {isZoomed ? "🔍 Click to zoom out" : "🔍 Click to zoom in"}
          </div>
        </div>
      )}
    </motion.div>
  );

  return <Portal containerId="slideshow-modal-root">{modalContent}</Portal>;
};

// Responsive Media Grid Component
const MediaGrid = ({
  mediaItems,
  onMediaClick,
}: {
  mediaItems: MediaItem[];
  onMediaClick: (index: number) => void;
}) => {
  const mediaCount = mediaItems.length;

  if (mediaCount === 0) return null;

  const renderMediaItem = (
    media: MediaItem,
    index: number,
    isOverlay?: boolean,
  ) => (
    <div
      className={`relative cursor-pointer overflow-hidden rounded-xl md:rounded-[20px] ${
        media.type === "video" ? "aspect-video" : "aspect-square"
      }`}
      onClick={() => onMediaClick(index)}
    >
      {media.type === "video" ? (
        <>
          <img
            src={media.thumbnail || media.url}
            alt={media.filename || `Media ${index + 1}`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors">
            <BsPlayCircle className="text-white text-3xl md:text-5xl" />
          </div>
          {isOverlay && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-xl md:text-2xl font-bold">
                +{mediaCount - 1}
              </span>
            </div>
          )}
        </>
      ) : (
        <>
          <img
            src={media.url}
            alt={media.filename || `Media ${index + 1}`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          {isOverlay && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-xl md:text-2xl font-bold">
                +{mediaCount - 1}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );

  if (mediaCount === 1) {
    return (
      <div className="mt-3 md:mt-4 max-w-full md:max-w-[80%] lg:max-w-[70%]">
        {renderMediaItem(mediaItems[0], 0, false)}
      </div>
    );
  }

  if (mediaCount === 2) {
    return (
      <div className="grid grid-cols-2 gap-1 md:gap-2 mt-3 md:mt-4">
        {mediaItems
          .slice(0, 2)
          .map((media, idx) => renderMediaItem(media, idx, false))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-1 md:gap-2 mt-3 md:mt-4">
      {renderMediaItem(mediaItems[0], 0, false)}
      {renderMediaItem(mediaItems[1], 1, true)}
    </div>
  );
};

// Category-specific styling configurations
const getCategoryStyles = (category?: string) => {
  const categoryUpper = (category || "DISCUSSION").toUpperCase();
  
  const styles: Record<string, {
    bgGradient: string;
    borderStyle: string;
    headerIcon: React.ReactNode;
    headerText: string;
    containerClass: string;
    contentClass: string;
    badgeClass: string;
  }> = {
    PRAYER: {
      bgGradient: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
      borderStyle: "border-blue-400 dark:border-blue-500",
      headerIcon: <GiPrayerBeads className="text-blue-600" />,
      headerText: "Prayer Request",
      containerClass: "shadow-md hover:shadow-lg",
      contentClass: "text-gray-700 dark:text-gray-200 italic font-light leading-relaxed",
      badgeClass: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
    },
    DEVOTION: {
      bgGradient: "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30",
      borderStyle: "border-purple-400 dark:border-purple-500",
      headerIcon: <FaBook className="text-purple-600" />,
      headerText: "Daily Devotion",
      containerClass: "shadow-md hover:shadow-lg font-serif",
      contentClass: "text-gray-800 dark:text-gray-100 leading-relaxed text-base",
      badgeClass: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
    },
    BLESSING: {
      bgGradient: "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30",
      borderStyle: "border-amber-400 dark:border-amber-500",
      headerIcon: <GiPearlNecklace className="text-amber-600" />,
      headerText: "Blessing",
      containerClass: "shadow-md hover:shadow-lg",
      contentClass: "text-gray-700 dark:text-gray-200",
      badgeClass: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
    },
    TESTIMONY: {
      bgGradient: "bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30",
      borderStyle: "border-rose-400 dark:border-rose-500",
      headerIcon: <FaHeart className="text-rose-600" />,
      headerText: "Testimony",
      containerClass: "shadow-md hover:shadow-lg",
      contentClass: "text-gray-700 dark:text-gray-200",
      badgeClass: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300"
    },
    QUESTION: {
      bgGradient: "bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/30 dark:to-teal-950/30",
      borderStyle: "border-cyan-400 dark:border-cyan-500",
      headerIcon: <FaQuestionCircle className="text-cyan-600" />,
      headerText: "Faith Questions",
      containerClass: "shadow-md hover:shadow-lg",
      contentClass: "text-gray-700 dark:text-gray-200",
      badgeClass: "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300"
    },
    DISCUSSION: {
      bgGradient: "bg-white/70 dark:bg-secondaryColors-0/70",
      borderStyle: "border-gray-400 dark:border-gray-500",
      headerIcon: <FaRegCommentDots className="text-gray-600" />,
      headerText: "Post",
      containerClass: "shadow-sm hover:shadow-md",
      contentClass: "text-gray-700 dark:text-gray-200",
      badgeClass: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
    }
  };
  
  return styles[categoryUpper] || styles.DISCUSSION;
};

export default function DiscussionCard({
  discussion,
  userPic,
  commentText,
  isLoadingReplies,
  showReplies,
  replyingTo,
  nestedCommentText,
  showNestedReplies,
  onToggleLike,
  onToggleReplies,
  onCommentChange,
  onSubmitComment,
  onToggleReplyLike,
  onToggleNestedReplyLike,
  onShowReplyInput,
  onCancelReply,
  onNestedTextChange,
  onSubmitNestedReply,
  onToggleNestedReplies,
  renderFormattedText,
  currentUserId,
  onDelete,
  onEdit,
  onVideoComplete,
}: Props) {
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  const allMedia: MediaItem[] = discussion.mediaUrls || [];
  const categoryStyles = getCategoryStyles(discussion.category);
  const isPrayer = discussion.category?.toUpperCase() === "PRAYER";
  const isDevotion = discussion.category?.toUpperCase() === "DEVOTION";
  const isBlessing = discussion.category?.toUpperCase() === "BLESSING";

  const handleMediaClick = (index: number) => {
    setGalleryIndex(index);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/discussion/${discussion.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleVideoCompletion = (videoUrl: string) => {
    onVideoComplete?.(videoUrl);
  };

  // Prayer-specific styling - no media allowed
  const shouldShowMedia = !isPrayer;

  // Random blessing template
  const blessingMessages = [
    "May the Lord bless you and keep you; may His face shine upon you.",
    "The Lord is your shepherd; you shall not want.",
    "May God's grace be multiplied to you in abundance.",
    "Blessed are those who trust in the Lord.",
    "The Lord will fight for you; you need only to be still.",
    "May the peace of Christ rule in your heart.",
  ];
  const randomBlessing = blessingMessages[Math.floor(Math.random() * blessingMessages.length)];

  // Devotion Bible verse suggestion
  const devotionVerses = [
    "“I can do all things through Christ who strengthens me.” - Philippians 4:13",
    "“For God so loved the world that He gave His only Son.” - John 3:16",
    "“The Lord is my light and my salvation.” - Psalm 27:1",
    "“Be still, and know that I am God.” - Psalm 46:10",
    "“Trust in the Lord with all your heart.” - Proverbs 3:5",
  ];
  const randomVerse = devotionVerses[Math.floor(Math.random() * devotionVerses.length)];

  return (
    <>
      <div className={`relative backdrop-blur-md border border-[#ccc]/20 rounded-xl md:rounded-[20px] shadow-sm w-full max-w-full min-w-0 transition-all duration-300 overflow-hidden
        ${categoryStyles.containerClass}
        ${categoryStyles.bgGradient}
        ${categoryStyles.borderStyle}`}
      >
        <div className="py-3 md:py-4 px-4 md:px-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 md:h-[30px] md:w-[30px] rounded-full overflow-hidden bg-[#ccc]/10 ring-2 ring-transparent transition-all hover:ring-primaryColors-0">
                <img
                  src={discussion.author.user_pic}
                  alt="avatar"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xs md:text-[14px] font-semibold dark:text-textSlightDark-0 text-lightBoldText-0/80">
                  {discussion.author.first_name} {discussion.author.last_name}
                </h1>
                <p className="text-[10px] md:text-[11px] dark:text-textSlightDark-0 text-lightBoldText-0/80">
                  {new Date(discussion.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <DiscussionDropdown
              discussionId={discussion.id}
              authorId={discussion.author.id}
              currentUserId={currentUserId}
              onDelete={onDelete as any}
              onEdit={onEdit as any}
            />
          </div>

          {/* Category Header - Special styling per category */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-2xl">{categoryStyles.headerIcon}</span>
            <span className={`text-sm font-semibold ${categoryStyles.badgeClass} px-3 py-1 rounded-full`}>
              {categoryStyles.headerText}
            </span>
          </div>

          {/* Devotion Bible Verse */}
          {isDevotion && (
            <div className="mt-3 p-3 bg-purple-100/30 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 italic">
              <p className="text-sm text-purple-700 dark:text-purple-300 flex items-start gap-2">
                <FaBook className="mt-1 text-purple-600" />
                <span>{randomVerse}</span>
              </p>
            </div>
          )}

          {/* Prayer Request Header */}
          {isPrayer && (
            <div className="mt-3 p-3 bg-blue-100/30 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center gap-2">
              <GiPrayerBeads className="text-blue-600" />
              <p className="text-xs text-blue-600 dark:text-blue-400">
                “The prayer of a righteous person is powerful and effective.” - James 5:16
              </p>
            </div>
          )}

          {/* Content */}
          <div className={`mt-3 dark:text-textSlightDark-0 text-lightBoldText-0/80 text-sm md:text-base
            ${categoryStyles.contentClass}`}
          >
            {renderFormattedText(discussion.content)}
          </div>

          {/* Media Grid - Hidden for prayers */}
          {shouldShowMedia && allMedia.length > 0 && (
            <MediaGrid mediaItems={allMedia} onMediaClick={handleMediaClick} />
          )}

          {/* Prayer-specific action buttons */}
          {isPrayer && (
            <div className="mt-3 flex items-center gap-3">
              <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded-full hover:bg-blue-600 transition shadow-sm">
                🙏 I Prayed
              </button>
              <button className="px-3 py-1 text-sm border border-blue-500 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-50 transition">
                🤝 Encourage
              </button>
            </div>
          )}

          {/* Blessings Random Template */}
          {isBlessing && (
            <div className="mt-3 p-3 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-lg border border-amber-200 dark:border-amber-800 shadow-inner">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <GiPearlNecklace className="text-2xl" />
                <span className="text-sm font-semibold">Blessing of the Day</span>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-2 italic">
                “{randomBlessing}”
              </p>
              <p className="text-xs text-amber-500 dark:text-amber-400 mt-2 text-right">
                — Numbers 6:24-26
              </p>
            </div>
          )}

          {/* Like + Comment count */}
          <div className="flex items-center justify-between md:justify-start md:gap-8 mt-3 md:mt-4 pt-3 ">
            <button
              onClick={() => onToggleLike(discussion.id)}
              className="flex items-center gap-1.5 md:gap-2 hover:text-red-500 transition group"
            >
              {discussion.liked ? (
                <BsHeartFill className="text-red-500 text-sm md:text-base" />
              ) : (
                <BiHeart className="text-gray-400 group-hover:text-red-500 text-sm md:text-base" />
              )}
              <span
                className={`text-xs md:text-sm ${discussion.liked ? "text-red-500" : "text-gray-500"}`}
              >
                {discussion._count?.likes || 0}
              </span>
            </button>
            <button
              onClick={() => onToggleReplies(discussion.id)}
              className="flex items-center gap-1.5 md:gap-2 hover:text-primaryColors-0 transition group"
            >
              <FaRegCommentDots className="text-gray-400 group-hover:text-primaryColors-0 text-sm md:text-base" />
              <span className="text-xs md:text-sm text-gray-500">Comment</span>
            </button>
            <div className="relative">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 md:gap-2 hover:text-primaryColors-0 transition group"
              >
                <CiShare2 className="text-gray-400 group-hover:text-primaryColors-0 text-sm md:text-base" />
                <span className="text-xs md:text-sm text-gray-500">Share</span>
              </button>
              {showShareTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-[10px] md:text-xs rounded whitespace-nowrap">
                  Link copied!
                </div>
              )}
            </div>
          </div>

          {/* Comment input */}
          <div className="flex items-center gap-2 md:gap-3 my-2 md:my-3">
            <div className="h-8 w-8 md:h-[40px] md:w-[40px] rounded-full overflow-hidden flex-shrink-0">
              {userPic ? (
                <img
                  src={userPic || ""}
                  className="h-full w-full object-cover"
                  alt="avatar"
                />
              ) : (
                <div className="h-full w-full bg-[#ccc]/20 rounded-full" />
              )}
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={isPrayer ? "Type a prayer or encouragement..." : "Write your comment..."}
                value={commentText}
                onChange={(e) => onCommentChange(discussion.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSubmitComment(discussion.id);
                }}
                className="h-9 md:h-[40px] px-3 pr-10 md:pr-12 bg-[#ccc]/20 text-textSlightDark-0 rounded-full w-full border-none outline-none text-xs md:text-[0.8rem] focus:ring-2 focus:ring-primaryColors-0"
              />
              <button
                onClick={() => onSubmitComment(discussion.id)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 flex justify-center items-center h-6 w-6 md:h-[30px] md:w-[30px] bg-primaryColors-0 text-white rounded-full hover:bg-primaryColors-0/90 transition"
              >
                <IoSend size={12} className="md:text-base" />
              </button>
            </div>
          </div>

          {/* Replies */}
          {showReplies && (
            <div className="mt-2 md:mt-3 pl-3 md:pl-6 border border-[#ccc]/20">
              {isLoadingReplies ? (
                <div className="flex justify-center py-4">
                  <FaSpinner className="animate-spin text-primaryColors-0" />
                </div>
              ) : discussion.replies && discussion.replies.length > 0 ? (
                discussion.replies.map((reply) => (
                  <ReplyItem
                    key={reply.id}
                    reply={reply}
                    discussionId={discussion.id}
                    userPic={userPic}
                    replyingTo={replyingTo}
                    nestedCommentText={nestedCommentText[reply.id] || ""}
                    showNestedReplies={!!showNestedReplies[reply.id]}
                    onToggleLike={onToggleReplyLike}
                    onToggleNestedLike={onToggleNestedReplyLike}
                    onShowReplyInput={onShowReplyInput}
                    onCancelReply={onCancelReply}
                    onNestedTextChange={onNestedTextChange}
                    onSubmitNestedReply={onSubmitNestedReply}
                    onToggleNestedReplies={onToggleNestedReplies}
                    renderFormattedText={renderFormattedText}
                  />
                ))
              ) : (
                <p className="text-xs md:text-sm text-gray-400 text-center py-2">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Responsive Slideshow Modal */}
      <AnimatePresence>
        {galleryIndex !== null && allMedia.length > 0 && (
          <SlideshowModal
            mediaItems={allMedia}
            initialIndex={galleryIndex}
            onClose={() => setGalleryIndex(null)}
            onVideoComplete={handleVideoCompletion}
          />
        )}
      </AnimatePresence>
    </>
  );
}