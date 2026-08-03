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
      {/* subtle "face" so it reads as a character, not just a ball. The
          whole group drifts left-and-back and blinks/smiles on its own
          independent timers (rather than one synced loop) so it reads as
          idle life rather than a mechanical repeat. */}
      <motion.div
        className="absolute flex flex-col items-center"
        animate={{ x: [0, 0, -size * 0.08, -size * 0.08, 0, 0], rotate: [0, 0, -4, -4, 0, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", times: [0, 0.55, 0.68, 0.85, 0.95, 1] }}
      >
        <div className="flex gap-[14%]" style={{ width: size * 0.34 }}>
          <motion.span
            className="block rounded-full bg-white/90"
            style={{ width: size * 0.07, height: size * 0.16 }}
            animate={{ scaleY: active ? [1, 1, 0.1, 1, 1] : [1, 1, 0.1, 1, 1] }}
            transition={{ duration: active ? 1.8 : 3.6, repeat: Infinity, ease: "easeInOut", times: [0, 0.9, 0.95, 1, 1] }}
          />
          <motion.span
            className="block rounded-full bg-white/90"
            style={{ width: size * 0.07, height: size * 0.16 }}
            animate={{ scaleY: active ? [1, 1, 0.1, 1, 1] : [1, 1, 0.1, 1, 1] }}
            transition={{ duration: active ? 1.8 : 3.6, repeat: Infinity, ease: "easeInOut", times: [0, 0.9, 0.95, 1, 1], delay: 0.06 }}
          />
        </div>
        {/* smile — a simple arc that curves upward on its own slow cycle */}
        <motion.svg
          width={size * 0.3}
          height={size * 0.14}
          viewBox="0 0 100 40"
          style={{ marginTop: size * 0.05 }}
          initial={false}
        >
          <motion.path
            stroke="rgba(255,255,255,0.9)"
            strokeWidth={9}
            strokeLinecap="round"
            fill="none"
            animate={{ d: ["M10,10 Q50,10 90,10", "M10,8 Q50,32 90,8", "M10,10 Q50,10 90,10"] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.svg>
      </motion.div>
    </div>
  );
}
