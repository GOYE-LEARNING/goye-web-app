"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthContext } from "@/app/context/AuthContext";
import AuthLoader from "@/app/auth/auth_loader";
import { getUserProfile } from "@/app/utils/database/db";

export default function DashboardTutorAuthContext({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { authStatus, checkAuth, refreshToken, updateAuthStatus } = useAuthContext();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const authCheckedRef = useRef(false);

  // Allowed roles for tutor dashboard
  const allowedRoles = ["tutor", "instructor"];

  useEffect(() => {
    const verifyAuth = async () => {
      // Prevent multiple checks
      if (authCheckedRef.current) return;
      authCheckedRef.current = true;
      
      setIsCheckingAuth(true);

      // Check for tokens in cookies
      const hasAccessToken = document.cookie.includes("accessToken");
      const hasRefreshToken = document.cookie.includes("refreshToken");
      
      // Check localStorage for user data
      const userId = localStorage.getItem("user_id");
      const userRole = localStorage.getItem("role");
      const userType = localStorage.getItem("type");
      const isProfileComplete2 = localStorage.getItem("isProfileComplete") === "true";
      const profile = await getUserProfile();
      const firstName = profile?.first_name;
      const lastName = profile?.last_name;
      const email = profile?.email_address;
      const progressId = localStorage.getItem("progress_id");
      const planId = localStorage.getItem("plan_id");

      console.log("Tutor Dashboard Layout - Detailed auth check:", {
        hasAccessToken,
        hasRefreshToken,
        userId,
        userRole,
        userType,
        isProfileComplete2,
        authStatus: authStatus.isExistingUser,
        allowedRoles
      });

      // FIRST: Check localStorage immediately - this is the most reliable
      if (userId && userRole) {
        // Check if user has tutor/instructor role
        if (!allowedRoles.includes(userRole.toLowerCase())) {
          console.log(`❌ Tutor Dashboard: User role "${userRole}" not allowed. Redirecting to unauthorized`);
          router.push("/unauthorized");
          setIsCheckingAuth(false);
          return;
        }

        console.log("✅ Tutor Dashboard: Found user in localStorage, authorizing...");
        
        // Update auth context if needed
        if (!authStatus.isExistingUser) {
          updateAuthStatus({
            isExistingUser: true,
            isProfileComplete: isProfileComplete2,
            requiresProfileCompletion: !isProfileComplete2,
            isLoading: false,
            user: {
              id: userId,
              first_name: firstName || "",
              last_name: lastName || "",
              email_address: email || "",
              role: userRole,
              type: userType || "tutor",
              level: localStorage.getItem("level") || "Beginners"
            }
          });
        }
        
        setIsAuthorized(true);
        setIsCheckingAuth(false);
        
        // Still verify with backend in background, but don't block
        verifyWithBackend();
        return;
      }

      // SECOND: Check auth context
      let isAuthenticated = false;

      if (authStatus.isExistingUser) {
        // Check if user has tutor/instructor role
        const role = authStatus.user?.role?.toLowerCase();
        if (role && allowedRoles.includes(role)) {
          isAuthenticated = true;
          console.log("✅ Tutor Dashboard: Auth context says authenticated with role:", role);
        } else {
          console.log(`❌ Tutor Dashboard: Auth context role "${role}" not allowed`);
          router.push("/unauthorized");
          setIsCheckingAuth(false);
          return;
        }
      } 
      // THIRD: Try to refresh token
      else if (hasAccessToken || hasRefreshToken) {
        console.log("🔄 Tutor Dashboard: Attempting token refresh...");
        const refreshed = await refreshToken();
        if (refreshed) {
          const isValid = await checkAuth();
          // After refresh, check role
          const role = authStatus.user?.role?.toLowerCase();
          if (isValid && role && allowedRoles.includes(role)) {
            isAuthenticated = true;
            console.log("✅ Tutor Dashboard: Token refresh successful with role:", role);
          } else {
            console.log(`❌ Tutor Dashboard: Token refresh failed or invalid role: ${role}`);
            router.push("/unauthorized");
            setIsCheckingAuth(false);
            return;
          }
        }
      }

      if (!isAuthenticated) {
        console.log("❌ Tutor Dashboard: Not authenticated, redirecting to login");
        router.push("/auth");
        setIsCheckingAuth(false);
        return;
      }

      // Check if profile is complete
      const isProfileComplete = authStatus.isProfileComplete || localStorage.getItem("isProfileComplete") === "true";
      
      if (!isProfileComplete) {
        console.log("Profile incomplete, redirecting to auth");
        router.push("/auth");
        setIsCheckingAuth(false);
        return;
      }

      setIsAuthorized(true);
      setIsCheckingAuth(false);
    };

    const verifyWithBackend = async () => {
      // Background verification - don't block UI
      try {
        const hasTokens = document.cookie.includes("accessToken") || document.cookie.includes("refreshToken");
        if (hasTokens) {
          const isValid = await checkAuth();
          const role = authStatus.user?.role?.toLowerCase();
          if (isValid && role && allowedRoles.includes(role)) {
            console.log("✅ Tutor Dashboard: Background verification completed");
          } else {
            console.log("⚠️ Tutor Dashboard: Background verification failed or invalid role");
          }
        }
      } catch (err) {
        console.log("Background verification failed, but user is still authorized from localStorage");
      }
    };

    verifyAuth();
  }, [authStatus.isExistingUser, authStatus.isProfileComplete, authStatus.user?.role, checkAuth, refreshToken, router, pathname, updateAuthStatus]);

  if (isCheckingAuth || !isAuthorized) {
    return <AuthLoader />;
  }

  return <>{children}</>;
}