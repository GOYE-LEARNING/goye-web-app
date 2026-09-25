"use client";

import Image from "next/image";
import { useTheme } from "../context/theme_provider";
import logo from '@/public/images/goye_final_logo.png'
import ToogleDarkMode from "./toogleDarkMode";
import { CiGlobe } from "react-icons/ci";
import { FaChevronDown } from "react-icons/fa";
import { useI18n } from "@/app/context/I18nContext";

interface Props {
  openLanguage: () => void;
  hasLanguage: boolean;
}

export default function AuthWelcomeHeader({
  openLanguage,
  hasLanguage,
}: Props) {
  const { darkMode, setDarkMode } = useTheme();
  const { t, languageName: language, locale: languageCode } = useI18n();

  return (
    <>
      <div className="px-[48px] flex justify-between items-center font-[400] md:mb-7 my-7 md:mt-0 w-full">
        <Image
          src={logo}
          alt={t("logo")}
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
                  {t("English (EN)")}
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