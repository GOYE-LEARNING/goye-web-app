"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HiOutlineInformationCircle } from "react-icons/hi";

interface InfoTipProps {
  /** What to explain, in plain words. */
  text: string;
  /** Optional bold heading inside the bubble. */
  title?: string;
  /** Accessible name for the button. Defaults to "More information". */
  label?: string;
  className?: string;
}

/**
 * A small (i) button that explains something in plain words.
 *
 * Click or tap opens the bubble; hovering a mouse over it also does. It closes on Escape, on a
 * click elsewhere, or when the page scrolls. The bubble is drawn at the top level of the page, so
 * it is never clipped by a table or a scrolling panel.
 */
export default function InfoTip({ text, title, label = "More information", className = "" }: InfoTipProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const place = useCallback(() => {
    const b = btnRef.current?.getBoundingClientRect();
    if (!b) return;
    const width = Math.min(280, window.innerWidth - 24);
    let left = b.left + b.width / 2 - width / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - width - 12));
    setPos({ top: b.bottom + 8, left });
  }, []);

  useEffect(() => {
    if (!open) return;
    place();
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (!btnRef.current?.contains(t) && !bubbleRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open, place]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        onMouseEnter={() => setOpen(true)}
        className={`inline-flex items-center justify-center align-middle rounded-full text-gray-400 hover:text-primaryColors-0 focus:text-primaryColors-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primaryColors-0 transition-colors ${className}`}
      >
        <HiOutlineInformationCircle className="w-4 h-4" />
      </button>
      {open &&
        pos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={bubbleRef}
            id={id}
            role="tooltip"
            style={{ top: pos.top, left: pos.left, width: Math.min(280, window.innerWidth - 24) }}
            onMouseLeave={() => setOpen(false)}
            className="fixed z-[9999] rounded-lg bg-gray-900 text-white text-xs leading-relaxed p-3 shadow-xl normal-case font-normal tracking-normal text-left"
          >
            {title && <p className="font-semibold mb-1 text-[13px]">{title}</p>}
            {text}
          </div>,
          document.body,
        )}
    </>
  );
}
