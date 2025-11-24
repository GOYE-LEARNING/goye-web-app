"use client";

import React, { useState } from "react";
import { BsFillSendFill } from "react-icons/bs";
import { MdOutlineCancel } from "react-icons/md";

interface Props {
  cancel: () => void;
  openPosts: () => void;
  courseId: string
}

export default function DashboardNewPost({ cancel, openPosts, courseId }: Props) {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    if (!title || !content) {
      alert("Please fill out both fields before posting!");
      return;
    }
    const res = await fetch(`${API_URL}/api/socials/create-post/${courseId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title, content: content }),
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) {
      console.log("An erro occured while submitting the post");
    }
    console.log(data.message);
    console.log({ title, content });
    openPosts();
    setTitle("");
    setContent("");
    cancel(); // Close sidebar after successful post
  };

  return (
    <>
      <div className="w-[390px] fixed top-0 right-0 h-full bg-white drop-shadow-2xl p-[32px] border border-[#E3E3E833] transition-all duration-300 ease-in-out">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-[#1F2130] font-bold text-[24px]">New Post</h1>
          <span onClick={cancel} className="cursor-pointer">
            <MdOutlineCancel size={20} className="text-[18px]" />
          </span>
        </div>

        <div className="dashboard_hr my-5"></div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3"
          noValidate
        >
          {/* Title Input */}
          <div className="w-full h-[63px] border border-[#D2D5DA] py-[8px] px-[12px] flex items-center relative">
            <div className="flex flex-col w-full">
              <label className="text-[#71748C] text-[12px]">Title</label>
              <input
                type="text"
                name="title"
                onChange={handleChange}
                value={title}
                className="text-[#1F2937] text-[16px] font-[500] outline-none border-none w-full"
              />
            </div>
          </div>

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
              Post <BsFillSendFill />
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
    </>
  );
}
