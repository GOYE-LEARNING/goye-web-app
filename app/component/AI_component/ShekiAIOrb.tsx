"use client";

import { motion } from "framer-motion";
import { AssistantStatus } from "@/app/hook/useShekiAI";

export default function ShekiAIOrb({
  status,
  size = 120,
  // 0..1 live loudness — of the assistant's voice while it speaks, or the
  // speaker's while it listens. When supplied, the orb tracks the actual
  // sound instead of pulsing on a timer, which reads as far more alive.
  level = 0,
}: {
  status: AssistantStatus;
  size?: number;
  level?: number;
}) {
  const active = status === "speaking" || status === "thinking" || status === "listening";
  const reactive = level > 0.01;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* ambient glow rings */}
      <motion.div
        className="absolute rounded-full bg-primaryColors-0/30 blur-xl"
        style={{ width: size * 1.4, height: size * 1.4 }}
        animate={
          reactive
            ? { scale: 1 + level * 0.4, opacity: 0.4 + level * 0.45 }
            : { scale: active ? [1, 1.25, 1] : [1, 1.08, 1], opacity: active ? [0.5, 0.8, 0.5] : [0.3, 0.45, 0.3] }
        }
        transition={
          reactive
            ? { type: "spring", damping: 20, stiffness: 260 }
            : { duration: active ? 1.1 : 2.6, repeat: Infinity, ease: "easeInOut" }
        }
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          background: "radial-gradient(circle at 35% 30%, #FBB041, #FFA500 55%, #b56a00 100%)",
        }}
        animate={
          reactive
            ? {
                scale: 1 + level * 0.16,
                boxShadow: `0 0 ${18 + level * 34}px ${3 + level * 12}px rgba(251,176,65,${0.45 + level * 0.4})`,
              }
            : {
                scale: active ? [1, 1.08, 1] : [1, 1.02, 1],
                boxShadow: active
                  ? ["0 0 20px 4px rgba(255,165,0,0.55)", "0 0 40px 12px rgba(251,176,65,0.75)", "0 0 20px 4px rgba(255,165,0,0.55)"]
                  : ["0 0 16px 2px rgba(255,165,0,0.35)", "0 0 22px 4px rgba(255,165,0,0.45)", "0 0 16px 2px rgba(255,165,0,0.35)"],
              }
        }
        transition={
          reactive
            ? { type: "spring", damping: 18, stiffness: 320 }
            : { duration: active ? 0.9 : 2.4, repeat: Infinity, ease: "easeInOut" }
        }
      />
      {/* subtle "face" so it reads as a character, not just a ball */}
      <div className="absolute flex gap-[14%]" style={{ width: size * 0.34 }}>
        <motion.span
          className="block rounded-full bg-white/90"
          style={{ width: size * 0.07, height: size * 0.16 }}
          animate={{ scaleY: active ? [1, 0.3, 1] : [1, 0.85, 1] }}
          transition={{ duration: active ? 1.6 : 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          className="block rounded-full bg-white/90"
          style={{ width: size * 0.07, height: size * 0.16 }}
          animate={{ scaleY: active ? [1, 0.3, 1] : [1, 0.85, 1] }}
          transition={{ duration: active ? 1.6 : 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
        />
      </div>
    </div>
  );
}
