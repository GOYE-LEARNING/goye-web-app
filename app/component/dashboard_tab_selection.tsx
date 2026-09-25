"use client";

import { SetStateAction, useState } from "react";
import { useI18n } from "@/app/context/I18nContext";

type TabType = "all" | "enrolled" | "saved" | "done";

interface Props {
  activeTab: TabType;
  setActiveTab: React.Dispatch<SetStateAction<TabType>>;
}

export default function DashboardTabSelection({
  activeTab,
  setActiveTab,
}: Props) {
  const { t } = useI18n();
  const handleClick = (tab: TabType) => {
    setActiveTab(tab);
  };

  const design = (tab: string) =>
    `${activeTab === tab
      ? "bg-primaryColors-0 text-white shadow-md"
      : "dark:bg-secondaryColors-0 bg-white border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}
     h-[34px] px-5 rounded-md transition-all duration-200 font-medium cursor-pointer flex-shrink-0`;

  return (
    // Combining percentage widths with min-widths on 4 buttons forced this
    // row wider than a phone screen, and with no overflow handling of its
    // own, that overflow bubbled up into a horizontal scrollbar on the
    // WHOLE page instead of just this row. flex-nowrap + overflow-x-auto
    // contains the scroll to the tab strip itself, where it belongs.
    <div className="flex items-center gap-3 text-[14px] font-[500] my-5 overflow-x-auto no-scrollbar">
      <button
        type="button"
        className={design("all")}
        onClick={() => handleClick("all")}
      >
        {t("All")}
      </button>
      <button
        type="button"
        className={design("enrolled")}
        onClick={() => handleClick("enrolled")}
      >
        {t("Enrolled")}
      </button>
      <button
        type="button"
        className={design("saved")}
        onClick={() => handleClick("saved")}
      >
        {t("Saved")}
      </button>
      <button
        type="button"
        className={design("done")}
        onClick={() => handleClick("done")}
      >
        {t("Done")}
      </button>
    </div>
  );
}