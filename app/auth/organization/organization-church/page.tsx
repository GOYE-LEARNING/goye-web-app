"use client";

import { FaArrowRight } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { IoIosRefresh } from "react-icons/io";
import { OrgSignUp } from "../BodyProvider";
import { useEffect, useState } from "react";

export default function ChurchInfo({
  hideButton = false,
}: {
  hideButton?: boolean;
}) {
  const { formData, setFormData, isChurchComplete } = OrgSignUp();
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    setFormData({ ...formData, church_email: formData.org_email });
  }, [formData.org_email]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const previewUrl = URL.createObjectURL(selectedFile);
    setFile(selectedFile);
    setFormData({ ...formData, church_logo: selectedFile }); // Store the actual File object
  };

  const removeLogo = () => {
    if (
      typeof formData.church_logo === "string" &&
      formData.church_logo?.startsWith("blob:")
    ) {
      URL.revokeObjectURL(formData.church_logo);
    }
    setFile(null);
    setFormData({ ...formData, church_logo: "" });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const form = [
    {
      type: "text",
      name: "church_min_name",
      label: "Church / Ministry Name",
      value: formData.church_min_name,
    },
    {
      type: "text",
      name: "church_ld_pastor",
      label: "Church Lead Pastor",
      value: formData.church_ld_pastor,
    },
    {
      type: "text",
      name: "church_address",
      label: "Church Address",
      value: formData.church_address,
    },
    {
      type: "text",
      name: "church_leader_ship_role",
      label: "Church Role",
      value: formData.church_leader_ship_role,
    },
    {
      type: "text",
      name: "church_weekly_service",
      label: "Church Weekly Service",
      value: formData.church_weekly_service,
    },
    {
      type: "email",
      name: "church_email",
      label: "Church Email",
      value: formData.church_email,
    },
    {
      type: "text",
      name: "church_website",
      label: "Church Website",
      value: formData.church_website,
    },

    {
      type: "file",
      name: "church_logo",
      label: "Church Logo",
      value: formData.church_logo,
    },
  ];

  return (
    <div
      className="
          glass_effect
          relative
          text-white
          rounded-[30px]
          w-full h-full p-6 overflow-y-auto chat_scroll3"
    >
      {/* GLASS CONTAINER */}
      <div
        className="
         
        "
      >
        <h1 className="text-[22px] font-semibold text-white mb-6">
          Church Information
        </h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="md:grid md:grid-cols-2 flex flex-col gap-6">
            {form.map((data, i) => (
              <div
                key={i}
                className={`flex flex-col gap-1 ${
                  data.name === "church_logo" || data.name === "church_website"
                    ? "md:col-span-2"
                    : ""
                }`}
              >
                <label className="md:text-[0.8rem] text-[0.95rem] text-white">
                  {data.label}
                </label>

                {/* LOGO UPLOAD */}
                {data.name === "church_logo" ? (
                  <div
                    className="
                      relative h-[150px]
                      bg-white/15
                      backdrop-blur-lg
                      border border-dashed border-white/30
                      rounded-2xl
                      shadow-inner
                      overflow-hidden
                    "
                  >
                    {!formData.church_logo ? (
                      <>
                        <label
                          htmlFor="church-logo"
                          className="absolute inset-0 flex flex-col justify-center items-center cursor-pointer text-white/80"
                        >
                          <span className="font-medium">
                            Upload church logo
                          </span>
                          <span className="text-[12px] opacity-70">
                            PNG or JPG
                          </span>
                        </label>
                        <input
                          id="church-logo"
                          type="file"
                          accept="image/png, image/jpeg, image/jpg"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </>
                    ) : (
                      <div className="relative w-full h-full">
                        <img
                          src={formData.church_logo}
                          alt="Church logo"
                          className="w-full h-full object-cover"
                        />

                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center gap-4">
                          <button
                            type="button"
                            onClick={removeLogo}
                            className="
                              px-4 py-1.5
                              bg-white/25
                              backdrop-blur-md
                              border border-white/30
                              rounded-lg
                              text-white
                              flex items-center gap-2
                              hover:bg-white/35
                            "
                          >
                            <MdDelete /> Remove
                          </button>

                          <label
                            htmlFor="church-logo-replace"
                            className="
                              px-4 py-1.5
                              bg-white/25
                              backdrop-blur-md
                              border border-white/30
                              rounded-lg
                              text-white
                              flex items-center gap-2
                              cursor-pointer
                              hover:bg-white/35
                            "
                          >
                            <IoIosRefresh /> Replace
                          </label>

                          <input
                            id="church-logo-replace"
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* GLASS INPUT */
                  <input
                    type={data.type}
                    value={typeof data.value === "string" ? data.value : ""}
                    onChange={handleChange}
                    name={data.name}
                    className="glass_input"
                  />
                )}
              </div>
            ))}
          </div>

          {!hideButton && (
            <button
              disabled={!isChurchComplete}
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
                    !isChurchComplete
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
    </div>
  );
}
