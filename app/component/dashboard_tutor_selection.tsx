"use client";

import { useState } from "react";
import { useI18n } from "@/app/context/I18nContext";

interface Props {
  allFunc: () => void;
  activeFunc: () => void;
  inActiveFunc: () => void;

}

export default function DashboardTutorActiveTab({
  allFunc,
  activeFunc,
  inActiveFunc,
}: Props) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive">(
    "all"
  );
  const handleClickTab = (tab: "all" | "active" | "inactive") => {
    setActiveTab(tab);
    if (tab == "all") {
      allFunc();
    } else if (tab == "active") {
      activeFunc();
    } else if (tab == "inactive") {
      inActiveFunc();
    }
  };

  const design = (tab: string) =>
    `${
      activeTab === tab
        ? "bg-white dark:bg-boldShadyColor-0 text-primaryColors-0 border border-primaryColors-0/30"
        : "bg-primaryColors-0 text-white"
    }`;
  return (
    <>
      <div className="flex justify-start items-center gap-3 text-[14px] font-[500]">
        <button
          className={`h-[34px] w-[10%] text-center ${design("all")}`}
          onClick={() => {
            handleClickTab("all");
          }}
        >
          {t("All")}
        </button>
        <button
          className={`h-[34px]  w-[15%] text-center ${design("active")}`}
          onClick={() => {
            handleClickTab("active");
          }}
        >
          {t("Active")}
        </button>
        <button
          className={`h-[34px]  w-[15%] text-center ${design("inactive")}`}
          onClick={() => {
            handleClickTab("inactive");
          }}
        >
          {t("Inactive")}
        </button>
      </div>
    </>
  );
}
