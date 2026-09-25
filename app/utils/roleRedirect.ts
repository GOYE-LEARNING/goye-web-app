/**
 * Role -> dashboard path resolution, shared by the landing navbar and the
 * PWA entry route (/app) — both need to send an authenticated visitor to
 * their correct dashboard without duplicating this branch logic.
 */

export function getRoleRedirectPath(): string {
  if (typeof window === "undefined") return "/auth";

  const role = localStorage.getItem("role");
  const org_name = localStorage.getItem("org_name");
  const type = localStorage.getItem("type")?.toLowerCase();

  if (role === "goye_admin" || type === "admin") {
    return "/dashboard/admin";
  }

  if (role === "org_admin") {
    if (!org_name) return "/auth";
    return `/dashboard/${org_name}/admin`;
  }

  if (role === "invited_user" || type === "invited_user") {
    if (!org_name) return "/auth";
    return `/dashboard/${org_name}/organization`;
  }

  if (role === "instructor" || role === "tutor") {
    return "/dashboard/tutor";
  }

  if (role === "student") {
    return "/dashboard/student";
  }

  return "/auth";
}

export function getProfileRedirectPath(): string {
  if (typeof window === "undefined") return "/auth";

  const role = localStorage.getItem("role");
  const org_name = localStorage.getItem("org_name");

  if (role === "student") {
    return "/dashboard/student/profile";
  } else if (role === "instructor" || role === "tutor") {
    return "/dashboard/tutor/profile";
  } else if (role === "invited_user") {
    return org_name ? `/dashboard/${org_name}/organization/profile` : "/auth";
  } else if (role === "org_admin") {
    return org_name ? `/dashboard/${org_name}/admin/profile` : "/auth";
  } else if (role === "goye_admin") {
    return "/dashboard/admin/profile";
  }

  return "/auth";
}

/**
 * Same role branching as getRoleRedirectPath, but driven by a freshly
 * fetched profile/organization payload instead of localStorage — used
 * wherever the caller just did a real network check (checkPublicSession,
 * the /app entry route) rather than trusting whatever a previous session
 * happened to leave in localStorage.
 */
export function resolveRedirectPathFromProfile(
  user: any,
  organization?: any,
): string {
  if (!user) return "/auth";

  const role = user.role;
  const userType = user.userType;
  const orgName =
    organization?.organization_name ||
    organization?.name ||
    user.organizationName;

  if (role === "goye_admin" || userType === "ADMIN") {
    return "/dashboard/admin";
  }

  if (role === "org_admin" || userType === "ORGANIZATION_OWNER") {
    return orgName ? `/dashboard/${orgName}/admin` : "/auth";
  }

  if (role === "invited_user" || userType === "INVITED_MEMBER") {
    return orgName ? `/dashboard/${orgName}/organization` : "/auth";
  }

  if (role === "instructor" || role === "tutor") {
    return "/dashboard/tutor";
  }

  if (role === "student") {
    return "/dashboard/student";
  }

  return "/auth";
}
