// app/components/AdminRoute.tsx
"use client";

import { ProtectedRoute } from "./ProtectedRoute";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["admin", "goye_admin", "super_admin"]}>
      {children}
    </ProtectedRoute>
  );
}