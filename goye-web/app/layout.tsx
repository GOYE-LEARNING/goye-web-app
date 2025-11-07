import "./styles/globals.css";
import React from "react";
import "@fontsource/inter";
import "@fontsource/fustat"; // Default weight 400
import "@fontsource/fustat/500.css"; // Optional bold weight
import "@fontsource/fustat/600.css"; // Optional bold weight
import "@fontsource/fustat/700.css"; // Optional bold weight

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
        <div className="min-h-[100vh] w-full bg-secondaryColors-0">
          {children}
        </div>
      </body>
    </html>
  );
}
