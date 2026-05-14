"use client";

import { usePathname } from "next/navigation";

interface Props {
  value: string;
  onChange: () => void;
  countries: object;
}
export default function DropDowns({ value: onChange, countries }: Props) {
  const pathname = usePathname();

  const url = [
    "/auth/organization/organization-information",
    "/auth/organization/user-information",
  ];

  const checkPath = url.some((p) => pathname == p);
  return (
    <>
      <div
        className={`w-full absolute left-0 h-[200px] overflow-x-hidden scrollbar drop-shadow-md ${
          checkPath ? "bg-primaryColors-0 text-white" : "dark:bg-shadyColor-0 bg-white"
        } z-10 rounded-sm flex flex-col`}
      >
        {countries as any}
      </div>
    </>
  );
}
