"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTheme } from "../context/theme_provider";
import logo from '@/public/images/goye_final_logo.png'
import ToogleDarkMode from "./toogleDarkMode";
import { CiGlobe } from "react-icons/ci";
import { FaChevronDown } from "react-icons/fa";

interface Props {
  openLanguage: () => void;
  hasLanguage: boolean;
}

export default function AuthWelcomeHeader({
  openLanguage,
  hasLanguage,
}: Props) {
  const { darkMode, setDarkMode } = useTheme();
  const [language, setLanguage] = useState<string>("");
  const [languageCode, setLanguageCode] = useState<string>("");

  // Load language from localStorage on mount and when it changes
  useEffect(() => {
    const loadLanguage = () => {
      const lang = localStorage.getItem("lang");
      const langCode = localStorage.getItem("langCode");
      if (lang) setLanguage(lang);
      if (langCode) setLanguageCode(langCode);
    };

    loadLanguage();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "lang" || e.key === "langCode") {
        loadLanguage();
      }
    };

    // Custom event for same-tab updates
    const handleLanguageUpdate = () => loadLanguage();
    window.addEventListener("languageUpdated", handleLanguageUpdate);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("languageUpdated", handleLanguageUpdate);
    };
  }, []);

  return (
    <>
      <div className="px-[48px] flex justify-between items-center font-[400] md:mb-7 my-7 md:mt-0 w-full">
        <Image
          src={logo}
          alt="logo"
          height={100}
          width={100}
        />
        <div className="flex items-center gap-4">
          <ToogleDarkMode
            toogleDarkMode={() => setDarkMode(!darkMode)}
          />
          <span
            className="flex items-center gap-2 ml-3 cursor-pointer z-10"
            onClick={openLanguage}
          >
            <CiGlobe color="orange" size={20} />
            <span>
              {!hasLanguage ? (
                <span className="text-[0.8rem] dark:text-white/80 text-lightBoldText-0">
                  English (EN)
                </span>
              ) : (
                <span className="text-[0.8rem] dark:text-white/80 text-lightBoldText-0">
                  {language} ({languageCode})
                </span>
              )}
            </span>
            <span className="dark:text-white/80 text-lightBoldText-0">
              <FaChevronDown size={10} />
            </span>
          </span>
        </div>
      </div>
    </>
  );
}