"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import ForgotPassword from "./forgot_password";
import Message from "../component/message";
import { FaCheck } from "react-icons/fa6";

interface formData {
  email: string;
  password: string;
}

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState<formData>({
    email: "",
    password: "",
  });
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [showForgotPasswordPage, setForgotPassowrdPage] = useState<boolean>(false);
  const [showLoginPage, setShowLoginPage] = useState<boolean>(true);
  
  const showForgotPage = () => {
    setForgotPassowrdPage(true);
    setShowLoginPage(false);
  };

  const showLoginFunc = () => {
    setForgotPassowrdPage(false);
    setShowLoginPage(true);
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ Reset message state before new submission
    setShowMessage(false);
    setError(false);
    setMessage("");
    
    try {
      const res = await fetch(`${API_URL}/api/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
        credentials: "include",
      });

      const data = await res.json();
      setMessage(data.message);

      if (!res.ok) {
        setError(true);
        setShowMessage(true);
        return;
      }

      localStorage.setItem("first_name", `${data.data.user.first_name}`);
      localStorage.removeItem("token");
      localStorage.setItem("role", data.data.user.role);
      
      setFormData({ email: "", password: "" });
      
      // Redirect to loading page
      router.push("../loading");
      
    } catch (error) {
      setError(true);
      setMessage("Network error: Unable to connect to server");
      setShowMessage(true);
    }
    // ✅ REMOVED: finally block that was causing the issue
  };

  const loginComponent = [
    {
      id: 1,
      label: "Email address",
      type: "email",
      name: "email",
      value: formData["email"] as string,
      handlechange: handleChange,
    },
    {
      id: 2,
      label: "Password",
      type: !showPassword ? "password" : "text",
      name: "password",
      value: formData["password"] as string,
      handlechange: handleChange,
      iconChange: !showPassword ? <IoMdEye /> : <IoMdEyeOff />,
    },
  ];

  return (
    <>
      {showMessage && (
        <Message
          icon={error ? <span>&times;</span> : <FaCheck color="white" />}
          color={error ? "#DA0E29" : "#007E50"}
          message={message}
          width={100}
        />
      )}
      {showLoginPage && (
        <div className="form_container">
          <h1 className="form_h1">Login</h1>
          <p className="form-p">Enter your details below to sign in</p>
          <form
            method="POST"
            onSubmit={handleSubmit}
            noValidate
            className="form"
          >
            {loginComponent.map((form) => (
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
                  className={`absolute left-[12px] label peer-focus:text-[14px] peer-focus:top-[2px] transition-all duration-300 ease-in-out md:peer-placeholder-shown:top-[18px] peer-placeholder-shown:top-[19.8px] peer-placeholder-shown:text-[16px] ${
                    form.value
                      ? "top-[2px] text-[14px]"
                      : "top-[15px] text-[16px]"
                  }`}
                >
                  {form.label}
                </label>

                <div
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setShowPassword(!showPassword);
                  }}
                  className="cursor-pointer absolute right-[17px] top-[22px] flex justify-center items-center"
                >
                  {form.iconChange}
                </div>
              </div>
            ))}
            <span className="form_link" onClick={showForgotPage}>
              Forgot Password ?
            </span>
            <button type="submit" className="form_btn mt-[5rem] md:mt-0">
              Login <FaArrowRight size={13} />
            </button>
          </form>
        </div>
      )}
      {showForgotPasswordPage && (
        <ForgotPassword showLoginPage={showLoginFunc} />
      )}
    </>
  );
}