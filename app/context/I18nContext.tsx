"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { translateBatch } from "../utils/translator";

/**
 * Centralized i18n provider — the single source of truth for the active
 * language across the whole app.
 *
 * Why it exists: translation state previously lived in a non-context hook
 * (utils/checkLanguages) while a same-named context hook only toggled a modal.
 * That split meant there was no shared locale/cache. This context unifies it:
 *   - one locale value (persisted in localStorage; stays in sync with the
 *     existing selector modal via the `languageUpdated` event + `lang`/
 *     `langCode` keys, so nothing else has to change),
 *   - a `t()` function + `<T>` component that translate on demand,
 *   - a shared translation cache (memory + localStorage) so a given string is
 *     fetched once, not on every render.
 *
 * Machine translation still runs through /api/translate (server proxy), so any
 * language works without hand-written message catalogs.
 */

interface I18nContextType {
  /** ISO code of the active language, or "en". */
  locale: string;
  /** Human-readable language name (e.g. "Yoruba"). */
  languageName: string;
  /** True when a non-English language is active. */
  hasLanguage: boolean;
  /** Set + persist the active language (also used by the selector modal path). */
  setLanguage: (name: string, code: string) => void;
  /**
   * Translate a string. Returns the cached translation synchronously if known;
   * otherwise returns the original text and queues a background fetch that
   * re-renders consumers once ready.
   */
  t: (text: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

const CACHE_KEY = "i18n_cache_v1";
const MAX_CACHE_ENTRIES = 3000;

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<string>("en");
  const [languageName, setLanguageName] = useState<string>("");
  // Bumping this forces consumers to re-run t() after new translations land.
  const [, setVersion] = useState(0);

  const cacheRef = useRef<Map<string, string>>(new Map());
  const pendingRef = useRef<Set<string>>(new Set());
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Hydrate locale + cache from localStorage, and stay in sync with the
  // existing language selector (which writes lang/langCode + fires
  // `languageUpdated`). ──────────────────────────────────────────────────
  useEffect(() => {
    const loadLocale = () => {
      setLocale(localStorage.getItem("langCode") || "en");
      setLanguageName(localStorage.getItem("lang") || "");
    };
    loadLocale();

    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const obj = JSON.parse(raw) as Record<string, string>;
        cacheRef.current = new Map(Object.entries(obj));
      }
    } catch {
      /* ignore corrupt cache */
    }

    const onLangUpdate = () => loadLocale();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "lang" || e.key === "langCode") loadLocale();
    };
    window.addEventListener("languageUpdated", onLangUpdate);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("languageUpdated", onLangUpdate);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const persistCache = useCallback(() => {
    try {
      // Keep localStorage bounded — drop oldest entries past the cap.
      const entries = Array.from(cacheRef.current.entries());
      const trimmed = entries.slice(-MAX_CACHE_ENTRIES);
      cacheRef.current = new Map(trimmed);
      localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(trimmed)));
    } catch {
      /* storage full / unavailable — non-fatal */
    }
  }, []);

  const flush = useCallback(async () => {
    const code = locale;
    if (!code || code === "en") {
      pendingRef.current.clear();
      return;
    }
    const texts = Array.from(pendingRef.current);
    pendingRef.current.clear();
    if (texts.length === 0) return;

    const results = await translateBatch(texts, code);
    texts.forEach((text, i) => {
      cacheRef.current.set(`${code}:${text}`, results[i] ?? text);
    });
    persistCache();
    setVersion((v) => v + 1);
  }, [locale, persistCache]);

  const scheduleFlush = useCallback(() => {
    if (flushTimer.current) clearTimeout(flushTimer.current);
    // Small debounce so all t() calls in one render batch into one request.
    flushTimer.current = setTimeout(() => {
      void flush();
    }, 60);
  }, [flush]);

  const t = useCallback(
    (text: string): string => {
      if (!text || !locale || locale === "en") return text;
      const key = `${locale}:${text}`;
      const cached = cacheRef.current.get(key);
      if (cached !== undefined) return cached;
      // Not yet translated — queue it and show the original for now.
      pendingRef.current.add(text);
      scheduleFlush();
      return text;
    },
    [locale, scheduleFlush],
  );

  const setLanguage = useCallback((name: string, code: string) => {
    localStorage.setItem("lang", name);
    localStorage.setItem("langCode", code);
    window.dispatchEvent(new Event("languageUpdated"));
    setLocale(code);
    setLanguageName(name);
  }, []);

  return (
    <I18nContext.Provider
      value={{
        locale,
        languageName,
        hasLanguage: !!locale && locale !== "en",
        setLanguage,
        t,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

/** Convenience component: <T>Some text</T> or <T text="Some text" />. */
export function T({
  children,
  text,
  className,
}: {
  children?: string;
  text?: string;
  className?: string;
}) {
  const { t } = useI18n();
  const source = text ?? (typeof children === "string" ? children : "");
  return <span className={className}>{t(source)}</span>;
}
