"use client";

import React, { useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import VerifyEmail from "./verify_email";
import { useSignup } from "./SignupContext";

export default function Signin() {
  const [showEmail, setShowEmail] = useState<boolean>(false);
  const [showSignup, setShowSignup] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const showEmailFunc = () => {
    setShowEmail(true);
    setShowSignup(false);
  };
  const { formData, setFormData } = useSignup();

  const sendOTP = async () => {
    setIsLoading(true);
    setShowSignup(false);
    try {
      const res = await fetch(`${API_URL}/api/user/sendOtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();
      localStorage.setItem("otp-token", data.sessionToken);
      localStorage.setItem("otp-email", data.email);

      console.log(data);
      setIsLoading(false);
      showEmailFunc();
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    sendOTP();
  };

  const signinComponent = [
    {
      id: 1,
      label: "First name",
      type: "text",
      name: "firstname",
      value: formData["firstname"] as string,
      handlechange: handleChange,
    },
    {
      id: 2,
      label: "Last name",
      type: "text",
      name: "lastname",
      value: formData["lastname"] as string,
      handlechange: handleChange,
    },
    {
      id: 3,
      label: "Email address",
      type: "email",
      name: "email",
      value: formData["email"] as string,
      handlechange: handleChange,
    },
  ];

  return (
    <>
      {showSignup && (
        <div className="form_container">
          <h1 className="form_h1">Signin</h1>
          <p className="form-p">
            Let get you started on your discipleship journey
          </p>
          <form
            method="POST"
            onSubmit={handleSubmit}
            noValidate
            className="form"
          >
            {signinComponent.map((form) => (
              <div key={form.id} className="form_label">
                <input
                  type={form.type}
                  name={form.name}
                  value={form.value}
                  onChange={handleChange}
                  placeholder=" "
                  required
                  className={`form_input peer focus:outline-none`}
                />
                <label
                  htmlFor={form.name}
                  className={`absolute top-[15px] left-[12px] label peer-focus:text-[14px] peer-focus:top-[2px] transition-all duration-300 ease-in-out peer-placeholder-shown:top-[15px] peer-placeholder-shown:text-[16px] ${
                    form.value
                      ? "top-[2px] text-[14px]"
                      : "top-[15px] text-[16px]"
                  }`}
                >
                  {form.label}
                </label>
              </div>
            ))}
            <button className="form_btn md:mt-0 mt-[3rem]" type="submit">
              Next <FaArrowRight size={13} />
            </button>
          </form>
        </div>
      )}
      {isLoading && (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin h-[60px] w-[60px] bg-transparent border-4 border-t-[#ccc] border-r-primaryColors-0 border-l-[#ccc] border-b-[#ccc] rounded-full"></div>
        </div>
      )}
      {showEmail && <VerifyEmail openSignup={() => {}} />}
    </>
  );
}
