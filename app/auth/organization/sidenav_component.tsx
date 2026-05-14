"use client";

import { usePathname } from "next/navigation";
import LinkNext from "next/link";
import React from "react";

interface Props {
  label?: string;
  path: string;
  icon: React.ReactNode;
  value?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export default function Link({
  label,
  path,
  icon,
  value,
  onClick,
  disabled,
}: Props) {
  const pathname = usePathname();
  const isActive = pathname === path;

  return (
    <div>
      <LinkNext
        onClick={onClick}
        href={path}
        className={`cursor-pointer transition-all duration-200 rounded-full flex justify-center items-center md:h-[54px] md:w-[54px] h-[45px] w-[45px] ${
          isActive ? "text-textSlightDark-0 bg-white" : "text-white"
        } ${
          disabled
            ? "opacity-40 pointer-events-none cursor-not-allowed"
            : "hover:text-white hover:bg-black/25"
        }`}
      >
        <span>{icon}</span>
      </LinkNext>
    </div>
  );
}
