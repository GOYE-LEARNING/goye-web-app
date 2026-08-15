"use client";

import dynamic from "next/dynamic";

const WorldGlobe = dynamic(() => import("./WorldGlobe"), {
  ssr: false,
  loading: () => <div className="h-full w-full" />,
});

export default function GlobeHero({ dark }: { dark: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none select-none absolute inset-0 overflow-hidden">
      {/* Soft brand-colored glow behind the globe */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 blur-[100px]"
        style={{
          width: "min(78vw, 820px)",
          height: "min(78vw, 820px)",
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,165,0,0.22) 0%, rgba(255,165,0,0.08) 48%, transparent 70%)",
        }}
      />
      <div className="absolute inset-0 [&_canvas]:!pointer-events-auto">
        <WorldGlobe dark={dark} />
      </div>
    </div>
  );
}
