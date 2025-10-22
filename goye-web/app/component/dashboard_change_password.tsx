"use client";

import { useState } from "react";
import SubHeader from "./dashboard_subheader";
import { IoEye, IoEyeOff } from "react-icons/io5";

interface Props {
  backFunction: () => void;
}

interface FormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export default function DashboardChangePassword({ backFunction }: Props) {
  const [formData, setFormData] = useState<FormData>({
    current_password: "Password1234",
    new_password: "Password1235",
    confirm_password: "Password12345",
  });

  // Track which field is visible
  const [activeShowPassword, setActiveShowPassword] = useState<
    "current" | "new" | "confirm" | null
  >(null);

  const handleClick = (tab: "current" | "new" | "confirm") => {
    // Toggle logic: if already open, close it
    setActiveShowPassword((prev) => (prev === tab ? null : tab));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const backFunc = () => {
    backFunction();
  };

  // Define all password input fields
  const forms = [
    {
      label: "Current password",
      name: "current_password",
      key: "current" as const,
    },
    {
      label: "New password",
      name: "new_password",
      key: "new" as const,
    },
    {
      label: "Confirm password",
      name: "confirm_password",
      key: "confirm" as const,
    },
  ];

  return (
    <>
      <div>
        <SubHeader header="Change Password" backFunction={backFunc} />
        <div className="dashboard_content_mainbox">
          <form className="flex flex-col gap-5">
            {forms.map((form, i) => (
              <div
                key={i}
                className="w-full h-[63px] border border-[#D2D5DA] py-[8px] px-[12px] flex items-center relative"
              >
                <div className="flex flex-col w-full">
                  <label className="text-[#71748C] text-[12px]">
                    {form.label}
                  </label>
                  <input
                    type={activeShowPassword === form.key ? "text" : "password"} // ✅ correct logic
                    name={form.name}
                    onChange={handleChange}
                    value={(formData as any)[form.name]}
                    className={`text-[#1F2937] text-[16px] font-[500] outline-none border-none ${
                      form.name === "current_password"
                        ? "text-[#71748C] bg-transparent"
                        : ""
                    }`}
                    disabled={form.name === "current_password"}
                  />
                </div>

                {/* 👁 Show/Hide button */}
                <div
                  className="cursor-pointer ml-2"
                  onClick={() => handleClick(form.key)}
                >
                  {activeShowPassword === form.key ? (
                    <IoEyeOff className="text-[#6B7280]" />
                  ) : (
                    <IoEye className="text-[#6B7280]" />
                  )}
                </div>
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3">
              <span className="form_more bg-[#ffffff] text-[#71748C] border border-[#D9D9D9]">
                Cancel
              </span>
              <span className="form_more text-plainColors-0 bg-primaryColors-0">
                Save Changes
              </span>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
