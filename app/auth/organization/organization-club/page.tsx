"use client";

import { FaArrowRight } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { IoIosRefresh } from "react-icons/io";
import { OrgSignUp } from "../BodyProvider";
import { useEffect, useState } from "react";

export default function ClubInfo({ hideButton = false }: { hideButton?: boolean }) {
  const { formData, setFormData, isClubComplete } = OrgSignUp();
  const [docFile, setDocFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

    useEffect(() => {
      setFormData({ ...formData, club_email: formData.org_email });
    }, [formData.org_email]);
  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setDocFile(file);
    setFormData({ ...formData, club_document: file }); // Store the actual File object
  };

  const removeDoc = () => {
    if (typeof formData.club_document === "string" && formData.club_document?.startsWith("blob:")) {
      URL.revokeObjectURL(formData.club_document);
    }
    setDocFile(null);
    setFormData({ ...formData, club_document: "" });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };



  const form = [
    { label: "Club Name", name: "club_name", type: "text" },
    { label: "Club Type", name: "club_type", type: "text" },
    { label: "Club Leader Name", name: "club_leader_name", type: "text" },
    { label: "Club Role", name: "club_role", type: "text" },
    {
      label: "Meeting Frequency",
      name: "club_meeting_frequency",
      type: "text",
    },
    {
      label: "Social Media / Messaging Group Link",
      name: "club_social_link",
      type: "text",
    },
    { label: "Parent Church / School", name: "club_parent_org", type: "text" },
    {
      label: "Short Description of Activities",
      name: "club_description",
      type: "text",
    },
    { label: "Upload Document", name: "club_document", type: "file" },
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
      <h1 className="text-[20px] md:text-[24px] font-semibold pb-5">
        Club Information
      </h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="md:grid md:grid-cols-2 flex flex-col gap-5">
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
                  {!formData.club_document ? (
                    <>
                      <label
                        htmlFor="club-doc"
                        className="absolute inset-0 text-white flex flex-col justify-center items-center cursor-pointer"
                      >
                        <span className="font-medium">Upload document</span>
                        <span className="text-[12px] opacity-70">
                          PDF, PNG, JPG
                        </span>
                      </label>

                      <input
                        id="club-doc"
                        type="file"
                        accept="image/png, image/jpeg, application/pdf"
                        className="hidden"
                        onChange={handleDocChange}
                      />
                    </>
                  ) : (
                    <div className="relative w-full h-full flex justify-center items-center">
                      <span className="text-sm opacity-80">
                        Document selected
                      </span>

                      <div className="absolute inset-0 bg-black/40 flex justify-center items-center gap-3">
                        <button
                          type="button"
                          onClick={removeDoc}
                          className="
                            px-4 py-1
                            rounded-xl
                            bg-white/70
                            backdrop-blur-md
                            hover:bg-white
                            flex items-center gap-2
                          "
                        >
                          <MdDelete /> Remove
                        </button>

                        <label
                          htmlFor="club-doc-replace"
                          className="
                            px-4 py-1
                            rounded-xl
                            bg-white/70
                            backdrop-blur-md
                            hover:bg-white
                            cursor-pointer
                            flex items-center gap-2
                          "
                        >
                          <IoIosRefresh /> Replace
                        </label>

                        <input
                          id="club-doc-replace"
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
                  value={(formData as any)[data.name] || ""}
                  onChange={handleChange}
                    className="glass_input"
                  placeholder={`${
                    data.name == "club_role" ? "What your role here ?" : ""
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {!hideButton && (
          <button
            disabled={!isClubComplete}
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
                !isClubComplete
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
