"use client";

import { useEffect, useState } from "react";
import { MdCookie } from "react-icons/md";

const STORAGE_KEY = "goye_cookie_consent";
const EXIT_MS = 300;

export type CookieChoice = "accepted" | "declined";

/**
 * Reads the visitor's stored cookie preference.
 *
 * Exported so feature code can gate *non-essential* cookies on it — the
 * session/auth cookies GOYE needs to keep you logged in are strictly
 * necessary and are set either way, which is what the banner copy says.
 */
export function getCookieChoice(): CookieChoice | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "accepted" || stored === "declined" ? stored : null;
}

export default function CookieConsent() {
  // Two flags rather than framer's <AnimatePresence>: `mounted` owns whether
  // the node is in the DOM at all, `shown` drives the CSS transition.
  //
  // AnimatePresence was leaving the faded-out banner mounted indefinitely,
  // and because it freezes the child's last render during exit, no
  // state-derived className (e.g. a pointer-events toggle) could ever update
  // to release it. A fixed, invisible, still-clickable strip across the
  // bottom of the viewport swallows clicks on whatever sits under it — so
  // the unmount is handled explicitly here instead.
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (getCookieChoice() !== null) return;
    setMounted(true);
    // Paint once in the "out" position, then transition in on the next frame.
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const choose = (choice: CookieChoice) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      /* private mode / storage disabled — the banner still dismisses */
    }
    setShown(false);
    window.setTimeout(() => setMounted(false), EXIT_MS);
  };

  if (!mounted) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie preferences"
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-[60] p-[16px] md:p-[24px] flex justify-center"
    >
      <div
        className={`w-full max-w-[880px] dark:bg-secondaryColors-0 bg-white border border-[#ccc]/20 dark:border-[#ccc]/10 rounded-[12px] shadow-xl shadow-black/10 p-[20px] md:p-[24px] flex flex-col md:flex-row md:items-center gap-[16px] md:gap-[24px] transition-all duration-300 ease-out motion-reduce:transition-none ${
          shown
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-6 pointer-events-none"
        }`}
      >
        <div className="flex items-start gap-[14px] flex-1">
          <span className="text-primaryColors-0 text-[26px] flex-shrink-0 mt-[2px]">
            <MdCookie />
          </span>
          <div>
            <h2 className="font-semibold text-[15px] dark:text-white text-lightBoldText-0 mb-[4px]">
              We use cookies
            </h2>
            <p className="text-[13px] leading-relaxed dark:text-textSlightDark-0 text-lightBoldText-0/60">
              Some are essential to keep you signed in and can&apos;t be turned
              off. The rest help us understand how the platform is used so we can
              improve it — you can decline those and everything will still work.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-[10px] flex-shrink-0">
          <button
            onClick={() => choose("declined")}
            className="flex-1 md:flex-none px-[20px] h-[42px] rounded-[6px] text-[14px] font-medium border border-[#ccc]/30 dark:border-[#ccc]/20 dark:text-white text-lightBoldText-0 hover:bg-lightSecondaryColor-0 dark:hover:bg-shadyColor-0 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => choose("accepted")}
            className="flex-1 md:flex-none px-[20px] h-[42px] rounded-[6px] text-[14px] font-semibold bg-primaryColors-0 text-white hover:opacity-90 transition-opacity"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
