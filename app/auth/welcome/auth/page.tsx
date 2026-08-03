"use client";

import { useState, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";
import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";
import Step4 from "./step4";
import Finished from "../../finished";
import { useSignup } from "../../../context/SignupContext";
import { useAuthContext } from "@/app/context/AuthContext";
import { saveUserProfile } from "@/app/utils/database/db";
import { useModal } from "@/app/context/SimpleModalContext";
import { getFriendlyErrorMessage } from "@/app/utils/errorMessages";

export default function WelcomeMoreAuth() {
  const [step, setStep] = useState<number>(0);

  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [showMoreAuth, setShowMoreAuth] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // ✅ store all step data
  const { formData, setFormData } = useSignup();
  const { authStatus } = useAuthContext();
  const { showModal } = useModal();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const isInstructor = formData.role === "instructor";
  const totalSteps = isInstructor ? 4 : 3;

  //To send register the user — returns whether it actually succeeded, so
  // the caller doesn't advance past the form on a failed attempt.
  const signupUser = async (): Promise<boolean> => {
    try {
      const res = await fetch(
        `${API_URL}${authStatus.requiresProfileCompletion ? "/api/user/complete-profile" : "/api/user/signup"}`,
        {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify(
            authStatus.requiresProfileCompletion == true
              ? {
                  first_name: authStatus.user?.first_name,
                  last_name: authStatus.user?.last_name,
                  password: formData.password,
                  country: formData.country,
                  state: formData.city,
                  language: formData.language,
                  languageCode: formData.languageCode,
                  phone_number: formData.phone,
                  role: formData.role,
                  level: formData.level,
                  ...(isInstructor
                    ? {
                        bio: formData.bio,
                        church_name: formData.church_name,
                        church_role: formData.church_role,
                        social_media: formData.social_media,
                      }
                    : {}),
                }
              : {
                  first_name: formData.firstname,
                  last_name: formData?.lastname,
                  email_address: formData.email,
                  password: formData.password,
                  country: formData.country,
                  state: formData.city,
                  language: formData.language,
                  languageCode: formData.languageCode,
                  phone_number: formData.phone,
                  role: formData.role,
                  level: formData.level,
                  ...(isInstructor
                    ? {
                        bio: formData.bio,
                        church_name: formData.church_name,
                        church_role: formData.church_role,
                        social_media: formData.social_media,
                      }
                    : {}),
                },
          ),
          credentials: "include",
        },
      );

      const data = await res.json();
      if (!res.ok) {
        showModal("Something went wrong", getFriendlyErrorMessage(new Error(data?.message || `: ${res.status}`), "finishing your signup"), "error");
        return false;
      }
      await saveUserProfile({ first_name: authStatus.user?.first_name as any });
      return true;
    } catch (error) {
      showModal("Something went wrong", getFriendlyErrorMessage(error, "finishing your signup"), "error");
      return false;
    }
  };

  //isComplete
  const isComplete = [
    formData.country && formData.city && formData.phone,
    formData.role,
    formData.level,
    isInstructor ? !!(formData.bio && formData.church_name && formData.church_role) : true,
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
    ...(isInstructor ? [<Step4 formData={formData} setFormData={setFormData} />] : []),
  ];

  const openPopup = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const succeeded = await signupUser();
    setIsSubmitting(false);
    if (!succeeded) return; // stays on the form — error already shown via showModal

    localStorage.setItem("role", formData.role as any);
    setShowMoreAuth(false);
    setShowPopup(true);
  };

  return (
    <div className="flex justify-center items-center flex-col w-full">
      {showMoreAuth && (
        <div className="form_container">
          <div className="flex md:justify-start justify-center md:items-start items-center gap-3 md:my-5 mb-[1.8rem] md:mb-[0] w-full">
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
                className="form_more dark:bg-secondaryColors-0 bg-white text-primaryColors-0"
                onClick={prevStep}
              >
                Back
              </span>
              <span
                className={`form_more text-plainColors-0 bg-primaryColors-0 ${isSubmitting ? "opacity-60 pointer-events-none" : ""}`}
                onClick={step === totalSteps - 1 && isComplete[step] ? openPopup : nextStep}
              >
                {isSubmitting ? "Please wait…" : "Next"} <FaArrowRight />
              </span>
            </div>
          </div>
        </div>
      )}
      {showPopup && <Finished />}
    </div>
  );
}
