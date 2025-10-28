import { useState } from "react";

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
        ? "bg-boldShadyColor-0 text-primaryColors-0"
        : "bg-[#EFEFF1] text-SlightDark"
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
          All
        </button>
        <button
          className={`h-[34px]  w-[15%] text-center ${design("active")}`}
          onClick={() => {
            handleClickTab("active");
          }}
        >
          Active
        </button>
        <button
          className={`h-[34px]  w-[15%] text-center ${design("inactive")}`}
          onClick={() => {
            handleClickTab("inactive");
          }}
        >
          Inactive
        </button>
      </div>
    </>
  );
}
