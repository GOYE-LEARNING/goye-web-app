// app/component/chat_component/discussion/discussion_card.tsx
"use client";

import { BiHeart } from "react-icons/bi";
import { BsHeartFill, BsThreeDots } from "react-icons/bs";
import { FaCommentAlt, FaSpinner } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { Discussion } from "@/app/interface/discussion";
import ReplyItem from "./reply_item";
import CustomVideoPlayer from "../custom_video_player";
import DiscussionDropdown from "./discussion_dropdown";
import { CiShare2 } from "react-icons/ci";
import { FaRegCommentDots } from "react-icons/fa6";

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
}

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
}: Props) {
  return (
    <div className="relative bg-shadyColor-0/60 backdrop-blur-md border border-white/10 py-4 md:px-4 px-6 rounded-[20px] shadow-sm w-full max-w-full min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-[30px] w-[30px] rounded-full overflow-hidden bg-[#ccc]/10">
            <img
              src={discussion.author.user_pic}
              alt="avatar"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-[14px] font-semibold text-textSlightDark-0">
              {discussion.author.first_name} {discussion.author.last_name}
            </h1>
            <p className="text-[11px] text-textGrey-0">
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

      {/* Content */}
      <div className="mt-3">{renderFormattedText(discussion.content)}</div>

      {/* Media */}
      {discussion.mediaUrls && discussion.mediaUrls.length > 0 && (
        <div
          className={`grid ${discussion.mediaUrls.length > 2 ? "grid-cols-2" : "grid-cols-1"} gap-2 mt-4`}
        >
          {discussion.mediaUrls.map((media: any, idx: number) =>
            media.type === "image" ? (
              <img
                key={idx}
                src={media.url}
                alt={media.filename}
                className="max-h-[300px] w-full object-cover rounded-[20px]"
              />
            ) : (
              <CustomVideoPlayer key={idx} src={media.url} />
            ),
          )}
        </div>
      )}

      {/* Like + Comment count - FIXED: use liked property */}
      <div className="flex items-center md:justify-start justify-between md:w-auto w-full md:gap-[2rem] mt-4 my-[1.2rem] md:my-0 pt-3 border-t border-gray-100/5">
        <button
          onClick={() => onToggleLike(discussion.id)}
          className="flex items-center gap-2 hover:text-red-500 transition group"
        >
          {discussion.liked ? (
            <BsHeartFill className="text-red-500" />
          ) : (
            <BiHeart className="text-gray-400 group-hover:text-red-500" />
          )}
          <span
            className={`text-sm ${discussion.liked ? "text-red-500" : "text-gray-500"}`}
          >
            {discussion._count?.likes || 0}
          </span>
        </button>
        <button
          onClick={() => onToggleReplies(discussion.id)}
          className="flex items-center gap-2 hover:text-primaryColors-0 transition group"
        >
          <FaRegCommentDots className="text-gray-400 group-hover:text-primaryColors-0" />
          <span className="text-sm text-gray-500">
            Comment
          </span>
        </button>
         <button
          onClick={() => onToggleReplies(discussion.id)}
          className="flex items-center gap-2 hover:text-primaryColors-0 transition group"
        >
          <CiShare2 className="text-gray-400 group-hover:text-primaryColors-0" />
          <span className="text-sm text-gray-500">
            Share
          </span>
        </button>
      </div>

      {/* Comment input */}
      <div className="flex items-center gap-3 my-3">
        <div className="h-[40px] w-[40px] rounded-full overflow-hidden flex-shrink-0">
          {userPic ? (
            <img
              src={userPic || ""}
              className="h-full w-full object-cover"
              alt="avatar"
            />
          ) : (
            <div className="h-full w-full bg-[#ccc]/20" />
          )}
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Write your comment..."
            value={commentText}
            onChange={(e) => onCommentChange(discussion.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmitComment(discussion.id);
            }}
            className="h-[40px] px-3 pr-12 bg-[#ccc]/20 text-textSlightDark-0 rounded-full w-full border-none outline-none text-[0.8rem]"
          />
          <button
            onClick={() => onSubmitComment(discussion.id)}
            className="absolute right-2 top-[5px] flex justify-center items-center h-[30px] w-[30px] bg-primaryColors-0 text-white rounded-full hover:bg-primaryColors-0/90 transition"
          >
            <IoSend />
          </button>
        </div>
      </div>

      {/* Replies */}
      {showReplies && (
        <div className="mt-3 pl-6 border-l-2 border-gray-200">
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
            <p className="text-sm text-gray-400 text-center py-2">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
