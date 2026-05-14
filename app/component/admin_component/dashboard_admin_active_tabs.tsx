import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface Props {
  allFunc: () => void;
  studentFunc: () => void;
  tutorFunc: () => void;

}

export default function DashboardAdminTab({
  allFunc,
  studentFunc,
  tutorFunc,
}: Props) {
  const params = useParams<{org_name: string}>()
  const {org_name} = params;
  const pathname = usePathname()
  
  const [studentTab, setstudentTab] = useState<"all" | "student" | "instructors">(
    "all"
  );
  const handleClickTab = (tab: "all" | "student" | "instructors") => {
    setstudentTab(tab);
    if (tab == "all") {
      allFunc();
    } else if (tab == "student") {
      studentFunc();
    } else if (tab == "instructors") {
      tutorFunc();
    }
  };

  const design = (tab: string) =>
    `${
      studentTab === tab
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
          className={`h-[34px]  w-[15%] text-center ${design("student")}`}
          onClick={() => {
            handleClickTab("student");
          }}
        >
          {pathname == `/dashboard/${org_name}/admin/users` ? 'Members' : "Student"}
        </button>
        <button
          className={`h-[34px]  w-[15%] text-center ${design("instructors")}`}
          onClick={() => {
            handleClickTab("instructors");
          }}
        >
          Instructors
        </button>
      </div>
    </>
  );
}
