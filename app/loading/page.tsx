"use client";

import Image from "next/image";
import logo from "@/public/images/goye_white.png";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useOrganizationContext } from "@/app/component/organization_component/organanization_context";
import { useAuthContext } from "@/app/context/AuthContext";
import { getUserProfile } from "@/app/utils/database/db";

export default function LoadingPage() {
  const { organizationId, setOrganizationId } = useOrganizationContext();
  const { updateAuthStatus, checkAuth } = useAuthContext();
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Authenticating...");
  const [error, setError] = useState<string | null>(null);
  const redirectAttempted = useRef(false);
  const authCheckedRef = useRef(false);

  const statusMessages = [
    { progress: 20, message: "Verifying credentials..." },
    { progress: 40, message: "Loading your profile..." },
    { progress: 60, message: "Setting up your dashboard..." },
    { progress: 80, message: "Almost ready..." },
    { progress: 100, message: "Redirecting..." },
  ];

  useEffect(() => {
    const currentStatus = statusMessages.reduce((prev, curr) => {
      if (progress >= curr.progress) return curr.message;
      return prev;
    }, statusMessages[0].message);

    setStatus(currentStatus);
  }, [progress]);

  useEffect(() => {
    const verifyAndUpdateAuth = async () => {
      if (authCheckedRef.current) return;
      authCheckedRef.current = true;

      // ✅ Read everything from Dexie — single source of truth
      const profile = await getUserProfile();

      const userId = profile?.userId;
      const role = profile?.role;
      const userType = profile?.userType;
      const isProfileComplete = profile?.isProfileComplete ?? false;
      const firstName = profile?.first_name;
      const lastName = profile?.last_name;
      const email = profile?.email_address;
      const userLevel = profile?.level;
      const orgId = profile?.organizationId;

      console.log("Loading page - user data check:", {
        userId,
        role,
        userType,
        isProfileComplete,
        firstName,
        lastName,
        email,
        userLevel,
        orgId,
      });

      if (userId && role) {
        if (orgId) setOrganizationId(orgId);

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
        console.log("✅ Updated auth context from Dexie profile");

        try {
          const isValid = await checkAuth();
          console.log("Backend auth check result:", isValid);

          if (!isValid) {
            console.warn("⚠️ Backend check failed, but continuing with user data");
          }
        } catch (err) {
          console.warn("⚠️ Backend check error, continuing with user data:", err);
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
  }, [router, updateAuthStatus, checkAuth, setOrganizationId]);

  useEffect(() => {
    if (progress === 100 && !redirectAttempted.current && !error) {
      redirectAttempted.current = true;

      const redirect = async () => {
        const profile = await getUserProfile();
        const role = profile?.role?.toLowerCase();
        const userType = profile?.userType?.toLowerCase();
        const finalOrgId = organizationId || profile?.organizationId;
        const adminRole = profile?.adminRole;

        console.log("Redirecting with:", { role, userType, finalOrgId });

        const timeout = setTimeout(() => {
          try {
            let redirectPath = "/dashboard";

            if (role === "invited") {
              redirectPath = finalOrgId ? `/dashboard/${finalOrgId}/organization` : "/dashboard/student";
              console.log("Redirecting as invited user to:", redirectPath);
            } else if (role === "instructor" || role === "tutor") {
              redirectPath = "/dashboard/tutor";
              console.log("Redirecting as instructor/tutor to:", redirectPath);
            } else if (role === "goye_admin") {
              redirectPath = adminRole === "super_admin" ? "/dashboard/super-admin" : "/dashboard/admin";
              console.log("Redirecting as goye_admin to:", redirectPath);
            } else if (role === "org_admin" || role === "admin" || role === "administrator") {
              redirectPath = finalOrgId ? `/dashboard/${finalOrgId}/admin` : "/dashboard/admin";
              console.log("Redirecting as org admin to:", redirectPath);
            } else if (role === "invited_user" || role === "organization_member") {
              redirectPath = finalOrgId ? `/dashboard/${finalOrgId}/organization` : "/dashboard/student";
              console.log("Redirecting as organization member to:", redirectPath);
            } else if (role === "student") {
              redirectPath = "/dashboard/student";
              console.log("Redirecting as student to:", redirectPath);
            } else {
              redirectPath = "/dashboard/student";
              console.log("Redirecting as default student to:", redirectPath);
            }

            console.log("Final redirect path:", redirectPath);
            router.push(redirectPath);
          } catch (err) {
            console.error("Redirect error:", err);
            setError("Failed to redirect. Please try again.");
            redirectAttempted.current = false;
          }
        }, 500);

        return () => clearTimeout(timeout);
      };

      redirect();
    }
  }, [progress, router, organizationId, error]);

  const handleRetry = async () => {
    setError(null);
    setProgress(0);
    redirectAttempted.current = false;
    authCheckedRef.current = false;

    const profile = await getUserProfile();
    if (!profile?.role) {
      router.push("/auth");
    } else {
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

        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 animate-fade-in">
            Almost there
          </h1>
          <p className="text-gray-400 text-lg animate-fade-in-up">{status}</p>
        </div>

        <div className="w-full max-w-md space-y-3">
          <div className="relative bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primaryColors-0 to-primaryColors-1 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer"></div>
            </div>
          </div>

          <div className="flex justify-between text-sm text-gray-500">
            <span>Loading</span>
            <span className="font-mono">{Math.round(progress)}%</span>
          </div>
        </div>

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