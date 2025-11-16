"use client";

import React from "react";
import { CiSearch } from "react-icons/ci";
interface Props {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
export default function DashboardSearch({
  placeholder,
  value,
  onChange,
}: Props) {
  return (
    <>
      <div className="h-[40px] border-b border-[#D2D5DA] flex items-center gap-3 w-full my-5">
        <CiSearch size={25} />
        <input
          type="text"
          placeholder={placeholder}
          className="w-full bg-transparent border-none outline-none"
          value={value}
          onChange={onChange}
        />
      </div>
    </>
  );
}
