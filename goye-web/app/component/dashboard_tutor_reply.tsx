"use client";

import React, { useState } from "react";
import { FaReply } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";

interface Props {
  cancel: () => void;
  onReplyUpdate?: (replyUpdate?: any) => void;
  postId: string;
  parentReplyId?: string; // ✅ Optional for nested replies
}

export default function DashboardTutorReply({
  cancel,
  postId,
  parentReplyId,
  onReplyUpdate,
}: Props) {
  const [content, setContent] = useState<string>("");

  const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!content.trim()) {
    alert("Please write something before replying!");
    return;
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const bodyData: any = { content };
  if (parentReplyId) bodyData.parentId = parentReplyId; // send only for nested replies

  try {
    const res = await fetch(`${API_URL}/api/socials/create-reply/${postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(bodyData),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Reply failed:", data);
      return;
    }

    setContent("");
    if (onReplyUpdate) onReplyUpdate(data.data);
    cancel();
  } catch (error) {
    console.error(error);
  }
};


  return (
    <div className="w-[390px] fixed top-0 right-0 h-full bg-white drop-shadow-sm p-[32px] border border-[#E3E3E833] transition-all duration-300 ease-in-out">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-[#1F2130] font-bold text-[24px]">New Reply</h1>
        <span onClick={cancel} className="cursor-pointer">
          <MdOutlineCancel size={20} className="text-[18px]" />
        </span>
      </div>

      <div className="dashboard_hr my-5"></div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
        {/* Content Input */}
        <div className="w-full h-[176px] border border-[#D2D5DA] py-[8px] px-[12px] flex relative">
          <div className="flex flex-col w-full h-full">
            <label className="text-[#71748C] text-[12px]">Content</label>
            <textarea
              name="content"
              onChange={handleTextArea}
              value={content}
              cols={30}
              className="text-[#1F2937] text-[16px] font-[500] outline-none border-none resize-none h-full"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2 mt-[25%]">
          <button
            type="submit"
            className="form_more bg-primaryColors-0 text-white flex items-center gap-2"
          >
            Reply <FaReply />
          </button>

          <button
            type="button"
            onClick={cancel}
            className="form_more bg-[#F5F5F5] text-primaryColors-0 flex items-center gap-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
