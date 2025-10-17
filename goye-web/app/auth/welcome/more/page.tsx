"use client";

import { useState, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";
import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";

export default function WelcomeMoreAuth() {
  const [step, setStep] = useState<number>(0);
  const totalSteps = 3;

  // ✅ store all step data
  const [formData, setFormData] = useState({
    country: "",
    city: "",
    phone: "",
    role: "",
    level: "",
  });

  // ✅ Load saved data (if any)
  useEffect(() => {
    const saved = localStorage.getItem("GOYE_FORM_DATA");
    if (saved) setFormData(JSON.parse(saved));
  }, []);

  // ✅ Save data when updated
  useEffect(() => {
    localStorage.setItem("GOYE_FORM_DATA", JSON.stringify(formData));
  }, [formData]);

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

  return (
    <div className="flex justify-center items-center flex-col">
      <div className="form_container">
        <div className="flex gap-3 my-5">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <button
              key={index}
              onClick={() => setStep(index)}
              className={`w-[127.33px] h-[3px] rounded-xl ${
                step === index ? "bg-primaryColors-0" : "bg-secondaryColors-0"
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
        >
          {steps[step]}
        </motion.div>

        <div>
      
            <div className="grid grid-cols-2 gap-3">
              <span
                className="form_more bg-secondaryColors-0 text-primaryColors-0"
                onClick={prevStep}
              >
                Back
              </span>
              <span
                className="form_more text-plainColors-0 bg-primaryColors-0"
                onClick={nextStep}
              >
                Next <FaArrowRight />
              </span>
            </div>
          
        </div>
      </div>
    </div>
  );
}
