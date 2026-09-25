"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaArrowLeft, FaHeart, FaRegHeart } from "react-icons/fa";
import { FaRegCommentDots } from "react-icons/fa6";
import Loader from "@/app/component/loader";
import { useI18n } from "@/app/context/I18nContext";

interface Author {
  id: string;
  first_name: string;
  last_name: string;
  user_pic: string;
  role: string;
}

interface MediaItem {
  url: string;
  type: string;
  filename?: string;
}

interface Reply {
  id: string;
  content: string;
  author: Author;
  createdAt: string;
  _count: { likes: number };
}

interface DiscussionDetail {
  id: string;
  content: string;
  category?: string;
  mediaUrls?: MediaItem[];
  author: Author;
  createdAt: string;
  liked?: boolean;
  _count: { replies: number; likes: number };
  replies: Reply[];
}

export default function DiscussionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const discussionId = params?.id as string;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [discussion, setDiscussion] = useState<DiscussionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const { t } = useI18n();

  const fetchDiscussion = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/discussion/public/${discussionId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "This post could not be found.");
        return;
      }
      setDiscussion(data.data);
    } catch (err) {
      console.error(err);
      setError("We couldn't reach the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (discussionId) fetchDiscussion();
  }, [discussionId]);

  const toggleLike = async () => {
    if (!discussion || isLiking) return;
    setIsLiking(true);

    const wasLiked = discussion.liked;
    setDiscussion({
      ...discussion,
      liked: !wasLiked,
      _count: {
        ...discussion._count,
        likes: discussion._count.likes + (wasLiked ? -1 : 1),
      },
    });

    try {
      const res = await fetch(`${API_URL}/api/discussion/${discussion.id}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to like");
    } catch (err) {
      // Revert on failure — we don't actually know the new state.
      setDiscussion((prev) =>
        prev
          ? {
              ...prev,
              liked: wasLiked,
              _count: { ...prev._count, likes: prev._count.likes + (wasLiked ? 1 : -1) },
            }
          : prev,
      );
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="min-h-screen dark:bg-secondaryColors-0 bg-lightSecondaryColor-0 px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 mb-4 dark:text-textSlightDark-0 text-lightBoldText-0 text-[14px] font-medium"
        >
          <FaArrowLeft /> Back to GOYE
        </button>

        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader
              width={30}
              height={30}
              border_width={2}
              full_border_color="transparent"
              small_border_color="#FFA500"
            />
          </div>
        )}

        {!isLoading && error && (
          <div className="text-center py-20">
            <p className="dark:text-textSlightDark-0 text-lightBoldText-0 font-semibold mb-2">
              {error}
            </p>
            <p className="text-textGrey-0 text-[14px]">
              The post may have been removed, or you may need to sign in to view it.
            </p>
          </div>
        )}

        {!isLoading && !error && discussion && (
          <div className="dark:bg-boldShadyColor-0 bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-[44px] w-[44px] rounded-full overflow-hidden bg-shadyColor-0 shrink-0">
                {discussion.author?.user_pic ? (
                  <img
                    src={discussion.author.user_pic}
                    alt={discussion.author.first_name}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div>
                <p className="font-semibold dark:text-textSlightDark-0 text-lightBoldText-0">
                  {discussion.author?.first_name} {discussion.author?.last_name}
                </p>
                <p className="text-textGrey-0 text-[12px]">
                  {new Date(discussion.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <p className="dark:text-textSlightDark-0 text-lightBoldText-0 text-[15px] whitespace-pre-wrap mb-4">
              {t(discussion.content)}
            </p>

            {discussion.mediaUrls && discussion.mediaUrls.length > 0 && (
              <div className="grid grid-cols-1 gap-2 mb-4 rounded-xl overflow-hidden">
                {discussion.mediaUrls.map((media, i) =>
                  media.type === "video" ? (
                    <video
                      key={i}
                      src={media.url}
                      controls
                      className="w-full max-h-[420px] rounded-xl bg-black"
                    />
                  ) : (
                    <img
                      key={i}
                      src={media.url}
                      alt="Post media"
                      className="w-full max-h-[420px] object-cover rounded-xl"
                    />
                  ),
                )}
              </div>
            )}

            <div className="flex items-center gap-6 pt-3 border-t border-[#ccc]/20">
              <button
                onClick={toggleLike}
                disabled={isLiking}
                className="flex items-center gap-2 text-[14px] dark:text-textSlightDark-0 text-lightBoldText-0"
              >
                {discussion.liked ? (
                  <FaHeart className="text-red-500" />
                ) : (
                  <FaRegHeart />
                )}
                {discussion._count.likes}
              </button>
              <span className="flex items-center gap-2 text-[14px] dark:text-textSlightDark-0 text-lightBoldText-0">
                <FaRegCommentDots />
                {discussion._count.replies}
              </span>
            </div>

            {discussion.replies.length > 0 && (
              <div className="mt-5 pt-4 border-t border-[#ccc]/20 space-y-4">
                {discussion.replies.map((reply) => (
                  <div key={reply.id} className="flex items-start gap-3">
                    <div className="h-[34px] w-[34px] rounded-full overflow-hidden bg-shadyColor-0 shrink-0">
                      {reply.author?.user_pic ? (
                        <img
                          src={reply.author.user_pic}
                          alt={reply.author.first_name}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="dark:bg-shadyColor-0 bg-lightWhite-0 rounded-xl px-3 py-2 flex-1">
                      <p className="font-semibold text-[13px] dark:text-textSlightDark-0 text-lightBoldText-0">
                        {reply.author?.first_name} {reply.author?.last_name}
                      </p>
                      <p className="text-[13px] dark:text-textSlightDark-0 text-lightBoldText-0/80">
                        {t(reply.content)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
