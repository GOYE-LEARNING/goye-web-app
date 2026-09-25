"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthContext } from "@/app/context/AuthContext";
import AuthLoader from "@/app/auth/auth_loader";
import AuthErrorScreen from "@/app/component/auth_error_screen";
import { getUserProfile } from "@/app/utils/database/db";

export default function DashboardStudentAuthContext({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    authStatus,
    checkAuth,
    refreshToken,
    authError,
    clearAuthError,
    getAuthError,
  } = useAuthContext();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const verifyAuth = async () => {
      setIsCheckingAuth(true);

      // Check if we have tokens in cookies
      const hasAccessToken = document.cookie.includes("accessToken");
      const hasRefreshToken = document.cookie.includes("refreshToken");
      
      // Check localStorage for user data
      const profile = await getUserProfile();
      const userId = profile?.userId;
      const userRole = localStorage.getItem("role");
      const userType = localStorage.getItem("type");

      console.log("Auth check - Cookies:", { hasAccessToken, hasRefreshToken });
      console.log("Auth check - LocalStorage:", { userId, userRole, userType });

      let isAuthenticated = false;

      // First check authStatus from context
      if (authStatus.isExistingUser) {
        isAuthenticated = true;
      }
      // Then try to refresh token if we have cookies
      else if (hasAccessToken || hasRefreshToken) {
        const refreshed = await refreshToken();
        if (refreshed) {
          const isValid = await checkAuth();
          isAuthenticated = isValid;
        }
      }
      // Finally check localStorage as fallback
      else if (userId && (userRole === "student" || userType === "user")) {
        isAuthenticated = true;
        console.log("Using localStorage for auth");
      }

      if (!isAuthenticated) {
        // checkAuth()/refreshToken() set authError when the server never
        // actually answered (network drop, timeout, 5xx) — that's not proof
        // this session is invalid, so don't sign the user out over it.
        // getAuthError() reads a ref, so it reflects what just happened
        // above rather than the (possibly one-render-stale) authError prop.
        if (getAuthError()) {
          console.log("Auth check errored, showing error screen instead of redirecting");
          setIsCheckingAuth(false);
          return;
        }
        console.log("Not authenticated, redirecting to login");
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

      // Check if user has student role
      const role = authStatus.user?.role || localStorage.getItem("role");
      if (role !== "student") {
        console.log("Not a student, redirecting to unauthorized");
        router.push("/unauthorized");
        setIsCheckingAuth(false);
        return;
      }

      setIsAuthorized(true);
      setIsCheckingAuth(false);
    };

    verifyAuth();
    // authError deliberately excluded: it's an *output* of this effect (via
    // checkAuth/refreshToken), not an input — including it would re-run the
    // effect every time it sets its own error. retryCount is the only
    // manual re-trigger.
  }, [authStatus.isExistingUser, authStatus.isProfileComplete, authStatus.user?.role, checkAuth, refreshToken, router, pathname, retryCount, getAuthError]);

  if (!isAuthorized && !isCheckingAuth && authError) {
    return (
      <AuthErrorScreen
        message={authError}
        onRetry={() => {
          clearAuthError();
          setRetryCount((c) => c + 1);
        }}
      />
    );
  }

  if (isCheckingAuth || !isAuthorized) {
    return <AuthLoader />;
  }

  return <>{children}</>;
}