"use client";

import React, { useState } from "react";
import { IoIosRefresh } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import DropDowns from "../drop_downs";
import { FaCheck, FaChevronDown } from "react-icons/fa";

interface Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
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

export default function CourseStep1({ formData, setFormData }: Props) {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<string[]>([]);
  const courseLevel = formData.course_level;

  const handleChangeLevel = (level: string) => {
    setFormData({ ...formData, course_level: level });
    setSelectedValue(level as any);
    setShowDropdown(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ✅ Fixed: Handle file upload properly
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        course_image: previewUrl, // For preview
        courseImageFile: file,    // For actual upload
      });
    }
  };

  const form: Form[] = [
    {
      label: "Course Title",
      type: "text",
      name: "course_title",
      value: formData.course_title,
      onchange: handleChange,
    },
    {
      label: "Short Description",
      type: "text",
      name: "course_short_description",
      value: formData.course_short_description,
      onchange: handleChange,
    },
    {
      label: "Description",
      name: "course_description",
      value: formData.course_description,
      onchange: handleChange,
    },
    {
      label: "Level",
      type: "text",
      name: "course_level",
      value: formData.course_level,
      onchange: handleChange,
    },
    {
      label: "Course Thumbnail",
      type: "file",
      name: "course_image",
      value: formData.course_image,
      onchange: handleChange,
    },
  ];

  const levels = ["Beginner", "Intermediate"];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-textSlightDark-0 font-semibold text-[18px]">Course Information</h1>
      {form.map((data, i) => {
        return (
          <div
            key={i}
            className={`border border-[#D2D5DA] flex justify-between items-center w-full py-[8px] px-[12px] ${
              data.type === "file"
                ? "border-none px-0"
                : data.name == "course_level"
                ? "flex-row p-0"
                : ""
            }`}
          >
            <div className={`flex flex-col w-full ${data.name == 'course_level' ? 'h-[48px]' : ''}`}>
              <label className="text-textGrey-0 text-[12px]">
                {data.label}
              </label>

              {/* DESCRIPTION FIELD */}
              {data.name === "course_description" ? (
                <textarea
                  name={data.name}
                  value={data.value}
                  onChange={data.onchange}
                  className="border-none outline-none text-textSlightDark-0 h-[100px] font-[500] resize-none"
                />
              ) : data.type === "file" ? (
                /* ✅ FIXED: FILE UPLOAD FIELD */
                <div
                  className={`flex justify-center items-center flex-col gap-2 my-4 h-[120px] border border-dashed border-[#D2D5DA] rounded-md relative overflow-hidden`}
                >
                  {!formData.course_image ? (
                    <>
                      <label
                        htmlFor="course-image"
                        className="flex justify-center items-center flex-col w-full h-full absolute top-0 left-0 cursor-pointer"
                      >
                        <h1 className="text-nearTextColors-0 text-[14px] font-[500]">
                          Upload thumbnail image
                        </h1>
                        <p className="text-textGrey-0 text-[12px]">
                          Supports JPEG or PNG
                        </p>
                      </label>
                      <input
                        id="course-image"
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </>
                  ) : (
                    <div className="relative w-full h-full">
                      <img
                        src={formData.course_image}
                        alt="Thumbnail preview"
                        className="absolute top-0 left-0 w-full h-full object-cover rounded-md"
                      />
                      <div className="flex justify-center items-center gap-2 w-full h-full text-white absolute top-0 left bg-[#0000004D]">
                        <button
                          type="button"
                          onClick={() => setFormData({ 
                            ...formData, 
                            course_image: "",
                            courseImageFile: undefined 
                          })}
                          className="h-[30px] w-[113px] flex items-center justify-center gap-2 bg-[#FFFFFF66]"
                        >
                          <MdDelete /> Remove
                        </button>
                        <div>
                          <label
                            htmlFor="course-image-replace"
                            className="h-[30px] w-[113px] flex items-center justify-center gap-2 bg-[#FFFFFF66] cursor-pointer"
                          >
                            <IoIosRefresh /> Retake
                          </label>
                          <input
                            id="course-image-replace"
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : data.name == "course_level" ? (
                <div className="relative w-full">
                  {showDropdown && (
                    <div>
                      <DropDowns
                        value={courseLevel}
                        onChange={() => {}}
                        countries={levels.map((level, i) => {
                          return (
                            <div
                              key={i}
                              onClick={() => handleChangeLevel(level)}
                              className="flex justify-between items-center w-full p-3 hover:bg-secondaryColors-0 cursor-pointer"
                            >
                              <div>{level}</div>
                              {courseLevel === level && (
                                <span className="text-primaryColors-0">
                                  <FaCheck size={12} />
                                </span>
                              )}
                            </div>
                          );
                        })}
                      />
                    </div>
                  )}
                  {selectedValue}
                </div>
              ) : (
                /* TEXT INPUT FIELDS */
                <input
                  type={data.type}
                  name={data.name}
                  value={data.value}
                  onChange={data.onchange}
                  className="border-none outline-none w-full text-textSlightDark-0 font-[500] text-[16px]"
                />
              )}
            </div>
            {data.name == "course_level" ? (
              <div className="">
                <FaChevronDown onClick={() => setShowDropdown(true)} />
              </div>
            ) : (
              ""
            )}
          </div>
        );
      })}
    </div>
  );
}