"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
interface SidenavProps {
  label: string;
  icon: React.ReactNode;
  path: string;
}

export default function SidenavComponent({ label, path, icon }: SidenavProps) {
  const pathname = usePathname();
  const isActive = pathname === path;
  return (
    <>
      <Link
        href={path}
        className={`flex items-center gap-2 h-[40px] px-2 rounded-[8px] side_link ${
          isActive ? "bg-primaryColors-0/10" : ""
        }`}
      >
        <span className="text-[14px]">{icon}</span>
        <div
          className={`${
            isActive ? "text-[#3F1F22] font-semibold" : "text-[#71748C]"
          }  text-[14px] `}
        >
          {label}
        </div>
      </Link>
    </>
  );
}
