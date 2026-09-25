// app/component/AppProviders.tsx
//
// Everything RootLayout (app/layout.tsx) used to do directly, moved out into
// its own client component so app/layout.tsx can become a server component
// and export PWA metadata (manifest link, theme-color, viewport) — Next's
// Metadata API only works in server components, and this tree needs
// useEffect/useState/router hooks, so it can't be one file anymore. No
// logic changed from the original RootLayout body, only moved.
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

// AuthGuard component to protect routes
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

// Explicit service worker registration — see the `register: false` note in
// next.config.ts for why this can't be left to the plugin's own injection
// under the App Router.
//
// A shipped fix is only "live" once the browser is actually running the new
// JS bundle — the SW's own skipWaiting()/clientsClaim() only make a new
// worker take over fetches, they don't make an already-open tab reload the
// (already-executing, now-stale) code it loaded on its last navigation. Two
// bugs (the i18n cache-key fix and the org-announcement fix) were reported
// as "still happening" purely because of this: the server had the fix, but
// nothing ever told an already-open tab/installed PWA to go get it. This
// adds the two missing pieces:
//  - actively ask for an update check (registration.update()) instead of
//    waiting on the browser's own infrequent schedule — on mount and every
//    time the tab/PWA regains focus, which is exactly when a user would
//    otherwise wonder why yesterday's bug is still there.
//  - reload once a new worker actually takes control, so the fix is running
//    on the very next check instead of "next time you happen to fully close
//    and reopen the app."
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

/**
 * One-off repair of identity values left behind by earlier builds.
 *
 * Sits here rather than inside AuthGuard because AuthGuard returns early on
 * public routes, and the residue most needs clearing exactly when someone is
 * sitting on /auth about to sign in as a different person.
 *
 * Renders nothing and never blocks startup.
 */
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
    <body
      className={`${bodyClassName} ${checkAll ? "overflow-hidden" : ""}`}
    >
      <IdentityReconciler />
      <ServiceWorkerRegistration />
      {/*
        LanguageProvider/I18nProvider now wrap literally everything,
        including the error/not-found handlers. They used to sit deep
        inside this tree (below GlobalNotFoundHandler/GlobalAPIErrorHandler),
        which worked fine until those two handlers themselves started
        calling useI18n() — at that point every single page crashed with
        "useI18n must be used within I18nProvider" on mount, since a
        consumer can never sit above its own provider. Putting the
        providers outermost is also the more correct place for them
        anyway: an error screen should be able to translate too.
      */}
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
