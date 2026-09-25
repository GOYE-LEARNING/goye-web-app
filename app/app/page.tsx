// app/app/page.tsx — path "/app", the PWA manifest's start_url.
//
// Pure redirect gate: "Open PWA -> existing session? -> dashboard : login",
// per the PWA spec. Deliberately NOT in PUBLIC_ROUTES — AuthGuard
// (app/component/AppProviders.tsx) already bounces an unauthenticated visit
// to /auth before this even mounts, so this effect only has to handle the
// authenticated case: run the same full session check every dashboard route
// uses, then send the visitor to their actual role-based dashboard instead
// of a generic one.
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/app/context/AuthContext";
import AuthLoader from "@/app/auth/auth_loader";
import { resolveRedirectPathFromProfile } from "@/app/utils/roleRedirect";

export default function PwaEntryPage() {
  const router = useRouter();
  const { checkAuth, authStatus } = useAuthContext();
  const hasStarted = useRef(false);
  const hasRedirected = useRef(false);

  // Kick off the same full session check every dashboard route uses.
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    void checkAuth();
  }, [checkAuth]);

  // authStatus updates asynchronously after checkAuth() resolves — reading
  // it back inside the effect above would only see the stale pre-check
  // value, so the redirect has to react to the *next* render instead of
  // happening inside the same async call.
  useEffect(() => {
    if (hasRedirected.current || authStatus.isLoading) return;
    hasRedirected.current = true;

    if (!authStatus.isExistingUser) {
      router.replace("/auth");
      return;
    }

    const path = resolveRedirectPathFromProfile(
      authStatus.user,
      authStatus.organization,
    );
    router.replace(path);
  }, [authStatus, router]);

  return <AuthLoader />;
}
