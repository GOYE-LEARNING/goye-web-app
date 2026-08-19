// app/components/AuthGuard.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSessionState } from "@/app/utils/database/db";
import { useAuthContext } from "../context/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { authStatus, checkAuth } = useAuthContext();

  useEffect(() => {
    const checkAccess = async () => {
      // Skip auth check for public routes
      const publicRoutes = ['/login', '/signup', '/', '/about', '/contact'];
      if (publicRoutes.includes(pathname)) {
        return;
      }

      // Check authentication
      const session = await getSessionState();
      if (!session?.isAuthenticated) {
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) {
          console.log("❌ Not authenticated, redirecting to login");
          router.push('/login');
        }
      }
    };

    checkAccess();
  }, [pathname, router, checkAuth]);

  // Show nothing while checking
  if (authStatus.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}