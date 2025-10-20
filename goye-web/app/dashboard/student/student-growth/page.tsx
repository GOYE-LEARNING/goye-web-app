"use client";

import DashboardGrowthAchievement from "@/app/component/dashboard_growth_achievement";
import DashboardGrowthCertificate from "@/app/component/dashboard_growth_certificate";
import DashboardGrowthSubHeader from "@/app/component/dashboard_growth_subheader";
import DashboardStudentGrowthMore from "@/app/component/dashboard_student_growth_more";
import SubHeader from "@/app/component/dashboard_subheader";
import { useState } from "react";

export default function StudentGrowth() {
  const [acheivements, setAchivement] = useState<boolean>(true);
  const [certificates, setCertificate] = useState<boolean>(false);
  const backFunction = () => {};
  const acheivement = () => {
    setCertificate(false);
    setAchivement(true);
  };
  const certificate = () => {
    setAchivement(false);
    setCertificate(true);
  };
  return (
    <>
      <SubHeader backFunction={backFunction} header="Spiritual Growth" />
      <DashboardStudentGrowthMore />
      <DashboardGrowthSubHeader
        acheivement={acheivement}
        certificate={certificate}
      />

      {acheivements && (
        <div>
          <DashboardGrowthAchievement />
        </div>
      )}
      {certificates && (
        <div>
          <DashboardGrowthCertificate />
        </div>
      )}
    </>
  );
}
