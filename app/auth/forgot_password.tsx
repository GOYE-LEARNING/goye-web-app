"use client";

import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import AuthLoader from "./auth_loader";
import { useModal } from "@/app/context/SimpleModalContext";
import TranslatedText from "../hook/translateText";

interface Props {
  showLoginPage: () => void;
  onForgotPasswordSuccess?: (email: string) => void;
}

export default function ForgotPassword({ showLoginPage, onForgotPasswordSuccess }: Props) {
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const { showModal } = useModal();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (message) setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage({ text: "Please enter your email address", type: "error" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/api/user/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send reset link");
      }

      setMessage({
        text: data.message || `Password reset link sent to ${email}`,
        type: "success",
      });

      // Notify parent component
      if (onForgotPasswordSuccess) {
        onForgotPasswordSuccess(email);
      }

      // Clear email input
      setEmail("");

      // Show success modal
      showModal(
        "Check Your Email",
        `We've sent a password reset link to ${email}. Please check your inbox and follow the instructions to reset your password.`,
        "success"
      );

      // Redirect back to login after 3 seconds
      setTimeout(() => {
        showLoginPage();
      }, 3000);
    } catch (error: any) {
      console.error("Forgot password error:", error);
      setMessage({
        text: error.message || "An error occurred. Please try again.",
        type: "error",
      });
      showModal("Error", error.message || "Failed to send reset link. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <AuthLoader />;
  }

  return (
    <div className="form_container z-20">
      <div className="flex items-center gap-3">
        <span
          className="cursor-pointer text-primaryColors-0 font-bold"
          onClick={showLoginPage}
        >
          <FaArrowLeft />
        </span>
        <h1 className="form_h1">
          <TranslatedText text="Forgot Password" />
        </h1>
      </div>
      <p className="form-p">
        <TranslatedText text="Enter your email address and we'll send you a link to reset your password." />
      </p>

      {message && (
        <div
          className={`p-3 rounded-lg mb-4 ${
            message.type === "success"
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="form">
        <div className="form_label">
          <input
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            placeholder=" "
            required
            className="form_input peer focus:outline-none"
          />
          <label
            htmlFor="email"
            className={`absolute left-[12px] label peer-focus:text-[14px] peer-focus:top-[10px] transition-all duration-300 ease-in-out md:peer-placeholder-shown:top-[18px] peer-placeholder-shown:top-[19.8px] peer-placeholder-shown:text-[16px] ${
              email ? "top-[2px] text-[14px]" : "top-[15px] text-[16px]"
            }`}
          >
            <TranslatedText text="Email address" />
          </label>
        </div>

        <button type="submit" className="form_btn mt-[2rem] md:mt-0">
          <TranslatedText text="Send Reset Link" /> <FaArrowRight size={13} />
        </button>

        <div className="text-center mt-4">
          <span
            className="text-primaryColors-0 cursor-pointer hover:underline"
            onClick={showLoginPage}
          >
            <TranslatedText text="Back to Login" />
          </span>
        </div>
      </form>
    </div>
  );
}