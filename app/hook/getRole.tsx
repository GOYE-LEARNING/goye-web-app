export function getRoleRedirectPath() {
  const role = localStorage.getItem("role");
  const org_name = localStorage.getItem("org_name"); // Store org_name during login
  
  if (role === "student") {
    return "/dashboard/student/profile";
  } else if (role === "tutor") {
    return "/dashboard/tutor/profile";
  } else if (role === "invited_user") {
    return `/dashboard/${org_name}/organization/profile`;
  } else if (role === "org_admin") {
    return `/dashboard/${org_name}/admin/profile`;
  }
  return "/auth"; // default fallback
}