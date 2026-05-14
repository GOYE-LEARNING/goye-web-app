"use client";

import DashboardHeader from "@/app/component/dashboard_header";
import TutorSidenav from "./sidenav";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ResizeProvider from "@/app/context/resizeAbleContext";
import { useAuthContext } from "@/app/context/AuthContext";
import AuthLoader from "@/app/auth/auth_loader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { authStatus, checkAuth, refreshToken } = useAuthContext();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const path = ["/dashboard/tutor/course", "/dashboard/tutor/community"];
  const path2 = ["/dashboard/tutor/chat"];
  const checkPath = path.some((p) => pathname == p);
  const isChatPage = path2.some((p) => pathname == p);
  const [isMobile, setIsMobile] = useState(false);

  // Allowed roles for this dashboard
  const allowedRoles = ["tutor", "instructor"];

  // Check authentication on mount
  useEffect(() => {
    const verifyAuth = async () => {
      setIsCheckingAuth(true);

      // Wait for auth status to finish loading
      if (authStatus.isLoading) {
        // Still loading, wait
        return;
      }

      let isAuthenticated = authStatus.isExistingUser;

      if (!isAuthenticated) {
        const refreshed = await refreshToken();
        if (refreshed) {
          const isValid = await checkAuth();
          isAuthenticated = isValid;
        }
      }

      if (!isAuthenticated) {
        const redirectUrl = `/auth?redirect=${encodeURIComponent(pathname)}`;
        router.push(redirectUrl);
        setIsCheckingAuth(false);
        return;
      }

      // Wait for user role to be available
      const userRole = authStatus.user?.role;
      
      if (!userRole) {
        // User role not yet loaded, wait a bit and retry
        console.log("Waiting for user role to load...");
        setTimeout(() => {
          const retryRole = authStatus.user?.role;
          if (retryRole && allowedRoles.includes(retryRole)) {
            setIsAuthorized(true);
          } else if (retryRole && !allowedRoles.includes(retryRole)) {
            console.log(`User role "${retryRole}" not allowed. Allowed:`, allowedRoles);
            router.push("/unauthorized");
          } else {
            console.log("User role still undefined after retry");
            router.push("/unauthorized");
          }
          setIsCheckingAuth(false);
        }, 500);
        return;
      }

      // Check if user has allowed role
      if (!allowedRoles.includes(userRole)) {
        console.log(`User role "${userRole}" not allowed. Allowed:`, allowedRoles);
        router.push("/unauthorized");
        setIsCheckingAuth(false);
        return;
      }

      setIsAuthorized(true);
      setIsCheckingAuth(false);
    };

    verifyAuth();
  }, [authStatus.isExistingUser, authStatus.user?.role, authStatus.isLoading, checkAuth, refreshToken, router, pathname]);

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Add class to body when on chat page on mobile only
  useEffect(() => {
    if (isChatPage && isMobile) {
      document.body.classList.add("chat-open");
    } else {
      document.body.classList.remove("chat-open");
    }

    return () => {
      document.body.classList.remove("chat-open");
    };
  }, [isChatPage, isMobile]);

  // Show loading state while checking authentication
  if (isCheckingAuth || !isAuthorized) {
    return <AuthLoader />;
  }

  return (
    <ResizeProvider>
      <div className="h-full w-full md:bg-transparent bg-primaryColors-0">
        <TutorSidenav />

        <div className="md:w-[80%] w-full min-w-0 max-w-full h-full md:absolute right-0 flex flex-col">
          <DashboardHeader />

          <div
            className={`
    w-full flex md:items-center flex-col 
    md:px-0 md:py-0 md:rounded-none rounded-tr-xl rounded-tl-xl 
    md:bg-transparent mb-0 md:mb-5 overflow-auto px-4
    ${
      isChatPage
        ? "bg-shadyColor-0 min-h-screen md:min-h-0 overflow-y-auto mt-[14%] md:mt-0"
        : checkPath
          ? "bg-shadyColor-0 min-h-screen overflow-y-auto"
          : "bg-secondaryColors-0 h-full overflow-y-auto"
    }
  radial_gradient2`}
            style={
              isChatPage && isMobile ? { height: "calc(100vh - 4rem)" } : {}
            }
          >
            <div
              className={`
      ${
        isChatPage && !isMobile
          ? "w-full h-full min-w-0"
          : isChatPage && isMobile
            ? "w-full h-full min-w-0 overflow-hidden"
            : "md:max-w-[707px] w-full max-w-full relative h-full overflow-auto scrollbar2"
      }
    `}
              style={isChatPage && !isMobile ? { height: "100%" } : {}}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </ResizeProvider>
  );
}