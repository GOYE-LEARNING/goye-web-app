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
import VerifyEmail from "@/app/auth/verify_email";
import AuthLoader from "@/app/auth/auth_loader";
import { useSignup } from "../../../context/SignupContext";
import { useAuthContext } from "@/app/context/AuthContext";
import {
  saveAuthTokens,
  getAuthTokens,
  getOrCreateDeviceId,
} from "@/app/utils/database/db";
import { useModal } from "@/app/context/SimpleModalContext";
import { getFriendlyErrorMessage } from "@/app/utils/errorMessages";
import { hasVerifiedOtp, clearOtpVerified } from "@/app/utils/signupFlowGuard";
import { useI18n } from "@/app/context/I18nContext";

/**
 * Where this page is in the "is this person allowed in?" decision:
 *  - checking     : working out which case applies
 *  - sending-otp  : sending a verification code
 *  - otp-needed   : showing the OTP screen (email not verified yet)
 *  - ready        : show the profile steps
 */
type Gate = "checking" | "sending-otp" | "otp-needed" | "ready";

/** Reads the (unverified) payload of the OTP session token we stored. */
function readOtpSession(): { email?: string; exp?: number } | null {
  try {
    const token = localStorage.getItem("otp-token");
    if (!token) return null;
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/**
 * The email the person typed earlier, for when this page was reloaded and the
 * in-memory form is empty. If your SignupContext stores the form under a
 * different localStorage key, change "GOYE_FORM_DATA" below.
 */
function readSavedEmail(): string {
  try {
    const raw = localStorage.getItem("GOYE_FORM_DATA");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.email) return String(parsed.email);
    }
  } catch {
    // fall through
  }
  return localStorage.getItem("otp-email") || "";
}

export default function WelcomeMoreAuth() {
  const [step, setStep] = useState<number>(0);
  const [gate, setGate] = useState<Gate>("checking");

  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [showMoreAuth, setShowMoreAuth] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // ✅ store all step data
  const { formData, setFormData } = useSignup();
  const { authStatus, login, updateAuthStatus } = useAuthContext();
  const { showModal } = useModal();
  const router = useRouter();
  const { t } = useI18n();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Set after a successful signup so nothing below reacts to the
  // now-cleared OTP flag.
  const signupCompletedRef = useRef(false);
  // The gate decision runs once (also guards React strict-mode double effects).
  const decidedRef = useRef(false);

  const isInstructor = formData.role === "instructor";
  const totalSteps = isInstructor ? 4 : 3;

  // ───────────────────────────────────────────────────────────────────────────
  // GATE: replaces the old "no OTP? go back to /auth" redirect.
  //
  //   1. OTP already verified in this browser        → show the steps
  //   2. Signed in, profile unfinished (e.g. Google) → show the steps
  //      (the account exists and Google verified the email, so no OTP)
  //   3. Page was reloaded and the context was reset → ask the backend whether
  //      there is a session with an unfinished profile; if so, same as 2
  //   4. Otherwise the email is not verified → send an OTP and show the OTP
  //      screen. Only if there is no email at all is there nothing to verify,
  //      and only then does the person go back to /auth to start signup.
  // ───────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (decidedRef.current) return;
    decidedRef.current = true;

    const probeSession = async (): Promise<any | null> => {
      try {
        const [deviceId, tokens] = await Promise.all([
          getOrCreateDeviceId(),
          getAuthTokens(),
        ]);
        const res = await fetch(`${API_URL}/api/user/profile`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-Device-Id": deviceId,
            ...(tokens?.accessToken && {
              Authorization: `Bearer ${tokens.accessToken}`,
            }),
          },
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data?.user ?? null;
      } catch {
        return null;
      }
    };

    const requestOtp = async (email: string) => {
      setGate("sending-otp");
      try {
        const res = await fetch(`${API_URL}/api/user/sendOtp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, purpose: "signup" }),
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          // e.g. the email already has an account → tell them, then send them
          // to log in (or to Google sign-in, per the server's message).
          showModal(
            t("Error"),
            data?.message || t("Failed to send OTP. Please try again."),
            "error",
          );
          router.replace("/auth");
          return;
        }

        localStorage.setItem("otp-token", data.sessionToken);
        localStorage.setItem("otp-email", data.email);
        setGate("otp-needed");
      } catch (error) {
        showModal(
          t("Something went wrong"),
          getFriendlyErrorMessage(error, "sending your verification code"),
          "error",
        );
        router.replace("/auth");
      }
    };

    const decide = async () => {
      // 1. Already verified.
      if (hasVerifiedOtp()) {
        setGate("ready");
        return;
      }

      // 2. Signed in with an unfinished profile (Google).
      if (authStatus?.requiresProfileCompletion) {
        setGate("ready");
        return;
      }

      // 3. After a reload the context is empty, so ask the backend.
      const sessionUser = await probeSession();
      if (sessionUser?.id) {
        if (sessionUser.isProfileComplete === false) {
          updateAuthStatus({
            isExistingUser: true,
            isProfileComplete: false,
            requiresProfileCompletion: true,
            isLoading: false,
            user: {
              id: sessionUser.id,
              first_name: sessionUser.first_name || "",
              last_name: sessionUser.last_name || "",
              email_address: sessionUser.email_address || "",
              role: sessionUser.role || "student",
              level: sessionUser.level,
              userType: sessionUser.userType,
            },
          });
          setGate("ready");
        } else {
          // Signed in with a finished profile: nothing to do on this page.
          router.replace("/loading");
        }
        return;
      }

      // 4. Not verified, no account: the email must be verified with an OTP.
      const email = (formData.email || readSavedEmail()).trim();
      if (!email) {
        // Nothing to verify yet: start signup from the beginning.
        router.replace("/auth");
        return;
      }

      // Reuse a still-valid code session (e.g. a quick reload) instead of
      // sending another email and using up the rate limit.
      const existing = readOtpSession();
      const stillFresh =
        !!existing?.exp &&
        existing.exp * 1000 > Date.now() + 30_000 &&
        existing.email?.toLowerCase() === email.toLowerCase();

      if (stillFresh) {
        setGate("otp-needed");
        return;
      }

      await requestOtp(email);
    };

    decide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A signed-in, unfinished-profile session can show up after the first
  // render (the auth context finishing its check). That is enough on its own.
  useEffect(() => {
    if (authStatus?.requiresProfileCompletion && gate !== "ready") {
      setGate("ready");
    }
  }, [authStatus?.requiresProfileCompletion, gate]);

  // Registers the user (or completes a Google profile). Returns whether it
  // actually succeeded, so the caller doesn't advance past the form on a
  // failed attempt.
 const signupUser = async (): Promise<boolean> => {
  try {
    // Profile completion is only for a user that already exists (row in DB).
    // A fresh Google signup has no authStatus.user.id yet — it must go
    // through /signup, which creates the row.
    const isCompletingProfile =
      authStatus.requiresProfileCompletion === true &&
      !!authStatus.user?.id;

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
          first_name: formData.firstname || authStatus.user?.first_name,
          last_name: formData.lastname || authStatus.user?.last_name,
          email_address:
            authStatus.user?.email_address || formData.email,
          ...common,
        }
      : {
          first_name: formData.firstname,
          last_name: formData.lastname,
          email_address: formData.email,
          ...common,
        };

    const res = await fetch(
      `${API_URL}${
        isCompletingProfile
          ? "/api/user/complete-profile"
          : "/api/user/signup"
      }`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      },
    );

    const data = await res.json().catch(() => ({}));
    console.log("signupUser response", data);
    console.log("signupUser payload", payload);

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

    signupCompletedRef.current = true;
    clearOtpVerified();

    if (data?.accessToken || data?.refreshToken) {
      Promise.resolve(
        saveAuthTokens({
          ...(data.accessToken && { accessToken: data.accessToken }),
          ...(data.refreshToken && { refreshToken: data.refreshToken }),
        } as any),
      ).catch((e: any) => console.error("saveAuthTokens failed", e));
    }

    const serverUser = data?.user ?? data?.data?.user ?? {};
    const userData = {
      ...(isCompletingProfile ? authStatus.user : {}),
      ...serverUser,
      first_name:
        serverUser.first_name ??
        (payload as any).first_name ??
        authStatus.user?.first_name ??
        formData.firstname,
      last_name:
        serverUser.last_name ??
        (payload as any).last_name ??
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
  const openPopup = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const succeeded = await signupUser();
      if (!succeeded) return; // stays on the form: error already shown

      localStorage.setItem("role", formData.role as any);
      setShowMoreAuth(false);
      setShowPopup(true);
    } finally {
      // Always runs, so the button can never stay on "Please wait…"
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

  // ── Gate screens ───────────────────────────────────────────────────────────
  if (gate === "checking" || gate === "sending-otp") {
    return <AuthLoader />;
  }

  if (gate === "otp-needed") {
    return (
      <div className="flex justify-center items-center flex-col w-full">
        <VerifyEmail
          type="signing_up"
          openCreateNewPassword={() => {}}
          // Called by VerifyEmail once the code is correct.
          openSignup={() => setGate("ready")}
        />
      </div>
    );
  }

  // ── gate === "ready": the profile steps ────────────────────────────────────
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