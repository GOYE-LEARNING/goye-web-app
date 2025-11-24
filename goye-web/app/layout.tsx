import "./styles/globals.css";
import React, { useEffect } from "react";
import "@fontsource/inter";
import "@fontsource/fustat"; // Default weight 400
import "@fontsource/fustat/500.css"; // Optional bold weight
import "@fontsource/fustat/600.css"; // Optional bold weight
import "@fontsource/fustat/700.css"; // Optional bold weight
import { usePathname } from "next/navigation";
import path from "path";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html>
      <body
        className={`bg-white md:bg-secondaryColors-0 font-['Fustat',_'sans-erif'] scrollbar`}
      >
        <div className={`min-h-[100vh] w-full md:bg-secondaryColors-0 bg-white overflow-hidden`}>
          {children}
        </div>
      </body>
    </html>
  );
}
