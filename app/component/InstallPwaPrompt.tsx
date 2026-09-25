"use client";

import { useEffect, useState } from "react";
import { MdInstallMobile, MdClose } from "react-icons/md";
import { useI18n } from "@/app/context/I18nContext";

const DISMISSED_KEY = "pwa_install_prompt_dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

/**
 * "Install App" affordance.
 *
 * Chrome/Edge/Android fire `beforeinstallprompt` — but only once the browser
 * decides the page is "install-worthy" (valid manifest + active service
 * worker + some engagement heuristics it doesn't document), which can take a
 * while or never fire at all on a given visit. Previously this component
 * rendered nothing until that event arrived, so on a page where it never
 * fires, there was no install button at all. Now the button is always shown
 * (unless already installed/dismissed): if the real prompt is available it
 * triggers the native one-tap install; otherwise it shows the manual
 * "how to install" instructions for the current platform instead of
 * disappearing.
 */
export default function InstallPwaPrompt({
  className = "",
}: {
  className?: string;
}) {
  const { t } = useI18n();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [showManualHint, setShowManualHint] = useState(false);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    setStandalone(isStandalone());
    if (isStandalone()) return;
    try {
      setDismissed(localStorage.getItem(DISMISSED_KEY) === "true");
    } catch {
      setDismissed(false);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, "true");
    } catch {
      // best-effort only — a per-device UI preference, not auth state
    }
  };

  const install = async () => {
    if (!deferredPrompt) {
      // The browser hasn't handed us a real install prompt yet (or never
      // will, e.g. iOS Safari) — fall back to telling the person how to do
      // it manually instead of the button doing nothing.
      setShowManualHint((v) => !v);
      return;
    }
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (standalone || dismissed) return null;

  const manualInstructions = isIos()
    ? t("Tap Share, then Add to Home Screen")
    : t("Open your browser menu and choose Install App / Add to Home Screen");

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-2 rounded-full border border-primaryColors-0/30 bg-primaryColors-0/10 px-3 py-1.5 text-[13px] text-primaryColors-0">
        <MdInstallMobile size={18} />
        <button onClick={install} className="font-medium">
          {t("Install App")}
        </button>
        <button onClick={dismiss} aria-label={t("Dismiss")}>
          <MdClose size={16} />
        </button>
      </div>
      {showManualHint && !deferredPrompt && (
        <span className="px-3 text-[12px] text-gray-500 dark:text-gray-400">
          {manualInstructions}
        </span>
      )}
    </div>
  );
}
