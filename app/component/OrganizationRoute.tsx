// app/components/OrganizationRoute.tsx
"use client";

import { ProtectedRoute } from "./ProtectedRoute";

export function OrganizationRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["organization", "org_admin", "invited_user"]}>
      {children}
    </ProtectedRoute>
  );
}