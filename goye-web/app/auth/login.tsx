"use client";

import { label } from "framer-motion/client";
import React, { useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

interface formData {
  email: string;
  password: string;
}
export default function Login() {
  const [formData, setFormData] = useState<formData>({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault;
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
      <div className="form_container">
        <h1 className="form_h1">Login</h1>
        <p className="form-p">Enter your details below to sign in</p>
        <form noValidate className="form">
          {loginComponent.map((form) => (
            <div key={form.id} className="form_label">
              <input
                type={form.type}
                name={form.name}
                value={form.value}
                onChange={handleChange}
                placeholder=" "
                className={`form_input peer focus:outline-none`}
              />
              <label
                htmlFor={form.name}
                className={`absolute  left-[12px] label peer-focus:text-[14px] peer-focus:top-[2px] transition-all duration-300 ease-in-out md:peer-placeholder-shown:top-[18px] peer-placeholder-shown:top-[19.8px] peer-placeholder-shown:text-[16px] ${
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
          <span className="form_link">Forgot Password ?</span>
          <span className="form_btn mt-9 md:mt-0">
            Login <FaArrowRight size={13} />
          </span>
        </form>
      </div>
    </>
  );
}
