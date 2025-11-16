"use client";

import { useState, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";
import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";
import Finished from "../../finished";
import { useSignup } from "../../SignupContext";

export default function WelcomeMoreAuth() {
  const [step, setStep] = useState<number>(0);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [showMoreAuth, setShowMoreAuth] = useState<boolean>(true);
  const totalSteps = 3;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  // ✅ store all step data
  const { formData, setFormData } = useSignup();

  //To send register the user
  const signupUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/signup`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          first_name: formData.firstname,
          last_name: formData.lastname,
          email_address: formData.email,
          password: formData.password,
          country: formData.country,
          state: formData.city,
          phone_number: formData.phone,
          role: formData.role,
          level: formData.level,
        }),
        credentials: 'include'
      });

      const data = await res.json();
      console.log(data.message);
      localStorage.removeItem('token')
      localStorage.setItem("first_name", data.user.first_name)
    } catch (error) {
      console.error(error);
    }
  };

  //isComplete
  const isComplete = [
    formData.country && formData.city && formData.phone,
    formData.role,
    formData.level,
  ];

  const nextStep = () => {
    if (step < totalSteps - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = () => {
    console.log("Final Form Data:", formData);
    // 🟢 here you can send it to backend
    // fetch("/api/submit", { method: "POST", body: JSON.stringify(formData) });
    localStorage.removeItem("GOYE_FORM_DATA");
  };

  const steps = [
    <Step1 formData={formData} setFormData={setFormData} />,
    <Step2 formData={formData} setFormData={setFormData} />,
    <Step3 formData={formData} setFormData={setFormData} />,
  ];

  const openPopup = () => {
    setShowMoreAuth(false);
    setShowPopup(true);
    localStorage.setItem("role", formData.role as any);
    signupUser();
  };

  return (
    <div className="flex justify-center items-center flex-col w-full">
      {showMoreAuth && (
        <div className="form_container">
          <div className="flex md:justify-start justify-center md:items-start items-center gap-3 md:my-5 my-[4rem] w-full">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <button
                key={index}
                onClick={() => setStep(index)}
                className={`w-[127.33px] h-[3px] rounded-xl ${
                  isComplete[index]
                    ? "bg-primaryColors-0"
                    : step == index
                    ? "bg-primaryColors-0/10"
                    : "bg-[#D9D9D9]"
                }`}
              ></button>
            ))}
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full"
          >
            {steps[step]}
          </motion.div>

          <div className="w-full md:mt-0 mt-[5rem]">
            <div className="grid grid-cols-2 gap-3">
              <span
                className="form_more bg-secondaryColors-0 text-primaryColors-0"
                onClick={prevStep}
              >
                Back
              </span>
              <span
                className="form_more text-plainColors-0 bg-primaryColors-0"
                onClick={step === 2 && isComplete[step] ? openPopup : nextStep}
              >
                Next <FaArrowRight />
              </span>
            </div>
          </div>
        </div>
      )}
      {showPopup && <Finished />}
    </div>
  );
}
