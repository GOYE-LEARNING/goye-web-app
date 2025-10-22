"use client";

import { useState } from "react";

interface Props {
  allFunc: (all: boolean) => void;
  enrolledFunc: (enrolled: boolean) => void;
  savedFunc: (saved: boolean) => void;
  doneFunc: (done: boolean) => void;
}
export default function DashboardTabSelection({
  allFunc,
  enrolledFunc,
  savedFunc,
  doneFunc,
}: Props) {
  const [activeTab, setActiveTab] = useState<
    "all" | "enrolled" | "saved" | "done"
  >("all");

  const handleClick = (tab: "all" | "enrolled" | "saved" | "done") => {
    setActiveTab(tab);
    if (tab == "all") {
      allFunc(true);
    } else if (tab == "enrolled") {
      enrolledFunc(true);
    } else if (tab == "saved") {
      savedFunc(true);
    } else if (tab == "done") {
      doneFunc(true);
    }
  };

  const design = (tab: string) =>
    `${activeTab === tab ? "bg-[#EDE8E8]" : "bg-[#EFEFF1]"}`;
  return (
    <>
      <div className="flex justify-between items-center gap-3 text-[14px] font-[500]">
        <button
          className={`h-[34px] w-[10%] text-center ${design("all")}`}
          onClick={() => {
            handleClick("all");
          }}
        >
          All
        </button>
        <button
          className={`h-[34px]  w-[30%] text-center ${design("enrolled")}`}
          onClick={() => {
            handleClick("enrolled");
          }}
        >
          Enrolled
        </button>
        <button
          className={`h-[34px]  w-[30%] text-center ${design("saved")}`}
          onClick={() => handleClick("saved")}
        >
          Saved
        </button>
        <button
          className={`h-[34px]  w-[30%] text-center ${design("done")}`}
          onClick={() => handleClick("done")}
        >
          Done
        </button>
      </div>
    </>
  );
}
