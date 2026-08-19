"use client";

import { useMemo, useState } from "react";

/**
 * Shared chart primitives.
 *
 * These started life inline inside the super-admin overview page; the
 * organization analytics dashboard needs the same vocabulary, so they live
 * here rather than being copy-pasted. Everything is hand-authored SVG — no
 * charting dependency — and themed through the existing Tailwind tokens.
 */

/** Validated CVD-safe categorical hues (light / dark), assigned in fixed order. */
export const CATEGORICAL = [
  { light: "#2a78d6", dark: "#3987e5" }, // blue
  { light: "#1baf7a", dark: "#199e70" }, // aqua
  { light: "#eda100", dark: "#c98500" }, // yellow
  { light: "#008300", dark: "#008300" }, // green
  { light: "#4a3aa7", dark: "#9085e9" }, // violet
  { light: "#e34948", dark: "#e66767" }, // red
  { light: "#e87ba4", dark: "#d55181" }, // magenta
  { light: "#eb6834", dark: "#d95926" }, // orange
];

/** Brand orange — reserved for single-series trends so it reads as "the" metric. */
export const ACCENT = "#FFA500";

export function hueAt(i: number, dark: boolean): string {
  const h = CATEGORICAL[i % CATEGORICAL.length];
  return dark ? h.dark : h.light;
}

/** Reads the current theme once, for charts that need explicit hex values. */
export function useIsDark(): boolean {
  const [dark, setDark] = useState(false);
  useMemo(() => {
    if (typeof document !== "undefined") {
      setDark(document.documentElement.classList.contains("dark"));
    }
  }, []);
  return dark;
}

// ─── Stat tile ────────────────────────────────────────────────────────────

export function StatTile({
  label,
  value,
  icon,
  accent,
  sublabel,
}: {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  accent?: string;
  sublabel?: string;
}) {
  return (
    <div className="bg-white dark:bg-shadyColor-0 rounded-xl p-4 flex items-center gap-3 border border-[#ccc]/10">
      {icon && (
        <div
          className="h-11 w-11 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: `${accent || ACCENT}1a`, color: accent || ACCENT }}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-textGrey-0 text-[12px] truncate">{label}</p>
        <p className="text-lightBoldText-0-0 dark:text-white text-[22px] font-[700] leading-tight tabular-nums">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {sublabel && <p className="text-textGrey-0 text-[11px] mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
}

// ─── Donut / pie ──────────────────────────────────────────────────────────

interface Slice {
  label: string;
  value: number;
}

/** Polar → cartesian on the chart's unit circle. */
function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** SVG path for a donut segment between two angles. */
function arcPath(cx: number, cy: number, rOuter: number, rInner: number, start: number, end: number) {
  // A single arc can't express a full circle — nudge it just under 360°.
  const sweep = end - start >= 360 ? 359.99 : end - start;
  const e = start + sweep;
  const p1 = polar(cx, cy, rOuter, start);
  const p2 = polar(cx, cy, rOuter, e);
  const p3 = polar(cx, cy, rInner, e);
  const p4 = polar(cx, cy, rInner, start);
  const largeArc = sweep > 180 ? 1 : 0;
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${p4.x} ${p4.y}`,
    "Z",
  ].join(" ");
}

/**
 * Donut chart with a legend and a hover-driven centre readout.
 * Donut rather than a solid pie: the hole gives the total somewhere to live,
 * and arc length stays easier to compare than wedge area.
 */
export function DonutChart({
  data,
  dark,
  centerLabel,
}: {
  data: Slice[];
  dark: boolean;
  centerLabel?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return <p className="text-textGrey-0 text-sm text-center py-10">No data yet</p>;
  }

  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 78;
  const rInner = 50;

  let cursor = 0;
  const segments = data.map((d, i) => {
    const angle = (d.value / total) * 360;
    const seg = { ...d, start: cursor, end: cursor + angle, i };
    cursor += angle;
    return seg;
  });

  const active = hover !== null ? segments[hover] : null;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-[180px] h-[180px] flex-shrink-0"
        role="img"
        aria-label={`Donut chart: ${data.map((d) => `${d.label} ${d.value}`).join(", ")}`}
        onMouseLeave={() => setHover(null)}
      >
        {segments.map((s) => (
          <path
            key={s.label}
            d={arcPath(cx, cy, rOuter, rInner, s.start, s.end)}
            fill={hueAt(s.i, dark)}
            opacity={hover === null || hover === s.i ? 1 : 0.45}
            style={{ transition: "opacity 0.2s" }}
            onMouseEnter={() => setHover(s.i)}
          />
        ))}
        <text
          x={cx}
          y={active ? cy - 4 : cy + 2}
          textAnchor="middle"
          className="fill-lightBoldText-0 dark:fill-white"
          style={{ fontSize: 22, fontWeight: 700 }}
        >
          {active ? active.value.toLocaleString() : total.toLocaleString()}
        </text>
        <text
          x={cx}
          y={active ? cy + 14 : cy + 18}
          textAnchor="middle"
          className="fill-textGrey-0"
          style={{ fontSize: 10 }}
        >
          {active ? active.label : centerLabel || "total"}
        </text>
      </svg>

      <div className="flex flex-col gap-2 min-w-0 w-full">
        {segments.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-2 cursor-default"
            onMouseEnter={() => setHover(s.i)}
            onMouseLeave={() => setHover(null)}
          >
            <span
              className="h-[10px] w-[10px] rounded-sm flex-shrink-0"
              style={{ backgroundColor: hueAt(s.i, dark) }}
            />
            <span className="text-[12px] text-lightBoldText-0-0 dark:text-white truncate flex-1 capitalize">
              {s.label.toLowerCase().replace(/_/g, " ")}
            </span>
            <span className="text-[12px] text-textGrey-0 tabular-nums flex-shrink-0">
              {Math.round((s.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Line chart ───────────────────────────────────────────────────────────

export interface Series {
  name: string;
  color: string;
  data: { date: string; count: number }[];
}

/**
 * Multi-series line chart with a shared hover crosshair and tooltip.
 * A single series gets an area wash; multiple series get a legend instead.
 */
export function LineChart({ series, height = 200 }: { series: Series[]; height?: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const width = 640;
  const padL = 8;
  const padR = 8;
  const padT = 14;
  const padB = 26;
  const dates = series[0]?.data ?? [];
  const max = Math.max(1, ...series.flatMap((s) => s.data.map((d) => d.count)));
  const pw = width - padL - padR;
  const ph = height - padT - padB;

  const seriesPts = series.map((s) => ({
    ...s,
    pts: s.data.map((d, i) => ({
      x: padL + (i / Math.max(1, s.data.length - 1)) * pw,
      y: padT + ph - (d.count / max) * ph,
      ...d,
    })),
  }));

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  if (dates.length === 0) {
    return <p className="text-textGrey-0 text-sm text-center py-10">No data yet</p>;
  }

  return (
    <div className="relative">
      {series.length > 1 && (
        <div className="flex items-center gap-4 mb-2 flex-wrap">
          {series.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5">
              <span className="h-[8px] w-[8px] rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-[11px] text-textGrey-0">{s.name}</span>
            </div>
          ))}
        </div>
      )}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height }}
        role="img"
        aria-label={`Line chart of ${series.map((s) => s.name).join(" and ")} over time`}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          {series.length === 1 && (
            <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={series[0].color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={series[0].color} stopOpacity="0.02" />
            </linearGradient>
          )}
        </defs>
        <line
          x1={padL}
          y1={padT + ph}
          x2={width - padR}
          y2={padT + ph}
          className="text-[#ccc]/20"
          stroke="currentColor"
          strokeWidth={1}
        />
        {seriesPts.map((s) => {
          const line = s.pts
            .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
            .join(" ");
          const area = `${line} L ${s.pts[s.pts.length - 1]?.x ?? 0} ${padT + ph} L ${s.pts[0]?.x ?? 0} ${padT + ph} Z`;
          return (
            <g key={s.name}>
              {series.length === 1 && <path d={area} fill="url(#lineFill)" />}
              <path
                d={line}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {hover !== null && s.pts[hover] && (
                <circle cx={s.pts[hover].x} cy={s.pts[hover].y} r={4} fill={s.color} stroke="white" strokeWidth={2} />
              )}
            </g>
          );
        })}
        {hover !== null && seriesPts[0]?.pts[hover] && (
          <line
            x1={seriesPts[0].pts[hover].x}
            y1={padT}
            x2={seriesPts[0].pts[hover].x}
            y2={padT + ph}
            className="text-[#ccc]/30"
            stroke="currentColor"
            strokeWidth={1}
          />
        )}
        {dates.map((_, i) => (
          <rect
            key={i}
            x={padL + (i / Math.max(1, dates.length)) * pw}
            y={padT}
            width={pw / Math.max(1, dates.length)}
            height={ph}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}
      </svg>
      {hover !== null && dates[hover] && (
        <div
          className="absolute -translate-x-1/2 bg-secondaryColors-0 text-white text-[11px] rounded px-2 py-1.5 pointer-events-none whitespace-nowrap shadow-lg flex flex-col gap-0.5"
          style={{ left: `${(seriesPts[0].pts[hover].x / width) * 100}%`, top: 0 }}
        >
          <span className="font-[600]">{fmt(dates[hover].date)}</span>
          {series.map((s) => (
            <span key={s.name}>
              {s.name}: {s.data[hover]?.count ?? 0}
            </span>
          ))}
        </div>
      )}
      <div className="flex justify-between text-[11px] text-textGrey-0 mt-1">
        <span>{dates[0] ? fmt(dates[0].date) : ""}</span>
        <span>{dates[dates.length - 1] ? fmt(dates[dates.length - 1].date) : ""}</span>
      </div>
    </div>
  );
}

// ─── Bar charts ───────────────────────────────────────────────────────────

/** Vertical bars — categorical magnitude comparison with value labels. */
export function BarChart({
  data,
  dark,
  height = 180,
  singleHue,
}: {
  data: { label: string; value: number }[];
  dark: boolean;
  height?: number;
  singleHue?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  if (data.length === 0) {
    return <p className="text-textGrey-0 text-sm text-center py-8">No data yet</p>;
  }
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="flex items-end gap-2 w-full" style={{ height }}>
      {data.map((d, i) => {
        const color = singleHue || hueAt(i, dark);
        const pct = (d.value / max) * 100;
        return (
          <div
            key={d.label}
            className="flex-1 flex flex-col items-center justify-end h-full min-w-0"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <span className="text-[12px] font-[700] text-lightBoldText-0-0 dark:text-white mb-1 tabular-nums">
              {d.value}
            </span>
            <div className="w-full flex justify-center h-full items-end">
              <div
                className="w-full max-w-[42px] rounded-t-[4px] transition-all duration-300"
                style={{
                  height: `${Math.max(pct, 2)}%`,
                  backgroundColor: color,
                  opacity: hover === null || hover === i ? 1 : 0.55,
                }}
              />
            </div>
            <span className="text-[10px] text-textGrey-0 mt-2 text-center truncate w-full capitalize">
              {d.label.toLowerCase().replace(/_/g, " ")}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Horizontal bars — better when labels are long (names, course titles, roles). */
export function HorizontalBars({
  data,
  dark,
  labelWidth = 140,
  emptyMessage = "No data yet",
}: {
  data: { label: string; value: number }[];
  dark: boolean;
  labelWidth?: number;
  emptyMessage?: string;
}) {
  if (data.length === 0) {
    return <p className="text-textGrey-0 text-sm text-center py-8">{emptyMessage}</p>;
  }
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const max = Math.max(1, ...sorted.map((d) => d.value));

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((d, i) => (
        <div key={`${d.label}-${i}`} className="flex items-center gap-3">
          <span
            className="text-[12px] text-lightBoldText-0-0 dark:text-white flex-shrink-0 truncate"
            style={{ width: labelWidth }}
            title={d.label}
          >
            {d.label}
          </span>
          <div className="flex-1 h-[20px] bg-[#ccc]/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(d.value / max) * 100}%`, backgroundColor: hueAt(i, dark) }}
            />
          </div>
          <span className="text-[12px] font-[600] text-lightBoldText-0-0 dark:text-white w-[40px] text-right flex-shrink-0 tabular-nums">
            {d.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Progress ring ────────────────────────────────────────────────────────

/** Radial gauge for a single rate (completion, attendance, etc). */
export function ProgressRing({
  value,
  total,
  label = "completed",
  caption,
  color = "#30A46F",
}: {
  value: number;
  total: number;
  label?: string;
  caption?: string;
  color?: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-2">
      <div className="relative w-[130px] h-[130px]">
        <svg viewBox="0 0 130 130" className="w-full h-full -rotate-90" role="img" aria-label={`${pct}% ${label}`}>
          <circle cx="65" cy="65" r={r} fill="none" stroke="currentColor" className="text-[#ccc]/15" strokeWidth={12} />
          <circle
            cx="65"
            cy="65"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[28px] font-[700] text-lightBoldText-0-0 dark:text-white tabular-nums">{pct}%</span>
          <span className="text-[11px] text-textGrey-0">{label}</span>
        </div>
      </div>
      {caption && <p className="text-[12px] text-textGrey-0 text-center">{caption}</p>}
    </div>
  );
}

// ─── Card shell ───────────────────────────────────────────────────────────

/** Consistent panel around every chart, so the grid reads as one system. */
export function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white dark:bg-boldShadyColor-0 rounded-xl p-4 border border-[#ccc]/10 ${className}`}>
      <h2 className="text-lightBoldText-0 dark:text-white font-[600] text-[14px]">{title}</h2>
      {subtitle && <p className="text-textGrey-0 text-[12px] mt-0.5 mb-3">{subtitle}</p>}
      <div className={subtitle ? "" : "mt-3"}>{children}</div>
    </div>
  );
}
