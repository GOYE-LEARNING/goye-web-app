"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
  
  // Add timeout tracking
  const [isTimeout, setIsTimeout] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

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
    
    // Check for network connection
    if (!navigator.onLine) {
      showMessagePopup("No internet connection. Please check your network and try again.", "bad");
    }
    
    return () => {
      // Abort any ongoing requests on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [start]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      showMessagePopup("Internet connection restored!", "good");
    };
    
    const handleOffline = () => {
      showMessagePopup("Internet connection lost. Please check your network.", "bad");
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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

  // Verify OTP with timeout and error handling
  const verifyOtp = useCallback(
    async (otp: string) => {
      const token = localStorage.getItem("otp-token");
      
      // Check for internet connection
      if (!navigator.onLine) {
        showMessagePopup("No internet connection. Please check your network and try again.", "bad");
        return;
      }
      
      setIsLoading(true);
      setIsTimeout(false);
      
      // Create abort controller for timeout
      abortControllerRef.current = new AbortController();
      const timeoutId = setTimeout(() => {
        setIsTimeout(true);
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        showMessagePopup("Request timed out. Please check your internet connection and try again.", "bad");
        setIsLoading(false);
      }, 30000); // 30 second timeout
      
      try {
        const res = await fetch(`${API_URL}/api/user/verify-otp`, {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify({ sessionToken: token, otp: otp }),
          signal: abortControllerRef.current.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const data = await res.json();
          showMessagePopup(
            data.message || "An error occurred while verifying OTP",
            "bad",
          );
          setIsLoading(false);
          return;
        }

        const data = await res.json();

        pause();
        setShowVerificationPage(false);
        setShowPasswordPage(true);
        showMessagePopup("OTP verified successfully!", "good");
        openCreateNewPassword();

        setIsLoading(false);
      } catch (error: any) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
          // Don't show duplicate message if timeout already handled
          if (!isTimeout) {
            showMessagePopup("Request took too long. Please check your internet connection and try again.", "bad");
          }
        } else if (error.message === 'Failed to fetch') {
          showMessagePopup("Network error. Please check your internet connection and try again.", "bad");
        } else {
          console.log(error);
          showMessagePopup(error.message || "An error occurred while verifying OTP", "bad");
        }
        setIsLoading(false);
      }
    },
    [API_URL, pause, openCreateNewPassword, isTimeout]
  );

  // Handle OTP completion
  const onComplete = useCallback(
    (otp: string) => {
      if (otp.length === 6) {
        verifyOtp(otp);
      }
    },
    [verifyOtp],
  );

  // Resend OTP with timeout and error handling
  const sendOTP = useCallback(async () => {
    const email = localStorage.getItem("otp-email");
    
    if (!email) {
      showMessagePopup("Email not found. Please try again.", "bad");
      return;
    }
    
    if (!navigator.onLine) {
      showMessagePopup("No internet connection. Please check your network and try again.", "bad");
      return;
    }

    setIsLoading(true);
    
    // Create abort controller for timeout
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
      showMessagePopup("Request timed out. Please check your internet connection and try again.", "bad");
      setIsLoading(false);
    }, 30000);
    
    try {
      const res = await fetch(`${API_URL}/api/user/sendOtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
        credentials: "include",
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json();

      if (!res.ok) {
        showMessagePopup(data.message || "Failed to resend OTP", "bad");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("otp-token", data.sessionToken);
      reset(); // Reset timer
      start(); // Start again
      showMessagePopup("OTP resent successfully!", "good");
      setIsLoading(false);
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        showMessagePopup("Request took too long. Please check your internet connection and try again.", "bad");
      } else if (error.message === 'Failed to fetch') {
        showMessagePopup("Network error. Please check your internet connection and try again.", "bad");
      } else {
        console.log(error);
        showMessagePopup(error.message || "An error occurred while resending OTP", "bad");
      }
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
      return <span className="text-red-600">Your OTP has expired. Click "Resend OTP" to get a new code.</span>;
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

          {/* Network status indicator */}
          {!navigator.onLine && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              <p className="text-sm">⚠️ No internet connection. Please check your network.</p>
            </div>
          )}

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
                
                {/* Show network tips */}
                {message && message.includes("timed out") && (
                  <div className="text-sm text-gray-500 mt-2">
                    <p>💡 Tips:</p>
                    <ul className="list-disc list-inside ml-2">
                      <li>Check your internet connection</li>
                      <li>Try switching between WiFi and mobile data</li>
                      <li>Refresh the page and try again</li>
                    </ul>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="form_btn md:mt-0 mt-[8rem]"
                onClick={handleClick}
                disabled={isLoading || (time !== 0 && time > 0)}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2 justify-center">
                    <div className="animate-spin h-[25px] w-[25px] border-4 border-t-white border-r-primaryColors-0 border-b-white border-l-white bg-transparent rounded-full"></div>
                    <span>Processing...</span>
                  </div>
                ) : time === 0 ? (
                  "Resend OTP"
                ) : (
                  "Enter OTP above"
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