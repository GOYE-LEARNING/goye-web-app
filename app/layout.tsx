// app/layout.tsx
"use client";
import "@/app/styles/globals.css";
import "@fontsource/inter";
import "@fontsource/fustat";
import "@fontsource/fustat/500.css";
import "@fontsource/fustat/600.css";
import "@fontsource/fustat/700.css";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import localFont from "next/font/local";
import OrganizationProvider from "@/app/component/organization_component/organanization_context";
import { ThemeProvider } from "@/app/context/theme_provider";
import Cursor from "./component/cursor";
import AuthProvider from "./context/AuthContext";
import { SignupProvider } from "./context/SignupContext";
import { ModalProvider } from "./context/SimpleModalContext";
import { BuiltInTabProvider } from "./context/BuiltinTabContext";
import { GlobalAPIErrorHandler } from "./component/GlobalApiErrorHandler";
import { GlobalNotFoundHandler } from "./component/GlobalNotFoundHandler";
import { LanguageProvider } from "./context/LanguageContext";
import { I18nProvider } from "./context/I18nContext";
import { 
  setupCrossTabSync, 
  getSessionState, 
  getOrCreateDeviceId,
  updateSessionState,
  setupDeviceIdSync,
  syncDeviceIdAcrossTabs
} from "@/app/utils/database/db";
import { setupGlobalFetchInterceptor } from "@/app/utils/globalFetch";

const Poppins = localFont({
  src: "../public/font/Poppins-Regular.ttf",
  variable: "--font-poppins",
});

// AuthGuard component to protect routes
function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const publicRoutes = ['/auth', '/signup', '/', '/about', '/contact', '/auth'];
        const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));
        
        if (isPublicRoute) {
          setIsInitialized(true);
          return;
        }

        const session = await getSessionState();
        
        if (!session?.isAuthenticated) {
          console.log("❌ Not authenticated, redirecting to login from layout");
          router.push('/auth');
          return;
        }

        await getOrCreateDeviceId();
        await syncDeviceIdAcrossTabs();

        await updateSessionState({
          lastActivity: new Date().toISOString(),
        });

        setIsInitialized(true);
      } catch (error) {
        console.error("AuthGuard initialization error:", error);
        router.push('/auth');
      }
    };

    initAuth();
  }, [pathname, router]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}

// Cross-tab sync component
function CrossTabSync() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const deviceChannel = setupDeviceIdSync();
    const authChannel = setupCrossTabSync();
    
    authChannel.onmessage = async (event) => {
      if (event.data.type === 'LOGOUT') {
        console.log('📡 Received logout event from another tab');
        if (!window.location.pathname.includes('/auth')) {
          router.push('/auth');
        }
      }
      
      if (event.data.type === 'LOGIN_SUCCESS') {
        console.log('📡 Received login event from another tab');
        await syncDeviceIdAcrossTabs();
        if (window.location.pathname.includes('/auth')) {
          router.push('/loading');
        } else {
          window.location.reload();
        }
      }
    };

    syncDeviceIdAcrossTabs();

    return () => {
      if (deviceChannel) deviceChannel.close();
      authChannel.close();
    };
  }, [router]);

  return null;
}

// Device ID sync component
function DeviceIdSync() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncDeviceId = async () => {
      const deviceId = await getOrCreateDeviceId();
      console.log('🔑 Device ID initialized:', deviceId);
      await syncDeviceIdAcrossTabs();
    };

    syncDeviceId();

    const interval = setInterval(syncDeviceIdAcrossTabs, 30000);

    return () => clearInterval(interval);
  }, []);

  return null;
}

// Global fetch interceptor component
function GlobalFetchInterceptor() {
  useEffect(() => {
    setupGlobalFetchInterceptor();
  }, []);

  return null;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const path = ["/dashboard/student/chat", "/dashboard/tutor/chat"];
  const checkAll = path.some((p) => pathname == p);

  return (
    <html lang="en" className="h-full">
      <body
        className={`min-h-full ${Poppins.variable} dark:bg-secondaryColors-0 bg-white dark:text-textSlightDark-0 text-lightBoldText-0 antialiased font-['Fustat',_'sans-erif'] scrollbar2 ${checkAll ? "overflow-hidden" : ""}`}
      >
        <GlobalNotFoundHandler>
          <GlobalAPIErrorHandler>
            <SignupProvider>
              <AuthProvider>
                <ThemeProvider>
                  <OrganizationProvider>
                    <ModalProvider>
                      <BuiltInTabProvider>
                        <LanguageProvider>
                          <I18nProvider>
                            <AuthGuard>
                              <GlobalFetchInterceptor />
                              <DeviceIdSync />
                              <CrossTabSync />
                              <div className="min-h-[100dvh] w-full max-w-[100vw] min-w-0 overflow-x-hidden">
                                <Cursor />
                                {children}
                                <div id="modal-root" />
                                <div id="slideshow-modal-root" />
                              </div>
                            </AuthGuard>
                          </I18nProvider>
                        </LanguageProvider>
                      </BuiltInTabProvider>
                    </ModalProvider>
                  </OrganizationProvider>
                </ThemeProvider>
              </AuthProvider>
            </SignupProvider>
          </GlobalAPIErrorHandler>
        </GlobalNotFoundHandler>
      </body>
    </html>
  );
}