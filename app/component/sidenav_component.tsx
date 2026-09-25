"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidenavProps {
  label: string;
  icon: React.ReactNode;
  path: string;
  isCollapsed?: boolean;
}

export default function SidenavComponent({ label, path, icon, isCollapsed = false }: SidenavProps) {
  const pathname = usePathname();
  const isActive = pathname === path;

  // On mobile the bar is a compact floating pill (see .sidenav's mobile
  // override in globals.css) — there isn't room to show every label, so only
  // the active tab gets one, matching a native tab bar. isCollapsed is a
  // desktop-only concept (the collapse toggle is hidden on mobile), so it
  // always wins over the active-label rule when set.
  const labelVisibility = isCollapsed
    ? "hidden"
    : isActive
      ? "block"
      : "hidden md:block";

  return (
    <>
      <Link
        href={path}
        className={`flex items-center flex-row md:justify-start justify-center gap-1.5 h-10 md:h-[48px] px-3 md:px-2 rounded-full md:rounded-[8px] side_link min-w-0 shrink-0 md:w-full md:shrink ${
          isActive
            ? "bg-primaryColors-0/15 text-primaryColors-0 font-semibold"
            : "text-textGrey-0"
        } ${isCollapsed ? 'justify-center' : ''}`}
      >
        <span className="text-[14px] shrink-0">{icon}</span>
        <div className={`text-[13px] truncate ${isActive ? "font-semibold" : ""} ${labelVisibility}`}>
          {label}
        </div>
      </Link>
    </>
  );
}