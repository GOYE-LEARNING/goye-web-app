"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
interface SidenavProps {
  label: string;
  icon: React.ReactNode;
  path: string
}

export default function SidenavComponent({label, path, icon} : SidenavProps) {
const pathname = usePathname()
const isActive = pathname == path
  return (
    <>
      <div className="">

      </div>
    </>
  );
}
