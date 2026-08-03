"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiChevronLeft } from "react-icons/fi";
import Portal from "@/app/component/Portal";
import AIContainerComponent from "./ai_container_component";
import ShekiAIOrb from "./ShekiAIOrb";
import type { AssistantMode } from "@/app/hook/useShekiAI";
import useWindowWidth from "@/app/hook/UseWindowWidth";

const DESKTOP_BREAKPOINT = 1024; // matches this app's lg: convention
const PANEL_WIDTH = 380;
const RAIL_WIDTH = 56;

export default function ShekiAIWidget({
  mode = "tutor",
  setPanelWidth,
  onInteract,
  sidenavExpanded,
}: {
  mode?: AssistantMode;
  setPanelWidth?: (px: number) => void;
  // Fired on any interaction with an open panel, so the dashboard layout
  // can collapse its sidenav in response — the two shouldn't both try to
  // occupy space at once.
  onInteract?: () => void;
  // True when the desktop sidenav is at full width. Only meaningful there —
  // the sidenav's own expand/collapse toggle is hidden below the md:
  // breakpoint, so this must never hide the mobile trigger.
  sidenavExpanded?: boolean;
}) {
  const width = useWindowWidth();
  const isDesktop = (width ?? 0) >= DESKTOP_BREAKPOINT;

  // Desktop: full third column vs. a narrow rail.
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Mobile: full-screen modal, closed by default so it never ambushes
  // someone on page load the way an auto-opening overlay would.
  const [isOpen, setIsOpen] = useState(false);
  // Full-screen focus mode, for concentrating on a longer conversation (and
  // used automatically for hands-free voice, which is an eyes-up interaction).
  const [isExpanded, setIsExpanded] = useState(false);

  // Report the horizontal space we take so the dashboard layout can inset
  // its content by the same amount — that's what makes this a real third
  // column rather than a panel floating over the page. Mirrors how
  // TutorSidenav reports its own state up via setIsCollapsedState.
  const hiddenForSidenav = isDesktop && !!sidenavExpanded;

  useEffect(() => {
    setPanelWidth?.(!isDesktop || isExpanded || hiddenForSidenav ? 0 : isCollapsed ? RAIL_WIDTH : PANEL_WIDTH);
  }, [isDesktop, isCollapsed, isExpanded, hiddenForSidenav, setPanelWidth]);

  if (hiddenForSidenav) return null;

  if (isDesktop) {

    // Width is a plain style + CSS transition rather than a framer-motion
    // animation: it's a layout-critical dimension, so the resting value must
    // be correct even if an animation never runs or gets interrupted.
    return (
      <aside
        style={{ width: isExpanded ? "100vw" : isCollapsed ? RAIL_WIDTH : PANEL_WIDTH }}
        className={`hidden lg:flex flex-col fixed right-0 top-0 h-screen overflow-hidden border-l border-black/5 dark:border-white/5 bg-lightSecondaryColor-0 dark:bg-shadyColor-0 transition-[width] duration-300 ease-in-out ${
          isExpanded ? "z-50" : "z-30"
        }`}
        onClick={() => !isCollapsed && onInteract?.()}
      >
        {isCollapsed ? (
          <button
            onClick={() => {
              setIsCollapsed(false);
              onInteract?.();
            }}
            aria-label="Expand ShekiAI assistant"
            className="h-full w-full flex flex-col items-center gap-3 pt-5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <ShekiAIOrb status="idle" size={30} />
            <FiChevronLeft className="text-nearTextColors-0" size={16} />
            <span className="text-[11px] tracking-widest text-nearTextColors-0 [writing-mode:vertical-rl]">
              ShekiAI
            </span>
          </button>
        ) : (
          <AIContainerComponent
            mode={mode}
            closeVariant="collapse"
            onClose={() => {
              setIsExpanded(false);
              setIsCollapsed(true);
            }}
            isExpanded={isExpanded}
            onToggleExpand={setIsExpanded}
          />
        )}
      </aside>
    );
  }

  return (
    <>
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => {
            setIsOpen(true);
            onInteract?.();
          }}
          aria-label="Open ShekiAI assistant"
          className="fixed bottom-24 right-5 z-40 h-14 w-14 rounded-full shadow-lg flex items-center justify-center"
          style={{ background: "radial-gradient(circle at 35% 30%, #FBB041, #FFA500 70%)" }}
        >
          <span className="h-2 w-6 bg-white/90 rounded-full" />
        </motion.button>
      )}

      {isOpen && (
        <Portal containerId="sheki-ai-root">
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setIsOpen(false)} />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-50"
          >
            <AIContainerComponent mode={mode} onClose={() => setIsOpen(false)} onToggleExpand={() => {}} />
          </motion.div>
        </Portal>
      )}
    </>
  );
}
