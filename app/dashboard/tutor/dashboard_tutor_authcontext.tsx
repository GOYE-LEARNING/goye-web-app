// app/dashboard/tutor/DashboardTutorAuthContext.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthContext } from "@/app/context/AuthContext";
import AuthLoader from "@/app/auth/auth_loader";

export default function DashboardTutorAuthContext({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { authStatus, checkAuth, refreshToken } = useAuthContext();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Define allowed roles for this dashboard
  const allowedRoles = ["tutor", "instructor"];

  useEffect(() => {
    const verifyAuth = async () => {
      setIsCheckingAuth(true);

      try {
        // Check if user is authenticated
        let isAuthenticated = authStatus.isExistingUser;

        if (!isAuthenticated) {
          // Try to refresh the token
          const refreshed = await refreshToken();
          if (refreshed) {
            const isValid = await checkAuth();
            isAuthenticated = isValid;
          }
        }

        if (!isAuthenticated) {
          // Redirect to auth page with return URL
          const redirectUrl = `/auth?redirect=${encodeURIComponent(pathname)}`;
          router.push(redirectUrl);
          setIsCheckingAuth(false);
          return;
        }

        // Wait for user data to be loaded
        if (authStatus.isLoading) {
          // Still loading, wait
          return;
        }

        // Check if user role exists
        const userRole = authStatus.user?.role;
        
        if (!userRole) {
          console.log("Waiting for user role to load...");
          // Wait a bit and retry
          setTimeout(() => {
            if (authStatus.user?.role) {
              const retryRole = authStatus.user?.role;
              if (allowedRoles.includes(retryRole)) {
                setIsAuthorized(true);
              } else {
                router.push("/unauthorized");
              }
              setIsCheckingAuth(false);
            } else {
              router.push("/unauthorized");
              setIsCheckingAuth(false);
            }
          }, 500);
          return;
        }

        // Check if user has allowed role
        if (!allowedRoles.includes(userRole)) {
          console.log(`User role "${userRole}" not allowed. Allowed roles: ${allowedRoles.join(", ")}`);
          router.push("/unauthorized");
          setIsCheckingAuth(false);
          return;
        }

        setIsAuthorized(true);
        setIsCheckingAuth(false);
      } catch (error) {
        console.error("Auth verification error:", error);
        router.push(`/auth`);
        setIsCheckingAuth(false);
      }
    };

    verifyAuth();
  }, [authStatus.isExistingUser, authStatus.user?.role, authStatus.isLoading, checkAuth, refreshToken, router, pathname]);


  return <>{children}</>;
}