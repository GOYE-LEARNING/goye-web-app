"use client";

import { form } from "framer-motion/m";
import React, { useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

interface formData {
  firstname: string;
  lastname: string;
  email: string;
}
export default function Signin() {
  const [formData, setFormData] = useState<formData>({
    firstname: "",
    lastname: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSignin = () => {
    localStorage.setItem('GOYE_FORM_DATA', JSON.stringify(formData))
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
      <div className="form_container">
        <h1 className="form_h1">Signin</h1>
        <p className="form-p">
          Let get you started on your discipleship journey
        </p>
        <form noValidate className="form">
          {signinComponent.map((form) => (
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
          <span className="form_btn" onClick={handleSignin}>
            Next <FaArrowRight size={13} />
          </span>
        </form>
      </div>
    </>
  );
}
