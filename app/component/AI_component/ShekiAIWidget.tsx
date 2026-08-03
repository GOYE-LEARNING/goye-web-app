"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Portal from "@/app/component/Portal";
import AIContainerComponent from "./ai_container_component";
import type { AssistantMode } from "@/app/hook/useShekiAI";
import useWindowWidth from "@/app/hook/UseWindowWidth";

const DESKTOP_BREAKPOINT = 1024; // matches this app's lg: convention

function FloatingTrigger({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      onClick={onClick}
      aria-label="Open ShekiAI assistant"
      className="fixed bottom-24 right-5 z-40 h-14 w-14 rounded-full shadow-lg flex items-center justify-center"
      style={{ background: "radial-gradient(circle at 35% 30%, #FBB041, #FFA500 70%)" }}
    >
      <span className="h-2 w-6 bg-white/90 rounded-full" />
    </motion.button>
  );
}

export default function ShekiAIWidget({ mode = "tutor" }: { mode?: AssistantMode }) {
  const width = useWindowWidth();
  const isDesktop = (width ?? 0) >= DESKTOP_BREAKPOINT;
  // Starts open so the assistant is visible on arrival, but tutors/students
  // can close it whenever — reopens via the same floating trigger used on
  // mobile, just positioned to not collide with the docked panel's space.
  const [isOpen, setIsOpen] = useState(true);

  if (isDesktop) {
    return (
      <>
        {isOpen && (
          <motion.div
            initial={{ x: 380 }}
            animate={{ x: 0 }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="hidden lg:flex flex-col w-[380px] shrink-0 fixed right-0 top-0 h-screen z-30 border-l border-black/5 dark:border-white/5 shadow-xl"
          >
            <AIContainerComponent mode={mode} onClose={() => setIsOpen(false)} />
          </motion.div>
        )}
        {!isOpen && <FloatingTrigger onClick={() => setIsOpen(true)} />}
      </>
    );
  }

  return (
    <>
      {!isOpen && <FloatingTrigger onClick={() => setIsOpen(true)} />}

      {isOpen && (
        <Portal containerId="sheki-ai-root">
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setIsOpen(false)} />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-50"
          >
            <AIContainerComponent mode={mode} onClose={() => setIsOpen(false)} />
          </motion.div>
        </Portal>
      )}
    </>
  );
}
