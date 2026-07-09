"use client";

import { useState, useRef, useEffect } from "react";
import {
  COUNTRY_LANGUAGE_DATA,
  FLATTENED_COUNTRY_DATA,
} from "../types/country";
import { translateText } from "../utils/translator";
import { useAuthContext } from "../context/AuthContext";
import TranslatedText from "../hook/translateText";
import { useTranslation } from "../hook/useTranslation";

interface CountryListProps {
  onLanguageSelect?: (language: string, code: string) => void;
  onSubmit?: () => void;
}

export default function CountryList({
  onLanguageSelect,
  onSubmit,
}: CountryListProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLanguageData, setSelectedLanguageData] = useState<{
    language: string;
    code: string;
  } | null>(null);
  const { translatedText } = useTranslation(
    "Search by country, language, or code...",
  );

  // Store selected language per country
  const [selectedLanguages, setSelectedLanguages] = useState<
    Record<string, { language: string; code: string }>
  >({});

  // Single container ref to catch all clicks inside the list
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter countries based on search query
  const filteredCountries = COUNTRY_LANGUAGE_DATA.filter((country) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    if (country.country.toLowerCase().includes(query)) return true;

    return country.languages.some(
      (lang) =>
        lang.language.toLowerCase().includes(query) ||
        lang.code.toLowerCase().includes(query) ||
        lang.nativeLanguage.toLowerCase().includes(query),
    );
  });

  const translate = async (url: string) => {
    const yorubaResult = await translateText(url, "yo");
    console.log(yorubaResult);
  };

  const executeLiveTranslation = async () => {
    const sampleText = "Good Evening, how are you doing";
    const result = await translateText(sampleText, "yo");
    console.log(`[${"yo"}] Result:`, result);
  };
  useEffect(() => {
    executeLiveTranslation();
  }, []);

  const handleCountryClick = (countryName: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedCountry(countryName);
    const country = COUNTRY_LANGUAGE_DATA.find(
      (c) => c.country === countryName,
    );

    if (country && country.languages.length > 1) {
      setOpenDropdown(openDropdown === countryName ? null : countryName);
    } else if (country && country.languages.length === 1) {
      const lang = country.languages[0];
      setSelectedLanguages((prev) => ({
        ...prev,
        [countryName]: { language: lang.language, code: lang.code },
      }));
      setSelectedLanguageData({ language: lang.language, code: lang.code });

      if (onLanguageSelect) {
        onLanguageSelect(lang.language, lang.code);
      }
    }
  };

  const handleLanguageSelect = async (
    countryName: string,
    language: string,
    code: string,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    event.preventDefault();

    // Update selected language for this specific country
    setSelectedLanguages((prev) => ({
      ...prev,
      [countryName]: { language, code },
    }));
    setSelectedLanguageData({ language, code });

    setSelectedCountry(countryName);
    setOpenDropdown(null);

    // Call the callback with the selected language
    if (onLanguageSelect) {
      onLanguageSelect(language, code);
    }
  };

  // Close dropdown when clicking outside using a single container check
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getSelectedLanguageForCountry = (countryName: string) => {
    if (selectedLanguages[countryName]) {
      return selectedLanguages[countryName];
    }

    const country = COUNTRY_LANGUAGE_DATA.find(
      (c) => c.country === countryName,
    );
    if (country && country.languages.length === 1) {
      const lang = country.languages[0];
      return { language: lang.language, code: lang.code };
    }

    return null;
  };

  const handleSubmit = () => {
    if (selectedLanguageData && onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className="h-full">
      <div className="flex flex-col h-full">

        {/* Search Bar */}
        <div className="md:my-[1.5rem] my-[1rem]">
          <div className="relative">
            <input
              type="text"
              placeholder={translatedText}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-[400px] h-[45px] px-4 pl-11 rounded-[10px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[0.9rem] focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {searchQuery && (
            <p className="text-[0.8rem] text-gray-500 dark:text-gray-400 mt-2">
              <TranslatedText text="Found" /> {filteredCountries.length}{" "}
              <TranslatedText text="country" />
              {filteredCountries.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Countries grid */}
        <div
          ref={containerRef}
          className="md:my-[1.5rem] my-[1rem] grid grid-cols-2 md:flex md:flex-wrap gap-[1rem]"
        >
          {filteredCountries.length > 0 ? (
            filteredCountries.map((country, i) => {
              const alpha2 = country.alpha2.toLowerCase();
              const hasMultipleLanguages = country.languages.length > 1;
              const isOpen = openDropdown === country.country;
              const isSelected = selectedCountry === country.country;
              const selectedLang = getSelectedLanguageForCountry(
                country.country,
              );
              const displayCode = selectedLang?.code || "";

              return (
                <div key={i} className="relative col-span-1">
                  {/* Main country button */}
                  <div
                    className={`md:h-[50px] h-[100px] px-[0.9rem] flex items-center justify-center md:flex-row flex-col md:justify-start gap-3 transition-all bg-shadyColor-0 rounded-[10px] cursor-pointer hover:bg-shadyColor-1 ${
                      isOpen ? "bg-shadyColor-1" : ""
                    } ${isSelected ? "ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-900/20" : ""}`}
                    onClick={(e) => handleCountryClick(country.country, e)}
                  >
                    <img
                      src={`https://flagcdn.com/16x12/${alpha2}.png`}
                      srcSet={`https://flagcdn.com/32x24/${alpha2}.png 2x,
    https://flagcdn.com/48x36/${alpha2}.png 3x`}
                      width="30"
                      height="15"
                      className="md:w-[30px] md:h-[15px] w-[35px] h-[20px] object-cover rounded-[2px] flex-shrink-0"
                      alt={country.country}
                    />
                    <span className="text-[0.8rem] md:text-[0.9rem] font-medium flex items-center gap-1 md:gap-2 whitespace-nowrap">
                      <span className="hidden sm:inline">
                        <TranslatedText text={country.country} />
                      </span>
                      <span className="sm:hidden text-[0.7rem]">
                        {country.country.length > 10
                          ? country.country.substring(0, 8) + "…"
                          : country.country}
                      </span>
                      {displayCode && (
                        <span
                          className={`text-[0.7rem] md:text-[0.8rem] uppercase ${
                            hasMultipleLanguages
                              ? "text-orange-500 dark:text-orange-400 font-semibold"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          ({displayCode})
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Dropdown for multiple languages */}
                  {hasMultipleLanguages && isOpen && (
                    <div className="absolute top-[65px] md:top-[55px] left-0 min-w-[180px] md:min-w-[220px] w-[90vw] md:w-auto max-w-[250px] bg-white dark:bg-gray-800 rounded-[10px] shadow-lg border border-gray-200 dark:border-gray-700 z-[9999] py-1">
                      {country.languages.map((lang, j) => {
                        const isSelectedLang =
                          selectedLanguages[country.country]?.code ===
                          lang.code;
                        return (
                          <div
                            key={j}
                            className={`px-3 md:px-4 py-2 md:py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer border-b last:border-b-0 border-gray-100 dark:border-gray-700 ${
                              isSelectedLang
                                ? "bg-orange-50 dark:bg-orange-900/20"
                                : ""
                            }`}
                            onClick={(e) =>
                              handleLanguageSelect(
                                country.country,
                                lang.language,
                                lang.code,
                                e,
                              )
                            }
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[0.8rem] md:text-[0.85rem] font-medium">
                                {lang.language}
                              </span>
                              <span className="text-[0.6rem] md:text-[0.65rem] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                                {lang.code}
                              </span>
                            </div>
                            <div className="text-[0.65rem] md:text-[0.7rem] text-gray-500 dark:text-gray-400 mt-0.5">
                              {lang.nativeLanguage}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-2 flex flex-col justify-center items-center gap-3 w-full py-8 text-gray-500 dark:text-gray-400">
              <p className="text-[1rem]">
                <TranslatedText text="No countries found matching " />
                <strong>{searchQuery}</strong>"
              </p>
              <p className="text-[0.85rem] mt-1">
                <TranslatedText
                  text="                Try searching by country name, language, or code
"
                />
              </p>
            </div>
          )}
        </div>
      </div>

      {filteredCountries.length > 0 && (
        <div className="flex justify-end items-end w-full pb-4">
          <button
            onClick={handleSubmit}
            className="h-[45px] w-[180px] md:w-[240px] bg-primaryColors-0 transition-all duration-200 hover:bg-white hover:text-primaryColors-0 flex justify-center items-center rounded-[15px] font-bold text-sm md:text-base"
          >
            Let interact!!
          </button>
        </div>
      )}
    </div>
  );
}
