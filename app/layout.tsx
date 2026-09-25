// app/layout.tsx
//
// Server component so it can export PWA metadata/viewport (Next's Metadata
// API only works here, not in a "use client" file) — everything else that
// used to live in this file (AuthGuard, providers, cross-tab sync) moved,
// unchanged, into the client component AppProviders.
import type { Metadata, Viewport } from "next";
import "@/app/styles/globals.css";
import "@fontsource/inter";
import "@fontsource/fustat";
import "@fontsource/fustat/500.css";
import "@fontsource/fustat/600.css";
import "@fontsource/fustat/700.css";

import localFont from "next/font/local";
import AppProviders from "./component/AppProviders";

const Poppins = localFont({
  src: "../public/font/Poppins-Regular.ttf",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "GOYE",
  description: "GOYE — learn, connect, and grow with your community.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GOYE",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFA500",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <AppProviders
        bodyClassName={`min-h-full ${Poppins.variable} dark:bg-secondaryColors-0 bg-white dark:text-textSlightDark-0 text-lightBoldText-0 antialiased font-['Fustat',_'sans-erif'] scrollbar2`}
      >
        {children}
      </AppProviders>
    </html>
  );
}
