"use client";

import { useState } from "react";

interface Props {
  acheivement: () => void;
  certificate: () => void;
}
export default function DashboardGrowthSubHeader({
  acheivement,
  certificate,
}: Props) {
  const [touchedAchieve, setTouchedAcheive] = useState<boolean>(true);
  const [touchedCertificate, setTouchedCertificate] = useState<boolean>(false);

  const achieveBtn = () => {
    acheivement();
    setTouchedCertificate(false);
    setTouchedAcheive(true);
  };

  const certifyBtn = () => {
    certificate();
    setTouchedAcheive(false);
    setTouchedCertificate(true);
  };
  return (
    <div className="bg-[#F1F1F4CC] grid grid-cols-2 h-[32px] p-[4px] text-[12px]">
      <button
        onClick={achieveBtn}
        className={`${touchedAchieve ? "bg-[#ffffff] drop-shadow-sm" : ""}`}
      >
        Acheivement
      </button>
      <button
        onClick={certifyBtn}
        className={`${touchedCertificate ? "bg-[#ffffff] drop-shadow-sm" : ""}`}
      >
        Certificate
      </button>
    </div>
  );
}
