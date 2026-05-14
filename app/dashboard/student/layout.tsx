"use client";

import DashboardHeader from "@/app/component/dashboard_header";
import Sidenav from "./sidenav";
import { usePathname, useRouter } from "next/navigation";
import ProgressProvider from "@/app/context/progressContext";
import QuizProvider from "@/app/context/quizContext";
import { useEffect, useState } from "react";
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

  const path = ["/dashboard/student/course", "/dashboard/student/community"];
  const path2 = ["/dashboard/student/chat"];
  const checkPath = path.some((p) => pathname == p);
  const isChatPage = path2.some((p) => pathname == p);
  const [isMobile, setIsMobile] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const verifyAuth = async () => {
      setIsCheckingAuth(true);

      let isAuthenticated = authStatus.isExistingUser;

      if (!isAuthenticated) {
        const refreshed = await refreshToken();
        if (refreshed) {
          const isValid = await checkAuth();
          isAuthenticated = isValid;
        }
      }

      if (!isAuthenticated) {
        const redirectUrl = `/auth`;
        router.push(redirectUrl);
        setIsCheckingAuth(false);
        return;
      }


      setIsAuthorized(true);
      setIsCheckingAuth(false);
    };

    verifyAuth();
  }, [authStatus.isExistingUser, authStatus.isProfileComplete, checkAuth, refreshToken, router, pathname]);

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
      <ProgressProvider>
        <QuizProvider>
          <div className="min-h-screen w-full md:bg-transparent bg-primaryColors-0 ">
            <Sidenav />
            <div className="md:w-[80%] w-full min-w-0 max-w-full h-full md:absolute right-0">
              <DashboardHeader />
              <div
                className={`
                  w-full flex md:items-center flex-col 
                  md:px-0 md:py-0 md:rounded-none rounded-tr-xl rounded-tl-xl 
                  md:bg-lightSecondaryColor-0 mb-0 md:mb-5 overflow-auto px-4
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
                </div>
              </div>
            </div>
          </div>
        </QuizProvider>
      </ProgressProvider>
    </>
  );
}