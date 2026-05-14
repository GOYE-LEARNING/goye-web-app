"use client";

import { FaArrowRight } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { IoIosRefresh } from "react-icons/io";
import { OrgSignUp } from "../BodyProvider";
import { useEffect, useState } from "react";

export default function SchoolInfo({ hideButton = false }: { hideButton?: boolean }) {
  const { formData, setFormData, isSchoolComplete } = OrgSignUp();
  const [docFile, setDocFile] = useState<File | null>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ✅ Handle document upload (PDF / image)
  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setDocFile(file);
    setFormData({
      ...formData,
      school_document: file, // Store the actual File object, not just the preview URL
    });
  };

  // ✅ Remove document
  const removeDoc = () => {
    if (typeof formData.school_document === "string" && formData.school_document?.startsWith("blob:")) {
      URL.revokeObjectURL(formData.school_document);
    }

    setDocFile(null);
    setFormData({
      ...formData,
      school_document: "",
    });
  };

    useEffect(() => {
      setFormData({ ...formData, school_email: formData.org_email });
    }, [formData.org_email]);

  const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const form = [
    {
      label: "School Name",
      name: "school_name",
      type: "text",
      value: formData.school_name,
    },
    {
      label: "Type of School",
      name: "school_type",
      type: "text",
      value: formData.school_type,
    },
    {
      label: "School Address",
      name: "school_address",
      type: "text",
      value: formData.school_address,
    },
    {
      label: "Administrator Name",
      name: "school_admin_name",
      type: "text",
      value: formData.school_admin_name,
    },
    {
      label: "School Role",
      name: "school_role",
      type: "text",
      value: formData.school_role,
    },
    {
      label: "Official School Email Domain",
      name: "school_email",
      type: "email",
      value: formData.school_email,
    },
    {
      label: "School Website",
      name: "school_website",
      type: "text",
      value: formData.school_website,
    },
    {
      label: "Accreditation / Registration Number ",
      name: "school_accreditation_number",
      type: "text",
      value: formData.school_accreditation_number,
    },
    {
      label: "Upload Official Document / ID (blurred)",
      name: "school_document",
      type: "file",
      value: formData.school_document,
    },
  ];


  return (
    <div
      className="
          glass_effect
          relative
          text-white
        rounded-[30px]
        w-full h-full
        p-[20px]
        overflow-y-auto
        overflow-x-hidden
        chat_scroll3
    "
    >
      <h1 className="md:text-[24px] text-[20px] text-white font-semibold pb-[20px]">
        School Information
      </h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="md:grid md:grid-cols-2 flex flex-col  gap-5 w-full mt-3">
          {form.map((data, i) => (
            <div
              key={i}
              className={`flex flex-col gap-1 ${
                data.type === "file" ? "col-span-2" : ""
              }`}
            >
              <label className="md:text-[0.8rem] text-[0.95rem]">
                {data.label}
              </label>

              {/* ✅ DOCUMENT UPLOAD */}
              {data.type === "file" ? (
                <div
                  className="
                   relative
                    h-[140px]
                    rounded-2xl
                    bg-white/20
                    backdrop-blur-lg
                    backdrop-saturate-150
                    border border-white/30
                    shadow-inner
                    overflow-hidden
                "
                >
                  {!formData.school_document ? (
                    <>
                      <label
                        htmlFor="school-doc"
                        className="absolute inset-0 flex flex-col justify-center items-center cursor-pointer"
                      >
                        <span className="text-[14px] font-medium">
                          Upload school document
                        </span>
                        <span className="text-[12px] text-white">
                          PDF, PNG, JPG
                        </span>
                      </label>

                      <input
                        id="school-doc"
                        type="file"
                        accept="image/png, image/jpeg, application/pdf"
                        className="hidden"
                        onChange={handleDocChange}
                      />
                    </>
                  ) : (
                    <div className="relative w-full h-full flex justify-center items-center bg-[#eaeaea]">
                      <span className="text-[14px] text-textGrey-0">
                        Document selected
                      </span>

                      <div className="absolute inset-0 bg-black/40 flex justify-center items-center gap-3">
                        <button
                          type="button"
                          onClick={removeDoc}
                          className="  px-4 py-1
                            rounded-xl
                            bg-white/70
                            backdrop-blur-md
                            hover:bg-white
                            flex items-center gap-2"
                        >
                          <MdDelete /> Remove
                        </button>

                        <label
                          htmlFor="school-doc-replace"
                          className="  px-4 py-1
                            rounded-xl
                            bg-white/70
                            backdrop-blur-md
                            hover:bg-white
                            flex items-center gap-2 cursor-pointer"
                        >
                          <IoIosRefresh /> Replace
                        </label>

                        <input
                          id="school-doc-replace"
                          type="file"
                          accept="image/png, image/jpeg, application/pdf"
                          className="hidden"
                          onChange={handleDocChange}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type={data.type}
                  name={data.name}
                  value={data.value as any || ""}
                  onChange={handleChange}
                    className="glass_input"
                  placeholder={`${
                    data.name == "school_role" ? "What your role here ?" : ""
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {!hideButton && (
          <button
            disabled={!isSchoolComplete}
            className={`
                     float-right
                     mt-8
                     w-[200px]
                     h-[44px]
                     rounded-xl
                     flex items-center justify-center gap-2
                     bg-black/80
                     backdrop-blur-md
                     text-white
                     transition-all
                     ${
                       !isSchoolComplete
                         ? "opacity-50 cursor-not-allowed"
                         : "hover:bg-black"
                     }
                   `}
          >
            Continue <FaArrowRight />
          </button>
        )}
      </form>
    </div>
  );
}
