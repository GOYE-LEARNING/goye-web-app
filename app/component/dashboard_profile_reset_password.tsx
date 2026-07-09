"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { MdCancel, MdCheckCircle } from "react-icons/md";
import { AnimatePresence, motion } from "framer-motion";
import Loader from "./loader";

interface Props {
  backFunction?: () => void;
}

export default function DashboardProfileResetPassword({ backFunction }: Props) {
  const [formData, setFormData] = useState<{ password: string }>({
    password: "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [touched, setTouched] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const router = useRouter();

  const rules = [
    { text: "At least 8 characters", test: /.{8,}/ },
    { text: "At least one number", test: /\d/ },
    { text: "At least one symbol", test: /[@$!%*?&]/ },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, password: e.target.value });
    if (!touched) setTouched(true);
    if (message) setMessage(null);
  };

  const validatePassword = (): boolean => {
    const allPassed = rules.every((rule) => rule.test.test(formData.password));
    if (!allPassed) {
      setMessage({
        text: "Please meet all password requirements",
        type: "error",
      });
      return false;
    }
    return true;
  };

  const handleRedirect = () => {
    console.log("handleRedirect called");
    if (backFunction) {
      console.log("Calling backFunction");
      backFunction();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setIsLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    try {
      const res = await fetch(`${API_URL}/api/user/update-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          newPassword: formData.password,
        }),
      });

      const data = await res.json();
      console.log(data);
      if (!res.ok) {
        throw new Error(
          data.message || data.error || "Failed to update password",
        );
      }

      setMessage({ text: "Password updated successfully!", type: "success" });
      setFormData({ password: "" });
      setTouched(false);

      // Redirect after showing success message
      setTimeout(() => {
        handleRedirect();
      }, 1500);
    } catch (error) {
      console.error("Error updating password:", error);
      setMessage({
        text:
          error instanceof Error
            ? error.message
            : "Failed to update password. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="md:hidden block"></div>

      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key="message"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3, ease: "easeIn" }}
            className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg ${
              message.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            <p>{message.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {true && (
          <motion.div
            key="reset-password"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeIn" }}
            className="form_container"
          >
            <h1 className="form_h1">Reset Password</h1>
            <p className="form-p">
              Your password must be at least 8 characters long, and include 1
              symbol and 1 number.
            </p>
            <form noValidate className="form py-5" onSubmit={handleSubmit}>
              <div className="form_label relative">
                <input
                  type={!showPassword ? "password" : "text"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => setTouched(true)}
                  placeholder=" "
                  disabled={isLoading}
                  className={`form_input peer focus:outline-none ${isLoading ? "opacity-50" : ""}`}
                />

                <label
                  htmlFor="password"
                  className={`absolute top-[15px] left-[12px] label peer-focus:text-[14px] peer-focus:top-[2px] transition-all duration-300 ease-in-out peer-placeholder-shown:top-[15px] peer-placeholder-shown:text-[16px] ${
                    formData.password
                      ? "top-[2px] text-[14px]"
                      : "top-[15px] text-[16px]"
                  }`}
                >
                  Password
                </label>

                <div
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (!isLoading) setShowPassword(!showPassword);
                  }}
                  className="cursor-pointer absolute right-[17px] top-[22px] flex justify-center items-center"
                >
                  {!showPassword ? <IoMdEye /> : <IoMdEyeOff />}
                </div>

                {touched && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-start justify-start gap-2 mt-3 text-[14px] w-full"
                  >
                    {rules.map((rule, index) => {
                      const passed = rule.test.test(formData.password);
                      return (
                        <div key={index} className="flex items-center gap-2">
                          {passed ? (
                            <MdCheckCircle
                              className="text-green-500"
                              size={16}
                            />
                          ) : (
                            <MdCancel className="text-red-500" size={16} />
                          )}
                          <span
                            className={`text-sm ${passed ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}
                          >
                            {rule.text}
                          </span>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="form_btn md:mt-0 mt-[8rem] flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2 justify-center">
                    <Loader
                      height={20}
                      width={20}
                      border_width={2}
                      full_border_color="white"
                      small_border_color="#FFA500"
                    />
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Update Password"
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
