"use client";

import React, { useState } from "react";
import SubHeader from "./dashboard_subheader";
import { MdDelete } from "react-icons/md";
import { IoIosRefresh } from "react-icons/io";

interface Props {
  cancel: () => void;
}

interface Form {
  label: string;
  type?: string;
  name: string;
  value: string;
  onchange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

interface FormData {
  group_title: string;
  group_short_description: string;
  group_description: string;
  group_image: string;
  group_preview?: string | null;
}

export default function DashboardTutorCreateGroup({ cancel }: Props) {
  const [selectedFile, setSelectedFile] = useState<boolean>(false);

  const [formData, setFormData] = useState<FormData>({
    group_title: "",
    group_short_description: "",
    group_description: "",
    group_image: "",
    group_preview: null,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(true);

    const previewUrl = URL.createObjectURL(file);

    setFormData((prev) => ({
      ...prev,
      group_image: file.name,
      group_preview: previewUrl,
    }));
  };

  const removeImage = () => {
    setSelectedFile(false);
    setFormData((prev) => ({
      ...prev,
      group_image: "",
      group_preview: null,
    }));
    URL.revokeObjectURL(formData.group_preview as any);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const form: Form[] = [
    {
      label: "Group Title",
      type: "text",
      name: "group_title",
      value: formData.group_title,
      onchange: handleChange,
    },
    {
      label: "Short Description",
      type: "text",
      name: "group_short_description",
      value: formData.group_short_description,
      onchange: handleChange,
    },
    {
      label: "Description",
      name: "group_description",
      value: formData.group_description,
      onchange: handleChange,
    },
  ];

  const clearData = () => {
    setFormData({
      group_title: "",
      group_description: "",
      group_short_description: "",
      group_image: "",
      group_preview: "",
    });
  };

  return (
    <>
      <SubHeader header="Create Group" backFunction={cancel} />

      <div className="dashboard_content_mainbox">
        <form
          method="POST"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          {/* RENDER NORMAL INPUTS */}
          {form.map((f, i) => (
            <div
              key={i}
              className="border border-[#D2D5DA] flex flex-col w-full py-2 px-3"
            >
              <label className="text-textGrey-0 text-[12px]">{f.label}</label>

              {f.name === "group_description" ? (
                <textarea
                  name={f.name}
                  value={f.value}
                  onChange={f.onchange}
                  className="outline-none border-none h-[100px] resize-none text-textSlightDark-0 font-[500]"
                />
              ) : (
                <input
                  type={f.type}
                  name={f.name}
                  value={f.value}
                  onChange={f.onchange}
                  className="border-none outline-none text-textSlightDark-0 font-[500] text-[16px]"
                />
              )}
            </div>
          ))}

          {/* IMAGE UPLOAD FIELD */}
          <div className="flex flex-col w-full">
            <label className="font-bold text-[#41415A] mb-1 text-[12px]">
              Group Thumbnail
            </label>

            {/* IF NO IMAGE SELECTED */}
            {!selectedFile && (
              <label
                htmlFor="group-image"
                className="flex justify-center items-center flex-col h-[109px] border border-dashed cursor-pointer"
              >
                <h1 className="text-nearTextColors-0 text-[14px] font-[500]">
                  Upload thumbnail image
                </h1>
                <p className="text-textGrey-0 text-[12px]">
                  Supports JPEG or PNG
                </p>
              </label>
            )}

            <input
              id="group-image"
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* IF IMAGE SELECTED → SHOW PREVIEW */}
            {selectedFile && formData.group_preview && (
              <div className="relative w-full h-[150px] mt-2">
                <img
                  src={formData.group_preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-[#0000004D] flex justify-center items-center gap-3">
                  <button
                    type="button"
                    onClick={removeImage}
                    className="flex items-center gap-2 bg-white/50 text-black px-3 py-1"
                  >
                    <MdDelete /> Remove
                  </button>

                  <label
                    htmlFor="group-image"
                    className="flex items-center gap-2 bg-white/50 text-black px-3 py-1 cursor-pointer"
                  >
                    <IoIosRefresh /> Retake
                  </label>
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="form_more bg-secondaryColors-0 text-primaryColors-0"
              onClick={clearData}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="form_more text-plainColors-0 bg-primaryColors-0"
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
