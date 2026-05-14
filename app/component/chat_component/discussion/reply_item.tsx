// app/component/chat_component/discussion/reply_item.tsx
"use client";

import { BiHeart } from "react-icons/bi";
import { BsHeartFill } from "react-icons/bs";
import { IoSend } from "react-icons/io5";
import { Reply } from "@/app/interface/discussion";
import NestedReplyItem from "./nested_reply_item";

interface Props {
  reply: Reply;
  discussionId: string;
  userPic: string;
  replyingTo: { replyId: string; authorName: string } | null;
  nestedCommentText: string;
  showNestedReplies: boolean;
  onToggleLike: (discussionId: string, replyId: string) => void;
  onToggleNestedLike: (
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
}

export default function ReplyItem({
  reply,
  discussionId,
  userPic,
  replyingTo,
  nestedCommentText,
  showNestedReplies,
  onToggleLike,
  onToggleNestedLike,
  onShowReplyInput,
  onCancelReply,
  onNestedTextChange,
  onSubmitNestedReply,
  onToggleNestedReplies,
  renderFormattedText,
}: Props) {
  const hasNested = reply.replies && reply.replies.length > 0;

  return (
    <div className="mb-4">
      <div className="flex items-start gap-2">
        <div className="h-[30px] w-[30px] rounded-full overflow-hidden flex-shrink-0">
          <img
            src={reply.author.user_pic}
            className="h-full w-full object-cover"
            alt="avatar"
          />
        </div>
        <div className="flex-1">
          {/* Author + time */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">
              {reply.author.first_name} {reply.author.last_name}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(reply.createdAt).toLocaleString()}
            </span>
          </div>

          {/* Content */}
          <div className="text-sm text-textSlightDark-0 mt-1">
            {renderFormattedText(reply.content)}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={() => onToggleLike(discussionId, reply.id)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition"
            >
              {reply.liked ? (
                <BsHeartFill className="text-red-500 text-[10px]" />
              ) : (
                <BiHeart className="text-[10px]" />
              )}
              <span>{reply._count?.likes || 0}</span>
            </button>

            <button
              onClick={() =>
                onShowReplyInput(
                  discussionId,
                  reply.id,
                  `${reply.author.first_name} ${reply.author.last_name}`,
                )
              }
              className="text-xs text-gray-400 hover:text-primaryColors-0 transition"
            >
              Reply
            </button>

            {hasNested && (
              <button
                onClick={() => onToggleNestedReplies(reply.id)}
                className="text-xs text-primaryColors-0 hover:underline transition"
              >
                {showNestedReplies
                  ? "Hide replies"
                  : `${reply.replies!.length} ${reply.replies!.length === 1 ? "reply" : "replies"}`}
              </button>
            )}
          </div>

          {/* Nested reply input */}
          {replyingTo?.replyId === reply.id && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-[28px] w-[28px] rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={userPic}
                  className="h-full w-full object-cover"
                  alt="avatar"
                />
              </div>
              <div className="flex-1 flex gap-2 relative items-center">
                <input
                  id={`reply-input-${reply.id}`}
                  type="text"
                  placeholder={`Reply to ${replyingTo.authorName}...`}
                  value={nestedCommentText}
                  onChange={(e) =>
                    onNestedTextChange(discussionId, e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      onSubmitNestedReply(discussionId, reply.id);
                  }}
                  className="h-[35px] px-3 bg-[#ccc]/20 text-textSlightDark-0 rounded-full w-full border-none outline-none text-[0.8rem] pr-10"
                  autoFocus
                />
                <button
                  onClick={() => onSubmitNestedReply(discussionId, reply.id)}
                  className="absolute right-10 top-[2.5px] flex justify-center items-center h-[30px] w-[30px] bg-primaryColors-0 text-white rounded-full text-sm hover:bg-primaryColors-0/90 transition"
                >
                  <IoSend size={12} />
                </button>
                <button
                  onClick={() => onCancelReply(discussionId)}
                  className="text-xs text-gray-400 hover:text-red-500 whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Nested replies list */}
          {showNestedReplies && hasNested && (
            <div className="mt-2 ml-4 pl-4 border-l-2 border-gray-100">
              {reply.replies!.map((nestedReply) => (
                <NestedReplyItem
                  key={nestedReply.id}
                  nestedReply={nestedReply}
                  discussionId={discussionId}
                  parentReplyId={reply.id}
                  onToggleLike={onToggleNestedLike}
                  renderFormattedText={renderFormattedText}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
