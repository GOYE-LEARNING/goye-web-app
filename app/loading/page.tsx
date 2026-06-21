"use client";

import Image from "next/image";
import logo from "@/public/images/goye_white.png";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useOrganizationContext } from "@/app/component/organization_component/organanization_context";
import { useAuthContext } from "@/app/context/AuthContext";

export default function LoadingPage() {
  const { organizationId } = useOrganizationContext();
  const { updateAuthStatus, checkAuth } = useAuthContext();
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Authenticating...");
  const [error, setError] = useState<string | null>(null);
  const redirectAttempted = useRef(false);
  const authCheckedRef = useRef(false);

  // Status messages based on progress
  const statusMessages = [
    { progress: 20, message: "Verifying credentials..." },
    { progress: 40, message: "Loading your profile..." },
    { progress: 60, message: "Setting up your dashboard..." },
    { progress: 80, message: "Almost ready..." },
    { progress: 100, message: "Redirecting..." },
  ];

  useEffect(() => {
    // Update status message based on progress
    const currentStatus = statusMessages.reduce((prev, curr) => {
      if (progress >= curr.progress) return curr.message;
      return prev;
    }, statusMessages[0].message);

    setStatus(currentStatus);
  }, [progress]);

  // Check auth and ensure context is updated
  useEffect(() => {
    const verifyAndUpdateAuth = async () => {
      if (authCheckedRef.current) return;
      authCheckedRef.current = true;

      // Get user data from localStorage (ONLY user data, NO tokens)
      const userId = localStorage.getItem("user_id");
      const role = localStorage.getItem("role");
      const userType = localStorage.getItem("type");
      const isProfileComplete =
        localStorage.getItem("isProfileComplete") === "true";
      const firstName = localStorage.getItem("first_name");
      const lastName = localStorage.getItem("last_name");
      const email = localStorage.getItem("email");
      const userLevel = localStorage.getItem("level");

      console.log("Loading page - user data check:", {
        userId,
        role,
        userType,
        isProfileComplete,
        firstName,
        lastName,
        email,
        userLevel,
      });

      // ✅ ONLY check if we have user data (NO token checks)
      if (userId && role) {
        // Update auth context with the data from localStorage
        updateAuthStatus({
          isExistingUser: true,
          isProfileComplete: isProfileComplete,
          requiresProfileCompletion: !isProfileComplete,
          isLoading: false,
          user: {
            id: userId,
            first_name: firstName || "",
            last_name: lastName || "",
            email_address: email || "",
            role: role,
            type: userType || "user",
            level: userLevel || "Beginners",
          },
        });
        console.log("✅ Updated auth context from localStorage");

        // Verify with backend (cookies will be sent automatically)
        try {
          const isValid = await checkAuth();
          console.log("Backend auth check result:", isValid);

          if (!isValid) {
            console.warn(
              "⚠️ Backend check failed, but continuing with user data",
            );
          }
        } catch (err) {
          console.warn(
            "⚠️ Backend check error, continuing with user data:",
            err,
          );
        }
      } else {
        console.error("❌ No user data found - redirecting to login");
        setError("No user session found. Please login again.");
        const timeout = setTimeout(() => {
          router.push("/auth");
        }, 3000);
        return () => clearTimeout(timeout);
      }
    };

    verifyAndUpdateAuth();

    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(prev + Math.random() * 5 + 2, 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [router, updateAuthStatus, checkAuth]);

  useEffect(() => {
    // Only redirect once when progress reaches 100
    if (progress === 100 && !redirectAttempted.current && !error) {
      redirectAttempted.current = true;

      const role = localStorage.getItem("role")?.toLowerCase();
      const userType = localStorage.getItem("type")?.toLowerCase();
      const organizationId_local = localStorage.getItem("organization_id");
      const finalOrgId = organizationId || organizationId_local;

      console.log("Redirecting with role:", role, "userType:", userType);

      // Small delay for smooth transition
      const timeout = setTimeout(() => {
        try {
          let redirectPath = "/dashboard";

          // SIMPLIFIED ROLE CHECK - Order matters!
          // Check for instructor/tutor first
          if (role === "instructor" || role === "tutor") {
            redirectPath = "/dashboard/tutor";
            console.log("Redirecting as instructor/tutor to:", redirectPath);
          }
          // Check for admin roles
          else if (role === "goye_admin") {
            redirectPath = "/dashboard/admin";
            console.log("Redirecting as goye_admin to:", redirectPath);
          } else if (
            role === "admin" ||
            role === "administrator" ||
            role === "org_admin"
          ) {
            if (finalOrgId) {
              redirectPath = `/dashboard/${finalOrgId}/admin`;
            }
            console.log("Redirecting as admin to:", redirectPath);
          }
          // Check for organization/member
          else if (role === "member") {
            if (finalOrgId) {
              redirectPath = `/dashboard/${finalOrgId}/organization`;
            }
            console.log("Redirecting as organization/member to:", redirectPath);
          }
          // Default to student (includes "student" role and "user" type)
          else if (role === "student") {
            redirectPath = "/dashboard/student";
          }

          console.log("Final redirect path:", redirectPath);

          // Use router.push to ensure state is preserved
          router.push(redirectPath);
        } catch (err) {
          console.error("Redirect error:", err);
          setError("Failed to redirect. Please try again.");
          redirectAttempted.current = false;
        }
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [progress, router, organizationId, error]);

  // Handle retry if error occurs
  const handleRetry = () => {
    setError(null);
    setProgress(0);
    redirectAttempted.current = false;
    authCheckedRef.current = false;

    const role = localStorage.getItem("role");
    if (!role) {
      router.push("/auth");
    } else {
      // Retry the verification
      window.location.reload();
    }
  };

  if (error) {
    return (
      <div className="absolute inset-0 w-full h-full bg-black">
        <div className="flex justify-center items-center flex-col gap-4 min-h-[85vh] transition-all duration-300">
          <div className="bg-red-500/10 p-6 rounded-2xl text-center max-w-md mx-4">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-white text-xl font-semibold mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-primaryColors-0 text-white rounded-lg hover:bg-primaryColors-1 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 h-full overflow-hidden">
      <div className="flex justify-center items-center flex-col gap-6 min-h-[85vh] transition-all duration-300 px-4">
        {/* Logo with pulse animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-primaryColors-0 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <Image
            src={logo}
            alt="GOYE Logo"
            height={100}
            width={100}
            className="relative z-10"
            priority
          />
        </div>

        {/* Title with animation */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 animate-fade-in">
            Almost there
          </h1>
          <p className="text-gray-400 text-lg animate-fade-in-up">{status}</p>
        </div>

        {/* Progress bar container */}
        <div className="w-full max-w-md space-y-3">
          <div className="relative bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primaryColors-0 to-primaryColors-1 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer"></div>
            </div>
          </div>

          {/* Progress percentage */}
          <div className="flex justify-between text-sm text-gray-500">
            <span>Loading</span>
            <span className="font-mono">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Loading tips */}
        <div className="mt-8 text-center text-sm text-gray-600 max-w-md">
          <p className="animate-pulse">
            ✨ Get ready to encounter the best JESUS ✨
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .shimmer {
          animation: shimmer 2s infinite;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out 0.2s both;
        }
      `}</style>
    </div>
  );
}