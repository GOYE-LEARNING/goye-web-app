// app/components/UserRoute.tsx
"use client";

import { ProtectedRoute } from "./ProtectedRoute";

export function UserRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["user", "student", "tutor", "individual"]}>
      {children}
    </ProtectedRoute>
  );
}