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
 * The selected language is mirrored to localStorage (`i18n_locale_v1`) purely
 * so a full page reload — not just a client-side route change — doesn't lose
 * it; this context's React state is still what every page actually reads
 * from:
 *   - Before an account exists (first visit to /auth), a picked language is
 *     applied immediately here, just long enough to translate the auth/signup
 *     screens and to ride along in the signup payload (SignupContext reads it
 *     from here via `setLanguage`).
 *   - Once a session exists, this context is the client's cache of the value
 *     the BACKEND holds (User.language/languageCode) — `refreshFromBackend()`
 *     fetches /api/user/profile and adopts whatever it returns, overwriting
 *     any locally-stored value. AuthContext calls this right after it
 *     resolves a session (login, refresh, initial check), and the signup
 *     submit flow calls it right after account creation succeeds, per "fetch
 *     the backend and retrieve the language."
 *   - Changing language while signed in (dashboard settings) persists to the
 *     backend immediately (PUT /api/user/update-user) as well, so it follows
 *     the account to other devices.
 *
 * A separate, purely-performance cache of already-translated strings (memory
 * + localStorage under `i18n_cache_v1`) still exists so a given string is
 * fetched once, not on every render — that cache holds translated TEXT, not
 * "the language," so it's unaffected by this.
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
  /**
   * False until the initial mount-time `refreshFromBackend()` call settles
   * (found a language, found none, or failed). There's no localStorage
   * fallback to show instantly, so a caller deciding whether to prompt for a
   * language (e.g. the auth page) needs to wait for this before trusting
   * `hasLanguage === false` as "this account truly has none" rather than
   * "we haven't checked yet."
   */
  isReady: boolean;
  /**
   * Set the active language in memory. Used for the pre-auth selection (not
   * persisted anywhere yet) and, when a session already exists, together with
   * a caller-side backend PUT to persist it server-side.
   */
  setLanguage: (name: string, code: string) => void;
  /**
   * Fetch /api/user/profile and adopt its language/languageCode as the
   * active locale. This is the one place that treats the backend as the
   * authoritative source of "what language is this account in." No-ops
   * (leaves current state alone) when logged out or the profile has no
   * language set yet.
   */
  refreshFromBackend: () => Promise<void>;
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

// Bumped v1 -> v2: a bad/garbled machine translation for some short UI
// string got cached under v1 and then never expired, so it kept showing up
// verbatim on every load once cached ("Select Language" rendering as
// unrelated text, for example). A version bump abandons whatever is stored
// under the old key instead of trying to detect/repair specific bad entries.
const CACHE_KEY = "i18n_cache_v2";
const MAX_CACHE_ENTRIES = 3000;
// A picked language used to live only in memory, which meant it reset on
// every full page reload (a hard nav, not a client-side route change) and
// only ever "stuck" for a logged-in account once the backend round-trip
// resolved. Persisting the choice itself — not just the translated-text
// cache below — is what makes it actually affect every other page, matching
// what the language picker's UI already implies. The backend remains the
// source of truth once a session exists: refreshFromBackend() below still
// overwrites this on mount for a logged-in account.
const LOCALE_KEY = "i18n_locale_v1";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<string>("en");
  const [languageName, setLanguageName] = useState<string>("");
  const [isReady, setIsReady] = useState(false);
  // Bumping this forces consumers to re-run t() after new translations land.
  const [, setVersion] = useState(0);

  const cacheRef = useRef<Map<string, string>>(new Map());
  const pendingRef = useRef<Set<string>>(new Set());
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate only the translated-string cache from localStorage — this is a
  // performance cache of already-translated text, not the language choice
  // itself, so it's fine for it to persist across reloads independently.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const obj = JSON.parse(raw) as Record<string, string>;
        cacheRef.current = new Map(Object.entries(obj));
      }
    } catch {
      /* ignore corrupt cache */
    }

    try {
      const raw = localStorage.getItem(LOCALE_KEY);
      if (raw) {
        const { code, name } = JSON.parse(raw) as { code: string; name: string };
        if (code && code !== "en") {
          setLocale(code);
          setLanguageName(name || code);
        }
      }
    } catch {
      /* ignore corrupt value */
    }
  }, []);

  const refreshFromBackend = useCallback(async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    try {
      const res = await fetch(`${API_URL}/api/user/profile`, {
        credentials: "include",
      });
      if (!res.ok) return; // logged out, or no session yet — leave state as-is
      const data = await res.json();
      const user = data?.user;
      const code = user?.languageCode;
      const name = user?.language;
      if (code && code !== "unknown") {
        setLocale(code);
        setLanguageName(name || code);
        try {
          localStorage.setItem(LOCALE_KEY, JSON.stringify({ code, name: name || code }));
        } catch {
          /* storage full / unavailable — non-fatal, context state is still correct */
        }
      }
    } catch {
      /* offline / unreachable — leave state as-is */
    }
  }, []);

  // Cover a page refresh while already signed in: there's no localStorage
  // fallback anymore, so the only way to know the account's language is to
  // ask the backend once on mount. `isReady` flips true once this settles
  // (found a language, found none, or the request failed) so callers like
  // the auth page can tell "checked, has none" apart from "haven't checked
  // yet" before deciding whether to prompt for a language.
  useEffect(() => {
    void refreshFromBackend().finally(() => setIsReady(true));
  }, [refreshFromBackend]);

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
    setLocale(code);
    setLanguageName(name);
    setIsReady(true);
    try {
      if (code && code !== "en") {
        localStorage.setItem(LOCALE_KEY, JSON.stringify({ code, name }));
      } else {
        localStorage.removeItem(LOCALE_KEY);
      }
    } catch {
      /* storage full / unavailable — non-fatal, context state is still correct */
    }
  }, []);

  return (
    <I18nContext.Provider
      value={{
        locale,
        languageName,
        hasLanguage: !!locale && locale !== "en",
        isReady,
        setLanguage,
        refreshFromBackend,
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
