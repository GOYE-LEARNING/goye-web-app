"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useTimer } from "use-timer";
import OtpLength from "../component/auth_otp_input";
import DashboardProfileResetPassword from "./dashboard_profile_reset_password";
import MessageComponent from "../component/message_component";

interface Props {
  openSignup: () => void;
  openCreateNewPassword: () => void;
  type: "fg_password" | "signing_up";
  backFunction?: () => void;
}

export default function DashboardProfileVerifyEmail({
  openSignup,
  type,
  openCreateNewPassword,
  backFunction,
}: Props) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [showPasswordPage, setShowPasswordPage] = useState<boolean>(false);
  const [showVerificationPage, setShowVerificationPage] =
    useState<boolean>(true);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>("");
  const [messageType, setMessageType] = useState<"good" | "bad">("good");

  const { time, start, pause, reset, status } = useTimer({
    initialTime: 300,
    timerType: "DECREMENTAL",
    endTime: 0,
  });

  const isRunning = status === "RUNNING";
  const isStopped = status === "PAUSED";

  // Start timer on mount
  useEffect(() => {
    start();
  }, [start]);

  // Show message helper
  const showMessagePopup = (text: string, type: "good" | "bad") => {
    setMessageText(text);
    setMessageType(type);
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 3000);
  };

  // Format time
  const formatTime = useCallback((): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, [time]);

  // Verify OTP
  const verifyOtp = useCallback(
    async (otp: string) => {
      const token = localStorage.getItem("otp-token");
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/user/verify-otp`, {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify({ sessionToken: token, otp: otp }),
        });

        const data = await res.json();

        if (!res.ok) {
          showMessagePopup(
            data.message || "An bad occurred while verifying OTP",
            "bad",
          );
          setIsLoading(false);
          return;
        }

        pause();
        setShowVerificationPage(false);
        setShowPasswordPage(true);
        showMessagePopup("OTP verified successfully!", "good");
        openCreateNewPassword();

        setIsLoading(false);
      } catch (error: any) {
        console.log(error);
        showMessagePopup("An bad occurred while verifying OTP", "bad");
        setIsLoading(false);
        setMessage(error.message);
        showMessagePopup(error.message, "bad");
      }
    },
    [API_URL, pause],
  );

  // Handle OTP completion
  const onComplete = useCallback(
    (otp: string) => {
      verifyOtp(otp);
    },
    [verifyOtp],
  );

  // Resend OTP
  const sendOTP = useCallback(async () => {
    const email = localStorage.getItem("otp-email");
    if (!email) {
      showMessagePopup("Email not found. Please try again.", "bad");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/sendOtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        showMessagePopup(data.message || "Failed to resend OTP", "bad");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("otp-token", data.sessionToken);
      setIsLoading(false);
      reset(); // Reset timer
      start(); // Start again
      showMessagePopup("OTP resent goodfully!", "good");
    } catch (bad) {
      console.log(bad);
      showMessagePopup("An bad occurred while resending OTP", "bad");
      setIsLoading(false);
    }
  }, [API_URL, reset, start]);

  // Handle button click (Verify or Resend)
  const handleClick = useCallback(() => {
    if (time === 0) {
      sendOTP();
    }
    // Note: For "Verify", the OTP input handles the verification automatically
  }, [time, sendOTP]);

  // Handle back from password page
  const handleBackFromPassword = useCallback(() => {
    setShowPasswordPage(false);
    setShowVerificationPage(true);
    if (backFunction) {
      backFunction();
    }
  }, [backFunction]);

  // Time display
  const timeDisplay = useMemo(() => {
    if (time === 0) {
      return <span className="text-red-600">Your OTP has expired</span>;
    }
    return <span>{formatTime()}</span>;
  }, [time, formatTime]);

  return (
    <>
      {/* Message Popup */}
      {showMessage && (
        <MessageComponent status={messageType} message={messageText} />
      )}

      {/* Verification Page */}
      {showVerificationPage && (
        <div className="form_container">
          <h1 className="form_h1">Verify Email</h1>
          <p className="form-p">
            A one-time password has been sent to your email. Please check your
            inbox and enter the OTP below.
          </p>

          <div className="form">
            <div className="w-full">
              <OtpLength length={6} onComplete={onComplete} />

              <div className="text-[15px] w-full flex items-start justify-start flex-col my-4 gap-2">
                <div className="flex items-center gap-1">
                  <div className="text-[#71748C]">Resend OTP in:</div>
                  <span className="font-semibold text-primaryColors-0">
                    {timeDisplay}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="form_btn md:mt-0 mt-[8rem]"
                onClick={handleClick}
                disabled={isLoading || time !== 0}
              >
                {isLoading ? (
                  <div className="animate-spin h-[25px] w-[25px] border-4 border-t-white border-r-primaryColors-0 border-b-white border-l-white bg-transparent rounded-full"></div>
                ) : time === 0 ? (
                  "Resend OTP"
                ) : (
                  "Waiting for OTP..."
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Page */}
      {showPasswordPage && (
        <DashboardProfileResetPassword backFunction={handleBackFromPassword} />
      )}
    </>
  );
}
