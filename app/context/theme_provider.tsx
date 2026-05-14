"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type ThemeContextValue = {
  darkMode: boolean;
  setDarkMode: (next: boolean) => void;
  hydrated: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyDomTheme(dark: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", dark);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkModeState] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const boot = () => {
      // Load from localStorage only
      const saved = typeof window !== "undefined" ? localStorage.getItem("darkMode") : null;
      
      let initialDarkMode = false;
      
      if (saved === "true") {
        initialDarkMode = true;
      } else if (saved === "false") {
        initialDarkMode = false;
      } else {
        // Optional: Check system preference as fallback
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        initialDarkMode = prefersDark;
      }
      
      setDarkModeState(initialDarkMode);
      applyDomTheme(initialDarkMode);
      setHydrated(true);
    };

    boot();
  }, []);

  const setDarkMode = useCallback((next: boolean) => {
    setDarkModeState(next);
    applyDomTheme(next);
    
    // Save to localStorage only
    try {
      localStorage.setItem("darkMode", String(next));
    } catch (error) {
      console.error("Failed to save dark mode preference:", error);
    }
  }, []);

  const value = useMemo(
    () => ({ darkMode, setDarkMode, hydrated }),
    [darkMode, setDarkMode, hydrated],
  );

  // Prevent flash of wrong theme by not rendering until hydrated
  if (!hydrated) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}