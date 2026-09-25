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
import AuthErrorScreen from "@/app/component/auth_error_screen";
import { SocketProvider } from "@/app/context/SocketContext";
import ShekiAIWidget from "@/app/component/AI_component/ShekiAIWidget";
import { AI_ENABLED } from "@/app/utils/featureFlags";
import { getUserProfile, getAuthTokens } from "@/app/utils/database/db";
import MobilePageTransition from "@/app/component/MobilePageTransition";

export default function DashboardLayout({
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
    updateAuthStatus,
    authError,
    clearAuthError,
    getAuthError,
  } = useAuthContext();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const authCheckedRef = useRef(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  // Horizontal space the ShekiAI panel occupies, reported by the widget so
  // the content column can inset and sit beside it as a real third column.
  const [aiPanelWidth, setAiPanelWidth] = useState<number>(0);
  // Bumped whenever the AI panel is opened/interacted with, forcing the
  // sidenav closed so the two never fight for the same horizontal space.
  const [sidenavCollapseSignal, setSidenavCollapseSignal] = useState<number | undefined>(undefined);

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

      // accessToken/refreshToken are httpOnly cookies set by the server —
      // document.cookie can never see them, so that used to always read
      // false here and this branch never actually ran except via the
      // localStorage fast path below. The real client-side record of
      // whether we have tokens is the copy IndexedDB keeps via
      // saveAuthTokens() on login/refresh.
      const storedTokens = await getAuthTokens();
      const hasAccessToken = !!storedTokens?.accessToken;
      const hasRefreshToken = !!storedTokens?.refreshToken;

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
        // checkAuth()/refreshToken() distinguish "server explicitly said
        // this session is invalid" from "the request never got an answer"
        // (network drop, timeout, 5xx) and set authError only for the
        // latter. Getting no answer isn't proof of a bad session, so don't
        // sign the user out over it — show a retryable error instead.
        // getAuthError() reads a ref, so it reflects what just happened
        // above rather than a possibly stale render-time value.
        if (getAuthError()) {
          console.log("⚠️ Dashboard: Auth check errored, showing error screen instead of redirecting");
          setIsCheckingAuth(false);
          return;
        }
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
        const storedTokens = await getAuthTokens();
        const hasTokens = !!storedTokens?.accessToken || !!storedTokens?.refreshToken;
        if (hasTokens) {
          await checkAuth();
          console.log("✅ Dashboard: Background verification completed");
        }
      } catch (err) {
        console.log("Background verification failed, but user is still authorized from localStorage");
      }
    };

    verifyAuth();
    // authError/getAuthError deliberately excluded: authError is an output
    // of this effect, not an input, and getAuthError is a stable ref-backed
    // callback. retryCount is the only manual re-trigger.
  }, [authStatus.isExistingUser, checkAuth, refreshToken, router, updateAuthStatus, retryCount]);

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

  // A confirmed network/server error, not a confirmed-invalid session:
  // offer a retry instead of silently signing the user out.
  if (!isAuthorized && !isCheckingAuth && authError) {
    return (
      <AuthErrorScreen
        message={authError}
        onRetry={() => {
          clearAuthError();
          authCheckedRef.current = false;
          setRetryCount((c) => c + 1);
        }}
      />
    );
  }

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
              {AI_ENABLED && (
                <ShekiAIWidget mode="student" setPanelWidth={setAiPanelWidth} onInteract={() => setSidenavCollapseSignal((n) => (n ?? 0) + 1)} sidenavExpanded={!isCollapsed} />
              )}
              <Sidenav setIsCollapsedState={setIsCollapsed} forceCollapseSignal={sidenavCollapseSignal} />
              <div 
                className={`${isCollapsed ? "lg:w-[95%]" : "lg:w-[80%]"} org_width_animation w-full min-w-0 max-w-full h-full md:absolute right-0`}
                style={{ paddingRight: aiPanelWidth }}
              >
                <DashboardHeader />
                <div
                  className={`
                    w-full flex md:items-center flex-col 
                    md:px-0 md:py-0 md:rounded-none rounded-tr-xl rounded-tl-xl 
                    md:bg-lightSecondaryColor-0 mb-0 md:mb-5 overflow-auto px-3
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
                    <MobilePageTransition enabled={isMobile}>
                      {children}
                    </MobilePageTransition>
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