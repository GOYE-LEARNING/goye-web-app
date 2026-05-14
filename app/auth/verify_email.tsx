"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useTimer } from "use-timer";
import OtpLength from "../component/auth_otp_input";
import CreatePassword from "./reset-password/page";
import MessageComponent from "../component/message_component";

interface Props {
  openSignup: () => void;
}

export default function VerifyEmail({ openSignup }: Props) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [showPasswordPage, setShowPasswordPage] = useState<boolean>(false);
  const [showVerificationPage, setShowVerificationPage] =
    useState<boolean>(true);

  const { time, start, pause, reset, status } = useTimer({
    initialTime: 300,
    timerType: "DECREMENTAL",
    endTime: 0,
  });

  const isRunning = status === "RUNNING";
  const isStopped = status === "PAUSED";

  // Fix useEffect
  useEffect(() => {
    start();
  }, []); // Empty dependency array

  // Memoize formatTime
  const formatTime = useCallback((): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, [time]);

  // Memoize verifyOtp
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
          console.log("An error occured while verifying otp");
        }

        if (data.message == "Your otp has been verified") {
          pause();
          setShowVerificationPage(false);
          setShowPasswordPage(true);
        }

        setIsLoading(false);
        setMessage(data.message);
        setShowPasswordPage(true);
        setShowVerificationPage(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    },
    [isRunning, pause],
  );

  // Memoize onComplete
  const onComplete = useCallback(
    (otp: string) => {
      verifyOtp(otp);
    },
    [verifyOtp],
  );

  // Memoize sendOTP
  const sendOTP = useCallback(async () => {
    const email = localStorage.getItem("otp-email");
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/sendOtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      });

      const data = await res.json();
      localStorage.setItem("otp-token", data.sessionToken);
      setIsLoading(false);
      openSignup();
      reset(); // Reset timer
      start(); // Start again
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  }, [reset, start, pause]);

  // Memoize handleClick
  const handleClick = useCallback(() => {
    if (time === 0) {
      sendOTP();
    } else {
      setShowPasswordPage(true);
      setShowVerificationPage(false);
    }
  }, [time, sendOTP]);

  // Memoize time display
  const timeDisplay = useMemo(() => {
    if (time === 0) {
      return <span className="text-red-600">Your OTP has expired</span>;
    }
    return <div>{formatTime()}</div>;
  }, [time, formatTime]);

  return (
    <>
      {showVerificationPage && (
        <div className="form_container">
          <h1 className="form_h1">Verify Email</h1>
          <p className="form-p">
            A one-time password has been sent to your email.
          </p>
          <form noValidate className="form">
            <div className="w-full">
              <OtpLength length={6} onComplete={onComplete} />
              <div className="text-[15px] w-full flex items-start justify-start flex-col my-4 gap-2">
                <div className="flex items-center gap-1">
                  <div className="text-[#71748C]">Resend Otp in:</div>
                  <span className="font-semibold text-primaryColors-0">
                    {timeDisplay}
                  </span>
                </div>
                <span className="font-bold text-primaryColors-0">
                  {message === "jwt expired" ? "Oops Otp has expired" : message}
                </span>
              </div>
              <button
                type="button"
                className="form_btn md:mt-0 mt-[8rem]"
                onClick={handleClick}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin h-[25px] w-[25px] border-4 border-t-white border-r-primaryColors-0 border-b-white border-l-white bg-transparent rounded-full"></div>
                ) : time === 0 ? (
                  "Resend OTP"
                ) : (
                  "Verify"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      {showPasswordPage && <CreatePassword />}
    </>
  );
}
