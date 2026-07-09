"use client";
import "@/app/styles/globals.css";
import React from "react";
import "@fontsource/inter";
import "@fontsource/fustat"; // Default weight 400
import "@fontsource/fustat/500.css"; // Optional bold weight
import "@fontsource/fustat/600.css"; // Optional bold weight
import "@fontsource/fustat/700.css"; // Optional bold weight
import { usePathname } from "next/navigation";

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
        className={`min-h-full dark:bg-secondaryColors-0 bg-white dark:text-textSlightDark-0 text-lightBoldText-0 antialiased font-['Fustat',_'sans-erif'] scrollbar2 ${checkAll ? "overflow-hidden" : ""}`}
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
                          <div className="min-h-[100dvh] w-full max-w-[100vw] min-w-0  overflow-x-hidden">
                            <Cursor />

                            {children}
                            <div id="modal-root" />
                            <div id="slideshow-modal-root" />
                          </div>
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
