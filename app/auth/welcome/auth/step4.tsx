"use client";
import React from "react";

// Only shown to tutors (formData.role === "instructor") — collects the
// info needed for future manual verification of instructors. Social media
// is the one genuinely optional field; the rest are required for tutors
// since they're what a reviewer would actually check.
export default function Step4({
  formData,
  setFormData,
}: {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}) {
  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <div className="w-full">
      <h1 className="form_h1">Tell us about your ministry.</h1>
      <p className="form-p my-5">
        This helps us verify tutors and keep GOYE a trusted place to learn.
      </p>

      <form className="flex flex-col gap-4 my-4">
        <div className="relative">
          <textarea
            value={formData.bio || ""}
            onChange={handleChange("bio")}
            placeholder=" "
            rows={4}
            className="form_input peer focus:outline-none resize-none"
          />
          <label
            className={`absolute left-[12px] label peer-focus:text-[14px] peer-focus:top-[2px] transition-all duration-300 ease-in-out ${
              formData.bio ? "top-[2px] text-[14px]" : "top-[15px] text-[16px]"
            }`}
          >
            Describe yourself
          </label>
        </div>

        <div className="relative">
          <input
            type="text"
            value={formData.church_name || ""}
            onChange={handleChange("church_name")}
            placeholder=" "
            className="form_input peer focus:outline-none"
          />
          <label
            className={`absolute left-[12px] label peer-focus:text-[14px] peer-focus:top-[2px] transition-all duration-300 ease-in-out peer-placeholder-shown:top-[15px] peer-placeholder-shown:text-[16px] ${
              formData.church_name ? "top-[2px] text-[14px]" : "top-[15px] text-[16px]"
            }`}
          >
            Church you attend
          </label>
        </div>

        <div className="relative">
          <input
            type="text"
            value={formData.church_role || ""}
            onChange={handleChange("church_role")}
            placeholder=" "
            className="form_input peer focus:outline-none"
          />
          <label
            className={`absolute left-[12px] label peer-focus:text-[14px] peer-focus:top-[2px] transition-all duration-300 ease-in-out peer-placeholder-shown:top-[15px] peer-placeholder-shown:text-[16px] ${
              formData.church_role ? "top-[2px] text-[14px]" : "top-[15px] text-[16px]"
            }`}
          >
            Your role in that church
          </label>
        </div>

        <div className="relative">
          <input
            type="text"
            value={formData.social_media || ""}
            onChange={handleChange("social_media")}
            placeholder=" "
            className="form_input peer focus:outline-none"
          />
          <label
            className={`absolute left-[12px] label peer-focus:text-[14px] peer-focus:top-[2px] transition-all duration-300 ease-in-out peer-placeholder-shown:top-[15px] peer-placeholder-shown:text-[16px] ${
              formData.social_media ? "top-[2px] text-[14px]" : "top-[15px] text-[16px]"
            }`}
          >
            Social media (optional)
          </label>
        </div>
      </form>
    </div>
  );
}
