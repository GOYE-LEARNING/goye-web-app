"use client";

import { SetStateAction, useState } from "react";

type TabType = "all" | "enrolled" | "saved" | "done";

interface Props {
  activeTab: TabType;
  setActiveTab: React.Dispatch<SetStateAction<TabType>>;
}

export default function DashboardTabSelection({
  activeTab,
  setActiveTab,
}: Props) {
  const handleClick = (tab: TabType) => {
    setActiveTab(tab);
  };

  const design = (tab: string) =>
    `${activeTab === tab 
      ? "bg-primaryColors-0 text-white shadow-md" 
      : "dark:bg-secondaryColors-0 bg-white border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"} 
     h-[34px] rounded-md transition-all duration-200 font-medium cursor-pointer`;

  return (
    <div className="flex justify-between items-center gap-3 text-[14px] font-[500] my-5">
      <button
        type="button"
        className={`${design("all")} w-[10%] min-w-[70px]`}
        onClick={() => handleClick("all")}
      >
        All
      </button>
      <button
        type="button"
        className={`${design("enrolled")} w-[30%] min-w-[100px]`}
        onClick={() => handleClick("enrolled")}
      >
        Enrolled
      </button>
      <button
        type="button"
        className={`${design("saved")} w-[30%] min-w-[100px]`}
        onClick={() => handleClick("saved")}
      >
        Saved
      </button>
      <button
        type="button"
        className={`${design("done")} w-[30%] min-w-[100px]`}
        onClick={() => handleClick("done")}
      >
        Done
      </button>
    </div>
  );
}