// component/SelectLanguageContext.tsx
"use client";

import { useState, useEffect } from "react";
import CountryList from "./CountryList";
import Portal from "./Portal";
import TranslatedText from "../hook/translateText";

interface Props {
  closeLanguage: () => void;
}

export default function SelectLanguageContext({ closeLanguage }: Props) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLanguageSelect = (language: string, code: string) => {
    // Save to localStorage
    localStorage.setItem("lang", language);
    localStorage.setItem("langCode", code);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event("languageUpdated"));
    
    setSelectedLanguage(language);
    setSelectedCode(code);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedLanguage || !selectedCode) {
      setError("Please select a language first");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Your submission logic here
      console.log("Language selected:", selectedLanguage, selectedCode);
      
      // Close language selector after saving
      setTimeout(() => {
        closeLanguage();
      }, 500);
    } catch (error) {
      console.error("Submission error:", error);
      setError("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeLanguage();
    }
  };

  return (
    <Portal>
      <div
        className="inset-0 fixed w-full min-h-screen top-0 left-0 bg-black/30 backdrop-blur-md z-[9999] flex justify-center items-center flex-col"
        onClick={handleBackdropClick}
      >
        <div className="md:max-w-[750px] w-full md:h-[95%] h-full dark:bg-secondaryColors-0 bg-white border border-[#ccc]/30 md:rounded-[25px] overflow-y-auto scrollbar2 px-[1.2rem] py-[1rem] md:py-[2rem] md:px-[2.3rem] relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[1.8rem] dark:text-white/80 text-[#333]">
              <TranslatedText text="Select Language"/>
            </h2>
            <button
              onClick={closeLanguage}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          
          <CountryList
            onLanguageSelect={handleLanguageSelect}
            onSubmit={handleSubmit}
          />

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-[10px] border border-red-200 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}