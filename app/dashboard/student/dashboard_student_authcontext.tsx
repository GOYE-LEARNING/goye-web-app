// app/dashboard/student/DashboardStudentAuthContext.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthContext } from "@/app/context/AuthContext";
import AuthLoader from "@/app/auth/auth_loader";

export default function DashboardStudentAuthContext({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { authStatus, checkAuth, refreshToken } = useAuthContext();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      setIsCheckingAuth(true);

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
        const redirectUrl = `/auth`;
        router.push(redirectUrl);
        setIsCheckingAuth(false);
        return;
      }

      // Check if profile is complete
      if (!authStatus.isProfileComplete) {
        router.push("/auth");
        setIsCheckingAuth(false);
        return;
      }

      // Check if user has student role
      if (authStatus.user?.role !== "student") {
        router.push("/unauthorized");
        setIsCheckingAuth(false);
        return;
      }

      setIsAuthorized(true);
      setIsCheckingAuth(false);
    };

    verifyAuth();
  }, [authStatus.isExistingUser, authStatus.isProfileComplete, authStatus.user?.role, checkAuth, refreshToken, router, pathname]);



  return <>{children}</>;
}