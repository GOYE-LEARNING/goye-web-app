"use client";

import Image from "next/image";
import logo from "@/public/images/logo-removebg-preview.png";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoadingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 3; // Speed of loading
      });
    }, 150); // updates every 100ms

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const timeout = setTimeout(() => {
        router.push("../dashboard"); // 👈 Change this to your desired page
      }, 800); // short delay before redirect for smooth feel
      return () => clearTimeout(timeout);
    }
  }, [progress, router]);

  return (
    <>
      <div className="flex justify-center items-center flex-col gap-4 min-h-[85vh] transition-all duration-300">
        <Image src={logo} alt="logo" height={80} width={80} />
        <h1 className="form_h1">Almost there</h1>
        <p className="form-p">Building your experience...</p>

        {/* Progress bar container */}
        <div className="relative bg-[#ccc]/20 h-[10px] w-[400px] rounded-2xl overflow-hidden">
          <div
            className="h-full bg-primaryColors-0 rounded-2xl transition-all duration-200 ease-in-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </>
  );
}
