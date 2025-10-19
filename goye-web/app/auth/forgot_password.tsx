"use client";

import React, { useState } from "react";
import { FaArrowRight } from "react-icons/fa";

export default function ForgotPassword() {
  const [email, setEmail] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault;
  };

  return (
    <>
      <div className="form_container">
        <h1 className="form_h1">Forgot Password</h1>
        <p className="form-p">Enter your details below to sign in</p>
        <form noValidate className="form">
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
            <span className="form_more text-plainColors-0 bg-primaryColors-0">
              Next <FaArrowRight />
            </span>
          </div>
        </form>
      </div>
    </>
  );
}
