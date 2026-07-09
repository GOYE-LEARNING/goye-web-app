// hooks/useLanguage.ts
import { useState, useEffect, useCallback } from 'react';
import { translateText } from '../utils/translator';

interface LanguageState {
  language: string;
  languageCode: string;
  hasLanguage: boolean;
}

export function useLanguage() {
  const [languageState, setLanguageState] = useState<LanguageState>({
    language: '',
    languageCode: '',
    hasLanguage: false,
  });

  // Load language from localStorage
  const loadLanguage = useCallback(() => {
    const lang = localStorage.getItem('lang') || '';
    const langCode = localStorage.getItem('langCode') || '';
    
    setLanguageState({
      language: lang,
      languageCode: langCode,
      hasLanguage: !!(lang && langCode),
    });
  }, []);

  // Save language to localStorage
  const saveLanguage = useCallback((language: string, languageCode: string) => {
    localStorage.setItem('lang', language);
    localStorage.setItem('langCode', languageCode);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('languageUpdated'));
    
    setLanguageState({
      language,
      languageCode,
      hasLanguage: !!(language && languageCode),
    });
  }, []);

  // Clear language from localStorage
  const clearLanguage = useCallback(() => {
    localStorage.removeItem('lang');
    localStorage.removeItem('langCode');
    
    window.dispatchEvent(new Event('languageUpdated'));
    
    setLanguageState({
      language: '',
      languageCode: '',
      hasLanguage: false,
    });
  }, []);

  // Translate text using the selected language
  const translate = useCallback(async (text: string): Promise<string> => {
    if (!languageState.hasLanguage || languageState.languageCode === 'en') {
      return text;
    }
    
    try {
      return await translateText(text, languageState.languageCode);
    } catch (error) {
      console.error('Translation failed:', error);
      return text;
    }
  }, [languageState.hasLanguage, languageState.languageCode]);

  // Subscribe to language changes
  useEffect(() => {
    // Load initial language
    loadLanguage();

    // Listen for storage changes (cross-tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lang' || e.key === 'langCode') {
        loadLanguage();
      }
    };

    // Listen for custom event (same-tab)
    const handleLanguageUpdate = () => {
      loadLanguage();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('languageUpdated', handleLanguageUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('languageUpdated', handleLanguageUpdate);
    };
  }, [loadLanguage]);

  return {
    ...languageState,
    saveLanguage,
    clearLanguage,
    reloadLanguage: loadLanguage,
    translate, // Add translate function
  };
}