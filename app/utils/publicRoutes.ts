/**
 * The single source of truth for "does this route require an authenticated
 * session." AuthGuard (app/layout.tsx) and AuthContext previously kept two
 * separate, hand-maintained copies of this list that had already drifted
 * apart (one had /discussion, the other had /forgot-password but not
 * /discussion) — a mismatch here silently either bounces a signed-in user
 * to /auth on a route that should be public, or lets an unauthenticated
 * request through to a route that should be guarded.
 */
export const PUBLIC_ROUTES = [
  "/auth",
  "/signup",
  "/",
  "/about",
  "/contact",
  "/discussion",
  "/forgot-password",
];

export function isPublicRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return true;
  return PUBLIC_ROUTES.some((route) =>
    route === "/" ? pathname === "/" : pathname.startsWith(route),
  );
}
