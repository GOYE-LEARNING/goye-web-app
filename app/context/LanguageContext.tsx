// context/LanguageContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import SelectLanguageContext from "@/app/component/select_languages_context";
import Portal from "@/app/component/Portal";

interface LanguageContextType {
  openLanguageSelector: () => void;
  closeLanguageSelector: () => void;
  isLanguageSelectorOpen: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openLanguageSelector = () => setIsOpen(true);
  const closeLanguageSelector = () => setIsOpen(false);

  return (
    <LanguageContext.Provider
      value={{
        openLanguageSelector,
        closeLanguageSelector,
        isLanguageSelectorOpen: isOpen,
      }}
    >
      {children}
      {isOpen && (
        <SelectLanguageContext closeLanguage={closeLanguageSelector} />
      )}
    </LanguageContext.Provider>
  );
}