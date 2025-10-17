"use client";

import { useState } from "react";
import { FaCheck } from "react-icons/fa";

interface Props {
  value: string;
  onChange: () => void;
  countries: object;
}
export default function DropDowns({ value: onChange, countries }: Props) {
  const [selected, setSelected] = useState<string>("");
  return (
    <>
      <div className="w-full absolute h-[230px] overflow-x-hidden scrollbar drop-shadow-md bg-white z-10 rounded-sm">
        {countries as any}
      </div>
    </>
  );
}
