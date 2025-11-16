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


  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return false;

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
  return (
    <>
      <div className="w-full  md:my-8 my-4">
        <div className="flex justify-center items-center gap-3 w-full">
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
              className={`md:h-[76.5px] h-[50.33px] md:w-[76.5px] w-[50.33px] border text-center font-bold text-[1.2rem] outline-none`}
            />
          ))}
        </div>
      </div>
    </>
  );
}
