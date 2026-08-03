// app/dashboard/student/layout.tsx
"use client";

import DashboardHeader from "@/app/component/dashboard_header";
import Sidenav from "./sidenav";
import { usePathname, useRouter } from "next/navigation";
import ProgressProvider from "@/app/context/progressContext";
import QuizProvider from "@/app/context/quizContext";
import { useEffect, useState, useRef } from "react";
import { useAuthContext } from "@/app/context/AuthContext";
import AuthLoader from "@/app/auth/auth_loader";
import { SocketProvider } from "@/app/context/SocketContext";
import ShekiAIWidget from "@/app/component/AI_component/ShekiAIWidget";
import { getUserProfile } from "@/app/utils/database/db";

export default function DashboardLayout({
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
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  // Horizontal space the ShekiAI panel occupies, reported by the widget so
  // the content column can inset and sit beside it as a real third column.
  const [aiPanelWidth, setAiPanelWidth] = useState<number>(0);

  const path = ["/dashboard/student/course", "/dashboard/student/community"];
  const path2 = ["/dashboard/student/chat"];
  const checkPath = path.some((p) => pathname == p);
  const isChatPage = path2.some((p) => pathname == p);
  const [isMobile, setIsMobile] = useState(false);

  // Check authentication on mount
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
      const userRole = localStorage.getItem("role");
      const userType = localStorage.getItem("type");
      const isProfileComplete = localStorage.getItem("isProfileComplete") === "true";
      const profile = await getUserProfile();
      const userId = profile?.userId;
      const firstName = profile?.first_name;
      const lastName = profile?.last_name;
      const email = profile?.email_address;
      const progressId = localStorage.getItem("progress_id");
      const planId = localStorage.getItem("plan_id");

      console.log("Dashboard Layout - Detailed auth check:", {
        hasAccessToken,
        hasRefreshToken,
        userId,
        userRole,
        userType,
        isProfileComplete,
        authStatus: authStatus.isExistingUser
      });

      // FIRST: Check localStorage immediately - this is the most reliable
      if (userId && userRole) {
        console.log("✅ Dashboard: Found user in localStorage, authorizing...");
        
        // Update auth context if needed
        if (!authStatus.isExistingUser) {
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
              role: userRole,
              type: userType || "user",
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
        isAuthenticated = true;
        console.log("✅ Dashboard: Auth context says authenticated");
      } 
      // THIRD: Try to refresh token
      else if (hasAccessToken || hasRefreshToken) {
        console.log("🔄 Dashboard: Attempting token refresh...");
        const refreshed = await refreshToken();
        if (refreshed) {
          const isValid = await checkAuth();
          isAuthenticated = isValid;
          console.log("✅ Dashboard: Token refresh result:", isAuthenticated);
        }
      }

      if (!isAuthenticated) {
        console.log("❌ Dashboard: Not authenticated, redirecting to login");
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
          await checkAuth();
          console.log("✅ Dashboard: Background verification completed");
        }
      } catch (err) {
        console.log("Background verification failed, but user is still authorized from localStorage");
      }
    };

    verifyAuth();
  }, [authStatus.isExistingUser, checkAuth, refreshToken, router, updateAuthStatus]);

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
    <>
      <SocketProvider>
        <ProgressProvider>
          <QuizProvider>
            <div className="min-h-screen w-full md:bg-transparent bg-primaryColors-0">
              <ShekiAIWidget mode="student" setPanelWidth={setAiPanelWidth} />
              <Sidenav setIsCollapsedState={setIsCollapsed} />
              <div 
                className={`${isCollapsed ? "lg:w-[95%]" : "lg:w-[80%]"} org_width_animation w-full min-w-0 max-w-full h-full md:absolute right-0`}
                style={{ paddingRight: aiPanelWidth }}
              >
                <DashboardHeader />
                <div
                  className={`
                    w-full flex md:items-center flex-col 
                    md:px-0 md:py-0 md:rounded-none rounded-tr-xl rounded-tl-xl 
                    md:bg-lightSecondaryColor-0 mb-0 md:mb-5 overflow-auto px-7
                    ${
                      isChatPage
                        ? "dark:bg-shadyColor-0 bg-lightSecondaryColor-0 min-h-screen md:min-h-0 overflow-y-auto mt-[14%] md:mt-0"
                        : checkPath
                          ? "dark:bg-shadyColor-0 bg-lightSecondaryColor-0 min-h-screen overflow-y-auto"
                          : "dark:bg-secondaryColors-0 bg-lightSecondaryColor-0 h-full overflow-y-auto"
                    }
                    radial_gradient2
                  `}
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
                            : "md:max-w-[707px] w-full max-w-full relative min-h-screen overflow-auto scrollbar2"
                      }
                    `}
                    style={isChatPage && !isMobile ? { height: "100%" } : {}}
                  >
                    {children}
                    <br/>
                    <br/>
                    <br/>
                  </div>
                </div>
              </div>
            </div>
          </QuizProvider>
        </ProgressProvider>
      </SocketProvider>
    </>
  );
}