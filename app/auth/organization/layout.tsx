"use client";

import BodyProvider from "./BodyProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <BodyProvider>
      <div className="h-full chat_scroll">{children}</div>
    </BodyProvider>
  );
}
