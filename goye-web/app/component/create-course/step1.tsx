"use client";

import React, { useState } from "react";
import { IoIosRefresh } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import DropDowns from "../drop_downs";
import { FaCheck, FaChevronDown } from "react-icons/fa";

interface Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  uploadCourseImage?: (file: File, courseId: string) => Promise<string>; // Add this prop
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

export default function CourseStep1({
  formData,
  setFormData,
  uploadCourseImage,
}: Props) {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const courseLevel = formData.course_level;

  const handleChangeLevel = (level: string) => {
    setFormData({ ...formData, course_level: level });
    setSelectedValue([level]);
    setShowDropdown(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ✅ IMPROVED: Handle file upload with immediate upload option
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);

      // Create preview URL for immediate UI feedback
      const previewUrl = URL.createObjectURL(file);

      // Update form with preview immediately
      setFormData({
        ...formData,
        course_image: previewUrl,
        courseImageFile: file,
      });

      if (formData.courseId && uploadCourseImage) {
        const imageUrl = await uploadCourseImage(file, formData.courseId);
        setFormData({
          ...formData,
          course_image: imageUrl, // Replace with actual URL
          courseImageFile: undefined, // Clear the file since it's uploaded
        });
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      // Optionally show error message to user
      setFormData({
        ...formData,
        course_image: "",
        courseImageFile: undefined,
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    // Revoke the object URL to prevent memory leaks
    if (formData.course_image && formData.course_image.startsWith("blob:")) {
      URL.revokeObjectURL(formData.course_image);
    }

    setFormData({
      ...formData,
      course_image: "",
      courseImageFile: undefined,
    });
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
      <h1 className="text-textSlightDark-0 font-semibold text-[18px]">
        Course Information
      </h1>
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
            <div
              className={`flex flex-col w-full ${
                data.name == "course_level" ? "h-[48px]" : ""
              }`}
            >
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
                /* ✅ IMPROVED: FILE UPLOAD FIELD */
                <div
                  className={`flex justify-center items-center flex-col gap-2 my-4 h-[120px] border border-dashed border-[#D2D5DA] rounded-md relative overflow-hidden ${
                    uploadingImage ? "opacity-50" : ""
                  }`}
                >
                  {!formData.course_image ? (
                    <>
                      <label
                        htmlFor="course-image"
                        className={`flex justify-center items-center flex-col w-full h-full absolute top-0 left-0 cursor-pointer ${
                          uploadingImage ? "pointer-events-none" : ""
                        }`}
                      >
                        {uploadingImage ? (
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primaryColors-0 mx-auto mb-2"></div>
                            <p className="text-textGrey-0 text-[12px]">
                              Uploading...
                            </p>
                          </div>
                        ) : (
                          <>
                            <h1 className="text-nearTextColors-0 text-[14px] font-[500]">
                              Upload thumbnail image
                            </h1>
                            <p className="text-textGrey-0 text-[12px]">
                              Supports JPEG or PNG
                            </p>
                          </>
                        )}
                      </label>
                      <input
                        id="course-image"
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={uploadingImage}
                      />
                    </>
                  ) : (
                    <div className="relative w-full h-full">
                      <img
                        src={formData.course_image}
                        alt="Thumbnail preview"
                        className="absolute top-0 left-0 w-full h-full object-cover rounded-md"
                      />
                      <div className="flex justify-center items-center gap-2 w-full h-full text-white absolute top-0 left-0 bg-[#0000004D]">
                        <button
                          type="button"
                          onClick={removeImage}
                          className="h-[30px] w-[113px] flex items-center justify-center gap-2 bg-[#FFFFFF66] hover:bg-[#FFFFFF99] transition-colors"
                          disabled={uploadingImage}
                        >
                          <MdDelete /> Remove
                        </button>
                        <div>
                          <label
                            htmlFor="course-image-replace"
                            className={`h-[30px] w-[113px] flex items-center justify-center gap-2 bg-[#FFFFFF66] hover:bg-[#FFFFFF99] transition-colors cursor-pointer ${
                              uploadingImage
                                ? "pointer-events-none opacity-50"
                                : ""
                            }`}
                          >
                            <IoIosRefresh /> Replace
                          </label>
                          <input
                            id="course-image-replace"
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={uploadingImage}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : data.name == "course_level" ? (
                <div className="relative w-full">
                  <div
                    className="flex justify-between items-center w-full cursor-pointer"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <span
                      className={
                        courseLevel
                          ? "text-textSlightDark-0"
                          : "text-textGrey-0"
                      }
                    >
                      {courseLevel}
                    </span>
                    <FaChevronDown
                      className={`transition-transform ${
                        showDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {showDropdown && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-[#D2D5DA] shadow-lg z-10">
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
                              <div
                                className={
                                  courseLevel === level
                                    ? "text-primaryColors-0 font-medium"
                                    : ""
                                }
                              >
                                {level}
                              </div>
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
          </div>
        );
      })}
    </div>
  );
}
