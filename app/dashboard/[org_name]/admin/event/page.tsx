"use client";

import DashboardAdminEventManagement from "@/app/component/admin_component/dashboard_admin_event_management";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function OrgAdminEvent() {
  const params = useParams();
  const orgName = params.org_name as string;
  const [showEventList, setShowEventList] = useState(true);

  return (
    <div>
      {showEventList && (
        <DashboardAdminEventManagement
          orgId={orgName}
          backFunction={() => setShowEventList(false)}
        />
      )}
    </div>
  );
}
