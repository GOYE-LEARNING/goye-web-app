"use client";

import { useState, useEffect } from "react";
import SubHeader from "./dashboard_subheader";
import { Country, State } from "country-state-city";
import { FaCheck, FaGlobe } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../utils/checkLanguages";
import { CiSearch } from "react-icons/ci";

interface Props {
  backFunction: () => void;
}

interface LanguageOption {
  name: string;
  code: string;
  nativeName: string;
  flag: string;
}

const languages: LanguageOption[] = [
  { name: "English", code: "en", nativeName: "English", flag: "🇬🇧" },
  { name: "Spanish", code: "es", nativeName: "Español", flag: "🇪🇸" },
  { name: "French", code: "fr", nativeName: "Français", flag: "🇫🇷" },
  { name: "Portuguese", code: "pt", nativeName: "Português", flag: "🇵🇹" },
  { name: "German", code: "de", nativeName: "Deutsch", flag: "🇩🇪" },
  { name: "Italian", code: "it", nativeName: "Italiano", flag: "🇮🇹" },
  { name: "Dutch", code: "nl", nativeName: "Nederlands", flag: "🇳🇱" },
  {
    name: "Chinese (Simplified)",
    code: "zh_CN",
    nativeName: "简体中文",
    flag: "🇨🇳",
  },
  {
    name: "Chinese (Traditional)",
    code: "zh_TW",
    nativeName: "繁體中文",
    flag: "🇹🇼",
  },
  { name: "Japanese", code: "ja", nativeName: "日本語", flag: "🇯🇵" },
  { name: "Korean", code: "ko", nativeName: "한국어", flag: "🇰🇷" },
  { name: "Hindi", code: "hi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { name: "Swahili", code: "sw", nativeName: "Kiswahili", flag: "🇰🇪" },
  { name: "Yoruba", code: "yo", nativeName: "Yorùbá", flag: "🇳🇬" },
  { name: "Igbo", code: "ig", nativeName: "Igbo", flag: "🇳🇬" },
  { name: "Hausa", code: "ha", nativeName: "Hausa", flag: "🇳🇬" },
  { name: "Amharic", code: "am", nativeName: "አማርኛ", flag: "🇪🇹" },
];

export default function DashboardChangeLanguage({ backFunction }: Props) {
  const { language, languageCode, saveLanguage, hasLanguage } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageOption | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Set initial selected language
  useEffect(() => {
    if (hasLanguage && languageCode) {
      const found = languages.find((l) => l.code === languageCode);
      if (found) {
        setSelectedLanguage(found);
      }
    }
  }, [hasLanguage, languageCode]);

  const filteredLanguages = languages.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleLanguageSelect = (lang: LanguageOption) => {
    setSelectedLanguage(lang);
    setSearchTerm("");
  };

  const handleSave = async () => {
    if (!selectedLanguage) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Save language
      saveLanguage(selectedLanguage.name, selectedLanguage.code);

      // Show success   
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to save language:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <SubHeader header="Language" backFunction={backFunction} />

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Current Language Display */}
          <div className="glass_effect rounded-xl p-6 mb-6">
            <h3 className="text-sm font-medium text-[#B8BCC8] mb-2">
              Current Language
            </h3>
            <div className="flex items-center gap-3">
              <div className="text-3xl">{selectedLanguage?.flag || "🌐"}</div>
              <div>
                <p className="text-lg font-semibold text-white">
                  {selectedLanguage?.name || "Not selected"}
                </p>
                <p className="text-sm text-[#9CA3B0]">
                  {selectedLanguage?.nativeName || "Select a language below"}
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <CiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3B0]" />
            <input
              type="text"
              placeholder="Search languages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#252830] border border-[#3a3d4a] rounded-xl px-10 py-3 text-white placeholder-[#9CA3B0] focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
          </div>

          {/* Language List */}
          <div className="glass_effect rounded-xl overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto chat_scroll3">
              {filteredLanguages.length === 0 ? (
                <div className="text-center py-8 text-[#9CA3B0]">
                  No languages found
                </div>
              ) : (
                filteredLanguages.map((lang) => (
                  <motion.div
                    key={lang.code}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => handleLanguageSelect(lang)}
                    className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-200 border-b border-[#252830] last:border-b-0 hover:bg-white/5 ${
                      selectedLanguage?.code === lang.code
                        ? "bg-orange-500/10"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <div>
                        <p className="text-white font-medium">{lang.name}</p>
                        <p className="text-sm text-[#9CA3B0]">
                          {lang.nativeName}
                        </p>
                      </div>
                    </div>
                    {selectedLanguage?.code === lang.code && (
                      <FaCheck className="text-orange-500" />
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={handleSave}
              disabled={
                !selectedLanguage ||
                isSaving ||
                selectedLanguage?.code === languageCode
              }
              className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                !selectedLanguage || selectedLanguage?.code === languageCode
                  ? "bg-[#252830] text-[#9CA3B0] cursor-not-allowed"
                  : "bg-orange-500 text-[#121318] hover:bg-orange-400 hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-[#121318] border-t-transparent"></span>
                  Saving...
                </span>
              ) : selectedLanguage?.code === languageCode ? (
                "Current Language Selected"
              ) : (
                `Save ${selectedLanguage?.name || "Language"}`
              )}
            </button>

            {/* Success Message */}
            <AnimatePresence>
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center text-green-400 text-sm"
                >
                  ✅ Language saved successfully!
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info Text */}
            <p className="text-xs text-[#9CA3B0] text-center">
              Changing the language will update the interface language across
              the platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
