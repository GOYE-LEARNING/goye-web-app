"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";
import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";
import Step4 from "./step4";
import Finished from "../../finished";
import { useSignup } from "../../../context/SignupContext";
import { useAuthContext } from "@/app/context/AuthContext";
import { saveAuthTokens, saveUserProfile } from "@/app/utils/database/db";
import { useModal } from "@/app/context/SimpleModalContext";
import { getFriendlyErrorMessage } from "@/app/utils/errorMessages";
import { hasVerifiedOtp, clearOtpVerified } from "@/app/utils/signupFlowGuard";
import { useI18n } from "@/app/context/I18nContext";

export default function WelcomeMoreAuth() {
  const [step, setStep] = useState<number>(0);

  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [showMoreAuth, setShowMoreAuth] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // ✅ store all step data
  const { formData, setFormData } = useSignup();
  const { authStatus,setAuthStatus, login } = useAuthContext();
  const { showModal } = useModal();
  const router = useRouter();
  const { t, refreshFromBackend } = useI18n();

  // Block direct URL access — only reachable after OTP verification, unless the
  // user already has a session requiring profile completion (e.g. social login).
 
  // Set after a successful signup so the guard below doesn't treat the
  // now-cleared OTP flag as "direct URL access" and kick the user to /auth.
  const signupCompletedRef = useRef(false);
 
  useEffect(() => {
    if (signupCompletedRef.current) return;
    if (!hasVerifiedOtp() && !authStatus?.requiresProfileCompletion) {
      router.replace("/auth");
    }
  }, [router, authStatus]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const isInstructor = formData.role === "instructor";
  const totalSteps = isInstructor ? 4 : 3;

  //To send register the user — returns whether it actually succeeded, so
  // the caller doesn't advance past the form on a failed attempt.
 const signupUser = async (): Promise<boolean> => {
    try {
      const isCompletingProfile = authStatus.requiresProfileCompletion == true;
 
      const tutorFields = isInstructor
        ? {
            bio: formData.bio,
            church_name: formData.church_name,
            church_role: formData.church_role,
            social_media: formData.social_media,
          }
        : {};
 
      const common = {
        password: formData.password,
        country: formData.country,
        state: formData.city,
        language: formData.language,
        languageCode: formData.languageCode,
        phone_number: formData.phone,
        role: formData.role,
        level: formData.level,
        ...tutorFields,
      };
 
      const payload = isCompletingProfile
        ? {
            first_name: authStatus.user?.first_name,
            last_name: authStatus.user?.last_name,
            ...common,
          }
        : {
            first_name: formData.firstname,
            last_name: formData?.lastname,
            email_address: formData.email,
            ...common,
          };
 
      const res = await fetch(
        `${API_URL}${isCompletingProfile ? "/api/user/complete-profile" : "/api/user/signup"}`,
        {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        },
      );
 
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showModal(
          t("Something went wrong"),
          getFriendlyErrorMessage(
            new Error(data?.message || `: ${res.status}`),
            "finishing your signup",
          ),
          "error",
        );
        return false;
      }
 
      // Mark done BEFORE touching authStatus, so the guard effect skips.
      signupCompletedRef.current = true;
      clearOtpVerified();
 
      // Keep the tokens for the Authorization header (authHeaders reads them
      // from IndexedDB). Never let this block the flow.
      if (data?.accessToken || data?.refreshToken) {
        Promise.resolve(
          saveAuthTokens({
            ...(data.accessToken && { accessToken: data.accessToken }),
            ...(data.refreshToken && { refreshToken: data.refreshToken }),
          } as any),
        ).catch((e: any) => console.error("saveAuthTokens failed", e));
      }
 
      // Build the user that goes into authStatus: what the server returned,
      // plus what it doesn't echo back (role, level), falling back to the
      // existing user when this was the complete-profile path.
      const serverUser = data?.user ?? {};
      const userData = {
        ...(isCompletingProfile ? authStatus.user : {}),
        ...serverUser,
        first_name:
          serverUser.first_name ??
          authStatus.user?.first_name ??
          formData.firstname,
        last_name:
          serverUser.last_name ??
          authStatus.user?.last_name ??
          formData.lastname,
        email_address:
          serverUser.email_address ??
          authStatus.user?.email_address ??
          formData.email,
        role: formData.role,
        level: formData.level,
        isProfileComplete: true,
      };
 
      // login() saves the profile, marks the session authenticated, sets
      // authStatus (with the user), and calls refreshFromBackend() itself.
      await login(userData);
 
      return true;
    } catch (error) {
      showModal(
        t("Something went wrong"),
        getFriendlyErrorMessage(error, "finishing your signup"),
        "error",
      );
      return false;
    }
  };
 
// ─────────────────────────────────────────────────────────────────────────────
// 4. openPopup stays the same as before (with the try/finally).
// ─────────────────────────────────────────────────────────────────────────────
  const openPopup = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const succeeded = await signupUser();
      if (!succeeded) return;
      localStorage.setItem("role", formData.role as any);
      setShowMoreAuth(false);
      setShowPopup(true);
    } finally {
      setIsSubmitting(false);
    }
  };
 
 
  //isComplete
  const isComplete = [
    formData.country && formData.city && formData.phone,
    formData.role,
    formData.level,
    isInstructor
      ? !!(formData.bio && formData.church_name && formData.church_role)
      : true,
  ];

  const nextStep = () => {
    if (step < totalSteps - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

 

  const steps = [
    <Step1 formData={formData} setFormData={setFormData} />,
    <Step2 formData={formData} setFormData={setFormData} />,
    <Step3 formData={formData} setFormData={setFormData} />,
    ...(isInstructor
      ? [<Step4 formData={formData} setFormData={setFormData} />]
      : []),
  ];

  

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
                {t("Back")}
              </span>
              <span
                className={`form_more text-plainColors-0 bg-primaryColors-0 ${isSubmitting ? "opacity-60 pointer-events-none" : ""}`}
                onClick={
                  step === totalSteps - 1 && isComplete[step]
                    ? openPopup
                    : nextStep
                }
              >
                {isSubmitting ? t("Please wait…") : t("Next")} <FaArrowRight />
              </span>
            </div>
          </div>
        </div>
      )}
      {showPopup && <Finished />}
    </div>
  );
}
