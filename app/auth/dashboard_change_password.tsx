"use client";

import { useEffect, useState } from "react";
import SubHeader from "../component/dashboard_subheader";
import { IoEye, IoEyeOff } from "react-icons/io5";
import Loader from "../component/loader";
import { AnimatePresence, motion } from "framer-motion";

interface FormData {
  new_password: string;
  confirm_password: string;
}

interface Props {
  backFunction: () => void;
}

export default function DashboardChangePassword({ backFunction }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [status, setStatus] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    new_password: "",
    confirm_password: "",
  });

  // Track which field is visible
  const [activeShowPassword, setActiveShowPassword] = useState<
    "new" | "confirm" | null
  >(null);

  const handleClick = (tab: "new" | "confirm") => {
    // Toggle logic: if already open, close it
    setActiveShowPassword((prev) => (prev === tab ? null : tab));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = (): boolean => {
    if (formData.new_password !== formData.new_password) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    if (validate()) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      try {
        const res = await fetch(`${API_URL}/api/user/update-password`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newPassword: formData.new_password,
          }),
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          console.log("Error updating passowrd");
          return;
        }

        setIsLoading(false);

        setMessage(data.message);
        setShowMessage(true);
        setStatus(200);
        setTimeout(() => {
          setShowMessage(false);
          setStatus(null);
          setMessage("");
        }, 2000);
        setFormData({
          new_password: "",
          confirm_password: "",
        });
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
      <AnimatePresence mode="wait">
        {showMessage && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeIn" }}
            exit={{ opacity: 0, y: -30 }}
            className="bg-green-500 text-white w-full px-3 py-6 flex justify-between items-center"
          >
            <p>{message}</p>
            <span>&times;</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div>
        <SubHeader header="Change Password" backFunction={backFunction} />
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
                    new_password: "",
                    confirm_password: "",
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
                  <button
                    type="submit"
                    className="form_more text-white bg-primaryColors-0 md:mt-0"
                  >
                    Save Changes
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
