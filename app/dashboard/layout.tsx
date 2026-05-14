// app/dashboard/layout.tsx
"use client";

import AuthProvider from "@/app/context/AuthContext";

export default function DashboardParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}