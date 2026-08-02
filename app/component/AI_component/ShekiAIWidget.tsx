"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Portal from "@/app/component/Portal";
import AIContainerComponent from "./ai_container_component";
import useWindowWidth from "@/app/hook/UseWindowWidth";

const DESKTOP_BREAKPOINT = 1024; // matches this app's lg: convention

export default function ShekiAIWidget() {
  const width = useWindowWidth();
  const isDesktop = (width ?? 0) >= DESKTOP_BREAKPOINT;
  const [isOpen, setIsOpen] = useState(false);

  if (isDesktop) {
    // Always-docked right-side panel, fixed-positioned (matching this
    // layout's existing absolute/fixed positioning convention rather than
    // reflowing the sidenav+content width calculation it already does).
    return (
      <div className="hidden lg:flex flex-col w-[380px] shrink-0 fixed right-0 top-0 h-screen z-30 border-l border-black/5 dark:border-white/5 shadow-xl">
        <AIContainerComponent />
      </div>
    );
  }

  return (
    <>
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsOpen(true)}
          aria-label="Open ShekiAI assistant"
          className="fixed bottom-24 right-5 z-40 h-14 w-14 rounded-full shadow-lg flex items-center justify-center"
          style={{ background: "radial-gradient(circle at 35% 30%, #FBB041, #FFA500 70%)" }}
        >
          <span className="h-2 w-6 bg-white/90 rounded-full" />
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <Portal containerId="sheki-ai-root">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-0 z-50"
            >
              <AIContainerComponent onClose={() => setIsOpen(false)} />
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </>
  );
}
