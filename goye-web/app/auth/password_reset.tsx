"use client";

import React, { useState } from "react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { MdCancel, MdCheckCircle } from "react-icons/md";
interface PasswordConfirmation {
  password: string;
  confirmPassword: string;
}
export default function PasswordReset() {
  const [passwordsConfirmation, setPasswordConfirmation] =
    useState<PasswordConfirmation>({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const [touched, setTouched] = useState<boolean>(false);

  // ✅ Fixed: Correct regex (not strings)
  const rules = [
    { text: "At least 8 characters", test: /.{8,}/ },
    { text: "At least one number", test: /\d/ },
    { text: "At least one symbol", test: /[@$!%*?&]/ },
  ];

  // ✅ Fixed: handleChange now receives event properly
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordConfirmation({ ...passwordsConfirmation, [name]: value });
    if (!touched) setTouched(true);
  };

  // ✅ Fixed: e.preventDefault() called correctly
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    //const allPassed = rules.every((rule) => rule.test.test(password))
  };

  return (
    <>
      <div className="form_container">
        <h1 className="form_h1">Reset Password</h1>
        <p className="form-p">Set your new password</p>
        <form noValidate className="form py-5" onSubmit={handleSubmit}>
          <div className="form_label relative">
            <input
              type={!showPassword ? "password" : "text"}
              name="password"
              value={passwordsConfirmation.password}
              onChange={handleChange}
              onBlur={() => setTouched(true)}
              placeholder=" "
              className={`form_input peer focus:outline-none`}
            />

            <label
              htmlFor="password"
              className={`absolute top-[15px] left-[12px] label peer-focus:text-[14px] peer-focus:top-[2px] transition-all duration-300 ease-in-out peer-placeholder-shown:top-[15px] peer-placeholder-shown:text-[16px] ${
                passwordsConfirmation.password
                  ? "top-[2px] text-[14px]"
                  : "top-[15px] text-[16px]"
              }`}
            >
              Password
            </label>

            <div
              onMouseDown={(e) => {
                e.preventDefault();
                setShowPassword(!showPassword);
              }}
              className="cursor-pointer absolute right-[17px] top-[22px] flex justify-center items-center"
            >
              {!showPassword ? <IoMdEye /> : <IoMdEyeOff />}
            </div>

            {/* ✅ Password rule validation below input */}
            {touched && (
              <div className="flex flex-col items-start gap-2 mt-3 text-[14px]">
                {rules.map((rule, index) => {
                  const passed = rule.test.test(passwordsConfirmation.password);
                  return (
                    <div key={index} className="flex items-center gap-2">
                      {passed ? (
                        <MdCheckCircle className="text-green-500" />
                      ) : (
                        <MdCancel className="text-red-500" />
                      )}
                      <span>{rule.text}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="form_label relative">
            <input
              type={!showConfirmPassword ? "password" : "text"}
              name="confirmPassword"
              value={passwordsConfirmation.confirmPassword}
              onChange={handleChange}
              placeholder=" "
              className={`form_input peer focus:outline-none`}
            />

            <label
              htmlFor="confirmPassword"
              className={`absolute top-[15px] left-[12px] label peer-focus:text-[14px] peer-focus:top-[2px] transition-all duration-300 ease-in-out peer-placeholder-shown:top-[15px] peer-placeholder-shown:text-[16px] ${
                passwordsConfirmation.confirmPassword
                  ? "top-[2px] text-[14px]"
                  : "top-[15px] text-[16px]"
              }`}
            >
              Confirm password
            </label>

            <div
              onMouseDown={(e) => {
                e.preventDefault();
                setShowConfirmPassword(!showConfirmPassword);
              }}
              className="cursor-pointer absolute right-[17px] top-[22px] flex justify-center items-center"
            >
              {!showConfirmPassword ? <IoMdEye /> : <IoMdEyeOff />}
            </div>
          </div>
          <input type="submit" value="Submit" className="form_btn" />
        </form>
      </div>
    </>
  );
}
