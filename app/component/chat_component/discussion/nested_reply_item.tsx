// app/component/chat_component/discussion/nested_reply_item.tsx
"use client";

import { BiHeart } from "react-icons/bi";
import { BsHeartFill } from "react-icons/bs";
import { NestedReply } from "@/app/interface/discussion";

interface Props {
  nestedReply: NestedReply;
  discussionId: string;
  parentReplyId: string;
  onToggleLike: (discussionId: string, replyId: string, parentReplyId: string) => void;
  renderFormattedText: (text: string) => any;
}

export default function NestedReplyItem({
  nestedReply,
  discussionId,
  parentReplyId,
  onToggleLike,
  renderFormattedText,
}: Props) {
  return (
    <div className="mb-2">
      <div className="flex items-start gap-2">
        <div className="h-[25px] w-[25px] rounded-full overflow-hidden flex-shrink-0">
          <img
            src={nestedReply.author.user_pic}
            className="h-full w-full object-cover"
            alt="avatar"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-xs">
              {nestedReply.author.first_name} {nestedReply.author.last_name}
            </span>
            {nestedReply.replyTo && (
              <span className="text-xs text-primaryColors-0">
                → @{nestedReply.replyTo.name.split(" ")[0]}
              </span>
            )}
            <span className="text-xs text-gray-400">
              {new Date(nestedReply.createdAt).toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-textSlightDark-0 mt-1">
            {renderFormattedText(nestedReply.content)}
          </div>
          <button
            onClick={() => onToggleLike(discussionId, nestedReply.id, parentReplyId)}
            className="flex items-center gap-1 mt-1 text-xs text-gray-400 hover:text-red-500 transition"
          >
            {nestedReply._count.likes > 1 ? (
              <BsHeartFill className="text-red-500 text-[8px]" />
            ) : (
              <BiHeart className="text-[8px]" />
            )}
            <span className="text-[10px]">{nestedReply._count?.likes || 0}</span>
          </button>
        </div>
      </div>
    </div>
  );
}