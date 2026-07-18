"use client";

import ManageEvents from "@/app/component/organization_component/ManageEvents";
import { useRouter } from "next/navigation";

export default function OrgAdminEvent() {
  const router = useRouter();

  return <ManageEvents onBack={() => router.back()} />;
}
