"use client";

import { useState } from "react";
import { useI18n } from "@/app/context/I18nContext";

interface Props {
  acheivement: () => void;
  certificate: () => void;
}
export default function DashboardGrowthSubHeader({
  acheivement,
  certificate,
}: Props) {
  const { t } = useI18n();
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
    <div className="bg-lightWhite-0 dark:bg-shadyColor-0 grid grid-cols-2 h-[40px] p-[4px] text-[12px]">
      <button
        onClick={achieveBtn}
        className={`${touchedAchieve ? "bg-[#ffffff] dark:bg-secondaryColors-0 drop-shadow-sm border border-[#ccc]/15" : ""}`}
      >
        {t("Acheivement")}
      </button>
      <button
        onClick={certifyBtn}
        className={`${touchedCertificate ? "bg-[#ffffff] dark:bg-secondaryColors-0 drop-shadow-sm" : ""}`}
      >
        {t("Certificate")}
      </button>
    </div>
  );
}
