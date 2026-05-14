"use client";

import React, { useState } from "react";
import { FaReply } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import Loader from "./loader";

interface Props {
  cancel: () => void;
  postId: string;
  parentReplyId?: string;
  onReplyUpdate: (reply: any) => void;
}

export default function DashboardNewReply({ 
  cancel, 
  postId, 
  parentReplyId, 
  onReplyUpdate 
}: Props) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError("Please enter a reply");
      return;
    }

    if (!postId) {
      setError("Post ID is missing");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const url = `${API_URL}/api/socials/create-reply/${postId}`;
      
      const requestBody: any = {
        content: content.trim(),
      };

      if (parentReplyId) {
        requestBody.parentId = parentReplyId;
      }

      console.log("Creating reply:", { url, requestBody, postId, parentReplyId });

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Error response:", data);
        setError(data.message || "Failed to create reply");
        setIsLoading(false);
        return;
      }

      console.log("Reply created successfully:", data);
      
      if (onReplyUpdate && data.data) {
        onReplyUpdate(data.data);
      }
      
      setContent("");
      cancel();
    } catch (error) {
      console.error("Error creating reply:", error);
      setError("An error occurred while creating your reply");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="w-[390px] fixed top-0 right-0 h-full bg-white drop-shadow-2xl p-[32px] border border-[#E3E3E833] transition-all duration-300 ease-in-out overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-textSlightDark-0 font-bold text-[24px]">
            {parentReplyId ? "New Reply to Comment" : "New Reply"}
          </h1>
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
                onChange={(e) => {
                  setContent(e.target.value);
                  if (error) setError("");
                }}
                value={content}
                cols={30}
                placeholder={parentReplyId ? "Write your reply to this comment..." : "Write your reply..."}
                className="text-[#1F2937] text-[16px] font-[500] outline-none border-none resize-none h-full"
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm px-2">{error}</div>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-2 mt-[25%]">
            <button
              type="submit"
              disabled={isLoading || !content.trim()}
              className="form_more bg-primaryColors-0 text-white flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader
                  height={20}
                  width={20}
                  full_border_color="white"
                  small_border_color="transparent"
                  border_width={2}
                />
              ) : (
                <FaReply />
              )}
              {parentReplyId ? "Post Reply" : "Reply"}
            </button>

            <button
              type="button"
              onClick={cancel}
              className="form_more bg-[#F5F5F5] text-primaryColors-0 flex items-center gap-2 justify-center"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}