// src/components/ProtectedRoute.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthContext } from "../context/AuthContext";
import AuthLoader from "../auth/auth_loader";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRoles = [],
  redirectTo = "/login"
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { authStatus, checkAuth, refreshToken } = useAuthContext();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      setIsChecking(true);
      
      // Check if user is authenticated
      let isAuthenticated = authStatus.isExistingUser;
      
      if (!isAuthenticated) {
        // Try to refresh token first
        const refreshed = await refreshToken();
        if (refreshed) {
          // Re-check auth status after refresh
          const isValid = await checkAuth();
          isAuthenticated = isValid;
        }
      }
      
      if (!isAuthenticated) {
        // Redirect to login with return URL
        const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(pathname)}`;
        router.push(redirectUrl);
        setIsChecking(false);
        return;
      }
      
      // Check role-based access
      if (requiredRoles.length > 0 && authStatus.user) {
        const userRole = authStatus.user.role;
        if (!requiredRoles.includes(userRole)) {
          router.push("/unauthorized");
          setIsChecking(false);
          return;
        }
      }
      
      setIsAuthorized(true);
      setIsChecking(false);
    };

    verifyAuth();
  }, [authStatus.isExistingUser, authStatus.user, checkAuth, refreshToken, router, pathname, requiredRoles, redirectTo]);

  if (isChecking || authStatus.isLoading) {
    return <AuthLoader />;
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}