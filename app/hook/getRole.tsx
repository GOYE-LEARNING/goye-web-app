import { useParams, useRouter } from "next/navigation";

export function GetRole() {
  const router = useRouter();
  const params = useParams<{ org_name: string }>();
  const role = localStorage.getItem("role");
  if (role == "student") {
    router.push("/dashboard/student/profile");
  } else if (role == "tutor") {
    router.push("/dashboard/tutor/profile");
  } else if (role == "invited_user") {
    router.push(`/dashboard/${params.org_name}/organization/profile`);
  } else if (role == "org_admin") {
    router.push(`/dashboard/${params.org_name}/admin/profile`);
  }
}
