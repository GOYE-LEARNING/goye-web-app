// app/components/ProtectedRoute.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../context/AuthContext";
import  AuthLoader  from "../auth/auth_loader";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = [],
  redirectTo = "/auth"
}: ProtectedRouteProps) {
  const router = useRouter();
  const { authStatus, checkAuth } = useAuthContext();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Check authentication
        const isAuthenticated = await checkAuth();
        
        if (!isAuthenticated) {
          console.log("❌ Not authenticated, redirecting to login");
          router.push(redirectTo);
          setIsAuthorized(false);
          return;
        }

        // Check role-based access
        if (allowedRoles.length > 0) {
          const userRole = authStatus.user?.role?.toLowerCase();
          const userType = authStatus.user?.type?.toLowerCase();
          
          const hasAccess = allowedRoles.some(role => {
            const normalizedRole = role.toLowerCase();
            return userRole === normalizedRole || userType === normalizedRole;
          });

          if (!hasAccess) {
            console.log(`❌ Role "${userRole}" not allowed. Redirecting...`);
            router.push("/unauthorized");
            setIsAuthorized(false);
            return;
          }
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Auth verification error:", error);
        router.push(redirectTo);
        setIsAuthorized(false);
      }
    };

    verifyAuth();
  }, [checkAuth, router, allowedRoles, redirectTo, authStatus.user]);

  // Show loader while checking auth
  if (isAuthorized === null || authStatus.isLoading) {
    return (
        <AuthLoader />
    );
  }

  // If not authorized, return null (redirect will happen)
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}