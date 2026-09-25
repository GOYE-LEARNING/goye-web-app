// hooks/useLanguage.ts
//
// Legacy hook kept for its many existing call sites. It no longer holds its
// own localStorage-backed state — it's a thin adapter over I18nContext, the
// single source of truth for the active language, so every consumer of this
// hook gets the same in-memory/backend-driven behavior for free.
import { useCallback } from 'react';
import { useI18n } from '../context/I18nContext';
import { translateText } from './translator';

export function useLanguage() {
  const { locale, languageName, hasLanguage, setLanguage } = useI18n();

  // Update the in-memory language immediately, and — when a session exists —
  // persist it to the backend so it follows the account to other devices.
  // Logged out or offline, the PUT is silently ignored and the choice still
  // applies for the rest of this session via context state.
  const saveLanguage = useCallback((language: string, languageCode: string) => {
    setLanguage(language, languageCode);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${API_URL}/api/user/update-user`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ language, languageCode }),
    }).catch(() => {
      /* not logged in, or offline — context state still holds it for this session */
    });
  }, [setLanguage]);

  const clearLanguage = useCallback(() => {
    setLanguage('', 'en');
  }, [setLanguage]);

  // Translate text using the selected language. Callers of this legacy hook
  // (TranslatedText, useTranslation) await this directly and set their own
  // local state from the result, so it has to resolve to the real
  // translation rather than the fire-and-forget cache lookup `t()` does.
  const translate = useCallback(async (text: string): Promise<string> => {
    if (!hasLanguage || locale === 'en') return text;
    try {
      return await translateText(text, locale);
    } catch {
      return text;
    }
  }, [hasLanguage, locale]);

  return {
    language: languageName,
    languageCode: locale,
    hasLanguage,
    saveLanguage,
    clearLanguage,
    reloadLanguage: () => {},
    translate,
  };
}
