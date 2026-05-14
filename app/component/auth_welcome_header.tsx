"use client";
import Image from "next/image";
import logoDarkMode from "@/public/images/goye_white.png";
import logoLightMode from "@/public/images/goye-removebg-preview.png";
import { usePathname } from "next/navigation";
import { useTheme } from "../context/theme_provider";
import ToogleDarkMode from "./toogleDarkMode";
export default function AuthWelcomeHeader() {
  const pathname = usePathname();
  const { darkMode, setDarkMode } = useTheme();
  return (
    <>
      <div className="px-[48px] flex justify-between items-center font-[400] md:mb-7 my-7 md:mt-0 w-full">
        <Image
          src={darkMode ? logoDarkMode : logoLightMode}
          alt="logo"
          height={100}
          width={100}
        />
        <ToogleDarkMode toogleDarkMode={() => setDarkMode(!darkMode)} />
      </div>
    </>
  );
}
