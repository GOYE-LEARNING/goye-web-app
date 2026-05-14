"use client";

import { useEffect, useState } from "react";
import SubHeader from "./dashboard_subheader";
import { IoEye, IoEyeOff } from "react-icons/io5";
import Loader from "./loader";
import { CiCircleInfo } from "react-icons/ci";
import { IoIosInformationCircle } from "react-icons/io";

interface Props {
  submitFunc: () => void;
  backFunc: () => void;
}

interface FormData {
  current_password: string;
}

export default function DashboardCheckPassword({
  submitFunc,
  backFunc,
}: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    current_password: "",
  });

  // Track which field is visible
  const [activeShowPassword, setActiveShowPassword] = useState<
    "current" | null
  >(null);

  const handleClick = (tab: "current") => {
    // Toggle logic: if already open, close it
    setActiveShowPassword((prev) => (prev === tab ? null : tab));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = (): boolean => {
    return true;
  };

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    if (validate()) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      try {
        const res = await fetch(`${API_URL}/api/user/check-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password: formData.current_password,
          }),
          credentials: "include",
        });

        const data = await res.json();
        setIsLoading(false);
        if (!res.ok) {
          console.log("Error updating passowrd");
          console.log(data.error);
          return;
        }
        console.log(data.error);

        submitFunc();
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Define all password input fields
  const forms = [
    {
      label: "Current password",
      name: "current_password",
      key: "current" as const,
    },
  ];

  return (
    <>
      <div>
        <SubHeader
          header="Remember Password"
          backFunction={() => {
            backFunc();
          }}
        />
        <div className="flex items-center gap-2">
          <IoIosInformationCircle color="gold" size={20} />
          <p className="text-nearTextColors-0 text-[12px]">
            To change password, you must remember the current one.
          </p>
        </div>
        <div className="dashboard_content_mainbox">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
            noValidate
          >
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
                    className={`text-[#1F2937] text-[16px] font-[500] outline-none border-none `}
                    required
                  />
                </div>

                {/* 👁 Show/Hide button */}
                <div>
                  {isLoading ? (
                    <Loader
                      height={20}
                      width={20}
                      border_width={2}
                      full_border_color="white"
                      small_border_color="#FFA500"
                    />
                  ) : (
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
                  )}
                </div>
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3">
              <span
                className="form_more bg-[#ffffff] text-[#71748C] border border-[#D9D9D9]"
                onClick={() => {
                  setFormData({
                    current_password: "",
                  });
                }}
              >
                Clear
              </span>
              <div>
                {isLoading == true ? (
                  <div className="form_more md:mt-0 opacity-70">
                    <div className="animate-spin h-[30px] w-[30px] border-[4px] border-r-[white] rounded-full bg-transparent"></div>
                  </div>
                ) : (
                  <button type="submit" className="form_more text-white bg-primaryColors-0 md:mt-0">
                    Submit
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
