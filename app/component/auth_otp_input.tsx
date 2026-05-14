"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTimer } from "use-timer";

interface OtpInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
}

export default function OtpLength({ length = 6, onComplete }: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.join("").length === length && onComplete) {
      onComplete(newOtp.join(""));
    }
  };

  // Handle paste event
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    
    // Get pasted text
    const pastedText = e.clipboardData.getData("text");
    
    // Extract only digits from pasted text
    const digits = pastedText.replace(/\D/g, "");
    
    if (digits.length === 0) return;
    
    // Take only the first 'length' digits
    const otpDigits = digits.slice(0, length).split("");
    
    // Create new OTP array
    const newOtp = [...otp];
    
    // Fill the OTP inputs with pasted digits
    for (let i = 0; i < otpDigits.length; i++) {
      newOtp[i] = otpDigits[i];
    }
    
    setOtp(newOtp);
    
    // Focus on the next empty input or last filled input
    const lastFilledIndex = Math.min(otpDigits.length - 1, length - 1);
    
    if (lastFilledIndex >= 0 && lastFilledIndex < length - 1) {
      // Focus the next empty input
      const nextEmptyIndex = lastFilledIndex + 1;
      if (nextEmptyIndex < length && !newOtp[nextEmptyIndex]) {
        inputRefs.current[nextEmptyIndex]?.focus();
      }
    } else if (otpDigits.length === length) {
      // If full OTP pasted, blur focus
      inputRefs.current[length - 1]?.blur();
    }
    
    // Auto-submit if complete OTP was pasted
    if (newOtp.join("").length === length && onComplete) {
      onComplete(newOtp.join(""));
    }
  };

  // Add paste event listener to container
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("paste", handlePaste as any);
      return () => {
        container.removeEventListener("paste", handlePaste as any);
      };
    }
  }, [otp]);

  return (
    <>
      <div className="w-full md:my-8 my-4">
        <div 
          ref={containerRef}
          className="flex justify-center items-center gap-3 w-full scale-90 md:scale-100"
        >
          {otp.map((value, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el as any)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={value}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`md:h-[76.5px] h-[50.33px] md:w-[76.5px] w-[50.33px] border text-center font-bold text-[1.2rem] outline-none dark:bg-shadyColor-0 bg-white border-[#E4E4E7]/10 rounded-lg focus:border-primaryColors-0 transition-colors duration-300 dark:text-white text-lightBoldText-0`}
            />
          ))}
        </div>
      </div>
    </>
  );
}