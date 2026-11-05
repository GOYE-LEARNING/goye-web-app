// app/component/AppProviders.tsx
"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import OrganizationProvider from "@/app/component/organization_component/organanization_context";
import { ThemeProvider } from "@/app/context/theme_provider";
import Cursor from "./cursor";
import AuthProvider from "../context/AuthContext";
import { SignupProvider } from "../context/SignupContext";
import { ModalProvider } from "../context/SimpleModalContext";
import { BuiltInTabProvider } from "../context/BuiltinTabContext";
import { GlobalAPIErrorHandler } from "./GlobalApiErrorHandler";
import { GlobalNotFoundHandler } from "./GlobalNotFoundHandler";
import { LanguageProvider } from "../context/LanguageContext";
import { I18nProvider } from "../context/I18nContext";
import {
  setupCrossTabSync,
  getSessionState,
  getOrCreateDeviceId,
  updateSessionState,
  setupDeviceIdSync,
  syncDeviceIdAcrossTabs,
} from "@/app/utils/database/db";
import { isPublicRoute } from "@/app/utils/publicRoutes";
import { reconcileStoredIdentity } from "@/app/utils/reconcileStoredIdentity";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (isPublicRoute(pathname)) {
          setIsInitialized(true);
          return;
        }

        const session = await getSessionState();

        if (!session?.isAuthenticated) {
          console.log("❌ Not authenticated, redirecting to login from layout");
          router.push("/auth");
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
        router.push("/auth");
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

function CrossTabSync() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const deviceChannel = setupDeviceIdSync();
    const authChannel = setupCrossTabSync();

    authChannel.onmessage = async (event) => {
      if (event.data.type === "LOGOUT") {
        console.log("📡 Received logout event from another tab");
        if (!window.location.pathname.includes("/auth")) {
          router.push("/auth");
        }
      }

      if (event.data.type === "LOGIN_SUCCESS") {
        console.log("📡 Received login event from another tab");
        await syncDeviceIdAcrossTabs();
        if (window.location.pathname.includes("/auth")) {
          router.push("/loading");
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

function DeviceIdSync() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncDeviceId = async () => {
      const deviceId = await getOrCreateDeviceId();
      console.log("🔑 Device ID initialized:", deviceId);
      await syncDeviceIdAcrossTabs();
    };

    syncDeviceId();

    const interval = setInterval(syncDeviceIdAcrossTabs, 30000);

    return () => clearInterval(interval);
  }, []);

  return null;
}

function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        const checkForUpdate = () => void registration.update().catch(() => {});
        checkForUpdate();
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") checkForUpdate();
        });
        window.addEventListener("focus", checkForUpdate);
      })
      .catch((error) => {
        console.error("Service worker registration failed:", error);
      });
  }, []);

  return null;
}

function IdentityReconciler() {
  useEffect(() => {
    void reconcileStoredIdentity();
  }, []);

  return null;
}

export default function AppProviders({
  children,
  bodyClassName,
}: {
  children: React.ReactNode;
  bodyClassName: string;
}) {
  const pathname = usePathname();
  const path = ["/dashboard/student/chat", "/dashboard/tutor/chat"];
  const checkAll = path.some((p) => pathname == p);

  return (
    <body className={`${bodyClassName} ${checkAll ? "overflow-hidden" : ""}`}>
      <IdentityReconciler />
      <ServiceWorkerRegistration />
      <LanguageProvider>
        <I18nProvider>
          <GlobalNotFoundHandler>
            <GlobalAPIErrorHandler>
              <SignupProvider>
                <AuthProvider>
                  <ThemeProvider>
                    <OrganizationProvider>
                      <ModalProvider>
                        <BuiltInTabProvider>
                          <AuthGuard>
                            <DeviceIdSync />
                            <CrossTabSync />
                            <div className="min-h-[100dvh] w-full max-w-[100vw] min-w-0 overflow-x-hidden">
                              <Cursor />
                              {children}
                              <div id="modal-root" />
                              <div id="slideshow-modal-root" />
                            </div>
                          </AuthGuard>
                        </BuiltInTabProvider>
                      </ModalProvider>
                    </OrganizationProvider>
                  </ThemeProvider>
                </AuthProvider>
              </SignupProvider>
            </GlobalAPIErrorHandler>
          </GlobalNotFoundHandler>
        </I18nProvider>
      </LanguageProvider>
    </body>
  );
}