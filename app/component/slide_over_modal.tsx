"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const EXIT_MS = 300;

interface SlideOverModalProps {
  open: boolean;
  onClose: () => void;
  /** Announced to screen readers as the dialog's name. */
  label: string;
  children: ReactNode;
  /** Panel width. Defaults to the 400px the forum panels already used. */
  widthClassName?: string;
  /** Set false for a panel that must not be dismissed by backdrop or Escape. */
  dismissable?: boolean;
}

/**
 * A slide-over panel that actually closes.
 *
 * The forum's panels were hand-rolled as an always-mounted `fixed` div toggled
 * between `translate-x-0` and `translate-x-full`. Moving something off-screen
 * is not the same as closing it, and each of the following was a real symptom:
 *
 *  - The children never unmounted, so a half-typed post or a stale postId
 *    survived a close and reappeared the next time the panel opened. The tutor
 *    reply panel had already grown a `setTimeout(..., 100)` and a comment
 *    saying it deliberately didn't reset its id — that is this bug being
 *    worked around rather than fixed.
 *  - A closed panel is still in the tab order. Keyboard users could tab into
 *    an invisible form and type into nothing.
 *  - Nothing closed on Escape or on a click outside, which is the first thing
 *    anyone tries.
 *  - The page behind kept scrolling under the panel.
 *  - A `w-full` overlay translated fully right sits just outside the viewport
 *    and can leave a horizontal scrollbar behind it.
 *
 * So: `mounted` decides whether the children exist at all, `shown` drives the
 * CSS transition. Same two-flag approach as the cookie banner, and for the
 * same reason — framer's <AnimatePresence> froze the exiting child's last
 * render there, so no state-derived className could release it.
 */
export default function SlideOverModal({
  open,
  onClose,
  label,
  children,
  widthClassName = "w-full sm:w-[400px]",
  dismissable = true,
}: SlideOverModalProps) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  // Mount, paint once in the "out" position, then transition in.
  //
  // A timer rather than requestAnimationFrame: rAF does not fire at all while
  // the tab is hidden, and browsers also throttle it aggressively. With rAF
  // the panel would mount, lock body scroll and raise the backdrop, but never
  // set `shown` — so it stayed translated off-screen and the page looked
  // frozen with no way back. Caught exactly that way: the verification tab was
  // backgrounded and the panel never appeared. A timer still fires when
  // hidden, so the panel is always in a consistent state by the time anyone
  // looks at it.
  useEffect(() => {
    if (open) {
      lastFocused.current = document.activeElement as HTMLElement | null;
      setMounted(true);
      const timer = window.setTimeout(() => setShown(true), 20);
      return () => window.clearTimeout(timer);
    }

    setShown(false);
    const timer = window.setTimeout(() => {
      setMounted(false);
      // Hand focus back to whatever opened the panel, so a keyboard user
      // isn't dropped at the top of the document.
      lastFocused.current?.focus?.();
    }, EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  // Escape to close, and keep focus inside the panel while it is open.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dismissable) {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, dismissable]);

  // Stop the page behind from scrolling, and restore whatever overflow the
  // document already had rather than assuming it was the default.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Move focus into the panel once it is in the DOM.
  useEffect(() => {
    if (!shown || !panelRef.current) return;
    const target = panelRef.current.querySelector<HTMLElement>(
      'input, textarea, button, [tabindex]:not([tabindex="-1"])',
    );
    (target ?? panelRef.current).focus?.();
  }, [shown]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[70]" role="presentation">
      {/* Backdrop. Click-to-close is what people try first. */}
      <div
        onClick={dismissable ? onClose : undefined}
        aria-hidden="true"
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          shown ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`absolute top-0 right-0 h-full ${widthClassName} max-w-full bg-white dark:bg-shadyColor-0 shadow-2xl outline-none overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          shown ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
