"use client";

import { SignupProvider } from "@/app/context/SignupContext";
import BodyProvider from "./BodyProvider";
import AuthProvider from "@/app/context/AuthContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SignupProvider>
        <BodyProvider>
          <div className="h-full chat_scroll">{children}</div>
        </BodyProvider>
      </SignupProvider>
    </AuthProvider>
  );
}
