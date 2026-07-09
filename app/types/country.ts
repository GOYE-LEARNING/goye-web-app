// Country name to alpha2 mapping
const COUNTRY_ALPHA2_MAP: Record<string, string> = {
  "United States": "us",
  "France": "fr",
  "Spain": "es",
  "Brazil": "br",
  "Germany": "de",
  "Italy": "it",
  "Netherlands": "nl",
  "China": "cn",
  "Taiwan": "tw",
  "Japan": "jp",
  "South Korea": "kr",
  "India": "in",
  "Kenya": "ke",
  "Nigeria": "ng",
  "Ethiopia": "et",
  "Saudi Arabia": "sa",
  "Russia": "ru",
  "Ukraine": "ua"
};

export const COUNTRY_LANGUAGE_DATA = [
  // ============================================
  // Tier 1 – Core Launch Languages
  // ============================================
  {
    country: "United States",
    flag: "🇺🇸",
    alpha2: "US",
    languages: [
      { language: "English", nativeLanguage: "English", code: "en" }
    ]
  },
  {
    country: "France",
    flag: "🇫🇷",
    alpha2: "FR",
    languages: [
      { language: "French", nativeLanguage: "Français", code: "fr" }
    ]
  },
  {
    country: "Spain",
    flag: "🇪🇸",
    alpha2: "ES",
    languages: [
      { language: "Spanish", nativeLanguage: "Español", code: "es" }
    ]
  },
  {
    country: "Brazil",
    flag: "🇧🇷",
    alpha2: "BR",
    languages: [
      { language: "Portuguese", nativeLanguage: "Português", code: "pt" }
    ]
  },
  {
    country: "Germany",
    flag: "🇩🇪",
    alpha2: "DE",
    languages: [
      { language: "German", nativeLanguage: "Deutsch", code: "de" }
    ]
  },
  {
    country: "Italy",
    flag: "🇮🇹",
    alpha2: "IT",
    languages: [
      { language: "Italian", nativeLanguage: "Italiano", code: "it" }
    ]
  },
  {
    country: "Netherlands",
    flag: "🇳🇱",
    alpha2: "NL",
    languages: [
      { language: "Dutch", nativeLanguage: "Nederlands", code: "nl" }
    ]
  },

  // ============================================
  // Asia
  // ============================================
  {
    country: "China",
    flag: "🇨🇳",
    alpha2: "CN",
    languages: [
      { language: "Chinese (Simplified)", nativeLanguage: "简体中文", code: "zh-CN" }
    ]
  },
  {
    country: "Taiwan",
    flag: "🇹🇼",
    alpha2: "TW",
    languages: [
      { language: "Chinese (Traditional)", nativeLanguage: "繁體中文", code: "zh-TW" }
    ]
  },
  {
    country: "Japan",
    flag: "🇯🇵",
    alpha2: "JP",
    languages: [
      { language: "Japanese", nativeLanguage: "日本語", code: "ja" }
    ]
  },
  {
    country: "South Korea",
    flag: "🇰🇷",
    alpha2: "KR",
    languages: [
      { language: "Korean", nativeLanguage: "한국어", code: "ko" }
    ]
  },
  {
    country: "India",
    flag: "🇮🇳",
    alpha2: "IN",
    languages: [
      { language: "Hindi", nativeLanguage: "हिन्दी", code: "hi" }
    ]
  },

  // ============================================
  // Africa
  // ============================================
  {
    country: "Kenya",
    flag: "🇰🇪",
    alpha2: "KE",
    languages: [
      { language: "Swahili", nativeLanguage: "Kiswahili", code: "sw" }
    ]
  },
  {
    country: "Nigeria",
    flag: "🇳🇬",
    alpha2: "NG",
    languages: [
      { language: "Yorùbá", nativeLanguage: "Yorùbá", code: "yo" },
      { language: "Igbo", nativeLanguage: "Asụsụ Igbo", code: "ig" },
      { language: "Hausa", nativeLanguage: "Hausa", code: "ha" }
    ]
  },
  {
    country: "Ethiopia",
    flag: "🇪🇹",
    alpha2: "ET",
    languages: [
      { language: "Amharic", nativeLanguage: "አማርኛ", code: "am" }
    ]
  },

  // ============================================
  // Middle East
  // ============================================

];

// Flattened array for easy lookup (each language as a separate entry)
export const FLATTENED_COUNTRY_DATA = COUNTRY_LANGUAGE_DATA.flatMap(country =>
  country.languages.map(lang => ({
    country: country.country,
    flag: country.flag,
    alpha2: country.alpha2,
    language: lang.language,
    nativeLanguage: lang.nativeLanguage,
    code: lang.code
  }))
);

// Get all language codes
export const getAllLanguageCodes = () => {
  return FLATTENED_COUNTRY_DATA.map(item => item.code);
};

// Get country by language code
export const getCountryByLanguageCode = (code: string) => {
  return FLATTENED_COUNTRY_DATA.find(item => item.code === code);
};

// Get countries by region
export const getCountriesByRegion = () => {
  return {
    core: COUNTRY_LANGUAGE_DATA.slice(0, 7),
    asia: COUNTRY_LANGUAGE_DATA.slice(7, 12),
    africa: COUNTRY_LANGUAGE_DATA.slice(12, 15),
    middleEast: COUNTRY_LANGUAGE_DATA.slice(15, 16),
    easternEurope: COUNTRY_LANGUAGE_DATA.slice(16, 18)
  };
};