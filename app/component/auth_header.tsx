"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTheme } from "../context/theme_provider";
import logoDarkMode from "@/public/images/goye_white.png";
import logoLightMode from "@/public/images/goye-removebg-preview.png";
import ToogleDarkMode from "./toogleDarkMode";
import { CiGlobe } from "react-icons/ci";
import { FaChevronDown } from "react-icons/fa";
import TranslatedText from "../hook/translateText";

interface Props {
  changeTextToLogin: () => void;
  changeTextToSignin: () => void;
  openLanguage: () => void;
  hasLanguage: boolean;
  isSignupOpen: boolean;
}

export default function AuthHeader({
  changeTextToLogin,
  changeTextToSignin,
  openLanguage,
  hasLanguage,
  isSignupOpen,
}: Props) {
  const [changeHeaderToLogin, setChangeHeaderToLogin] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>("");
  const [languageCode, setLanguageCode] = useState<string>("");
  const [changeHeaderToSignin, setChangeHeaderToSignin] = useState<boolean>(true);
  const { darkMode, setDarkMode } = useTheme();

  // Load language from localStorage on mount and when it changes
  useEffect(() => {
    const loadLanguage = () => {
      const lang = localStorage.getItem("lang");
      const langCode = localStorage.getItem("langCode");
      if (lang) setLanguage(lang);
      if (langCode) setLanguageCode(langCode);
    };

    loadLanguage();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "lang" || e.key === "langCode") {
        loadLanguage();
      }
    };

    const handleLanguageUpdate = () => loadLanguage();
    window.addEventListener("languageUpdated", handleLanguageUpdate);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("languageUpdated", handleLanguageUpdate);
    };
  }, []);

  // Language selector component - extracted to avoid duplication
  const LanguageSelector = () => (
    <span
      className="flex items-center gap-2 ml-3 cursor-pointer"
      onClick={openLanguage}
    >
      <CiGlobe color="orange" />
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
        <FaChevronDown size={7} />
      </span>
    </span>
  );

  return (
    <>
      <div className="pt-[48px] md:flex justify-between items-center font-[400] hidden relative z-[10] w-full">
        <Image
          src={darkMode ? logoDarkMode : logoLightMode}
          alt="logo"
          height={100}
          width={100}
        />
        
        {changeHeaderToSignin && (
          <div className="flex items-center gap-3">
            <ToogleDarkMode
              toogleDarkMode={() => {
                setDarkMode(!darkMode);
              }}
            />
            
            {isSignupOpen ? (
              <span className="text-nearTextColors-0">
                <TranslatedText text="Already have an account ?" />{" "}
                <span
                  className="text-primaryColors-0 cursor-pointer font-semibold"
                  onClick={() => {
                    changeTextToSignin();
                    setChangeHeaderToLogin(false);
                    setChangeHeaderToSignin(true);
                  }}
                >
                  <TranslatedText text=" Log in" />
                </span>
                <LanguageSelector />
              </span>
            ) : (
              <span className="text-nearTextColors-0">
                <TranslatedText text="New user ?" />{" "}
                <span
                  className="text-primaryColors-0 cursor-pointer font-semibold"
                  onClick={() => {
                    changeTextToLogin();
                    setChangeHeaderToLogin(true);
                    setChangeHeaderToSignin(false);
                  }}
                >
                  <TranslatedText text=" Create Account" />
                </span>
                <LanguageSelector />
              </span>
            )}
          </div>
        )}
        
        {changeHeaderToLogin && (
          <span className="text-nearTextColors-0 flex items-center">
            Have an account ?{" "}
            <span
              className="text-primaryColors-0 cursor-pointer font-semibold"
              onClick={() => {
                changeTextToSignin();
                setChangeHeaderToSignin(true);
                setChangeHeaderToLogin(false);
              }}
            >
              {" "}Login
            </span>
            <LanguageSelector />
          </span>
        )}
      </div>
    </>
  );
}