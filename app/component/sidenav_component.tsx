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
        className={`flex items-center md:flex-row flex-col md:justify-start justify-center gap-2 h-[48px] px-2 rounded-[8px] side_link w-full min-w-0 ${
          isActive
            ? "md:bg-primaryColors-0/15 text-primaryColors-0 font-semibold"
            : "text-textGrey-0"
        }`}
      >
        <span className="text-[14px]">{icon}</span>
        <div className={`text-[13px] truncate ${isActive ? "font-semibold" : ""}`}>
          {label}
        </div>
      </Link>
    </>
  );
}
