"use client";

import React, { useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa6";
import { AnimatePresence, motion } from "framer-motion";
import LinkSent from "./link_sent";
interface Props {
  showLoginPage: () => void;
}
export default function ForgotPassword({ showLoginPage }: Props) {
  const [email, setEmail] = useState<string>("");
  const [showRecoveryPage, setShowRecoveryPage] = useState<boolean>(false)
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(true)
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

   try {
     const res = await fetch(`${API_URL}/api/user/forgot-password`, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        link: "http://localhost:3000/auth/reset-password",
        email: email,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("An error occured")
    }
    console.log(data)
    setShowRecoveryPage(true)
    setShowForgotPassword(false)
   } catch (error) {
    console.error(error)
   }
    
  };

  return (
    <>
      {showForgotPassword && <div className="form_container">
        <span className="my-3">
          <FaArrowLeft />
        </span>
        <h1 className="form_h1">Forgot Password</h1>
        <p className="form-p">Enter your details below to sign in</p>
        <form method="POST" onSubmit={handleSubmit} noValidate className="form">
          <div className="form_label">
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder=" "
              className={`form_input peer focus:outline-none my-8`}
            />
            <label
              htmlFor="email"
              className={`absolute top-[45px] left-[12px] label peer-focus:text-[14px] peer-focus:top-[35px] transition-all duration-300 ease-in-out peer-placeholder-shown:top-[45px] peer-placeholder-shown:text-[16px] ${
                email ? "top-[45px] text-[14px]" : "top-[50px] text-[16px]"
              }`}
            >
              Email Address
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full">
            <span className="form_more bg-secondaryColors-0 text-primaryColors-0">
              Back
            </span>
            <button type="submit" className="form_more text-plainColors-0 bg-primaryColors-0">
              Next <FaArrowRight />
            </button>
          </div>
        </form>
      </div>}
      {showRecoveryPage && <LinkSent />}
    </>
  );
}
